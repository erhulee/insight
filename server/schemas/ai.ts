import { z } from 'zod'

// AI 聊天输入
export const ChatInput = z.object({
	sessionId: z.string(),
	message: z.string(),
})

// 生成问卷输入
export const GenerateSurveyInput = z.object({
	sessionId: z.string(),
	prompt: z.string(),
})

// AI 聊天响应
export const ChatResponse = z.object({
	content: z.string(),
	suggestions: z.array(z.string()),
	conversationState: z
		.object({
			phase: z.string(),
			progress: z.number(),
			collectedInfo: z.record(z.any()),
		})
		.optional(),
	metadata: z.record(z.any()).optional(),
})

// 问卷生成响应
export const SurveyGenerationResponse = z.object({
	survey: z.object({
		id: z.string(),
		title: z.string(),
		description: z.string().optional(),
		questions: z.array(z.any()),
	}),
	metadata: z
		.object({
			generationTime: z.number().optional(),
			tokenUsage: z
				.object({
					totalTokens: z.number().optional(),
					promptTokens: z.number().optional(),
					completionTokens: z.number().optional(),
				})
				.optional(),
		})
		.optional(),
})

// AI 提供商接口
export interface AIProvider {
	name: string
	modelName: string
	chat(input: ChatProviderInput): Promise<AIProviderResponse>
	generateSurvey(input: SurveyProviderInput): Promise<AIProviderResponse>
}

// AI 提供商聊天输入
export interface ChatProviderInput {
	prompt: string
	temperature?: number
	maxTokens?: number
}

// AI 提供商问卷生成输入
export interface SurveyProviderInput {
	prompt: string
	temperature?: number
	maxTokens?: number
}

// AI 提供商响应
export interface AIProviderResponse {
	content: string
	usage?: {
		promptTokens: number
		completionTokens: number
		totalTokens: number
	}
}

// 解析后的响应
export interface ParsedResponse {
	content: string
	suggestions: string[]
	metadata: Record<string, any>
	stateUpdate: {
		phase: string
		progress: number
		collectedInfo: Record<string, any>
		context: Record<string, any>
	}
}

// 对话 Prompt 输入
export interface ConversationPromptInput {
	message: string
	context: {
		phase: string
		collectedInfo: Record<string, any>
		previousMessages: any[]
	}
}

// 问卷 Prompt 输入
export interface SurveyPromptInput {
	prompt: string
	context: {
		collectedInfo: Record<string, any>
		requirements?: string[]
	}
}

// 聊天输入类型
export type ChatInputType = z.infer<typeof ChatInput>

// 生成问卷输入类型
export type GenerateSurveyInputType = z.infer<typeof GenerateSurveyInput>

// 聊天响应类型
export type ChatResponseType = z.infer<typeof ChatResponse>

// 问卷生成响应类型
export type SurveyGenerationResponseType = z.infer<
	typeof SurveyGenerationResponse
>
