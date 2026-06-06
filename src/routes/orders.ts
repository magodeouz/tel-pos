import { Hono } from 'hono'
import { eq, desc, and, sql } from 'drizzle-orm'
import { getDb } from '../db'
import { orders, orderItems, products } from '../schema'
import type { Env } from '../worker'

const app = new Hono<{ Bindings: Env }>()

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
  const rows = await db.select().from(orders).where(eq(orders.status, status)).orderBy(desc(orders.createdAt))
  return c.json(await Promise.all(rows.map(o => buildOrder(db, o))))
})

app.get('/list/paginated', async (c) => {
  const db = getDb(c.env.DB)
  const page = Number(c.req.query('page') ?? 1)
  const perPage = Number(c.req.query('per_page') ?? 10)
  const status = c.req.query('status')

  const where = status ? eq(orders.status, status) : undefined
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(where)
  const total = Number(count)
  const pages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(Math.max(1, page), pages)

  const rows = await db.select().from(orders).where(where)
    .orderBy(desc(orders.createdAt))
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

  const paymentMap: Record<string, string> = { nakit: '💵 Nakit', kredi_karti: '💳 Kredi Kartı', cari: '📋 Cari', odenmes: '🚫 Ödenmez', pending: '-' }
  const paymentLabel = paymentMap[built.payment_method ?? 'pending'] ?? built.payment_method ?? '-'
  const itemsHtml = built.items.map(i => `<div class="item"><span>${i.product_name} x${i.quantity}</span><span>${(i.quantity * i.unit_price).toFixed(2)} TL</span></div>`).join('')
  const discountHtml = discountVal > 0 ? `<div class="item" style="color:#c00"><span>İndirim</span><span>-${discountVal.toFixed(2)} TL</span></div>` : ''
  const noteHtml = built.note ? `<p style="font-size:0.8em;color:#666;margin:4px 0">Not: ${built.note}</p>` : ''
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('tr-TR') : ''

  return c.html(`<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"><title>Sipariş #${order.id}</title>
<style>@media print{body{margin:0;}.no-print{display:none;}}
body{font-family:monospace;width:80mm;max-width:80mm;margin:0 auto;padding:10px;font-size:13px;}
h2{text-align:center;margin:0 0 2px;font-size:16px;}
.center{text-align:center;}
hr{border:none;border-top:1px dashed #000;margin:6px 0;}
.item{display:flex;justify-content:space-between;margin:3px 0;}
.total{font-weight:bold;font-size:15px;border-top:2px solid #000;padding-top:4px;margin-top:2px;}
.payment-box{border:2px solid #000;border-radius:3px;padding:4px 8px;text-align:center;margin:6px 0;font-size:13px;font-weight:bold;}
.btn{display:block;width:100%;padding:8px;background:#333;color:#fff;border:none;cursor:pointer;font-size:14px;margin-top:12px;border-radius:4px;}</style>
</head><body>
<h2>EFE BÜFE</h2>
<p class="center" style="margin:2px 0;font-size:10px">Sipariş #${order.id}</p>
<p class="center" style="margin:2px 0;font-size:10px">${dateStr}</p>
<hr>
${itemsHtml}
<hr>
${discountHtml}
<div class="item total"><span>TOPLAM</span><span>${total.toFixed(2)} TL</span></div>
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
  const [order] = await db.insert(orders).values({ customerId: body.customer_id ?? null, note: body.note ?? '' }).returning()
  return c.json(await buildOrder(db, order), 201)
})

app.post('/:id/items', async (c) => {
  const db = getDb(c.env.DB)
  const orderId = Number(c.req.param('id'))
  const body = await c.req.json()
  const [product] = await db.select().from(products).where(eq(products.id, body.product_id)).limit(1)
  if (!product) return c.json({ detail: 'Ürün bulunamadı' }, 404)
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
