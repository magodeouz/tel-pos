import { Hono } from 'hono'
import { prisma } from '../db'

const customers = new Hono()

customers.get('/', async (c) => {
  const list = await prisma.customer.findMany({ orderBy: { name: 'asc' } })
  return c.json(list)
})

customers.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const customer = await prisma.customer.findUnique({ where: { id } })
  if (!customer) return c.json({ detail: 'Müşteri bulunamadı' }, 404)
  return c.json(customer)
})

customers.get('/phone/:phone', async (c) => {
  const phone = c.req.param('phone')
  const customer = await prisma.customer.findUnique({ where: { phone } })
  if (!customer) return c.json({ detail: 'Müşteri bulunamadı' }, 404)
  return c.json(customer)
})

customers.post('/', async (c) => {
  const body = await c.req.json()
  const existing = await prisma.customer.findUnique({ where: { phone: body.phone } })
  if (existing) return c.json({ detail: 'Bu telefon zaten kayıtlı' }, 400)
  const customer = await prisma.customer.create({
    data: { phone: body.phone, name: body.name, address: body.address ?? null, note: body.note ?? null }
  })
  return c.json(customer, 201)
})

customers.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const customer = await prisma.customer.update({
    where: { id },
    data: { phone: body.phone, name: body.name, address: body.address ?? null, note: body.note ?? null }
  })
  return c.json(customer)
})

customers.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await prisma.customer.delete({ where: { id } })
  return c.json({ ok: true })
})

export default customers
