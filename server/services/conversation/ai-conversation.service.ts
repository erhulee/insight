import { z } from 'zod'
import {
	ChatInput,
	ChatResponse,
	GenerateSurveyInput,
	SurveyGenerationResponse,
	AIProvider,
	ChatProviderInput,
	SurveyProviderInput,
	ParsedResponse,
} from '../../schemas/ai'
import { ConversationPhase, Message } from '../../schemas/conversation'

// 类型定义
type ChatInputType = z.infer<typeof ChatInput>
type ChatResponseType = z.infer<typeof ChatResponse>
type GenerateSurveyInputType = z.infer<typeof GenerateSurveyInput>
type SurveyGenerationResponseType = z.infer<typeof SurveyGenerationResponse>
import { PromptBuilderService } from './prompt-builder.service'
import { ConversationCache } from './cache.service'
import { PrismaClient } from '@prisma/client'
import { activeModelService } from '../ai/active-model'
import { aiConfigService } from '../ai-config'

export class AIConversationService {
	constructor(
		private aiProvider: AIProvider,
		private promptBuilder: PromptBuilderService,
		private cache: ConversationCache,
		private prisma: PrismaClient,
	) {}

	/**
	 * 调用 AI 服务
	 */
	private async callAIService({
		prompt,
		config,
		type,
	}: {
		prompt: string
		config: any
		type: 'chat' | 'survey'
	}) {
		// 根据配置类型选择不同的 AI 服务
		if (config.type === 'ollama') {
			// 使用 ollama 直接调用
			const { Ollama } = await import('ollama')
			const ollama = new Ollama({
				host: config.baseUrl || 'http://localhost:11434',
			})

			const response = await ollama.generate({
				model: config.model,
				prompt,
				stream: false,
				options: {
					temperature: type === 'chat' ? 0.7 : 0.3,
					num_predict: type === 'chat' ? 500 : 2000,
				},
			})

			return {
				content: response.response || '',
				usage: {
					promptTokens: response.prompt_eval_count || 0,
					completionTokens: response.eval_count || 0,
					totalTokens:
						(response.prompt_eval_count || 0) + (response.eval_count || 0),
				},
			}
		} else {
			// 其他类型的 AI 服务（OpenAI、Anthropic 等）暂时抛出错误
			// 因为 createAIService 不支持 ollama 类型
			throw new Error(
				`AI 服务类型 ${config.type} 暂不支持，请使用 ollama 本地模型`,
			)
		}
	}

