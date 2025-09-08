import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { aiConfigService } from '../services/ai-config-service'

export const aiConfigRouter = router({
	// 获取用户的AI配置列表
	getConfigs: protectedProcedure.query(async ({ ctx }) => {
		return await aiConfigService.getUserConfigs(ctx.userId)
	}),

	// 获取活跃的AI配置
	getActiveConfig: protectedProcedure.query(async ({ ctx }) => {
		return await aiConfigService.getActiveConfig(ctx.userId)
	}),

	// 创建AI配置
	createConfig: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, '配置名称不能为空'),
				type: z.enum(['openai', 'ollama', 'anthropic', 'custom']),
				baseUrl: z.string().min(1, '服务地址不能为空'),
				apiKey: z.string().optional(),
				model: z.string().min(1, '模型名称不能为空'),
				repeatPenalty: z.number().min(0).max(2).optional(),
				maxTokens: z.number().min(1).max(8000).optional(),
				isActive: z.boolean().default(false),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await aiConfigService.createConfig(ctx.userId, input)
		}),

	// 更新AI配置
	updateConfig: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1, '配置名称不能为空').optional(),
				type: z.enum(['openai', 'ollama', 'anthropic', 'custom']).optional(),
				baseUrl: z.string().min(1, '服务地址不能为空').optional(),
				apiKey: z.string().optional(),
				model: z.string().min(1, '模型名称不能为空').optional(),
				repeatPenalty: z.number().min(0).max(2).optional(),
				maxTokens: z.number().min(1).max(8000).optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input
			return await aiConfigService.updateConfig(ctx.userId, id, updateData)
		}),

	// 删除AI配置
	deleteConfig: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await aiConfigService.deleteConfig(ctx.userId, input.id)
		}),

	// 设置活跃配置
	setActiveConfig: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await aiConfigService.setActiveConfig(ctx.userId, input.id)
		}),

	// 测试AI配置连接
	testConnection: protectedProcedure
		.input(
			z.object({
				id: z.string().optional(), // 如果提供ID，则测试已保存的配置
				config: z
					.object({
						type: z.enum(['openai', 'ollama', 'anthropic', 'custom']),
						baseUrl: z.string(),
						apiKey: z.string().optional(),
						model: z.string(),
						repeatPenalty: z.number().optional(),
						maxTokens: z.number().optional(),
					})
					.optional(), // 如果提供config，则测试临时配置
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.id) {
				return await aiConfigService.testConfigConnection(ctx.userId, input.id)
			} else if (input.config) {
				return await aiConfigService.testConnection(input.config)
			} else {
				throw new Error('必须提供配置ID或配置对象')
			}
		}),

	// 获取AI服务状态
	getServiceStatus: protectedProcedure
		.input(
			z.object({
				config: z.object({
					type: z.enum(['openai', 'ollama', 'anthropic', 'custom']),
					baseUrl: z.string(),
					apiKey: z.string().optional(),
					model: z.string(),
					repeatPenalty: z.number().optional(),
					maxTokens: z.number().optional(),
				}),
			}),
		)
		.mutation(async ({ input }) => {
			return await aiConfigService.getServiceStatus(input.config)
		}),
})
