import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getDb } from './db'
import { requireAuth } from './security'
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


export default app
