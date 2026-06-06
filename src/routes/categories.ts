import { Hono } from 'hono'
import { eq, asc } from 'drizzle-orm'
import { getDb } from '../db'
import { categories, products } from '../schema'
import type { Env } from '../worker'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.id))
  const prods = await db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.sortOrder), asc(products.name))

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

// Persist a new category order: ids in their desired sequence.
app.post('/reorder', async (c) => {
  const db = getDb(c.env.DB)
  const { ids } = await c.req.json()
  if (!Array.isArray(ids)) return c.json({ detail: 'ids gerekli' }, 400)
  for (let i = 0; i < ids.length; i++) {
    await db.update(categories).set({ sortOrder: i }).where(eq(categories.id, Number(ids[i])))
  }
  return c.json({ ok: true })
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
