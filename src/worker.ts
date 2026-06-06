import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getDb } from './db'
import { users, categories, products } from './schema'
import { hashPassword, requireAuth } from './security'
import authRoute from './routes/auth'
import customersRoute from './routes/customers'
import categoriesRoute from './routes/categories'
import productsRoute from './routes/products'
import ordersRoute from './routes/orders'
import incomingCallRoute from './routes/incoming_call'
import reportsRoute from './routes/reports'

export { CallHub } from './ws-hub'

export interface Env {
  DB: D1Database
  CALL_HUB: DurableObjectNamespace
  JWT_SECRET?: string
  RESTAURANT_NAME?: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

// ── WebSocket ─────────────────────────────────────────────────
app.get('/ws', (c) => {
  const hub = c.env.CALL_HUB.get(c.env.CALL_HUB.idFromName('main'))
  return hub.fetch(c.req.raw)
})

// ── Public routes ─────────────────────────────────────────────
app.route('/api/auth', authRoute)
app.get('/api/health', (c) => c.json({ ok: true }))
app.get('/api/printer/status', (c) => c.json({ connected: false }))
app.post('/api/incoming-call', (c) => incomingCallRoute.fetch(
  new Request(c.req.url.replace('/api/incoming-call', '/'), c.req.raw),
  c.env
))

// ── Auth middleware ───────────────────────────────────────────
app.use('/api/*', async (c, next) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ detail: 'Yetkilendirme gerekli' }, 401)
  return next()
})

// ── Protected routes ──────────────────────────────────────────
app.route('/api/customers', customersRoute)
app.route('/api/categories', categoriesRoute)
app.route('/api/products', productsRoute)
app.route('/api/orders', ordersRoute)
app.route('/api/incoming-call', incomingCallRoute)
app.route('/api/reports', reportsRoute)

// ── Static files (served from /public via Cloudflare Pages) ──
app.get('/robots.txt', (c) => c.text('User-agent: *\nDisallow: /', 200, { 'X-Robots-Tag': 'noindex, nofollow' }))

// ── Seed on first request ─────────────────────────────────────
let seeded = false
app.use('*', async (c, next) => {
  if (!seeded) {
    seeded = true
    const db = getDb(c.env.DB)
    try {
      const [{ count: catCount }] = await db.select({ count: db.$count(categories) }).from(categories) as any
      if (Number(catCount) === 0) {
        const [icecek, yemek] = await Promise.all([
          db.insert(categories).values({ name: 'İçecekler', sortOrder: 1 }).returning(),
          db.insert(categories).values({ name: 'Yemekler', sortOrder: 2 }).returning(),
        ])
        await db.insert(categories).values({ name: 'Tatlılar', sortOrder: 3 })
        await db.insert(products).values([
          { categoryId: icecek[0].id, name: 'Çay', price: 10 },
          { categoryId: icecek[0].id, name: 'Kahve', price: 15 },
          { categoryId: yemek[0].id, name: 'Döner', price: 50 },
          { categoryId: yemek[0].id, name: 'Pide', price: 40 },
        ])
      }
      const [{ count: userCount }] = await db.select({ count: db.$count(users) }).from(users) as any
      if (Number(userCount) === 0) {
        await db.insert(users).values({ username: 'admin', passwordHash: hashPassword('admin123') })
      }
    } catch { /* ignore */ }
  }
  return next()
})

export default app
