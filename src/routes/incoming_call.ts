import { Hono } from 'hono'
import { prisma } from '../db'

const incomingCall = new Hono()

async function buildCustomerData(phone: string) {
  const customer = await prisma.customer.findUnique({ where: { phone } })
  if (!customer) return null

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return {
    id: customer.id,
    phone: customer.phone,
    name: customer.name,
    address: customer.address,
    note: customer.note,
    orders: orders.map(o => ({
      id: o.id,
      status: o.status,
      created_at: o.createdAt.toISOString(),
      items: o.items.map(i => ({ product_name: i.product.name, quantity: i.quantity, unit_price: i.unitPrice })),
      total: o.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
    }))
  }
}

incomingCall.post('/', async (c) => {
  const { phone } = await c.req.json()
  const trimmed = phone.trim()
  await prisma.incomingCall.create({ data: { phone: trimmed } })
  const customer = await buildCustomerData(trimmed)
  return c.json({ ok: true, customer, found: !!customer })
})

incomingCall.get('/pending', async (c) => {
  const cutoff = new Date(Date.now() - 2 * 60 * 1000)
  const calls = await prisma.incomingCall.findMany({
    where: { acknowledged: false, createdAt: { gte: cutoff } },
    orderBy: { createdAt: 'desc' },
  })

  const result = await Promise.all(calls.map(async (call) => ({
    id: call.id,
    phone: call.phone,
    created_at: call.createdAt.toISOString(),
    customer: await buildCustomerData(call.phone),
  })))

  return c.json(result)
})

incomingCall.post('/:id/ack', async (c) => {
  const id = Number(c.req.param('id'))
  await prisma.incomingCall.update({ where: { id }, data: { acknowledged: true } })
  return c.json({ ok: true })
})

export default incomingCall
