import { Redis } from 'ioredis'
import { ConversationSession } from '../../schemas/conversation'

export class ConversationCache {
	constructor(private redis: Redis) {}

	// 缓存会话状态
	async cacheSession(
		sessionId: string,
		session: ConversationSession,
		ttl: number = 3600, // 1小时过期
	): Promise<void> {
		await this.redis.setex(
			`conversation:${sessionId}`,
			ttl,
			JSON.stringify(session),
		)
	}

	// 获取会话状态
	async getSession(sessionId: string): Promise<ConversationSession | null> {
		const cached = await this.redis.get(`conversation:${sessionId}`)
		return cached ? JSON.parse(cached) : null
	}

	// 缓存 AI 响应
	async cacheAIResponse(
		key: string,
		response: any,
		ttl: number = 300, // 5分钟过期
	): Promise<void> {
		await this.redis.setex(`ai_response:${key}`, ttl, JSON.stringify(response))
	}

	// 获取缓存的 AI 响应
	async getCachedAIResponse(key: string): Promise<any | null> {
		const cached = await this.redis.get(`ai_response:${key}`)
		return cached ? JSON.parse(cached) : null
	}

	// 缓存对话消息
	async cacheMessages(
		sessionId: string,
		messages: any[],
		ttl: number = 1800, // 30分钟过期
	): Promise<void> {
		await this.redis.setex(
			`messages:${sessionId}`,
			ttl,
			JSON.stringify(messages),
		)
	}

	// 获取缓存的对话消息
	async getCachedMessages(sessionId: string): Promise<any[] | null> {
		const cached = await this.redis.get(`messages:${sessionId}`)
		return cached ? JSON.parse(cached) : null
	}

	// 删除会话缓存
	async deleteSession(sessionId: string): Promise<void> {
		await this.redis.del(`conversation:${sessionId}`)
		await this.redis.del(`messages:${sessionId}`)
	}

	// 清理过期缓存
	async cleanupExpiredSessions(): Promise<void> {
		const keys = await this.redis.keys('conversation:*')
		const expiredKeys = []

		for (const key of keys) {
			const ttl = await this.redis.ttl(key)
			if (ttl === -1) {
				// 没有过期时间，标记为过期
				expiredKeys.push(key)
			}
		}

		if (expiredKeys.length > 0) {
			await this.redis.del(...expiredKeys)
		}
	}

	// 设置会话过期时间
	async expireSession(sessionId: string, ttl: number): Promise<void> {
		await this.redis.expire(`conversation:${sessionId}`, ttl)
		await this.redis.expire(`messages:${sessionId}`, ttl)
	}

	// 检查会话是否存在
	async sessionExists(sessionId: string): Promise<boolean> {
		const exists = await this.redis.exists(`conversation:${sessionId}`)
		return exists === 1
	}

	// 获取会话 TTL
	async getSessionTTL(sessionId: string): Promise<number> {
		return await this.redis.ttl(`conversation:${sessionId}`)
	}
}
