import { Hono } from 'hono'
import { eq, asc, sql } from 'drizzle-orm'
import { getDb } from '../db'
import { products, categories } from '../schema'
import type { Env } from '../worker'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const rows = await db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.sortOrder), asc(products.name))
  const cats = await db.select().from(categories)
  const catMap = Object.fromEntries(cats.map(c => [c.id, c]))
  return c.json(rows.map(p => ({ ...p, category_id: p.categoryId, category: catMap[p.categoryId] })))
})

app.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  // New product goes to the end of its category.
  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${products.sortOrder}), -1)` })
    .from(products).where(eq(products.categoryId, body.category_id))
  const [row] = await db.insert(products).values({
    categoryId: body.category_id, name: body.name, price: body.price, note: body.note ?? null,
    sortOrder: Number(max) + 1,
  }).returning()
  return c.json(row, 201)
})

// Persist a new product order within a category: ids in their desired sequence.
app.post('/reorder', async (c) => {
  const db = getDb(c.env.DB)
  const { ids } = await c.req.json()
  if (!Array.isArray(ids)) return c.json({ detail: 'ids gerekli' }, 400)
  for (let i = 0; i < ids.length; i++) {
    await db.update(products).set({ sortOrder: i }).where(eq(products.id, Number(ids[i])))
  }
  return c.json({ ok: true })
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
