import { Hono } from 'hono'
import { eq, desc, and, gte, lte, sql, asc, inArray } from 'drizzle-orm'
import { getDb } from '../db'
import { orders, orderItems, products, customers, areas, diningTables } from '../schema'
import type { Env } from '../worker'

const app = new Hono<{ Bindings: Env }>()

// Istanbul (UTC+3, no DST) day window as UTC "YYYY-MM-DD HH:MM:SS" strings,
// matching how createdAt is stored. Pass a YYYY-MM-DD date, or omit for today.
function istanbulDayWindow(dateStr?: string) {
  const ist = dateStr || new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10)
  const toDb = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ')
  return {
    date: ist,
    start: toDb(new Date(ist + 'T00:00:00+03:00')),
    end: toDb(new Date(ist + 'T23:59:59+03:00')),
  }
}

async function buildOrder(db: ReturnType<typeof getDb>, order: typeof orders.$inferSelect) {
  const items = await db.select({
    id: orderItems.id, orderId: orderItems.orderId, productId: orderItems.productId,
    quantity: orderItems.quantity, unitPrice: orderItems.unitPrice,
    productName: products.name,
  }).from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id))
    .orderBy(orderItems.id)

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  return {
    id: order.id,
    customer_id: order.customerId,
    status: order.status,
    order_type: order.orderType ?? 'paket',
    table_id: order.tableId ?? null,
    payment_method: order.paymentMethod,
    discount_amount: order.discountAmount,
    discount_percent: order.discountPercent,
    note: order.note ?? '',
    created_at: order.createdAt,
    items: items.map(i => ({ id: i.id, product_id: i.productId, product_name: i.productName, quantity: i.quantity, unit_price: i.unitPrice })),
    total: subtotal,
  }
}

app.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const status = c.req.query('status') ?? 'open'
  const type = c.req.query('type') // 'salon' | 'paket' | undefined
  const conds = [
    status === 'all' ? undefined : eq(orders.status, status),
    type ? eq(orders.orderType, type) : undefined,
  ].filter(Boolean)
  const where = conds.length ? and(...conds) : undefined
  const rows = await db.select().from(orders).where(where).orderBy(desc(orders.createdAt), desc(orders.id))
  return c.json(await Promise.all(rows.map(o => buildOrder(db, o))))
})

// Floor plan: areas + tables, each table annotated with its open salon order
// (id + running total) or null. One request drives the whole table map.
app.get('/floor', async (c) => {
  const db = getDb(c.env.DB)
  const areaRows = await db.select().from(areas).orderBy(asc(areas.sortOrder), asc(areas.id))
  const tableRows = await db.select().from(diningTables).orderBy(asc(diningTables.sortOrder), asc(diningTables.id))
  const openSalon = await db.select().from(orders)
    .where(and(eq(orders.status, 'open'), eq(orders.orderType, 'salon')))

  const openIds = openSalon.map(o => o.id)
  const items = openIds.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, openIds))
    : []
  const totalByOrder: Record<number, number> = {}
  const countByOrder: Record<number, number> = {}
  for (const it of items) {
    totalByOrder[it.orderId] = (totalByOrder[it.orderId] ?? 0) + it.quantity * it.unitPrice
    countByOrder[it.orderId] = (countByOrder[it.orderId] ?? 0) + 1
  }

  const orderByTable: Record<number, { id: number; total: number; count: number; opened_at: string | null }> = {}
  for (const o of openSalon) {
    if (o.tableId) orderByTable[o.tableId] = {
      id: o.id, total: totalByOrder[o.id] ?? 0, count: countByOrder[o.id] ?? 0, opened_at: o.createdAt ?? null,
    }
  }

  return c.json(areaRows.map(a => ({
    area_id: a.id,
    area_name: a.name,
    tables: tableRows.filter(t => t.areaId === a.id).map(t => ({
      id: t.id,
      name: t.name,
      open_order: orderByTable[t.id] ?? null,
    })),
  })))
})

