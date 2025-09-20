import { v4 as uuidv4 } from 'uuid'
import {
	ConversationSession,
	ConversationState,
	Message,
	CollectedInfo,
} from '../../schemas/conversation'
import { ConversationCache } from './cache.service'

export class ConversationStateService {
	constructor(private cache: ConversationCache) {}

	/**
	 * 创建新的对话会话
	 */
	async createSession(userId: string): Promise<ConversationSession> {
		const sessionId = uuidv4()
		const now = new Date()

		const initialMessage: Message = {
			id: uuidv4(),
			type: 'ai',
			content:
				'你好！我是AI问卷助手。让我们一起创建一份完美的问卷吧！首先，请告诉我这份问卷的主要目的是什么？',
			timestamp: now,
			suggestions: [
				'客户满意度调查',
				'产品反馈收集',
				'市场研究',
				'员工满意度',
				'学术研究',
			],
		}

		const initialState: ConversationState = {
			phase: 'initial',
			progress: 20,
			collectedInfo: {},
		}

		const session: ConversationSession = {
			id: sessionId,
			userId,
			state: initialState,
			messages: [initialMessage],
			createdAt: now,
			updatedAt: now,
			expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24小时后过期
		}

		await this.cache.cacheSession(sessionId, session)
		return session
	}

	/**
	 * 获取会话
	 */
	async getSession(sessionId: string): Promise<ConversationSession | null> {
		return await this.cache.getSession(sessionId)
	}

	/**
	 * 发送消息并更新状态
	 */
	async sendMessage(
		sessionId: string,
		content: string,
		userId: string,
	): Promise<ConversationSession> {
		const session = await this.getSession(sessionId)
		if (!session) {
			throw new Error('会话不存在')
		}

		if (session.userId !== userId) {
			throw new Error('无权限访问此会话')
		}

		// 添加用户消息
		const userMessage: Message = {
			id: uuidv4(),
			type: 'user',
			content,
			timestamp: new Date(),
		}

		// 更新状态
		const newState = this.updateConversationState(content, session.state)

		// 生成AI响应
		const aiResponse = this.generateAIResponse(content, newState)

		// 更新会话
		const updatedSession: ConversationSession = {
			...session,
			state: newState,
			messages: [...session.messages, userMessage, aiResponse],
			updatedAt: new Date(),
		}

		await this.cache.cacheSession(sessionId, updatedSession)
		return updatedSession
	}

	/**
	 * 更新对话状态
	 */
	private updateConversationState(
		userInput: string,
		currentState: ConversationState,
	): ConversationState {
		const newState = { ...currentState }

		switch (currentState.phase) {
			case 'initial':
				newState.phase = 'details'
				newState.progress = 40
				newState.collectedInfo.purpose = userInput
				break
			case 'details':
				newState.phase = 'structure'
				newState.progress = 60
				newState.collectedInfo.targetAudience = userInput
				break
			case 'structure':
				newState.phase = 'validation'
				newState.progress = 80
				newState.collectedInfo.questionTypes = [userInput]
				break
			case 'validation':
				newState.phase = 'complete'
				newState.progress = 100
				newState.collectedInfo.estimatedTime = userInput
				break
		}

		return newState
	}

	/**
	 * 生成AI响应
	 */
	private generateAIResponse(
		userInput: string,
		state: ConversationState,
	): Message {
		const responses = {
			initial: {
				content:
					'很好！我了解了问卷的目的。现在请告诉我，这份问卷的目标受众是谁？这将帮助我设计更合适的问题。',
				suggestions: [
					'18-25岁年轻人',
					'企业客户',
					'内部员工',
					'学生群体',
					'专业人士',
				],
			},
			details: {
				content:
					'明白了目标受众。接下来，你希望问卷包含哪些类型的问题？我可以为你推荐最适合的问题形式。',
				suggestions: ['单选题', '多选题', '评分题', '开放式问题', '排序题'],
			},
			structure: {
				content:
					'很好的选择！最后，你希望受访者大约花多长时间完成这份问卷？这将帮助我控制问题数量。',
				suggestions: [
					'3-5分钟',
					'5-10分钟',
					'10-15分钟',
					'15-20分钟',
					'20分钟以上',
				],
			},
			validation: {
				content:
					'完美！基于我们的对话，我已经收集了足够的信息。让我为你生成一份定制化的问卷。你还有什么特殊要求吗？',
				suggestions: [
					'开始生成问卷',
					'添加更多细节',
					'修改某些要求',
					'重新开始',
				],
			},
			complete: {
				content:
					'太棒了！我已经根据我们的对话生成了完整的问卷结构和问题。你可以查看生成的问卷，如果需要调整，我们可以继续优化。',
				suggestions: ['查看问卷', '继续优化', '导出问卷', '重新生成'],
			},
		}

		const response = responses[state.phase]

		return {
			id: uuidv4(),
			type: 'ai',
			content: response.content,
			timestamp: new Date(),
			suggestions: response.suggestions,
		}
	}

	/**
	 * 重置会话
	 */
	async resetSession(
		sessionId: string,
		userId: string,
	): Promise<ConversationSession> {
		const session = await this.getSession(sessionId)
		if (!session) {
			throw new Error('会话不存在')
		}

		if (session.userId !== userId) {
			throw new Error('无权限访问此会话')
		}

		// 创建新的初始会话
		const newSession = await this.createSession(userId)
		newSession.id = sessionId // 保持相同的会话ID

		await this.cache.cacheSession(sessionId, newSession)
		return newSession
	}

	/**
	 * 删除会话
	 */
	async deleteSession(sessionId: string, userId: string): Promise<void> {
		const session = await this.getSession(sessionId)
		if (!session) {
			throw new Error('会话不存在')
		}

		if (session.userId !== userId) {
			throw new Error('无权限访问此会话')
		}

		await this.cache.deleteSession(sessionId)
	}

	/**
	 * 检查会话是否完成
	 */
	isSessionComplete(session: ConversationSession): boolean {
		return session.state.phase === 'complete'
	}

	/**
	 * 获取会话进度
	 */
	getSessionProgress(session: ConversationSession): number {
		return session.state.progress
	}

	/**
	 * 获取收集的信息
	 */
	getCollectedInfo(session: ConversationSession): CollectedInfo {
		return session.state.collectedInfo
	}

	/**
	 * 验证会话状态
	 */
	validateSessionState(session: ConversationSession): boolean {
		// 检查必填字段
		if (!session.id || !session.userId || !session.state) {
			return false
		}

		// 检查状态完整性
		if (session.state.progress < 0 || session.state.progress > 100) {
			return false
		}

		// 检查阶段有效性
		const validPhases = [
			'initial',
			'details',
			'structure',
			'validation',
			'complete',
		]
		if (!validPhases.includes(session.state.phase)) {
			return false
		}

		return true
	}

	/**
	 * 获取会话统计信息
	 */
	getSessionStats(session: ConversationSession) {
		const userMessages = session.messages.filter((msg) => msg.type === 'user')
		const aiMessages = session.messages.filter((msg) => msg.type === 'ai')

		return {
			totalMessages: session.messages.length,
			userMessages: userMessages.length,
			aiMessages: aiMessages.length,
			duration: session.updatedAt.getTime() - session.createdAt.getTime(),
			phase: session.state.phase,
			progress: session.state.progress,
		}
	}
}
