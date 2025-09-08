import { TRPCError } from '@trpc/server'
import { PrismaClient } from '@prisma/client'
import { createAIService } from '@/lib/ai-service-interface'
import type { AIServiceConfig } from '@/lib/ai-service-config'

const prisma = new PrismaClient()

export interface CreateAIConfigInput {
	name: string
	type: 'openai' | 'ollama' | 'anthropic' | 'custom'
	baseUrl: string
	apiKey?: string | undefined
	model: string
	repeatPenalty?: number | undefined
	maxTokens?: number | undefined
	isActive: boolean
}

export interface UpdateAIConfigInput {
	name?: string | undefined
	type?: 'openai' | 'ollama' | 'anthropic' | 'custom' | undefined
	baseUrl?: string | undefined
	apiKey?: string | undefined
	model?: string | undefined
	repeatPenalty?: number | undefined
	maxTokens?: number | undefined
	isActive?: boolean | undefined
}

export interface TestConnectionInput {
	type: 'openai' | 'ollama' | 'anthropic' | 'custom'
	baseUrl: string
	apiKey?: string | undefined
	model: string
	repeatPenalty?: number | undefined
	maxTokens?: number | undefined
}

export class AIConfigService {
	// 获取用户的所有AI配置
	async getUserConfigs(userId: string) {
		try {
			const configs = await prisma.aIConfig.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
			})

