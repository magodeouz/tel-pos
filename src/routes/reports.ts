import { Hono } from 'hono'
import { eq, gte, lte, desc } from 'drizzle-orm'
import { getDb } from '../db'
import { orders, orderItems, products, customers } from '../schema'
import type { Env } from '../worker'

const app = new Hono<{ Bindings: Env }>()

app.get('/sales-by-date', async (c) => {
  const db = getDb(c.env.DB)
  // Dates are Istanbul (UTC+3, no DST) days; DB stores UTC. Group and filter
  // by Istanbul day so totals line up exactly with the day-close report.
  const istToday = new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10)
  const start = c.req.query('start_date') ?? new Date(Date.now() - 30 * 86400000 + 3 * 3600 * 1000).toISOString().slice(0, 10)
  const end = c.req.query('end_date') ?? istToday

  const toDb = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ')
  const startUtc = toDb(new Date(start + 'T00:00:00+03:00'))
  const endUtc = toDb(new Date(end + 'T23:59:59+03:00'))
  const istDateKey = (utc: string) =>
    new Date(new Date(utc.replace(' ', 'T') + 'Z').getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10)

  const paidOrders = await db.select().from(orders)
    .where(eq(orders.status, 'paid'))

  const filtered = paidOrders.filter(o => o.createdAt && o.createdAt >= startUtc && o.createdAt <= endUtc)
  const items = await db.select().from(orderItems)

  let totalSales = 0, totalOrders = 0
  const dailyData: Record<string, { order_count: number; total_amount: number }> = {}

  for (const order of filtered) {
    const orderTotal = items.filter(i => i.orderId === order.id).reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    if (orderTotal <= 0) continue
    totalSales += orderTotal
    totalOrders++
    const dateKey = istDateKey(order.createdAt ?? '')
    if (!dailyData[dateKey]) dailyData[dateKey] = { order_count: 0, total_amount: 0 }
    dailyData[dateKey].order_count++
    dailyData[dateKey].total_amount += orderTotal
  }

  return c.json({
    total_sales: totalSales,
    total_orders: totalOrders,
    daily_breakdown: Object.entries(dailyData).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({ date, ...d }))
  })
})

app.get('/product-sales', async (c) => {
  const db = getDb(c.env.DB)
  const paidOrders = await db.select().from(orders).where(eq(orders.status, 'paid'))
  const paidIds = new Set(paidOrders.map(o => o.id))
  const items = await db.select({ quantity: orderItems.quantity, unitPrice: orderItems.unitPrice, orderId: orderItems.orderId, name: products.name })
    .from(orderItems).innerJoin(products, eq(orderItems.productId, products.id))

  const productMap: Record<string, { product_name: string; quantity_sold: number; revenue: number }> = {}
  for (const i of items) {
    if (!paidIds.has(i.orderId)) continue
    if (!productMap[i.name]) productMap[i.name] = { product_name: i.name, quantity_sold: 0, revenue: 0 }
    productMap[i.name].quantity_sold += i.quantity
    productMap[i.name].revenue += i.quantity * i.unitPrice
  }

  const top_products = Object.values(productMap).sort((a, b) => b.quantity_sold - a.quantity_sold).slice(0, 10)
  return c.json({ total_quantity_sold: top_products.reduce((s, p) => s + p.quantity_sold, 0), top_products })
})

app.get('/customer-spending', async (c) => {
  const db = getDb(c.env.DB)
  const allCustomers = await db.select().from(customers)
  const paidOrders = await db.select().from(orders).where(eq(orders.status, 'paid'))
  const items = await db.select().from(orderItems)

  const data = allCustomers.map(cust => {
    const custOrders = paidOrders.filter(o => o.customerId === cust.id)
    const total_spent = custOrders.reduce((s, o) => s + items.filter(i => i.orderId === o.id).reduce((si, i) => si + i.quantity * i.unitPrice, 0), 0)
    return { id: cust.id, name: cust.name, phone: cust.phone, total_spent, order_count: custOrders.length }
  }).filter(c => c.total_spent > 0).sort((a, b) => b.total_spent - a.total_spent)

  return c.json({
    total_customers: data.length,
    total_spending: data.reduce((s, c) => s + c.total_spent, 0),
    top_customers: data.slice(0, 20)
  })
})

