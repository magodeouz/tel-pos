import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { customers } from '../schema'
import type { Env } from '../worker'

const app = new Hono<{ Bindings: Env }>()

const normalize = (r: any) => ({ ...r, created_at: r.createdAt, createdAt: undefined })

app.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const list = await db.select().from(customers).orderBy(customers.name)
  return c.json(list.map(normalize))
})

app.get('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const [row] = await db.select().from(customers).where(eq(customers.id, Number(c.req.param('id')))).limit(1)
  if (!row) return c.json({ detail: 'Müşteri bulunamadı' }, 404)
  return c.json(normalize(row))
})

app.get('/phone/:phone', async (c) => {
  const db = getDb(c.env.DB)
  const [row] = await db.select().from(customers).where(eq(customers.phone, c.req.param('phone'))).limit(1)
  if (!row) return c.json({ detail: 'Müşteri bulunamadı' }, 404)
  return c.json(normalize(row))
})

app.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const existing = await db.select().from(customers).where(eq(customers.phone, body.phone)).limit(1)
  if (existing.length) return c.json({ detail: 'Bu telefon zaten kayıtlı' }, 400)
  const [row] = await db.insert(customers).values({
    phone: body.phone, name: body.name, address: body.address ?? null, note: body.note ?? null
  }).returning()
  return c.json(normalize(row), 201)
})

app.put('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const [row] = await db.update(customers)
    .set({ phone: body.phone, name: body.name, address: body.address ?? null, note: body.note ?? null })
    .where(eq(customers.id, Number(c.req.param('id'))))
    .returning()
  return c.json(normalize(row))
})

app.delete('/:id', async (c) => {
  const db = getDb(c.env.DB)
  await db.delete(customers).where(eq(customers.id, Number(c.req.param('id'))))
  return c.json({ ok: true })
})

export default app
