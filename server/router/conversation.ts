import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { getConversationService } from '../services/conversation'
import { ConversationErrorHandler } from '../services/conversation/error-handler'
import { ConversationMonitoring } from '../services/conversation/monitoring'
import {
	CreateSessionInput,
	SendMessageInput,
	GetMessagesInput,
	UpdateStateInput,
	CompleteConversationInput,
	ResetConversationInput,
} from '../schemas/conversation'

export const conversationRouter = router({
	// 创建新对话会话
	createSession: protectedProcedure
		.input(CreateSessionInput)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.userId!
			try {
				await ConversationMonitoring.logConversationEvent(
					'session_created',
					'new',
					{ userId: userId },
				)

				const conversationService = getConversationService()
				const session = await conversationService.createSession({
					userId,
					...input,
				})

				await ConversationMonitoring.logConversationEvent(
					'session_created_success',
					session.id,
					{ sessionId: session.id, userId: userId },
				)

				return session
			} catch (error) {
				await ConversationMonitoring.trackError(
					error as Error,
					{ input, operation: 'createSession' },
					'high',
				)
				throw error
			}
		}),

	// 发送消息（仅状态管理，不直接调用AI）
	sendMessage: protectedProcedure
		.input(SendMessageInput)
		.mutation(async ({ input, ctx }) => {
			try {
				const startTime = Date.now()
				// await ConversationMonitoring.logConversationEvent(
				// 	'message_sent',
				// 	input.sessionId,
				// 	{ content: input.content.substring(0, 100) },
				// )
				const conversationService = getConversationService()
				const response = await conversationService.sendMessage(input)

				// const duration = Date.now() - startTime
				// await ConversationMonitoring.trackPerformance('sendMessage', duration, {
				// 	sessionId: input.sessionId,
				// 	messageLength: input.content.length,
				// })
				// await ConversationMonitoring.logConversationEvent(
				// 	'message_sent_success',
				// 	input.sessionId,
				// 	{ responseLength: response.aiMessage.content.length },
				// )
				return response
			} catch (error) {
				await ConversationMonitoring.trackError(
					error as Error,
					{ input, operation: 'sendMessage' },
					'medium',
				)

				const conversationError = ConversationErrorHandler.handleAIError(
					error as Error,
					{ input },
				)
				throw new Error(conversationError.message)
			}
		}),

	// 获取对话历史
	getMessages: protectedProcedure
		.input(GetMessagesInput)
		.query(async ({ input, ctx }) => {
			try {
				const conversationService = getConversationService()
				const messages = await conversationService.getMessages(input)

				await ConversationMonitoring.logConversationEvent(
					'messages_retrieved',
					input.sessionId,
					{ count: messages.length, limit: input.limit },
				)

				return messages
			} catch (error) {
				await ConversationMonitoring.trackError(
					error as Error,
					{ input, operation: 'getMessages' },
					'low',
				)
				throw error
			}
		}),

	// 更新对话状态
	updateState: protectedProcedure
		.input(UpdateStateInput)
		.mutation(async ({ input, ctx }) => {
			console.log('updateState', input)
			try {
				const conversationService = getConversationService()
				const session = await conversationService.updateState(input)
				return session
			} catch (error) {
				await ConversationMonitoring.trackError(
					error as Error,
					{ input, operation: 'updateState' },
					'medium',
				)
				throw error
			}
		}),

	// 完成对话并生成问卷
	completeConversation: protectedProcedure
		.input(CompleteConversationInput)
		.mutation(async ({ input, ctx }) => {
			try {
				const startTime = Date.now()

				await ConversationMonitoring.logConversationEvent(
					'conversation_completing',
					input.sessionId,
					{ finalPrompt: input.finalPrompt?.substring(0, 100) },
				)

				const conversationService = getConversationService()
				const result = await conversationService.completeConversation(input)

				const duration = Date.now() - startTime
				await ConversationMonitoring.trackPerformance(
					'completeConversation',
					duration,
					{ sessionId: input.sessionId },
				)

				await ConversationMonitoring.logConversationEvent(
					'conversation_completed',
					input.sessionId,
					{ surveyId: result.survey.id },
				)

				return result
			} catch (error) {
				await ConversationMonitoring.trackError(
					error as Error,
					{ input, operation: 'completeConversation' },
					'high',
				)
				throw error
			}
		}),

	// 重置对话
	resetConversation: protectedProcedure
		.input(ResetConversationInput)
		.mutation(async ({ input, ctx }) => {
			try {
				const conversationService = getConversationService()
				const session = await conversationService.resetConversation(input)

				await ConversationMonitoring.logConversationEvent(
					'conversation_reset',
					input.sessionId,
					{},
				)

				return session
			} catch (error) {
				await ConversationMonitoring.trackError(
					error as Error,
					{ input, operation: 'resetConversation' },
					'medium',
				)
				throw error
			}
		}),

	// 获取会话状态（包含消息）
	getSession: protectedProcedure
		.input(z.object({ sessionId: z.string() }))
		.query(async ({ input, ctx }) => {
			debugger
			try {
				const conversationService = getConversationService()
				const session = await conversationService.getSessionDetail(
					input.sessionId,
				)

				if (!session) {
					throw new Error('会话不存在')
				}

				return session
			} catch (error) {
				await ConversationMonitoring.trackError(
					error as Error,
					{ input, operation: 'getSession' },
					'low',
				)
				throw error
			}
		}),

	// 获取会话统计信息
	getSessionStats: protectedProcedure
		.input(z.object({ sessionId: z.string() }))
		.query(async ({ input, ctx }) => {
			try {
				const conversationService = getConversationService()
				const session = await conversationService.getSession(input.sessionId)
				if (!session) {
					throw new Error('会话不存在')
				}

				const messages = await conversationService.getMessages({
					sessionId: input.sessionId,
					limit: 1000,
					offset: 0,
				})

				const stats = {
					messageCount: messages.length,
					duration: Date.now() - session.createdAt.getTime(),
					phase: session.state.phase,
					progress: session.state.progress,
					completionRate: session.state.progress,
				}

				await ConversationMonitoring.trackSessionMetrics(input.sessionId, stats)

				return stats
			} catch (error) {
				await ConversationMonitoring.trackError(
					error as Error,
					{ input, operation: 'getSessionStats' },
					'low',
				)
				throw error
			}
		}),
})
