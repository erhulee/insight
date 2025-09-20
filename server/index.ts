import { procedure, router, protectedProcedure, createContext } from './trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { userService, templateService, aiConfigService } from './services'
import { surveyRouter } from './router/survey'
import { aiConfigRouter } from './router/ai-config'
import { AIRouter } from './router/ai'
import { conversationRouter } from './router/conversation'
import { aiConversationRouter } from './router/ai-conversation'
import { conversationHistoryRouter } from './router/conversation-history'
import { initializeConversationServices } from './services/conversation'
import { activeModelService } from './services/ai/active-model'
import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'

// 初始化对话服务
const prisma = new PrismaClient()
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// 初始化对话相关服务
try {
	initializeConversationServices(prisma, redis, 'ollama', {})
	console.log('对话服务初始化成功')
} catch (error) {
	console.error('对话服务初始化失败:', error)
}

export const appRouter = router({
	surver: surveyRouter,
	aiConfig: aiConfigRouter,
	ai: AIRouter,
	conversation: conversationRouter,
	aiConversation: aiConversationRouter,
	conversationHistory: conversationHistoryRouter,
	// 用户相关路由
	Register: procedure
		.input(
			z.object({
				account: z.string(),
				password: z.string(),
				username: z.string(),
			}),
		)
		.mutation(async (opt) => {
			try {
				const { account, password, username } = opt.input
				return await userService.register({ account, password, username })
			} catch (e) {
				console.error('注册失败:', e)
				throw new TRPCError({
					message: '注册失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	CreateUser: procedure
		.input(
			z.object({
				account: z.string(),
				password: z.string(),
				username: z.string(),
			}),
		)
		.mutation(async (opt) => {
			const { account, password, username } = opt.input
			try {
				return await userService.createUser({ account, password, username })
			} catch (e) {
				throw new TRPCError({
					message: '注册失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	Logout: protectedProcedure.mutation(async (opt) => {
		const userId = opt.ctx.userId!
		return await userService.logout(userId)
	}),

	GetUserInfo: protectedProcedure.query(async (opt) => {
		const userId = opt.ctx.userId!
		try {
			const user = await userService.getUserInfo(userId)
			if (!user) {
				throw new TRPCError({
					message: '用户不存在',
					code: 'NOT_FOUND',
				})
			}
			return user
		} catch (e) {
			throw new TRPCError({
				message: '获取用户信息失败',
				code: 'INTERNAL_SERVER_ERROR',
			})
		}
	}),

	ValidateToken: procedure
		.input(
			z.object({
				token: z.string(),
			}),
		)
		.query(async (opt) => {
			const { token } = opt.input
			try {
				return await userService.validateToken(token)
			} catch (error) {
				console.error('Token validation error:', error)
				return null
			}
		}),

	UpdateUserInfo: protectedProcedure
		.input(
			z.object({
				name: z.string().optional(),
				current_password: z.string().optional(),
				password: z.string().optional(),
			}),
		)
		.mutation(async (opt) => {
			const userId = opt.ctx.userId!
			const { name, password, current_password } = opt.input
			try {
				const updateData: any = {}
				if (name) updateData.name = name
				if (password) updateData.password = password
				if (current_password) updateData.current_password = current_password

				return await userService.updateUserInfo(userId, updateData)
			} catch (e) {
				throw new TRPCError({
					message: '更新用户信息失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	// AI相关路由
	TestAIConnection: protectedProcedure
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
		.mutation(async (opt) => {
			try {
				const config = opt.input.config
				const testConfig: any = {
					type: config.type,
					baseUrl: config.baseUrl,
					model: config.model,
					temperature: 0.7, // 内置值
					topP: 0.9, // 内置值
				}
				if (config.apiKey) testConfig.apiKey = config.apiKey
				if (config.repeatPenalty)
					testConfig.repeatPenalty = config.repeatPenalty
				// maxTokens由AI服务内部处理，不需要传递

				return await aiConfigService.testConnection(testConfig)
			} catch (error) {
				console.error('AI连接测试失败:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : '连接测试失败',
				}
			}
		}),

	GetAIStatus: protectedProcedure
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
		.mutation(async (opt) => {
			try {
				return await aiConfigService.getServiceStatus(opt.input.config)
			} catch (error) {
				console.error('获取AI服务状态失败:', error)
				return {
					available: false,
					models: [],
					currentModel: '',
					error: error instanceof Error ? error.message : '获取状态失败',
				}
			}
		}),

	GenerateAISurveyWithConfig: protectedProcedure
		.input(
			z.object({
				prompt: z.string(),
				config: z.object({
					type: z.enum(['openai', 'ollama', 'anthropic', 'volcano', 'custom']),
					baseUrl: z.string(),
					apiKey: z.string().optional(),
					model: z.string(),
					repeatPenalty: z.number().optional(),
				}),
			}),
		)
		.mutation(async (opt) => {
			try {
				const config = {
					id: 'temp-config',
					name: '临时配置',
					type: opt.input.config.type,
					baseUrl: opt.input.config.baseUrl,
					apiKey: opt.input.config.apiKey || '',
					model: opt.input.config.model,
					...(opt.input.config.repeatPenalty && {
						repeatPenalty: opt.input.config.repeatPenalty,
					}),
					isActive: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				}

				return await aiConfigService.generateSurvey({
					prompt: opt.input.prompt,
					config,
				})
			} catch (error) {
				console.error('AI生成问卷失败:', error)
				if (error instanceof TRPCError) throw error

				throw new TRPCError({
					message: 'AI生成问卷失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	GenerateAISurvey: protectedProcedure
		.input(z.object({ prompt: z.string() }))
		.mutation(async (opt) => {
			try {
				// 获取用户的活跃配置（包含真实API密钥）
				const activeConfig = await activeModelService.getActiveAIConfig(
					opt.ctx.userId,
				)
				if (!activeConfig) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: '没有可用的AI服务配置',
					})
				}

				// 解密API密钥
				const decryptedApiKey =
					activeConfig.apiKey && activeConfig.apiKey !== '***'
						? Buffer.from(activeConfig.apiKey, 'base64').toString('utf-8')
						: undefined

				const configWithKey = {
					id: activeConfig.id,
					name: activeConfig.name,
					type: activeConfig.type as
						| 'openai'
						| 'ollama'
						| 'anthropic'
						| 'volcano'
						| 'custom',
					baseUrl: activeConfig.baseUrl,
					apiKey: decryptedApiKey || '',
					model: activeConfig.model,
					...(activeConfig.repeatPenalty && {
						repeatPenalty: activeConfig.repeatPenalty,
					}),
					isActive: activeConfig.isActive,
					createdAt: activeConfig.createdAt,
					updatedAt: activeConfig.updatedAt,
				}

				return await aiConfigService.generateSurvey({
					prompt: opt.input.prompt,
					config: configWithKey,
				})
			} catch (error) {
				console.error('AI生成问卷失败:', error)
				if (error instanceof TRPCError) throw error

				throw new TRPCError({
					message: 'AI生成问卷失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	GenerateAISurveyStreamWithConfig: protectedProcedure
		.input(
			z.object({
				prompt: z.string(),
				config: z.object({
					type: z.enum(['openai', 'ollama', 'anthropic', 'volcano', 'custom']),
					baseUrl: z.string(),
					apiKey: z.string().optional(),
					model: z.string(),
					repeatPenalty: z.number().optional(),
				}),
			}),
		)
		.subscription(async (opt) => {
			return observable<{ text: string }>((emit) => {
				const config = {
					id: 'temp-config',
					name: '临时配置',
					type: opt.input.config.type,
					baseUrl: opt.input.config.baseUrl,
					apiKey: opt.input.config.apiKey || '',
					model: opt.input.config.model,
					...(opt.input.config.repeatPenalty && {
						repeatPenalty: opt.input.config.repeatPenalty,
					}),
					isActive: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				}

				aiConfigService
					.generateSurveyStream(
						{
							prompt: opt.input.prompt,
							config,
						},
						(chunk: any) => {
							emit.next({ text: chunk.text || chunk.response || '' })
						},
					)
					.catch((error: any) => {
						emit.error(error)
					})
			})
		}),

	// 模板相关路由
	SaveQuestionsToTemplate: protectedProcedure
		.input(z.object({ questionId: z.string() }))
		.mutation(async (opt) => {
			try {
				const userId = opt.ctx.userId!
				return await templateService.saveQuestionsToTemplate(
					userId,
					opt.input.questionId,
				)
			} catch (error) {
				throw new TRPCError({
					message: '保存模板失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	GetTemplateList: procedure
		.input(
			z.object({
				page: z.number().optional(),
				limit: z.number().optional(),
				category: z.string().optional(),
				tags: z.string().optional(),
			}),
		)
		.query(async (opt) => {
			try {
				const input = {
					page: opt.input.page ?? 1,
					limit: opt.input.limit ?? 10,
					...(opt.input.category && { category: opt.input.category }),
					...(opt.input.tags && { tags: opt.input.tags }),
				}
				return await templateService.getTemplateList(input)
			} catch (error) {
				throw new TRPCError({
					message: '获取模板列表失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	CreateSurveyByTemplate: protectedProcedure
		.input(z.object({ templateId: z.string() }))
		.mutation(async (opt) => {
			try {
				const userId = opt.ctx.userId!
				return await templateService.createSurveyByTemplate(
					userId,
					opt.input.templateId,
				)
			} catch (error) {
				throw new TRPCError({
					message: '根据模板创建问卷失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),
})

export type AppRouter = typeof appRouter
