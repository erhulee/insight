import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { getConversationService } from '../services/conversation'

export const conversationHistoryRouter = router({
	// 获取用户的历史会话列表
	getUserHistory: protectedProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				pageSize: z.number().min(1).max(50).default(10),
				filters: z
					.object({
						status: z.enum(['active', 'completed', 'abandoned']).optional(),
						phase: z.string().optional(),
						dateRange: z
							.object({
								start: z.date(),
								end: z.date(),
							})
							.optional(),
						search: z.string().optional(),
					})
					.optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			try {
				const conversationService = getConversationService()
				const filters = input.filters || {}
				const result = await conversationService.getUserConversationHistory(
					ctx.userId!,
					input.page,
					input.pageSize,
					filters,
				)
				return result
			} catch (error) {
				console.error('获取历史会话失败:', error)
				throw new Error('获取历史会话失败')
			}
		}),

	// 获取特定会话的详细信息
	getConversationDetails: protectedProcedure
		.input(z.object({ sessionId: z.string() }))
		.query(async ({ input, ctx }) => {
			try {
				const conversationService = getConversationService()
				const details = await conversationService.getConversationDetails(
					input.sessionId,
					ctx.userId!,
				)
				if (!details) {
					throw new Error('会话不存在')
				}
				return details
			} catch (error) {
				console.error('获取会话详情失败:', error)
				throw new Error('获取会话详情失败')
			}
		}),

	// 删除会话
	deleteConversation: protectedProcedure
		.input(z.object({ sessionId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			try {
				const conversationService = getConversationService()
				const success = await conversationService.deleteConversation(
					input.sessionId,
					ctx.userId!,
				)
				if (!success) {
					throw new Error('删除会话失败')
				}
				return { success: true }
			} catch (error) {
				console.error('删除会话失败:', error)
				throw new Error('删除会话失败')
			}
		}),

	// 复制会话
	duplicateConversation: protectedProcedure
		.input(z.object({ sessionId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			try {
				const conversationService = getConversationService()
				const newSession = await conversationService.duplicateConversation(
					input.sessionId,
					ctx.userId!,
				)
				if (!newSession) {
					throw new Error('复制会话失败')
				}
				return newSession
			} catch (error) {
				console.error('复制会话失败:', error)
				throw new Error('复制会话失败')
			}
		}),

	// 获取会话统计信息
	getConversationStats: protectedProcedure.query(async ({ ctx }) => {
		try {
			const conversationService = getConversationService()
			const stats = await conversationService.getConversationStats(ctx.userId!)
			return stats
		} catch (error) {
			console.error('获取会话统计失败:', error)
			throw new Error('获取会话统计失败')
		}
	}),
})
