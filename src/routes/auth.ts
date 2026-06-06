import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { users } from '../schema'
import { verifyPassword, createToken } from '../security'
import type { Env } from '../worker'

const auth = new Hono<{ Bindings: Env }>()

auth.post('/login', async (c) => {
  const { username, password } = await c.req.json()
  const db = getDb(c.env.DB)
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return c.json({ detail: 'Kullanıcı adı veya şifre yanlış' }, 401)
  }
  const token = await createToken(username, c.env)
  return c.json({ access_token: token, token_type: 'bearer' })
})

export default auth
