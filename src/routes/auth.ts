import { Hono } from 'hono'
import { prisma } from '../db'
import { verifyPassword, createToken } from '../security'

const auth = new Hono()

auth.post('/login', async (c) => {
  const { username, password } = await c.req.json()
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return c.json({ detail: 'Kullanıcı adı veya şifre yanlış' }, 401)
  }
  return c.json({ access_token: createToken(username), token_type: 'bearer' })
})

export default auth
