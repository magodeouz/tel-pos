import { Hono } from 'hono'
import { eq, desc, and, gte } from 'drizzle-orm'
import { getDb } from '../db'
import { incomingCalls, customers, orders, orderItems, products } from '../schema'
import type { Env } from '../worker'

const app = new Hono<{ Bindings: Env }>()

async function buildCustomerData(db: ReturnType<typeof getDb>, phone: string) {
  const [customer] = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1)
  if (!customer) return null

  const recentOrders = await db.select({
    id: orders.id, status: orders.status, createdAt: orders.createdAt,
    itemId: orderItems.id, productId: orderItems.productId,
    quantity: orderItems.quantity, unitPrice: orderItems.unitPrice,
    productName: products.name,
  }).from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orders.customerId, customer.id))
    .orderBy(desc(orders.createdAt))
    .limit(50)

  // Group by order
  const orderMap = new Map<number, any>()
  for (const row of recentOrders) {
    if (!orderMap.has(row.id)) {
      orderMap.set(row.id, { id: row.id, status: row.status, created_at: row.createdAt, items: [], total: 0 })
    }
    if (row.itemId) {
      const item = { product_name: row.productName, quantity: row.quantity!, unit_price: row.unitPrice! }
      orderMap.get(row.id).items.push(item)
      orderMap.get(row.id).total += row.quantity! * row.unitPrice!
    }
  }

  return {
    id: customer.id, phone: customer.phone, name: customer.name,
    address: customer.address, note: customer.note,
    orders: Array.from(orderMap.values()).slice(0, 5),
  }
}

// Public — APK uses this
app.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const { phone } = await c.req.json()
  const trimmed = phone.trim()

  // Store call in DB
  await db.insert(incomingCalls).values({ phone: trimmed })

  // Broadcast via Durable Object WebSocket
  const hub = c.env.CALL_HUB.get(c.env.CALL_HUB.idFromName('main'))
  const customerData = await buildCustomerData(db, trimmed)
  await hub.fetch(new Request('https://hub/broadcast', {
    method: 'POST',
    body: JSON.stringify({ type: 'incoming_call', phone: trimmed, customer: customerData }),
    headers: { 'Content-Type': 'application/json' },
  }))

  return c.json({ ok: true, customer: customerData, found: !!customerData })
})

// Protected — browser uses these
app.get('/pending', async (c) => {
  const db = getDb(c.env.DB)
  // SQLite stores datetime as "YYYY-MM-DD HH:MM:SS" (space, no T/Z)
  const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString().replace('T', ' ').replace('Z', '').slice(0, 19)
  const calls = await db.select().from(incomingCalls)
    .where(and(eq(incomingCalls.acknowledged, false), gte(incomingCalls.createdAt, cutoff)))
    .orderBy(desc(incomingCalls.createdAt))

  const result = await Promise.all(calls.map(async (call) => ({
    id: call.id, phone: call.phone, created_at: call.createdAt,
    customer: await buildCustomerData(db, call.phone),
  })))
  return c.json(result)
})

app.post('/:id/ack', async (c) => {
  const db = getDb(c.env.DB)
  await db.update(incomingCalls).set({ acknowledged: true }).where(eq(incomingCalls.id, Number(c.req.param('id'))))
  return c.json({ ok: true })
})

export default app
