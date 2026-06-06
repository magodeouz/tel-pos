import { Hono } from 'hono'
import { eq, gte, lte, desc } from 'drizzle-orm'
import { getDb } from '../db'
import { orders, orderItems, products, customers } from '../schema'
import type { Env } from '../worker'

const app = new Hono<{ Bindings: Env }>()

app.get('/sales-by-date', async (c) => {
  const db = getDb(c.env.DB)
  const startStr = c.req.query('start_date')
  const endStr = c.req.query('end_date')
  const start = startStr ?? new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const end = endStr ?? new Date().toISOString().slice(0, 10)

  const paidOrders = await db.select().from(orders)
    .where(eq(orders.status, 'paid'))

  const filtered = paidOrders.filter(o => o.createdAt && o.createdAt >= start && o.createdAt <= end + 'T23:59:59')
  const items = await db.select().from(orderItems)

  let totalSales = 0, totalOrders = 0
  const dailyData: Record<string, { order_count: number; total_amount: number }> = {}

  for (const order of filtered) {
    const orderTotal = items.filter(i => i.orderId === order.id).reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    if (orderTotal <= 0) continue
    totalSales += orderTotal
    totalOrders++
    const dateKey = (order.createdAt ?? '').slice(0, 10)
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

export default app
