import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc'
import { getAIConversationService } from '../services/conversation'
import { ConversationErrorHandler } from '../services/conversation/error-handler'
import { ConversationMonitoring } from '../services/conversation/monitoring'
import { ChatInput, GenerateSurveyInput } from '../schemas/ai'

export const aiConversationRouter = router({
	// 发送对话消息到 AI
	chat: protectedProcedure.input(ChatInput).mutation(async ({ input, ctx }) => {
		console.log('chat:', input)
		try {
			const { getConversationService } = await import(
				'../services/conversation'
			)
			const conversationService = getConversationService()

			// 使用 conversation service 的 sendMessage 方法，它会保存数据到数据库
			const result = await conversationService.sendMessage({
				sessionId: input.sessionId,
				content: input.message,
			})
			console.log('sendMessage:', result)

			return {
				content: result.aiMessage.content,
				suggestions: result.aiMessage.suggestions || [],
				conversationState: result.conversationState,
				metadata: result.aiMessage.metadata || {},
			}
		} catch (error) {
			console.error(error)
			const conversationError = ConversationErrorHandler.handleAIError(
				error as Error,
				{ input },
			)
			throw new Error(conversationError.message)
		}
	}),

	// 生成问卷
	generateSurvey: protectedProcedure
		.input(GenerateSurveyInput)
		.mutation(async ({ input, ctx }) => {
			try {
				const startTime = Date.now()

				await ConversationMonitoring.logConversationEvent(
					'survey_generation_request',
					input.sessionId,
					{ promptLength: input.prompt.length },
				)

				const aiConversationService = getAIConversationService()
				const response = await aiConversationService.generateSurvey({
					...input,
					userId: ctx.userId!,
				})

				const duration = Date.now() - startTime
				await ConversationMonitoring.trackPerformance(
					'survey_generation',
					duration,
					{
						sessionId: input.sessionId,
						questionCount: response.survey.questions?.length || 0,
					},
				)

				// 跟踪 AI 使用情况
				if (response.metadata?.tokenUsage) {
					await ConversationMonitoring.trackAIUsage(
						'ai_provider', // 实际应该从服务获取
						'ai_model', // 实际应该从服务获取
						response.metadata.tokenUsage.totalTokens || 0,
						0, // 成本计算
					)
				}

				await ConversationMonitoring.logConversationEvent(
					'survey_generation_success',
					input.sessionId,
					{
						surveyId: response.survey.id,
						questionCount: response.survey.questions?.length || 0,
					},
				)

				return response
			} catch (error) {
				await ConversationMonitoring.trackError(
					error as Error,
					{ input, operation: 'generateSurvey' },
					'high',
				)

				const conversationError = ConversationErrorHandler.handleAIError(
					error as Error,
					{ input },
				)
				throw new Error(conversationError.message)
			}
		}),

	// 获取 AI 服务状态
	getServiceStatus: protectedProcedure.query(async ({ ctx }) => {
		try {
			const aiConversationService = getAIConversationService()
			const status = await aiConversationService.getServiceStatus(ctx.userId!)
			await ConversationMonitoring.logConversationEvent(
				'service_status_checked',
				'',
				{ status },
			)

			return status
		} catch (error) {
			await ConversationMonitoring.trackError(
				error as Error,
				{ operation: 'getServiceStatus' },
				'low',
			)
			throw error
		}
	}),

	// 获取 AI 提供商列表
	getProviders: publicProcedure.query(async ({ ctx }) => {
		try {
			// 这里应该返回可用的 AI 提供商列表
			const providers = [
				{
					name: 'OpenAI',
					models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
					status: 'active',
				},
				{
					name: 'Ollama',
					models: ['llama2', 'codellama', 'mistral'],
					status: 'active',
				},
				{
					name: 'Anthropic',
					models: ['claude-3-sonnet', 'claude-3-opus'],
					status: 'active',
				},
			]

			await ConversationMonitoring.logConversationEvent(
				'providers_listed',
				'',
				{ providerCount: providers.length },
			)

			return providers
		} catch (error) {
			await ConversationMonitoring.trackError(
				error as Error,
				{ operation: 'getProviders' },
				'low',
			)
			throw error
		}
	}),

	// 测试 AI 连接
	testConnection: publicProcedure
		.input(
			z.object({
				provider: z.string(),
				model: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			try {
				await ConversationMonitoring.logConversationEvent(
					'connection_test_started',
					'',
					{ provider: input.provider, model: input.model },
				)

				// 这里应该实际测试 AI 连接
				const testResult = {
					success: true,
					provider: input.provider,
					model: input.model,
					responseTime: Math.random() * 1000, // 模拟响应时间
					timestamp: new Date().toISOString(),
				}

				await ConversationMonitoring.logConversationEvent(
					'connection_test_completed',
					'',
					{ result: testResult },
				)

				return testResult
			} catch (error) {
				await ConversationMonitoring.trackError(
					error as Error,
					{ input, operation: 'testConnection' },
					'medium',
				)
				throw error
			}
		}),

	// 获取 AI 使用统计
	getUsageStats: protectedProcedure
		.input(
			z.object({
				startDate: z.string().optional(),
				endDate: z.string().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			try {
				// 这里应该从数据库或监控系统获取实际的使用统计
				const stats = {
					totalRequests: 1000,
					totalTokens: 50000,
					totalCost: 25.5,
					averageResponseTime: 1200,
					successRate: 0.95,
					period: {
						start:
							input.startDate ||
							new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
						end: input.endDate || new Date().toISOString(),
					},
				}

				await ConversationMonitoring.logConversationEvent(
					'usage_stats_retrieved',
					'',
					{ stats },
				)

				return stats
			} catch (error) {
				await ConversationMonitoring.trackError(
					error as Error,
					{ input, operation: 'getUsageStats' },
					'low',
				)
				throw error
			}
		}),
})
