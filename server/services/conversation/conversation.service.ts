import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import {
	ConversationSession,
	Message,
	CreateSessionInput,
	SendMessageInput,
	GetMessagesInput,
	UpdateStateInput,
	CompleteConversationInput,
	ResetConversationInput,
	ConversationPhase,
} from '../../schemas/conversation'
import { createInitialConversationState } from '../../../app/(dashboard)/dashboard/create/_components/utils/conversation-utils'
import { AIConversationService } from './ai-conversation.service'
import { ConversationCache } from './cache.service'

// 历史会话相关接口
export interface ConversationHistoryItem {
	id: string
	sessionId: string
	title: string
	description: string
	phase: string
	progress: number
	messageCount: number
	createdAt: Date
	updatedAt: Date
	completedAt: Date | null
	status: string
	collectedInfo: any
	lastMessage?: string
}

export interface ConversationHistoryFilters {
	status?: 'active' | 'completed' | 'abandoned' | undefined
	phase?: string | undefined
	dateRange?:
		| {
				start: Date
				end: Date
		  }
		| undefined
	search?: string | undefined
}

export interface ConversationHistoryResponse {
	sessions: ConversationHistoryItem[]
	total: number
	page: number
	pageSize: number
	hasMore: boolean
}

export class ConversationService {
	constructor(
		private prisma: PrismaClient,
		private redis: Redis,
		private aiService: AIConversationService,
		private cache: ConversationCache,
	) {}

	// 开始会话的时候调用 createSession
	async createSession(input: CreateSessionInput): Promise<ConversationSession> {
		const sessionId = this.generateSessionId()
		const session = await this.prisma.conversationSession.create({
			data: {
				id: sessionId,
				sessionId,
				userId: input.userId || 'anonymous',
			},
		})

		// 转换为ConversationSession格式
		const conversationSession: ConversationSession = {
			id: session.id,
			sessionId: session.sessionId,
			userId: session.userId!,
			state: createInitialConversationState(),
			messages: [],
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
		}

		// 缓存会话状态
		await this.cache.cacheSession(sessionId, conversationSession)

		return conversationSession
	}

	async sendMessage(
		input: SendMessageInput,
	): Promise<{ userMessage: any; aiMessage: any; conversationState: any }> {
		console.log('sendMessage', input)
		const { sessionId, content } = input

		// 获取会话状态
		const session = await this.getSession(sessionId)
		if (!session) {
			throw new Error('会话不存在')
		}

		// 保存用户消息
		const userMessage = await this.prisma.conversationMessage.create({
			data: {
				sessionId,
				messageId: this.generateMessageId(),
				type: 'user',
				content,
				metadata: {},
			},
		})

		// 不再需要更新对话状态，因为字段已删除

		// 获取 AI 响应
		const aiResponse = await this.aiService.chat({
			sessionId,
			message: content,
			userId: session.userId!,
		})

		// 保存 AI 消息
		const aiMessage = await this.prisma.conversationMessage.create({
			data: {
				sessionId,
				messageId: this.generateMessageId(),
				type: 'ai',
				content: aiResponse.content,
				suggestions: aiResponse.suggestions,
				metadata: aiResponse.metadata || {},
			},
		})

		// 不再需要更新会话状态，因为字段已删除

		return {
			userMessage,
			aiMessage,
			conversationState: aiResponse.conversationState,
		}
	}

	async getMessages(input: GetMessagesInput): Promise<Message[]> {
		const { sessionId, limit, offset } = input

		// 检查缓存
		const cached = await this.cache.getCachedMessages(sessionId)
		if (cached) {
			return cached.slice(offset || 0, (offset || 0) + (limit || 10))
		}

		// 从数据库获取
		const dbMessages = await this.prisma.conversationMessage.findMany({
			where: { sessionId },
			orderBy: { createdAt: 'asc' },
			take: limit || 10,
			skip: offset || 0,
		})

		// 转换为Message格式
		const messages: Message[] = dbMessages.map((msg) => ({
			id: msg.messageId,
			type: msg.type as 'user' | 'ai',
			content: msg.content,
			timestamp: msg.createdAt,
			suggestions: Array.isArray(msg.suggestions)
				? (msg.suggestions as string[])
				: undefined,
		}))

		// 缓存消息
		await this.cache.cacheMessages(sessionId, messages)

		return messages
	}

	async updateState(input: UpdateStateInput): Promise<ConversationSession> {
		const { sessionId } = input

		const dbSession = await this.prisma.conversationSession.update({
			where: { sessionId },
			data: {
				updatedAt: new Date(),
			},
		})

		// 转换为ConversationSession格式
		const session: ConversationSession = {
			id: dbSession.id,
			sessionId: dbSession.sessionId,
			userId: dbSession.userId!,
			state: createInitialConversationState(),
			messages: [],
			createdAt: dbSession.createdAt,
			updatedAt: dbSession.updatedAt,
		}

		// 更新缓存
		await this.cache.cacheSession(sessionId, session)

		return session
	}

