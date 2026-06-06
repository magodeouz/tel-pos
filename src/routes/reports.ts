import { Hono } from 'hono'
import { prisma } from '../db'

const reports = new Hono()

reports.get('/sales-by-date', async (c) => {
  const startStr = c.req.query('start_date')
  const endStr = c.req.query('end_date')

  const start = startStr ? new Date(startStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = endStr ? new Date(endStr) : new Date()
  end.setDate(end.getDate() + 1)

  const paidOrders = await prisma.order.findMany({
    where: { status: 'paid', createdAt: { gte: start, lt: end } },
    include: { items: true },
    orderBy: { createdAt: 'asc' }
  })

  let totalSales = 0
  let totalOrders = 0
  const dailyData: Record<string, { order_count: number; total_amount: number }> = {}

  for (const order of paidOrders) {
    const orderTotal = order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    if (orderTotal <= 0) continue
    totalSales += orderTotal
    totalOrders++
    const dateKey = order.createdAt.toISOString().slice(0, 10)
    if (!dailyData[dateKey]) dailyData[dateKey] = { order_count: 0, total_amount: 0 }
    dailyData[dateKey].order_count++
    dailyData[dateKey].total_amount += orderTotal
  }

  const daily_breakdown = Object.entries(dailyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }))

  return c.json({ total_sales: totalSales, total_orders: totalOrders, daily_breakdown })
})

reports.get('/product-sales', async (c) => {
  const items = await prisma.orderItem.findMany({
    where: { order: { status: 'paid' } },
    include: { product: true }
  })

  const productMap: Record<string, { product_name: string; quantity_sold: number; revenue: number }> = {}
  for (const item of items) {
    if (!productMap[item.product.name]) {
      productMap[item.product.name] = { product_name: item.product.name, quantity_sold: 0, revenue: 0 }
    }
    productMap[item.product.name].quantity_sold += item.quantity
    productMap[item.product.name].revenue += item.quantity * item.unitPrice
  }

  const top_products = Object.values(productMap)
    .sort((a, b) => b.quantity_sold - a.quantity_sold)
    .slice(0, 10)

  return c.json({
    total_quantity_sold: top_products.reduce((s, p) => s + p.quantity_sold, 0),
    top_products
  })
})

reports.get('/customer-spending', async (c) => {
  const customers = await prisma.customer.findMany({
    include: { orders: { where: { status: 'paid' }, include: { items: true } } }
  })

  const data = customers
    .map(c => {
      const total_spent = c.orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity * i.unitPrice, 0), 0)
      return { id: c.id, name: c.name, phone: c.phone, total_spent, order_count: c.orders.length }
    })
    .filter(c => c.total_spent > 0)
    .sort((a, b) => b.total_spent - a.total_spent)

  return c.json({
    total_customers: data.length,
    total_spending: data.reduce((s, c) => s + c.total_spent, 0),
    top_customers: data.slice(0, 20)
  })
})

export default reports