app.get('/list/paginated', async (c) => {
  const db = getDb(c.env.DB)
  const page = Number(c.req.query('page') ?? 1)
  const perPage = Number(c.req.query('per_page') ?? 10)
  const status = c.req.query('status')
  const type = c.req.query('type') // 'salon' | 'paket' | undefined

  // Default to the current Istanbul day; ?date=YYYY-MM-DD for a specific day,
  // ?all=1 to disable date filtering entirely. status='all' disables status filter.
  const win = c.req.query('all') === '1' ? null : istanbulDayWindow(c.req.query('date'))
  const conds = [
    status && status !== 'all' ? eq(orders.status, status) : undefined,
    type ? eq(orders.orderType, type) : undefined,
    win ? gte(orders.createdAt, win.start) : undefined,
    win ? lte(orders.createdAt, win.end) : undefined,
  ].filter(Boolean)
  const where = conds.length ? and(...conds) : undefined
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(where)
  const total = Number(count)
  const pages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(Math.max(1, page), pages)

  const rows = await db.select().from(orders).where(where)
    .orderBy(desc(orders.createdAt), desc(orders.id))
    .limit(perPage).offset((safePage - 1) * perPage)

  return c.json({ total, page: safePage, per_page: perPage, pages, orders: await Promise.all(rows.map(o => buildOrder(db, o))) })
})

app.get('/:id/receipt', async (c) => {
  const db = getDb(c.env.DB)
  const [order] = await db.select().from(orders).where(eq(orders.id, Number(c.req.param('id')))).limit(1)
  if (!order) return c.json({ detail: 'Sipariş bulunamadı' }, 404)

  const built = await buildOrder(db, order)
  const subtotal = built.total
  let discountVal = built.discount_amount ?? 0
  if (built.discount_percent) discountVal += subtotal * (built.discount_percent / 100)
  const total = Math.max(0, subtotal - discountVal)

  // Customer info if linked
  let customerHtml = ''
  if (order.customerId) {
    const [cust] = await db.select().from(customers).where(eq(customers.id, order.customerId)).limit(1)
    if (cust) {
      customerHtml = `<hr>
<div style="font-size:11px;">
  <div><strong>${cust.name}</strong></div>
  ${cust.phone ? `<div>Tel: ${cust.phone}</div>` : ''}
  ${cust.address ? `<div>${cust.address}</div>` : ''}
</div>`
    }
  }

  const fmtTR = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const paymentMap: Record<string, string> = { nakit: '💵 Nakit', kredi_karti: '💳 Kredi Kartı', cari: '📋 Cari', odenmes: '🚫 Ödenmez', pending: '-' }
  const paymentLabel = paymentMap[built.payment_method ?? 'pending'] ?? built.payment_method ?? '-'
  const itemsHtml = built.items.map(i => `<div class="item"><span>${i.product_name} x${i.quantity}</span><span>${fmtTR(i.quantity * i.unit_price)} ₺</span></div>`).join('')
  const discountHtml = discountVal > 0 ? `<div class="item" style="color:#c00"><span>İndirim</span><span>-${fmtTR(discountVal)} ₺</span></div>` : ''
  const noteHtml = built.note ? `<p style="font-size:0.8em;color:#666;margin:4px 0">Not: ${built.note}</p>` : ''
  // DB stores UTC — mark it UTC then render Istanbul time
  const dateStr = order.createdAt
    ? new Date(order.createdAt.replace(' ', 'T') + 'Z').toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
    : ''

  const restName = c.env.RESTAURANT_NAME ?? 'EFE BÜFE'
  const restAddr = c.env.RESTAURANT_ADDRESS ?? ''
  const restPhone = c.env.RESTAURANT_PHONE ?? ''

  return c.html(`<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"><title>Sipariş #${order.id}</title>
<style>@page{size:58mm auto;margin:0;}
@media print{body{margin:0;}.no-print{display:none;}}
body{font-family:monospace;width:44mm;max-width:44mm;margin:0;padding:2mm 0.5mm;font-size:11px;line-height:1.25;word-break:break-word;}
h2{text-align:center;margin:0 0 2px;font-size:13px;}
.center{text-align:center;}
hr{border:none;border-top:1px dashed #000;margin:5px 0;}
.item{display:flex;justify-content:space-between;gap:4px;margin:2px 0;}
.total{font-weight:bold;font-size:12px;border-top:2px solid #000;padding-top:4px;margin-top:2px;}
.payment-box{border:2px solid #000;border-radius:3px;padding:4px 6px;text-align:center;margin:6px 0;font-size:11px;font-weight:bold;}
.btn{display:block;width:100%;padding:8px;background:#333;color:#fff;border:none;cursor:pointer;font-size:14px;margin-top:12px;border-radius:4px;}</style>
</head><body>
<h2>${restName}</h2>
${restAddr ? `<p class="center" style="margin:1px 0;font-size:10px">${restAddr}</p>` : ''}
${restPhone ? `<p class="center" style="margin:1px 0;font-size:10px">Tel: ${restPhone}</p>` : ''}
<p class="center" style="margin:2px 0;font-size:10px">Sipariş #${order.id}</p>
<p class="center" style="margin:2px 0;font-size:10px">${dateStr}</p>
${customerHtml}
<hr>
${itemsHtml}
<hr>
${discountHtml}
<div class="item total"><span>TOPLAM</span><span>${fmtTR(total)} ₺</span></div>
<hr>
<div class="payment-box">ÖDEME: ${paymentLabel}</div>
${noteHtml}
<hr>
<p class="center" style="font-size:11px">Teşekkür ederiz!</p>
<div class="no-print"><button class="btn" onclick="window.print()">🖨️ Yazdır</button></div>
<script>window.onload=function(){window.print();}</script>
</body></html>`)
})

