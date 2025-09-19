import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { aiConfigService } from '../services/ai-config'
import { ollamaService } from '../services/ai/ollama'
import { activeModelService } from '../services/ai/active-model'
import { PrismaClient } from '@prisma/client'

export const aiConfigRouter = router({
	getAIServiceProviders: protectedProcedure.query(async () => {
		return await aiConfigService.getAIServiceProviders()
	}),
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
				type: z.enum(['openai', 'ollama', 'anthropic', 'volcano', 'custom']),
				baseUrl: z.string().min(1, '服务地址不能为空'),
				apiKey: z.string().optional(),
				model: z.string().min(1, '模型名称不能为空'),
				repeatPenalty: z.number().min(0).max(2).optional(),
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
				type: z.enum(['volcano', 'custom']).optional(),
				baseUrl: z.string().min(1, '服务地址不能为空').optional(),
				apiKey: z.string().optional(),
				model: z.string().min(1, '模型名称不能为空').optional(),
				repeatPenalty: z.number().min(0).max(2).optional(),
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
						type: z.enum([
							'openai',
							'ollama',
							'anthropic',
							'volcano',
							'custom',
						]),
						baseUrl: z.string(),
						apiKey: z.string().optional(),
						model: z.string(),
						repeatPenalty: z.number().optional(),
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
					type: z.enum(['openai', 'ollama', 'anthropic', 'volcano', 'custom']),
					baseUrl: z.string(),
					apiKey: z.string().optional(),
					model: z.string(),
					repeatPenalty: z.number().optional(),
				}),
			}),
		)
		.mutation(async ({ input }) => {
			return await aiConfigService.getServiceStatus(input.config)
		}),

	// === Ollama 专用接口 ===

	// 获取 Ollama 服务状态和模型列表
	GetOllamaModels: protectedProcedure.query(async () => {
		return await ollamaService.getServiceInfo()
	}),

	// 下载 Ollama 模型
	PullOllamaModel: protectedProcedure
		.input(
			z.object({
				modelName: z.string().min(1, '模型名称不能为空'),
			}),
		)
		.mutation(async ({ input }) => {
			return await ollamaService.pullModel(input.modelName)
		}),

	// 删除 Ollama 模型
	DeleteOllamaModel: protectedProcedure
		.input(
			z.object({
				modelName: z.string().min(1, '模型名称不能为空'),
			}),
		)
		.mutation(async ({ input }) => {
			return await ollamaService.deleteModel(input.modelName)
		}),

	// 检查 Ollama 服务状态
	CheckOllamaStatus: protectedProcedure.query(async () => {
		return await ollamaService.checkServiceStatus()
	}),

	// 获取 Ollama 系统信息
	GetOllamaSystemInfo: protectedProcedure.query(async () => {
		return await ollamaService.getSystemInfo()
	}),

	// 自动配置 Ollama
	AutoConfigureOllama: protectedProcedure.mutation(async ({ ctx }) => {
		return await ollamaService.autoConfigure()
	}),

	// 活跃模型相关路由
	setActiveModel: protectedProcedure
		.input(
			z.object({
				modelName: z.string(),
				modelSize: z.number().optional(),
				baseUrl: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await activeModelService.setActiveModel(ctx.userId, {
				modelName: input.modelName,
				modelSize: input.modelSize,
				baseUrl: input.baseUrl,
			})
		}),

	getActiveModel: protectedProcedure.query(async ({ ctx }) => {
		return await activeModelService.getActiveModel(ctx.userId)
	}),

	clearActiveModel: protectedProcedure.mutation(async ({ ctx }) => {
		await activeModelService.clearActiveModel(ctx.userId)
		return { success: true }
	}),

	getActiveAIConfig: protectedProcedure.query(async ({ ctx }) => {
		return await activeModelService.getActiveAIConfig(ctx.userId)
	}),
})
