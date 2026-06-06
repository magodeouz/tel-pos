import { Hono } from 'hono'
import { eq, asc } from 'drizzle-orm'
import { getDb } from '../db'
import { categories, products } from '../schema'
import type { Env } from '../worker'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder))
  const prods = await db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.name))

  return c.json(cats.map(cat => ({
    ...cat,
    sort_order: cat.sortOrder,
    products: prods.filter(p => p.categoryId === cat.id).map(p => ({
      id: p.id, category_id: p.categoryId, name: p.name, price: p.price, note: p.note, active: p.active
    }))
  })))
})

app.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const [row] = await db.insert(categories).values({ name: body.name, sortOrder: body.sort_order ?? 0 }).returning()
  return c.json(row, 201)
})

app.put('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const [row] = await db.update(categories)
    .set({ name: body.name, sortOrder: body.sort_order ?? 0 })
    .where(eq(categories.id, Number(c.req.param('id'))))
    .returning()
  return c.json(row)
})

app.delete('/:id', async (c) => {
  const db = getDb(c.env.DB)
  await db.delete(categories).where(eq(categories.id, Number(c.req.param('id'))))
  return c.json({ ok: true })
})

export default app
