import { Hono } from 'hono'
import { cors } from 'hono/cors'
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
  ASSETS: Fetcher
  JWT_SECRET?: string
  RESTAURANT_NAME?: string
  RESTAURANT_ADDRESS?: string
  RESTAURANT_PHONE?: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

// Never cache API responses — stale lists were the #1 "didn't update" bug.
// Browsers (esp. mobile) heuristically cache GETs that lack Cache-Control.
app.use('/api/*', async (c, next) => {
  await next()
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate')
  c.header('Pragma', 'no-cache')
})

// ── WebSocket ─────────────────────────────────────────────────
app.get('/ws', (c) => {
  const hub = c.env.CALL_HUB.get(c.env.CALL_HUB.idFromName('main'))
  return hub.fetch(c.req.raw)
})

// ── Public routes ─────────────────────────────────────────────
app.route('/api/auth', authRoute)
app.get('/api/health', (c) => c.json({ ok: true }))
app.get('/api/printer/status', (c) => c.json({ connected: false }))
// Receipt + day-close are public (window.open can't send auth headers)
app.get('/api/orders/:id/receipt', (c) => ordersRoute.fetch(
  new Request(c.req.url.replace('/api/orders', ''), c.req.raw),
  c.env
))
app.get('/api/reports/day-close', (c) => reportsRoute.fetch(
  new Request(c.req.url.replace('/api/reports', ''), c.req.raw),
  c.env
))
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

// ── HTML pages → serve from ASSETS ───────────────────────────
// HTML must never be cached, so the ?v= cache-bust on js/css is always
// re-read and clients pick up new code immediately after deploy.
const serveAsset = (file: string) => async (c: any) => {
  const res = await c.env.ASSETS.fetch(new Request(`${new URL(c.req.url).origin}/${file}`))
  const out = new Response(res.body, res)
  out.headers.set('Cache-Control', 'no-cache, must-revalidate')
  return out
}

app.get('/', serveAsset('login.html'))
app.get('/pos', serveAsset('pos.html'))
app.get('/admin', serveAsset('admin.html'))
app.get('/management', serveAsset('management.html'))
app.get('/robots.txt', (c) => c.text('User-agent: *\nDisallow: /', 200, { 'X-Robots-Tag': 'noindex, nofollow' }))

export default app
