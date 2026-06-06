import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { users } from '../schema'
import { verifyPassword, hashPassword, createToken } from '../security'
import type { Env } from '../worker'

// In-memory brute force protection (per worker instance, good enough for edge)
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_ATTEMPTS) return false
  entry.count++
  return true
}

function resetRateLimit(ip: string) {
  loginAttempts.delete(ip)
}

const auth = new Hono<{ Bindings: Env }>()

auth.post('/login', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return c.json({ detail: '15 dakika içinde çok fazla hatalı giriş. Lütfen bekleyin.' }, 429)
  }

  const { username, password } = await c.req.json()
  const db = getDb(c.env.DB)
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return c.json({ detail: 'Kullanıcı adı veya şifre yanlış' }, 401)
  }

  resetRateLimit(ip)
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
