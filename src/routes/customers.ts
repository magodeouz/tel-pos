import { Hono } from 'hono'
import { eq, desc, sql } from 'drizzle-orm'
import { getDb } from '../db'
import { customers, orders, orderItems, products } from '../schema'
import type { Env } from '../worker'

const app = new Hono<{ Bindings: Env }>()

const normalize = (r: any) => ({ ...r, created_at: r.createdAt, createdAt: undefined })

app.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const list = await db.select().from(customers).orderBy(customers.name)
  return c.json(list.map(normalize))
})

app.get('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const [row] = await db.select().from(customers).where(eq(customers.id, Number(c.req.param('id')))).limit(1)
  if (!row) return c.json({ detail: 'Müşteri bulunamadı' }, 404)
  return c.json(normalize(row))
})

app.get('/phone/:phone', async (c) => {
  const db = getDb(c.env.DB)
  const [row] = await db.select().from(customers).where(eq(customers.phone, c.req.param('phone'))).limit(1)
  if (!row) return c.json({ detail: 'Müşteri bulunamadı' }, 404)
  return c.json(normalize(row))
})

app.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const existing = await db.select().from(customers).where(eq(customers.phone, body.phone)).limit(1)
  if (existing.length) return c.json({ detail: 'Bu telefon zaten kayıtlı' }, 400)
  const [row] = await db.insert(customers).values({
    phone: body.phone, name: body.name, address: body.address ?? null, note: body.note ?? null
  }).returning()
  return c.json(normalize(row), 201)
})

app.put('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const [row] = await db.update(customers)
    .set({ phone: body.phone, name: body.name, address: body.address ?? null, note: body.note ?? null })
    .where(eq(customers.id, Number(c.req.param('id'))))
    .returning()
  return c.json(normalize(row))
})

app.delete('/:id', async (c) => {
  const db = getDb(c.env.DB)
  await db.delete(customers).where(eq(customers.id, Number(c.req.param('id'))))
  return c.json({ ok: true })
})

// Customer detail: info + all orders + cari balance
app.get('/:id/detail', async (c) => {
  const db = getDb(c.env.DB)
  const id = Number(c.req.param('id'))
  const [cust] = await db.select().from(customers).where(eq(customers.id, id)).limit(1)
  if (!cust) return c.json({ detail: 'Müşteri bulunamadı' }, 404)

  const custOrders = await db.select().from(orders).where(eq(orders.customerId, id)).orderBy(desc(orders.createdAt))
  const items = await db.select({
    orderId: orderItems.orderId, quantity: orderItems.quantity,
    unitPrice: orderItems.unitPrice, name: products.name,
  }).from(orderItems).innerJoin(products, eq(orderItems.productId, products.id))

  const getTotal = (orderId: number) =>
    items.filter(i => i.orderId === orderId).reduce((s, i) => s + i.quantity * i.unitPrice, 0)

  const ordersWithTotal = custOrders.map(o => ({
    id: o.id, status: o.status, payment_method: o.paymentMethod,
    created_at: o.createdAt, note: o.note,
    total: getTotal(o.id),
    items: items.filter(i => i.orderId === o.id).map(i => ({ name: i.name, quantity: i.quantity, unit_price: i.unitPrice })),
  }))

  // Cari balance = cari orders - cari payments received
  const cariOrders = ordersWithTotal
    .filter(o => o.status === 'paid' && o.payment_method === 'cari')
    .reduce((s, o) => s + o.total, 0)

  const paymentsResult = await c.env.DB
    .prepare('SELECT id, amount, note, created_at FROM cari_payments WHERE customer_id = ? ORDER BY created_at DESC')
    .bind(id).all<{id: number; amount: number; note: string; created_at: string}>()
  const cariPayments = paymentsResult.results ?? []
  const cariPaid = cariPayments.reduce((s, p) => s + p.amount, 0)
  const cariBalance = Math.max(0, cariOrders - cariPaid)

  return c.json({ ...normalize(cust), orders: ordersWithTotal, cari_balance: cariBalance, cari_payments: cariPayments })
})

// Cari tahsilat — record a payment received from customer
app.post('/:id/cari-payment', async (c) => {
  const id = Number(c.req.param('id'))
  const { amount, note } = await c.req.json()
  if (!amount || amount <= 0) return c.json({ detail: 'Geçersiz tutar' }, 400)

  await c.env.DB
    .prepare('INSERT INTO cari_payments (customer_id, amount, note) VALUES (?, ?, ?)')
    .bind(id, amount, note ?? '').run()

  return c.json({ ok: true })
})

export default app