	async completeConversation(input: CompleteConversationInput): Promise<any> {
		const { sessionId, finalPrompt } = input

		// 获取会话信息
		const session = await this.prisma.conversationSession.findUnique({
			where: { sessionId },
		})

		if (!session) {
			throw new Error('会话不存在')
		}

		// 生成最终问卷
		const surveyResponse = await this.aiService.generateSurvey({
			sessionId,
			prompt: finalPrompt || '请根据对话内容生成问卷',
			userId: session.userId!,
		})

		// 转换为ConversationSession格式并更新缓存
		const conversationSession: ConversationSession = {
			id: session.id,
			sessionId: session.sessionId,
			userId: session.userId!,
			state: createInitialConversationState(),
			messages: [],
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
		}

		await this.cache.cacheSession(sessionId, conversationSession)

		return {
			session: conversationSession,
			survey: surveyResponse.survey,
		}
	}

	async resetConversation(
		input: ResetConversationInput,
	): Promise<ConversationSession> {
		const { sessionId } = input

		// 删除所有消息
		await this.prisma.conversationMessage.deleteMany({
			where: { sessionId },
		})

		// 重置会话状态
		const session = await this.prisma.conversationSession.update({
			where: { sessionId },
			data: {
				updatedAt: new Date(),
			},
		})

		// 转换为ConversationSession格式
		const conversationSession: ConversationSession = {
			id: session.id,
			sessionId: session.sessionId,
			userId: session.userId!,
			state: createInitialConversationState(),
			messages: [],
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
		}

		// 清除缓存
		await this.cache.deleteSession(sessionId)

		return conversationSession
	}

	async getSession(sessionId: string): Promise<ConversationSession | null> {
		// 先检查缓存
		const cached = await this.cache.getSession(sessionId)
		if (cached) {
			return cached
		}

		// 从数据库获取
		const dbSession = await this.prisma.conversationSession.findUnique({
			where: { sessionId },
		})

		if (dbSession) {
			// 转换为ConversationSession格式
			const session: ConversationSession = {
				id: dbSession.id,
				sessionId: dbSession.sessionId,
				userId: dbSession.userId!,
				state: createInitialConversationState(),
				messages: [],
				createdAt: dbSession.createdAt,
				updatedAt: dbSession.updatedAt,
			}

			// 缓存会话
			await this.cache.cacheSession(sessionId, session)
			return session
		}

		return null
	}

	private async getRecentMessages(
		sessionId: string,
		limit: number,
	): Promise<Message[]> {
		const dbMessages = await this.prisma.conversationMessage.findMany({
			where: { sessionId },
			orderBy: { createdAt: 'desc' },
			take: limit,
		})

		return dbMessages.map((msg) => ({
			id: msg.messageId,
			type: msg.type as 'user' | 'ai',
			content: msg.content,
			timestamp: msg.createdAt,
			suggestions: Array.isArray(msg.suggestions)
				? (msg.suggestions as string[])
				: undefined,
		}))
	}

	private generateSessionId(): string {
		return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
	}

	private generateMessageId(): string {
		return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
	}

	// ==================== 历史会话相关方法 ====================

	/**
	 * 获取用户的历史会话列表
	 */
	async getUserConversationHistory(
		userId: string,
		page: number = 1,
		pageSize: number = 10,
		filters: ConversationHistoryFilters = {},
	): Promise<ConversationHistoryResponse> {
		const skip = (page - 1) * pageSize

		// 构建查询条件
		const where: any = {
			userId,
		}

		// 状态和阶段过滤已删除，因为字段不存在

		// 日期范围过滤
		if (filters.dateRange) {
			where.createdAt = {
				gte: filters.dateRange.start,
				lte: filters.dateRange.end,
			}
		}

		// 搜索过滤已删除，因为 collectedInfo 字段不存在

		// 获取会话列表
		const [sessions, total] = await Promise.all([
			this.prisma.conversationSession.findMany({
				where,
				orderBy: { updatedAt: 'desc' },
				skip,
				take: pageSize,
				include: {
					messages: {
						orderBy: { createdAt: 'desc' },
						take: 1,
					},
				},
			}),
			this.prisma.conversationSession.count({ where }),
		])

		// 转换为前端需要的格式
		const historyItems: ConversationHistoryItem[] = sessions.map((session) => {
			const lastMessage = session.messages[0]?.content || ''

			return {
				id: session.id,
				sessionId: session.sessionId,
				title: this.generateSessionTitle({}, lastMessage),
				description: this.generateSessionDescription({}),
				phase: 'initial',
				progress: 0,
				messageCount: session.messages.length,
				createdAt: session.createdAt,
				updatedAt: session.updatedAt,
				completedAt: null,
				status: 'active',
				collectedInfo: {},
				lastMessage:
					lastMessage.substring(0, 100) +
					(lastMessage.length > 100 ? '...' : ''),
			}
		})

		return {
			sessions: historyItems,
			total,
			page,
			pageSize,
			hasMore: skip + pageSize < total,
		}
	}