// Day closing report — HTML printable summary
app.get('/day-close', async (c) => {
  const db = getDb(c.env.DB)

  // Turkish money format: thousands "." and decimals "," (e.g. 91.295,00).
  const fmtTR = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // Day = Istanbul day (UTC+3, no DST). DB stores UTC.
  // ?date=YYYY-MM-DD picks a specific Istanbul day; otherwise use today.
  const istDateStr = c.req.query('date')
    || new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10)
  const startUtc = new Date(istDateStr + 'T00:00:00+03:00')
  const endUtc = new Date(istDateStr + 'T23:59:59+03:00')

  const allOrders = await db.select().from(orders)
  const todayOrders = allOrders.filter(o => {
    if (!o.createdAt) return false
    const d = new Date(o.createdAt.replace(' ', 'T') + 'Z') // parse as UTC
    return d >= startUtc && d <= endUtc
  })

  const items = await db.select({
    orderId: orderItems.orderId, quantity: orderItems.quantity,
    unitPrice: orderItems.unitPrice, name: products.name,
  }).from(orderItems).innerJoin(products, eq(orderItems.productId, products.id))

  const getTotal = (orderId: number) =>
    items.filter(i => i.orderId === orderId).reduce((s, i) => s + i.quantity * i.unitPrice, 0)

  const paid       = todayOrders.filter(o => o.status === 'paid')
  const cancelled  = todayOrders.filter(o => o.status === 'cancelled')
  const open       = todayOrders.filter(o => o.status === 'open')

  const paidTotal  = paid.reduce((s, o) => s + getTotal(o.id), 0)

  // Payment breakdown
  const byPayment: Record<string, { label: string; count: number; total: number }> = {
    nakit:       { label: 'Nakit',       count: 0, total: 0 },
    kredi_karti: { label: 'Kredi Kartı', count: 0, total: 0 },
    cari:        { label: 'Cari',        count: 0, total: 0 },
    odenmes:     { label: 'Ödenmez',     count: 0, total: 0 },
  }
  for (const o of paid) {
    const m = o.paymentMethod ?? 'nakit'
    if (byPayment[m]) { byPayment[m].count++; byPayment[m].total += getTotal(o.id) }
  }

  // Top products
  const prodMap: Record<string, { name: string; qty: number; rev: number }> = {}
  const paidIds = new Set(paid.map(o => o.id))
  for (const i of items) {
    if (!paidIds.has(i.orderId)) continue
    if (!prodMap[i.name]) prodMap[i.name] = { name: i.name, qty: 0, rev: 0 }
    prodMap[i.name].qty += i.quantity
    prodMap[i.name].rev += i.quantity * i.unitPrice
  }
  const topProds = Object.values(prodMap).sort((a, b) => b.rev - a.rev).slice(0, 10)

  // That day's individual orders (chronological), with customer names.
  const allCustomers = await db.select().from(customers)
  const custMap: Record<number, typeof customers.$inferSelect> = {}
  for (const cu of allCustomers) custMap[cu.id] = cu
  const payShort: Record<string, string> = { nakit: 'Nakit', kredi_karti: 'K.Kartı', cari: 'Cari', odenmes: 'Ödenmez' }
  const dayOrders = [...todayOrders].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))

  const restName  = c.env.RESTAURANT_NAME  ?? 'EFE BÜFE'
  const restAddr  = c.env.RESTAURANT_ADDRESS ?? ''
  const restPhone = c.env.RESTAURANT_PHONE  ?? ''
  const dateStr   = new Date(istDateStr + 'T12:00:00+03:00')
    .toLocaleDateString('tr-TR', { day:'2-digit', month:'long', year:'numeric', timeZone: 'Europe/Istanbul' })

  const payRows = Object.values(byPayment).filter(p => p.count > 0)
    .map(p => `<tr><td>${p.label}</td><td>${p.count}</td><td>${fmtTR(p.total)} ₺</td></tr>`).join('')

  const prodRows = topProds
    .map(p => `<tr><td>${p.name}</td><td>${p.qty}</td><td>${fmtTR(p.rev)} ₺</td></tr>`).join('')

  const orderRows = dayOrders.map(o => {
    const t = o.createdAt
      ? new Date(o.createdAt.replace(' ', 'T') + 'Z').toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })
      : ''
    const cust = o.customerId && custMap[o.customerId] ? custMap[o.customerId].name : ''
    const st = o.status === 'cancelled' ? 'İptal'
      : o.status === 'open' ? 'Açık'
      : (payShort[o.paymentMethod ?? 'nakit'] || 'Ödendi')
    return `<tr><td>${t}</td><td>#${o.id}${cust ? ' ' + cust : ''}</td><td>${fmtTR(getTotal(o.id))} ₺</td><td>${st}</td></tr>`
  }).join('')

  return c.html(`<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"><title>Gün Kapanış — ${dateStr}</title>
<style>
@media print{.no-print{display:none;} body{margin:0}}
body{font-family:monospace;max-width:80mm;margin:0 auto;padding:12px;font-size:12px;}
h2{text-align:center;margin:0 0 2px;font-size:15px;}
h3{margin:8px 0 4px;font-size:12px;border-bottom:1px dashed #000;padding-bottom:2px;}
.center{text-align:center;}
hr{border:none;border-top:2px solid #000;margin:6px 0;}
table{width:100%;border-collapse:collapse;}
td{padding:2px 0;}
td:last-child{text-align:right;}
.big{font-size:16px;font-weight:bold;}
.btn{display:block;width:100%;padding:8px;background:#333;color:#fff;border:none;cursor:pointer;font-size:13px;margin-top:10px;border-radius:4px;}
</style></head><body>
<h2>${restName}</h2>
${restAddr  ? `<p class="center" style="font-size:10px;margin:1px 0">${restAddr}</p>` : ''}
${restPhone ? `<p class="center" style="font-size:10px;margin:1px 0">Tel: ${restPhone}</p>` : ''}
<p class="center" style="font-size:11px;margin:4px 0"><strong>GÜN KAPANIŞ RAPORU</strong></p>
<p class="center" style="font-size:10px;margin:2px 0">${dateStr}</p>
<hr>
<h3>Özet</h3>
<table>
  <tr><td>Ödenen Sipariş</td><td><strong>${paid.length}</strong></td></tr>
  <tr><td>İptal Sipariş</td><td>${cancelled.length}</td></tr>
  <tr><td>Açık Sipariş</td><td>${open.length}</td></tr>
</table>
<div style="margin:6px 0;padding:6px;border:2px solid #000;text-align:center;">
  <div style="font-size:10px">TOPLAM CİRO</div>
  <div class="big">${fmtTR(paidTotal)} ₺</div>
</div>
${payRows ? `<h3>Ödeme Yöntemleri</h3>
<table><tr><td><b>Yöntem</b></td><td><b>Adet</b></td><td><b>Tutar</b></td></tr>${payRows}</table>` : ''}
${prodRows ? `<h3>En Çok Satılan Ürünler</h3>
<table><tr><td><b>Ürün</b></td><td><b>Adet</b></td><td><b>Tutar</b></td></tr>${prodRows}</table>` : ''}
${orderRows ? `<h3>O Günün Siparişleri (${dayOrders.length})</h3>
<table><tr><td><b>Saat</b></td><td><b>#</b></td><td><b>Tutar</b></td><td><b>Durum</b></td></tr>${orderRows}</table>` : ''}
<hr>
<p class="center" style="font-size:10px">Rapor: ${new Date().toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul' })}</p>
<div class="no-print">
  <button class="btn" onclick="window.print()">🖨️ Yazdır</button>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`)
})

export default app