app.get('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const [order] = await db.select().from(orders).where(eq(orders.id, Number(c.req.param('id')))).limit(1)
  if (!order) return c.json({ detail: 'Sipariş bulunamadı' }, 404)
  return c.json(await buildOrder(db, order))
})

app.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const [order] = await db.insert(orders).values({
    customerId: body.customer_id ?? null,
    orderType: body.order_type ?? 'paket',
    tableId: body.table_id ?? null,
    note: body.note ?? '',
  }).returning()
  return c.json(await buildOrder(db, order), 201)
})

app.post('/:id/items', async (c) => {
  const db = getDb(c.env.DB)
  const orderId = Number(c.req.param('id'))
  const body = await c.req.json()
  const [product] = await db.select().from(products).where(eq(products.id, body.product_id)).limit(1)
  if (!product) return c.json({ detail: 'Ürün bulunamadı' }, 404)

  // If the same product is already on this order, bump its quantity
  // instead of adding a duplicate line.
  const [existing] = await db.select().from(orderItems)
    .where(and(eq(orderItems.orderId, orderId), eq(orderItems.productId, body.product_id)))
    .limit(1)

  if (existing) {
    const [updated] = await db.update(orderItems)
      .set({ quantity: existing.quantity + (body.quantity ?? 1) })
      .where(eq(orderItems.id, existing.id))
      .returning()
    return c.json({ id: updated.id, product_id: updated.productId, product_name: product.name, quantity: updated.quantity, unit_price: updated.unitPrice })
  }

  const [item] = await db.insert(orderItems).values({
    orderId, productId: body.product_id, quantity: body.quantity, unitPrice: product.price
  }).returning()
  return c.json({ id: item.id, product_id: item.productId, product_name: product.name, quantity: item.quantity, unit_price: item.unitPrice }, 201)
})

app.delete('/:id/items/:itemId', async (c) => {
  const db = getDb(c.env.DB)
  await db.delete(orderItems).where(eq(orderItems.id, Number(c.req.param('itemId'))))
  return c.json({ ok: true })
})

app.patch('/:id/status', async (c) => {
  const db = getDb(c.env.DB)
  const { status } = await c.req.json()
  await db.update(orders).set({ status }).where(eq(orders.id, Number(c.req.param('id'))))
  return c.json({ ok: true, status })
})

app.patch('/:id/note', async (c) => {
  const db = getDb(c.env.DB)
  const { note } = await c.req.json()
  await db.update(orders).set({ note }).where(eq(orders.id, Number(c.req.param('id'))))
  return c.json({ ok: true, note })
})

app.patch('/:id/customer', async (c) => {
  const db = getDb(c.env.DB)
  const { customer_id } = await c.req.json()
  await db.update(orders).set({ customerId: customer_id }).where(eq(orders.id, Number(c.req.param('id'))))
  return c.json({ ok: true })
})

app.patch('/:id/payment', async (c) => {
  const db = getDb(c.env.DB)
  const { payment_method } = await c.req.json()
  await db.update(orders).set({ paymentMethod: payment_method }).where(eq(orders.id, Number(c.req.param('id'))))
  return c.json({ ok: true, payment_method })
})

app.patch('/:id/discount', async (c) => {
  const db = getDb(c.env.DB)
  const { discount_amount, discount_percent } = await c.req.json()
  await db.update(orders).set({ discountAmount: discount_amount ?? 0, discountPercent: discount_percent ?? 0 }).where(eq(orders.id, Number(c.req.param('id'))))
  return c.json({ ok: true, discount_amount, discount_percent })
})

export default app
