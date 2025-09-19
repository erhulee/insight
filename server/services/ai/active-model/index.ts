import { PrismaClient } from '@prisma/client'
import { ollamaService } from '../ollama'

export interface ActiveModelConfig {
	id: string
	userId: string
	modelName: string
	modelSize?: number
	modelType: string
	baseUrl?: string
	createdAt: Date
	updatedAt: Date
}

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
		console.log('setActiveModel', userId, request)
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
				baseUrl: request.baseUrl,
				updatedAt: new Date(),
			},
			create: {
				userId,
				modelName: request.modelName,
				modelSize: request.modelSize ? BigInt(request.modelSize) : null,
				modelType: 'ollama',
				baseUrl: request.baseUrl,
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

		return {
			id: activeConfig.id,
			userId: activeConfig.userId,
			modelName: activeConfig.modelName,
			modelSize: activeConfig.modelSize
				? Number(activeConfig.modelSize)
				: undefined,
			modelType: activeConfig.modelType,
			baseUrl: activeConfig.baseUrl,
			createdAt: activeConfig.createdAt,
			updatedAt: activeConfig.updatedAt,
		}
	}

	/**
	 * 获取用户当前活跃模型
	 */
	async getActiveModel(userId: string): Promise<ActiveModelConfig | null> {
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

		return {
			id: activeConfig.id,
			userId: activeConfig.userId,
			modelName: activeConfig.modelName,
			modelSize: activeConfig.modelSize
				? Number(activeConfig.modelSize)
				: undefined,
			modelType: activeConfig.modelType,
			baseUrl: activeConfig.baseUrl,
			createdAt: activeConfig.createdAt,
			updatedAt: activeConfig.updatedAt,
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
	async getActiveAIConfig(userId: string): Promise<any | null> {
		const activeModel = await this.getActiveModel(userId)
		if (!activeModel) {
			return null
		}

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