			// 解密API密钥（如果需要显示）
			return configs.map((config: any) => ({
				...config,
				apiKey: config.apiKey ? '***' : undefined, // 不返回真实API密钥
			}))
		} catch (error) {
			console.error('获取AI配置列表失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '获取AI配置列表失败',
			})
		}
	}

	// 获取用户的活跃AI配置
	async getActiveConfig(userId: string) {
		try {
			const config = await prisma.aIConfig.findFirst({
				where: { userId, isActive: true },
			})

			if (!config) {
				return null
			}

			return {
				...config,
				apiKey: config.apiKey ? '***' : undefined, // 不返回真实API密钥
			}
		} catch (error) {
			console.error('获取活跃AI配置失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '获取活跃AI配置失败',
			})
		}
	}

	// 创建AI配置
	async createConfig(userId: string, input: CreateAIConfigInput) {
		try {
			// 如果设置为活跃配置，先取消其他配置的活跃状态
			if (input.isActive) {
				await prisma.aIConfig.updateMany({
					where: { userId, isActive: true },
					data: { isActive: false },
				})
			}

			const config = await prisma.aIConfig.create({
				data: {
					...input,
					userId,
					// 加密API密钥（这里简化处理，实际应该使用加密库）
					apiKey: input.apiKey ? this.encryptApiKey(input.apiKey) : null,
					repeatPenalty: input.repeatPenalty || null,
					maxTokens: input.maxTokens || null,
				},
			})

			return {
				...config,
				apiKey: config.apiKey ? '***' : undefined,
			}
		} catch (error) {
			console.error('创建AI配置失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '创建AI配置失败',
			})
		}
	}

	// 更新AI配置
	async updateConfig(
		userId: string,
		configId: string,
		input: UpdateAIConfigInput,
	) {
		try {
			// 检查配置是否存在且属于当前用户
			const existingConfig = await prisma.aIConfig.findFirst({
				where: { id: configId, userId },
			})

			if (!existingConfig) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'AI配置不存在',
				})
			}

			// 如果设置为活跃配置，先取消其他配置的活跃状态
			if (input.isActive) {
				await prisma.aIConfig.updateMany({
					where: { userId, isActive: true },
					data: { isActive: false },
				})
			}

			const updateData: any = { ...input }
			if (input.apiKey !== undefined) {
				updateData.apiKey = input.apiKey
					? this.encryptApiKey(input.apiKey)
					: null
			}

			const config = await prisma.aIConfig.update({
				where: { id: configId },
				data: updateData,
			})

			return {
				...config,
				apiKey: config.apiKey ? '***' : undefined,
			}
		} catch (error) {
			if (error instanceof TRPCError) throw error

			console.error('更新AI配置失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '更新AI配置失败',
			})
		}
	}

	// 删除AI配置
	async deleteConfig(userId: string, configId: string) {
		try {
			const config = await prisma.aIConfig.findFirst({
				where: { id: configId, userId },
			})

			if (!config) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'AI配置不存在',
				})
			}

			await prisma.aIConfig.delete({
				where: { id: configId },
			})

			return { success: true }
		} catch (error) {
			if (error instanceof TRPCError) throw error

			console.error('删除AI配置失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '删除AI配置失败',
			})
		}
	}

	// 设置活跃配置
	async setActiveConfig(userId: string, configId: string) {
		try {
			// 检查配置是否存在且属于当前用户
			const config = await prisma.aIConfig.findFirst({
				where: { id: configId, userId },
			})

			if (!config) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'AI配置不存在',
				})
			}

			// 先取消所有配置的活跃状态
			await prisma.aIConfig.updateMany({
				where: { userId, isActive: true },
				data: { isActive: false },
			})

			// 设置指定配置为活跃状态
			const updatedConfig = await prisma.aIConfig.update({
				where: { id: configId },
				data: { isActive: true },
			})

			return {
				...updatedConfig,
				apiKey: updatedConfig.apiKey ? '***' : undefined,
			}
		} catch (error) {
			if (error instanceof TRPCError) throw error

			console.error('设置活跃配置失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '设置活跃配置失败',
			})
		}
	}

	// 测试配置连接
	async testConfigConnection(userId: string, configId: string) {
		try {
			const config = await prisma.aIConfig.findFirst({
				where: { id: configId, userId },
			})

			if (!config) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'AI配置不存在',
				})
			}

			// 解密API密钥
			const decryptedApiKey = config.apiKey
				? this.decryptApiKey(config.apiKey)
				: undefined

			const testConfig: AIServiceConfig = {
				id: config.id,
				name: config.name,
				type: config.type as any,
				baseUrl: config.baseUrl,
				apiKey: decryptedApiKey || '',
				model: config.model,
				temperature: 0.7, // 内置值
				topP: 0.9, // 内置值
				...(config.repeatPenalty && { repeatPenalty: config.repeatPenalty }),
				...(config.maxTokens && { maxTokens: config.maxTokens }),
				isActive: config.isActive,
				createdAt: config.createdAt,
				updatedAt: config.updatedAt,
			}

			return await this.testConnection(testConfig)
		} catch (error) {
			if (error instanceof TRPCError) throw error

			console.error('测试配置连接失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '测试配置连接失败',
			})
		}
	}

	// 测试连接
	async testConnection(config: TestConnectionInput | AIServiceConfig) {
		try {
			const service = createAIService(config.type)
			const result = await service.testConnection(config as AIServiceConfig)
			return result
		} catch (error) {
			console.error('测试AI服务连接失败:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : '连接测试失败',
			}
		}
	}

	// 获取服务状态
	async getServiceStatus(config: TestConnectionInput) {
		try {
			const service = createAIService(config.type)
			const status = await service.getStatus(config as AIServiceConfig)
			return status
		} catch (error) {
			console.error('获取AI服务状态失败:', error)
			return {
				available: false,
				models: [],
				currentModel: '',
				error: error instanceof Error ? error.message : '获取状态失败',
			}
		}
	}

	// 简单的API密钥加密（实际项目中应该使用更安全的加密方法）
	private encryptApiKey(apiKey: string): string {
		// 这里使用简单的Base64编码，实际应该使用AES等加密算法
		return Buffer.from(apiKey).toString('base64')
	}

	// 简单的API密钥解密
	private decryptApiKey(encryptedApiKey: string): string {
		// 这里使用简单的Base64解码，实际应该使用AES等解密算法
		return Buffer.from(encryptedApiKey, 'base64').toString('utf-8')
	}
}

export const aiConfigService = new AIConfigService()
