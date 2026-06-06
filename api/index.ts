import { Hono } from 'hono'
import { handle } from '@hono/node-server/vercel'
import { prisma } from '../src/db'
import { requireAuth, hashPassword } from '../src/security'
import auth from '../src/routes/auth'
import customers from '../src/routes/customers'
import categories from '../src/routes/categories'
import products from '../src/routes/products'
import orders from '../src/routes/orders'
import incomingCall from '../src/routes/incoming_call'
import reports from '../src/routes/reports'

const app = new Hono()

// ── Public routes ────────────────────────────────────────────
app.route('/api/auth', auth)
app.get('/api/health', (c) => c.json({ ok: true }))
app.get('/api/printer/status', (c) => c.json({ connected: false }))
app.post('/api/incoming-call', async (c) => {
  const { phone } = await c.req.json()
  const trimmed = phone.trim()
  await prisma.incomingCall.create({ data: { phone: trimmed } })
  const customer = await prisma.customer.findUnique({ where: { phone: trimmed } })
  return c.json({ ok: true, customer: customer ?? null, found: !!customer })
})

// ── Auth middleware ──────────────────────────────────────────
app.use('/api/*', async (c, next) => {
  const user = requireAuth(c)
  if (!user) return c.json({ detail: 'Yetkilendirme gerekli' }, 401)
  return next()
})

// ── Protected routes ─────────────────────────────────────────
app.route('/api/customers', customers)
app.route('/api/categories', categories)
app.route('/api/products', products)
app.route('/api/orders', orders)
app.route('/api/incoming-call', incomingCall)
app.route('/api/reports', reports)

// ── Seed ─────────────────────────────────────────────────────
async function seed() {
  try {
    const [catCount, userCount] = await Promise.all([
      prisma.category.count(),
      prisma.user.count(),
    ])
    if (catCount === 0) {
      const [icecek, yemek] = await Promise.all([
        prisma.category.create({ data: { name: 'İçecekler', sortOrder: 1 } }),
        prisma.category.create({ data: { name: 'Yemekler', sortOrder: 2 } }),
      ])
      await prisma.category.create({ data: { name: 'Tatlılar', sortOrder: 3 } })
      await prisma.product.createMany({
        data: [
          { categoryId: icecek.id, name: 'Çay', price: 10 },
          { categoryId: icecek.id, name: 'Kahve', price: 15 },
          { categoryId: yemek.id, name: 'Döner', price: 50 },
          { categoryId: yemek.id, name: 'Pide', price: 40 },
        ]
      })
    }
    if (userCount === 0) {
      await prisma.user.create({
        data: { username: 'admin', passwordHash: hashPassword('admin123') }
      })
    }
  } catch { /* ignore */ }
}

seed()

export default handle(app)
