import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import { ConversationService } from './conversation.service'
import { AIConversationService } from './ai-conversation.service'
import { PromptBuilderService } from './prompt-builder.service'
import { ConversationCache } from './cache.service'
import { AIProviderFactory } from './ai-provider-adapter'

// 导出历史会话相关接口
export type {
	ConversationHistoryItem,
	ConversationHistoryFilters,
	ConversationHistoryResponse,
} from './conversation.service'

// 全局服务实例
let conversationService: ConversationService
let aiConversationService: AIConversationService
let promptBuilderService: PromptBuilderService
let conversationCache: ConversationCache

export function initializeConversationServices(
	prisma: PrismaClient,
	redis: Redis,
	aiProviderType: string = 'ollama',
	aiProviderConfig: any = {},
) {
	// 创建 AI 提供商
	const aiProvider = AIProviderFactory.createProvider(
		aiProviderType,
		aiProviderConfig,
	)

	// 创建服务实例
	conversationCache = new ConversationCache(redis)
	promptBuilderService = new PromptBuilderService()
	aiConversationService = new AIConversationService(
		aiProvider,
		promptBuilderService,
		conversationCache,
		prisma,
	)
	conversationService = new ConversationService(
		prisma,
		redis,
		aiConversationService,
		conversationCache,
	)

	return {
		conversationService,
		aiConversationService,
		promptBuilderService,
		conversationCache,
	}
}

export function getConversationService(): ConversationService {
	if (!conversationService) {
		throw new Error(
			'ConversationService not initialized. Call initializeConversationServices first.',
		)
	}
	return conversationService
}

export function getAIConversationService(): AIConversationService {
	if (!aiConversationService) {
		throw new Error(
			'AIConversationService not initialized. Call initializeConversationServices first.',
		)
	}
	return aiConversationService
}

export function getPromptBuilderService(): PromptBuilderService {
	if (!promptBuilderService) {
		throw new Error(
			'PromptBuilderService not initialized. Call initializeConversationServices first.',
		)
	}
	return promptBuilderService
}

export function getConversationCache(): ConversationCache {
	if (!conversationCache) {
		throw new Error(
			'ConversationCache not initialized. Call initializeConversationServices first.',
		)
	}
	return conversationCache
}
