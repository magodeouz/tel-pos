import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { users } from '../schema'
import { verifyPassword, hashPassword, createToken } from '../security'
import type { Env } from '../worker'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 5 * 60 * 1000 // 5 minutes

async function checkRateLimit(d1: D1Database, ip: string): Promise<boolean> {
  const now = Date.now()
  const resetAt = now + WINDOW_MS
  // Read current state
  const row = await d1.prepare('SELECT count, reset_at FROM login_attempts WHERE ip = ?').bind(ip).first<{count: number; reset_at: number}>()

  if (!row || row.reset_at < now) {
    // First attempt or window expired — upsert fresh
    await d1.prepare('INSERT INTO login_attempts (ip, count, reset_at) VALUES (?, 1, ?) ON CONFLICT(ip) DO UPDATE SET count=1, reset_at=?')
      .bind(ip, resetAt, resetAt).run()
    return true
  }

  if (row.count >= MAX_ATTEMPTS) return false

  await d1.prepare('UPDATE login_attempts SET count = count + 1 WHERE ip = ?').bind(ip).run()
  return true
}

async function resetRateLimit(d1: D1Database, ip: string): Promise<void> {
  await d1.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run()
}

const auth = new Hono<{ Bindings: Env }>()

auth.post('/login', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown'
  const rateOk = await checkRateLimit(c.env.DB, ip)
  if (!rateOk) {
    const row = await c.env.DB.prepare('SELECT reset_at FROM login_attempts WHERE ip = ?').bind(ip).first<{reset_at: number}>()
    const retryAfter = row ? Math.max(0, Math.ceil((row.reset_at - Date.now()) / 1000)) : 300
    return c.json({ detail: 'Çok fazla hatalı giriş.', retry_after: retryAfter }, 429)
  }

  const { username, password } = await c.req.json()
  const db = getDb(c.env.DB)
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return c.json({ detail: 'Kullanıcı adı veya şifre yanlış' }, 401)
  }

  await resetRateLimit(c.env.DB, ip)
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