	/**
	 * 获取特定会话的详细信息
	 */
	async getConversationDetails(
		sessionId: string,
		userId: string,
	): Promise<ConversationHistoryItem | null> {
		const session = await this.prisma.conversationSession.findFirst({
			where: {
				sessionId,
				userId,
			},
			include: {
				messages: {
					orderBy: { createdAt: 'asc' },
				},
			},
		})

		if (!session) {
			return null
		}

		const lastMessage =
			session.messages[session.messages.length - 1]?.content || ''

		return {
			id: session.id,
			sessionId: session.sessionId,
			title: this.generateSessionTitle({}, lastMessage),
			description: this.generateSessionDescription({}),
			phase: 'initial',
			progress: 0,
			messageCount: session.messages.length,
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
			completedAt: null,
			status: 'active',
			collectedInfo: {},
			lastMessage:
				lastMessage.substring(0, 100) + (lastMessage.length > 100 ? '...' : ''),
		}
	}

	/**
	 * 删除会话
	 */
	async deleteConversation(
		sessionId: string,
		userId: string,
	): Promise<boolean> {
		try {
			// 删除相关消息
			await this.prisma.conversationMessage.deleteMany({
				where: { sessionId },
			})

			// 删除会话
			await this.prisma.conversationSession.deleteMany({
				where: {
					sessionId,
					userId,
				},
			})

			// 清除缓存
			await this.cache.deleteSession(sessionId)

			return true
		} catch (error) {
			console.error('删除会话失败:', error)
			return false
		}
	}

	/**
	 * 复制会话（创建新会话）
	 */
	async duplicateConversation(
		sessionId: string,
		userId: string,
	): Promise<ConversationHistoryItem | null> {
		try {
			const originalSession = await this.prisma.conversationSession.findFirst({
				where: {
					sessionId,
					userId,
				},
			})

			if (!originalSession) {
				return null
			}

			// 创建新会话
			const newSessionId = this.generateSessionId()
			const newSession = await this.prisma.conversationSession.create({
				data: {
					sessionId: newSessionId,
					userId,
				},
			})

			// 创建初始消息
			const summary = this.generateSessionSummary({})
			await this.prisma.conversationMessage.create({
				data: {
					sessionId: newSessionId,
					messageId: this.generateMessageId(),
					type: 'ai',
					content: `基于之前的对话，我了解到您想要：${summary}。让我们继续完善这个需求吧！`,
					metadata: {},
				},
			})

			return this.getConversationDetails(newSessionId, userId)
		} catch (error) {
			console.error('复制会话失败:', error)
			return null
		}
	}

	/**
	 * 获取会话统计信息
	 */
	async getConversationStats(userId: string) {
		const total = await this.prisma.conversationSession.count({
			where: { userId },
		})

		return {
			total,
			active: total, // 所有会话都视为活跃状态
			completed: 0,
			abandoned: 0,
		}
	}

	/**
	 * 生成会话标题
	 */
	private generateSessionTitle(
		collectedInfo: any,
		lastMessage: string,
	): string {
		if (collectedInfo.purpose) {
			return collectedInfo.purpose
		}
		if (collectedInfo.targetAudience) {
			return `${collectedInfo.targetAudience}相关问卷`
		}
		if (lastMessage) {
			return (
				lastMessage.substring(0, 30) + (lastMessage.length > 30 ? '...' : '')
			)
		}
		return '未命名会话'
	}

	/**
	 * 生成会话描述
	 */
	private generateSessionDescription(collectedInfo: any): string {
		const parts = []
		if (collectedInfo.purpose) parts.push(`目的：${collectedInfo.purpose}`)
		if (collectedInfo.targetAudience)
			parts.push(`受众：${collectedInfo.targetAudience}`)
		if (collectedInfo.questionTypes?.length) {
			parts.push(`题型：${collectedInfo.questionTypes.join('、')}`)
		}
		return parts.join(' | ') || '暂无描述'
	}

	/**
	 * 生成会话摘要
	 */
	private generateSessionSummary(collectedInfo: any): string {
		const parts = []
		if (collectedInfo.purpose) parts.push(collectedInfo.purpose)
		if (collectedInfo.targetAudience)
			parts.push(`面向${collectedInfo.targetAudience}`)
		if (collectedInfo.questionTypes?.length) {
			parts.push(`包含${collectedInfo.questionTypes.join('、')}等题型`)
		}
		return parts.join('，')
	}
}