	/**
	 * 获取用户的活跃AI配置
	 */
	private async getActiveAIConfig(userId: string) {
		const activeConfig = await activeModelService.getActiveAIConfig(userId)
		if (!activeConfig) {
			throw new Error('没有可用的AI服务配置')
		}

		// 解密API密钥
		const decryptedApiKey =
			activeConfig.apiKey && activeConfig.apiKey !== '***'
				? Buffer.from(activeConfig.apiKey, 'base64').toString('utf-8')
				: undefined

		return {
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
	}

	async chat(
		input: ChatInputType & { userId: string },
	): Promise<ChatResponseType> {
		const { sessionId, message, userId } = input

		// 检查缓存
		const cacheKey = `chat:${sessionId}:${Buffer.from(message).toString('base64')}`
		const cached = await this.cache.getCachedAIResponse(cacheKey)
		if (cached) {
			return cached
		}

		// 获取用户的活跃AI配置
		const activeConfig = await this.getActiveAIConfig(userId)

		// 从数据库获取历史消息
		const conversationHistory = await this.getRecentMessages(sessionId, 10)

		// 构建对话 prompt
		const prompt = this.promptBuilder.buildConversationPrompt({
			message,
			context: {
				phase: 'initial', // 默认阶段，实际应该从会话状态获取
				collectedInfo: {},
				previousMessages: conversationHistory,
			},
			phase: 'initial' as ConversationPhase,
		})

		// 使用活跃配置调用 AI 服务进行对话
		const aiResponse = await this.callAIService({
			prompt,
			config: activeConfig,
			type: 'chat',
		})

		// 解析 AI 响应
		const responseContent =
			typeof aiResponse === 'string'
				? aiResponse
				: (aiResponse as any).content || ''
		const parsedResponse = this.parseAIResponse(responseContent, 'initial')

		const response: ChatResponseType = {
			content: parsedResponse.content,
			suggestions: parsedResponse.suggestions,
			conversationState: parsedResponse.stateUpdate
				? {
						phase: parsedResponse.stateUpdate.phase,
						progress: parsedResponse.stateUpdate.progress,
						collectedInfo: parsedResponse.stateUpdate.collectedInfo,
					}
				: undefined,
			metadata: parsedResponse.metadata,
		}

		// 缓存响应
		await this.cache.cacheAIResponse(cacheKey, response)

		return response
	}

	async generateSurvey(
		input: GenerateSurveyInputType & { userId: string },
	): Promise<SurveyGenerationResponseType> {
		const { sessionId, prompt, userId } = input

		// 获取用户的活跃AI配置
		const activeConfig = await this.getActiveAIConfig(userId)

		// 构建问卷生成 prompt
		const surveyPrompt = this.promptBuilder.buildSurveyPrompt({
			prompt,
			context: {
				collectedInfo: {},
				requirements: [],
			},
			collectedInfo: {},
		})

		// 使用活跃配置调用 AI 服务生成问卷
		const aiResponse = await this.callAIService({
			prompt: surveyPrompt,
			config: activeConfig,
			type: 'survey',
		})

		// 解析和验证问卷结构
		const survey = this.parseSurveyResponse(aiResponse)

		// 保存生成的问卷
		const generatedSurvey = await this.saveGeneratedSurvey({
			sessionId,
			survey,
			prompt: surveyPrompt,
			metadata: {
				aiProvider: activeConfig.type,
				modelName: activeConfig.model,
				generationTime: Date.now(),
			},
		})

		return {
			survey: generatedSurvey,
			metadata: {
				generationTime: Date.now(),
				tokenUsage:
					typeof aiResponse === 'object' && 'tokenUsage' in aiResponse
						? (aiResponse as any).tokenUsage
						: undefined,
			},
		}
	}

	async getServiceStatus(userId: string) {
		try {
			const activeConfig = await this.getActiveAIConfig(userId)
			return {
				provider: activeConfig.type,
				model: activeConfig.model,
				status: 'active',
				timestamp: new Date().toISOString(),
			}
		} catch (error) {
			return {
				provider: 'unknown',
				model: 'none',
				status: 'inactive',
				error:
					error instanceof Error ? error.message : 'No active configuration',
				timestamp: new Date().toISOString(),
			}
		}
	}

	private parseAIResponse(response: string, phase: string): ParsedResponse {
		// 解析 AI 响应，提取内容、建议和元数据
		const content = this.extractContent(response)
		const suggestions = this.extractSuggestions(
			response,
			phase as ConversationPhase,
		)
		const metadata = this.extractMetadata(response)
		const stateUpdate = this.determineStateUpdate(
			response,
			phase as ConversationPhase,
		)

		return {
			content,
			suggestions,
			metadata,
			stateUpdate,
		}
	}

	private extractContent(response: string): string {
		// 提取主要内容，去除建议部分
		const lines = response.split('\n')
		const contentLines = lines.filter(
			(line) =>
				!line.includes('建议') &&
				!line.includes('推荐') &&
				!line.includes('选项') &&
				!line.includes('选择'),
		)
		return contentLines.join('\n').trim()
	}

	private extractSuggestions(
		response: string,
		phase: ConversationPhase,
	): string[] {
		// 根据对话阶段提取相关建议
		const suggestionPatterns = {
			initial: /建议[：:]\s*(.+)/g,
			details: /推荐[：:]\s*(.+)/g,
			structure: /选项[：:]\s*(.+)/g,
			validation: /选择[：:]\s*(.+)/g,
			complete: /操作[：:]\s*(.+)/g,
		}

		const pattern = suggestionPatterns[phase as keyof typeof suggestionPatterns]
		if (!pattern) return []

		const matches = response.match(pattern)
		return matches
			? matches.map((match) => match.replace(pattern, '$1').trim())
			: []
	}

	private extractMetadata(response: string): Record<string, any> {
		// 提取元数据，如置信度、处理时间等
		return {
			confidence: this.calculateConfidence(response),
			responseLength: response.length,
			processedAt: new Date().toISOString(),
		}
	}

	private determineStateUpdate(
		response: string,
		phase: ConversationPhase,
	): ParsedResponse['stateUpdate'] {
		// 根据响应内容确定状态更新
		const progressIncrement = this.calculateProgressIncrement(response, phase)

		return {
			phase: this.determineNextPhase(phase, response),
			progress: Math.min(
				100,
				this.getCurrentProgress(phase) + progressIncrement,
			),
			collectedInfo: this.extractCollectedInfo(response),
			context: this.updateContext(response, phase),
		}
	}

	private calculateConfidence(response: string): number {
		// 简单的置信度计算，基于响应长度和内容质量
		const lengthScore = Math.min(response.length / 100, 1)
		const qualityScore =
			response.includes('？') || response.includes('?') ? 0.8 : 0.6
		return (lengthScore + qualityScore) / 2
	}

	private calculateProgressIncrement(
		response: string,
		phase: ConversationPhase,
	): number {
		const increments = {
			initial: 20,
			details: 20,
			structure: 20,
			validation: 20,
			complete: 0,
		}
		return increments[phase as keyof typeof increments] || 0
	}

	private getCurrentProgress(phase: ConversationPhase): number {
		const progressMap = {
			initial: 0,
			details: 20,
			structure: 40,
			validation: 60,
			complete: 80,
		}
		return progressMap[phase as keyof typeof progressMap] || 0
	}

	private determineNextPhase(
		phase: ConversationPhase,
		response: string,
	): string {
		// 根据响应内容确定下一个阶段
		if (phase === 'initial' && response.includes('目的')) {
			return 'details'
		}
		if (phase === 'details' && response.includes('受众')) {
			return 'structure'
		}
		if (phase === 'structure' && response.includes('类型')) {
			return 'validation'
		}
		if (phase === 'validation' && response.includes('确认')) {
			return 'complete'
		}
		return phase
	}

	private extractCollectedInfo(response: string): Record<string, any> {
		// 从响应中提取收集到的信息
		const info: Record<string, any> = {}

		// 简单的信息提取逻辑
		if (response.includes('目的')) {
			info.purpose = this.extractValueAfter(response, '目的')
		}
		if (response.includes('受众')) {
			info.targetAudience = this.extractValueAfter(response, '受众')
		}
		if (response.includes('类型')) {
			info.questionTypes = this.extractValueAfter(response, '类型').split('、')
		}

		return info
	}

	private extractValueAfter(text: string, keyword: string): string {
		const regex = new RegExp(`${keyword}[：:](.+?)(?:\n|$)`, 'g')
		const match = regex.exec(text)
		return match && match[1] ? match[1].trim() : ''
	}

	private updateContext(
		response: string,
		phase: ConversationPhase,
	): Record<string, any> {
		return {
			lastResponse: response,
			currentPhase: phase,
			updatedAt: new Date().toISOString(),
		}
	}

	private parseSurveyResponse(aiResponse: any): any {
		try {
			// 尝试解析 JSON 响应
			const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/)
			if (jsonMatch) {
				return JSON.parse(jsonMatch[0])
			}

			// 如果解析失败，返回默认结构
			return {
				title: '生成的问卷',
				description: 'AI 生成的问卷',
				questions: [
					{
						id: 'q1',
						title: '请描述您的需求',
						type: 'text',
						required: true,
						description: '请详细描述您的需求',
					},
				],
			}
		} catch (error) {
			console.error('解析问卷响应失败:', error)
			return {
				title: '生成的问卷',
				description: 'AI 生成的问卷',
				questions: [],
			}
		}
	}

	private async saveGeneratedSurvey(data: {
		sessionId: string
		survey: any
		prompt: string
		metadata: any
	}): Promise<any> {
		const generatedSurvey = await this.prisma.generatedSurvey.create({
			data: {
				sessionId: data.sessionId,
				title: data.survey.title,
				description: data.survey.description,
				questions: data.survey.questions,
				prompt: data.prompt,
				aiProvider: data.metadata.aiProvider,
				modelName: data.metadata.modelName,
				generationMetadata: data.metadata,
			},
		})

		return generatedSurvey
	}

	/**
	 * 获取最近的消息历史
	 */
	private async getRecentMessages(
		sessionId: string,
		limit: number,
	): Promise<Message[]> {
		const dbMessages = await this.prisma.conversationMessage.findMany({
			where: { sessionId },
			orderBy: { createdAt: 'desc' },
			take: limit,
		})

		return dbMessages.map((msg) => ({
			id: msg.messageId,
			type: msg.type as 'user' | 'ai',
			content: msg.content,
			timestamp: msg.createdAt,
			suggestions: msg.suggestions ? (msg.suggestions as string[]) : [],
			metadata: msg.metadata || {},
		}))
	}
}
