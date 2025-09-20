import { PrismaClient, ActiveModelConfig, AIConfig } from '@prisma/client'
import { ollamaService } from '../ollama'

export interface SetActiveModelRequest {
	modelName: string
	modelSize?: number | undefined
	baseUrl?: string | undefined
}

export class ActiveModelService {
	db: PrismaClient = new PrismaClient()
	/**
	 * 设置活跃模型
	 */
	async setActiveModel(
		userId: string,
		request: SetActiveModelRequest,
	): Promise<ActiveModelConfig> {
		const serviceInfo = await ollamaService.getServiceInfo()

		if (!serviceInfo.models.some((model) => model.name === request.modelName)) {
			throw new Error(`模型 ${request.modelName} 未安装`)
		}

		// 更新或创建活跃模型配置
		const activeConfig = await this.db.activeModelConfig.upsert({
			where: {
				userId_modelType: {
					userId,
					modelType: 'ollama',
				},
			},
			update: {
				modelName: request.modelName,
				modelSize: request.modelSize ? BigInt(request.modelSize) : null,
				baseUrl: request.baseUrl || null,
				updatedAt: new Date(),
			},
			create: {
				userId,
				modelName: request.modelName,
				modelSize: request.modelSize ? BigInt(request.modelSize) : null,
				modelType: 'ollama',
				baseUrl: request.baseUrl || null,
			},
		})

		// 更新 AI 配置中的活跃状态
		await this.db.aIConfig.updateMany({
			where: { userId },
			data: { isActive: false },
		})

		await this.db.aIConfig.updateMany({
			where: {
				userId,
				model: request.modelName,
			},
			data: {
				isActive: true,
				modelSize: request.modelSize ? BigInt(request.modelSize) : null,
			},
		})

		return activeConfig
	}

	/**
	 * 获取用户当前活跃模型
	 */
	async getActiveModel(userId: string): Promise<ActiveModelConfig | null> {
		try {
			const activeConfig = await this.db.activeModelConfig.findUnique({
				where: {
					userId_modelType: {
						userId,
						modelType: 'ollama',
					},
				},
			})
			if (!activeConfig) {
				return null
			}
			return activeConfig
		} catch (error) {
			console.error('getActiveModel error', error)
			return null
		}
	}

	/**
	 * 清除活跃模型
	 */
	async clearActiveModel(userId: string): Promise<void> {
		await this.db.activeModelConfig.deleteMany({
			where: { userId, modelType: 'ollama' },
		})

		await this.db.aIConfig.updateMany({
			where: { userId },
			data: { isActive: false },
		})
	}

	/**
	 * 获取用户活跃模型的AI配置
	 */
	async getActiveAIConfig(userId: string): Promise<AIConfig | null> {
		console.log('[debug] try getActiveAIConfig userId', userId)
		const activeModel = await this.getActiveModel(userId)
		if (!activeModel) {
			return null
		}
		// 如果是 ollama 本地模型，直接返回配置信息，不需要查询 aIConfig 表
		if (activeModel.modelType === 'ollama') {
			return {
				id: `ollama-${activeModel.id}`,
				userId: activeModel.userId,
				name: `Ollama ${activeModel.modelName}`,
				type: 'ollama',
				baseUrl: activeModel.baseUrl || 'http://localhost:11434',
				apiKey: '', // ollama 不需要 API 密钥
				model: activeModel.modelName,
				modelSize: activeModel.modelSize,
				isActive: true,
				createdAt: activeModel.createdAt,
				updatedAt: activeModel.updatedAt,
			} as AIConfig
		}

		// 其他类型的模型（如 OpenAI、Anthropic 等）需要查询 aIConfig 表
		const aiConfig = await this.db.aIConfig.findFirst({
			where: {
				userId,
				model: activeModel.modelName,
				isActive: true,
			},
		})

		return aiConfig
	}
}

export const activeModelService = new ActiveModelService()
