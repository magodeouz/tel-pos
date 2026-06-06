import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import type { Context } from 'hono'

function getSecret(env: { JWT_SECRET?: string }) {
  return new TextEncoder().encode(env.JWT_SECRET ?? 'dev-secret-change-in-production-min32chars!')
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed)
}

export async function createToken(username: string, env: { JWT_SECRET?: string }): Promise<string> {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(getSecret(env))
}

export async function verifyToken(token: string, env: { JWT_SECRET?: string }): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(env))
    return payload.sub as string
  } catch {
    return null
  }
}

export async function requireAuth(c: Context): Promise<string | null> {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return verifyToken(auth.slice(7), c.env as { JWT_SECRET?: string })
}
