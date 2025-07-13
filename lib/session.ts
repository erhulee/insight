import { JWTPayload } from 'jose'
import jwt from 'jsonwebtoken'
import redis from './redis'

const JWT_SECRET = process.env.SESSION_SECRET || 'default_secret'
const EXPIRES_IN = '7d' // 7天

// 生成JWT并存入Redis
export async function createSession(userId: string) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: EXPIRES_IN })
  // 以userId为key存token，便于单点登录和登出
  await redis.set(`jwt:${userId}`, token, 'EX', 7 * 24 * 60 * 60)
  return token
}

// 校验JWT并查Redis
export async function decrypt(token: string | undefined = ''): Promise<JWTPayload | null> {
  // if (!token) return null
  // try {
  //   const payload = jwt.verify(token, JWT_SECRET) as JWTPayload & { userId: string }
  //   const redisToken = await redis.get(`jwt:${payload.userId}`)
  //   if (redisToken !== token) return null
  //   return payload
  // } catch (error) {
  //   console.log("decrypt error:", error)
  //   return null
  // }
  return null
}

// 删除Redis中的JWT
export async function deleteSession(userId: string) {
  await redis.del(`jwt:${userId}`)
}
