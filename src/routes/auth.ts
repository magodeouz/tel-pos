import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { users } from '../schema'
import { verifyPassword, hashPassword, createToken } from '../security'
import type { Env } from '../worker'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

async function checkRateLimit(db: ReturnType<typeof getDb>, ip: string): Promise<boolean> {
  const now = Date.now()
  const result = await db.run(
    `INSERT INTO login_attempts (ip, count, reset_at) VALUES (?, 1, ?)
     ON CONFLICT(ip) DO UPDATE SET
       count = CASE WHEN reset_at < ? THEN 1 ELSE count + 1 END,
       reset_at = CASE WHEN reset_at < ? THEN ? ELSE reset_at END
     RETURNING count, reset_at`,
    [ip, now + WINDOW_MS, now, now, now + WINDOW_MS]
  ) as any
  const row = result?.results?.[0]
  return !row || row.count <= MAX_ATTEMPTS
}

async function resetRateLimit(db: ReturnType<typeof getDb>, ip: string): Promise<void> {
  await db.run('DELETE FROM login_attempts WHERE ip = ?', [ip])
}

const auth = new Hono<{ Bindings: Env }>()

auth.post('/login', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown'
  const db = getDb(c.env.DB)

  if (!await checkRateLimit(db, ip)) {
    return c.json({ detail: '15 dakika içinde çok fazla hatalı giriş. Lütfen bekleyin.' }, 429)
  }

  const { username, password } = await c.req.json()
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return c.json({ detail: 'Kullanıcı adı veya şifre yanlış' }, 401)
  }

  await resetRateLimit(db, ip)
  const token = await createToken(username, c.env)
  return c.json({ access_token: token, token_type: 'bearer', username })
})

// Change password — requires current password
auth.post('/change-password', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return c.json({ detail: 'Yetkilendirme gerekli' }, 401)

  const { current_password, new_password } = await c.req.json()
  if (!new_password || new_password.length < 6) {
    return c.json({ detail: 'Yeni şifre en az 6 karakter olmalı' }, 400)
  }

  const { verifyToken } = await import('../security')
  const username = await verifyToken(authHeader.slice(7), c.env)
  if (!username) return c.json({ detail: 'Geçersiz token' }, 401)

  const db = getDb(c.env.DB)
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)
  if (!user || !verifyPassword(current_password, user.passwordHash)) {
    return c.json({ detail: 'Mevcut şifre yanlış' }, 401)
  }

  await db.update(users)
    .set({ passwordHash: hashPassword(new_password) })
    .where(eq(users.username, username))

  return c.json({ ok: true })
})

export default auth
