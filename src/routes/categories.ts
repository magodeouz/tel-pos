import { Hono } from 'hono'
import { prisma } from '../db'

const categories = new Hono()

categories.get('/', async (c) => {
  const list = await prisma.category.findMany({
    include: { products: { where: { active: true }, orderBy: { name: 'asc' } } },
    orderBy: { sortOrder: 'asc' }
  })
  return c.json(list.map(cat => ({
    id: cat.id,
    name: cat.name,
    sort_order: cat.sortOrder,
    products: cat.products.map(p => ({
      id: p.id,
      category_id: p.categoryId,
      name: p.name,
      price: p.price,
      note: p.note,
      active: p.active,
    }))
  })))
})

categories.post('/', async (c) => {
  const body = await c.req.json()
  const cat = await prisma.category.create({
    data: { name: body.name, sortOrder: body.sort_order ?? 0 }
  })
  return c.json(cat, 201)
})

categories.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const cat = await prisma.category.update({
    where: { id },
    data: { name: body.name, sortOrder: body.sort_order ?? 0 }
  })
  return c.json(cat)
})

categories.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await prisma.category.delete({ where: { id } })
  return c.json({ ok: true })
})

export default categories
