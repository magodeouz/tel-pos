import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { products, categories } from '../schema'
import type { Env } from '../worker'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const rows = await db.select().from(products).where(eq(products.active, true)).orderBy(products.name)
  const cats = await db.select().from(categories)
  const catMap = Object.fromEntries(cats.map(c => [c.id, c]))
  return c.json(rows.map(p => ({ ...p, category_id: p.categoryId, category: catMap[p.categoryId] })))
})

app.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const [row] = await db.insert(products).values({
    categoryId: body.category_id, name: body.name, price: body.price, note: body.note ?? null
  }).returning()
  return c.json(row, 201)
})

app.put('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const [row] = await db.update(products)
    .set({ categoryId: body.category_id, name: body.name, price: body.price, note: body.note ?? null, active: body.active ?? true })
    .where(eq(products.id, Number(c.req.param('id'))))
    .returning()
  return c.json(row)
})

app.delete('/:id', async (c) => {
  const db = getDb(c.env.DB)
  await db.update(products).set({ active: false }).where(eq(products.id, Number(c.req.param('id'))))
  return c.json({ ok: true })
})

export default app
