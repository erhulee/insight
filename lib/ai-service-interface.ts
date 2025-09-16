import { AIServiceConfig } from './ai-service-config'

export interface AIGenerationRequest {
	prompt: string
	config: AIServiceConfig
	options?: {
		maxTokens?: number
		temperature?: number
		topP?: number
		repeatPenalty?: number
	}
}

export interface AIGenerationResponse {
	content: string
	usage?: {
		promptTokens: number
		completionTokens: number
		totalTokens: number
	}
	model: string
	finishReason?: string
}

export interface AIGenerationStreamResponse {
	content: string
	isComplete: boolean
	usage?: {
		promptTokens: number
		completionTokens: number
		totalTokens: number
	}
	model: string
	finishReason?: string
}

export interface AIServiceStatus {
	available: boolean
	models: string[]
	currentModel: string
	error?: string
}

export interface AIService {
	generate(request: AIGenerationRequest): Promise<AIGenerationResponse>
	generateStream(
		request: AIGenerationRequest,
		onChunk: (chunk: AIGenerationStreamResponse) => void,
	): Promise<void>
	testConnection(
		config: AIServiceConfig,
	): Promise<{ success: boolean; error?: string }>
	getStatus(config: AIServiceConfig): Promise<AIServiceStatus>
}

// 服务工厂
export function createAIService(type: string): AIService {
	switch (type) {
		case 'openai':
			const { OpenAIService } = require('./ai-services/openai-service')
			return new OpenAIService()
		case 'ollama':
			const { OllamaService } = require('./ai-services/ollama-service')
			return new OllamaService()
		case 'anthropic':
			const { AnthropicService } = require('./ai-services/anthropic-service')
			return new AnthropicService()
		case 'volcano':
			const { VolcanoService } = require('./ai-services/volcano-service')
			return new VolcanoService()
		default:
			throw new Error(`Unsupported AI service type: ${type}`)
	}
}
