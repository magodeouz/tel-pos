import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Context } from 'hono'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
const JWT_EXPIRE = '24h'

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed)
}

export function createToken(username: string): string {
  return jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: JWT_EXPIRE })
}

export function verifyToken(token: string): string {
  const payload = jwt.verify(token, JWT_SECRET) as { sub: string }
  return payload.sub
}

export function requireAuth(c: Context): string | null {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    return verifyToken(auth.slice(7))
  } catch {
    return null
  }
}
