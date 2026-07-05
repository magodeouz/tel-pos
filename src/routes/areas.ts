import { Hono } from 'hono'
import { eq, asc } from 'drizzle-orm'
import { getDb } from '../db'
import { areas, diningTables } from '../schema'
import type { Env } from '../worker'

const app = new Hono<{ Bindings: Env }>()

// ── Areas (salon bölümleri) with nested tables ───────────────────
app.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const rows = await db.select().from(areas).orderBy(asc(areas.sortOrder), asc(areas.id))
  const tbls = await db.select().from(diningTables).orderBy(asc(diningTables.sortOrder), asc(diningTables.id))

  return c.json(rows.map(a => ({
    id: a.id,
    name: a.name,
    sort_order: a.sortOrder,
    tables: tbls.filter(t => t.areaId === a.id).map(t => ({
      id: t.id, area_id: t.areaId, name: t.name, sort_order: t.sortOrder,
    })),
  })))
})

app.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const [row] = await db.insert(areas).values({ name: body.name, sortOrder: body.sort_order ?? 0 }).returning()
  return c.json(row, 201)
})

// Persist a new area order: ids in their desired sequence.
app.post('/reorder', async (c) => {
  const db = getDb(c.env.DB)
  const { ids } = await c.req.json()
  if (!Array.isArray(ids)) return c.json({ detail: 'ids gerekli' }, 400)
  for (let i = 0; i < ids.length; i++) {
    await db.update(areas).set({ sortOrder: i }).where(eq(areas.id, Number(ids[i])))
  }
  return c.json({ ok: true })
})

app.put('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const [row] = await db.update(areas)
    .set({ name: body.name, sortOrder: body.sort_order ?? 0 })
    .where(eq(areas.id, Number(c.req.param('id'))))
    .returning()
  return c.json(row)
})

app.delete('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const id = Number(c.req.param('id'))
  // Remove the area's tables too, so the floor plan has no orphans.
  await db.delete(diningTables).where(eq(diningTables.areaId, id))
  await db.delete(areas).where(eq(areas.id, id))
  return c.json({ ok: true })
})

// ── Tables (masalar) ─────────────────────────────────────────────
app.post('/:areaId/tables', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const [row] = await db.insert(diningTables).values({
    areaId: Number(c.req.param('areaId')), name: body.name, sortOrder: body.sort_order ?? 0,
  }).returning()
  return c.json(row, 201)
})

app.post('/tables/reorder', async (c) => {
  const db = getDb(c.env.DB)
  const { ids } = await c.req.json()
  if (!Array.isArray(ids)) return c.json({ detail: 'ids gerekli' }, 400)
  for (let i = 0; i < ids.length; i++) {
    await db.update(diningTables).set({ sortOrder: i }).where(eq(diningTables.id, Number(ids[i])))
  }
  return c.json({ ok: true })
})

app.put('/tables/:id', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json()
  const [row] = await db.update(diningTables)
    .set({ name: body.name, sortOrder: body.sort_order ?? 0 })
    .where(eq(diningTables.id, Number(c.req.param('id'))))
    .returning()
  return c.json(row)
})

app.delete('/tables/:id', async (c) => {
  const db = getDb(c.env.DB)
  await db.delete(diningTables).where(eq(diningTables.id, Number(c.req.param('id'))))
  return c.json({ ok: true })
})

export default app
