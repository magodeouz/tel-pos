import { Hono } from 'hono'
import { prisma } from '../db'

const products = new Hono()

products.get('/', async (c) => {
  const list = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { name: 'asc' }
  })
  return c.json(list.map(p => ({
    id: p.id,
    category_id: p.categoryId,
    name: p.name,
    price: p.price,
    note: p.note,
    active: p.active,
    category: { id: p.category.id, name: p.category.name }
  })))
})

products.post('/', async (c) => {
  const body = await c.req.json()
  const p = await prisma.product.create({
    data: { categoryId: body.category_id, name: body.name, price: body.price, note: body.note ?? null }
  })
  return c.json(p, 201)
})

products.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const p = await prisma.product.update({
    where: { id },
    data: { categoryId: body.category_id, name: body.name, price: body.price, note: body.note ?? null, active: body.active ?? true }
  })
  return c.json(p)
})

products.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await prisma.product.update({ where: { id }, data: { active: false } })
  return c.json({ ok: true })
})

export default products
