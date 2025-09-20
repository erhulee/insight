import {
	AIProvider,
	ChatProviderInput,
	SurveyProviderInput,
	AIProviderResponse,
} from '../../schemas/ai'
import { Ollama } from 'ollama'

export class OllamaProviderAdapter implements AIProvider {
	name = 'Ollama'
	modelName: string
	private ollama: Ollama

	constructor(modelName: string = 'qwen2.5:7b') {
		this.modelName = modelName
		this.ollama = new Ollama({
			host: process.env.OLLAMA_HOST || 'http://localhost:11434',
		})
	}

	/**
	 * 检查模型是否可用
	 */
	async checkModelAvailability(): Promise<boolean> {
		try {
			const models = await this.ollama.list()
			return models.models.some((model) => model.name === this.modelName)
		} catch (error) {
			console.error('检查模型可用性失败:', error)
			return false
		}
	}

	async chat(input: ChatProviderInput): Promise<AIProviderResponse> {
		try {
			// 检查模型是否可用
			const isModelAvailable = await this.checkModelAvailability()
			if (!isModelAvailable) {
				throw new Error(`模型 ${this.modelName} 不可用，请确保模型已安装`)
			}

			const response = await this.ollama.generate({
				model: this.modelName,
				prompt: input.prompt,
				stream: false,
				options: {
					temperature: input.temperature || 0.7,
					num_predict: input.maxTokens || 500,
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
		} catch (error) {
			throw new Error(
				`Ollama chat error: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
		}
	}

	async generateSurvey(
		input: SurveyProviderInput,
	): Promise<AIProviderResponse> {
		try {
			// 检查模型是否可用
			const isModelAvailable = await this.checkModelAvailability()
			if (!isModelAvailable) {
				throw new Error(`模型 ${this.modelName} 不可用，请确保模型已安装`)
			}

			const response = await this.ollama.generate({
				model: this.modelName,
				prompt: input.prompt,
				stream: false,
				options: {
					temperature: input.temperature || 0.3,
					num_predict: input.maxTokens || 2000,
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
		} catch (error) {
			throw new Error(
				`Ollama survey generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
		}
	}
}

// OpenAI 提供商适配器（示例）
export class OpenAIProviderAdapter implements AIProvider {
	name = 'OpenAI'
	modelName: string
	apiKey: string

	constructor(apiKey: string, modelName: string = 'gpt-3.5-turbo') {
		this.apiKey = apiKey
		this.modelName = modelName
	}

	async chat(input: ChatProviderInput): Promise<AIProviderResponse> {
		try {
			const response = await fetch(
				'https://api.openai.com/v1/chat/completions',
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${this.apiKey}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						model: this.modelName,
						messages: [
							{
								role: 'user',
								content: input.prompt,
							},
						],
						temperature: input.temperature || 0.7,
						max_tokens: input.maxTokens || 500,
					}),
				},
			)

			if (!response.ok) {
				throw new Error(`OpenAI API error: ${response.status}`)
			}

			const data = await response.json()

			return {
				content: data.choices[0]?.message?.content || '',
				usage: data.usage,
			}
		} catch (error) {
			throw new Error(
				`OpenAI chat error: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
		}
	}

	async generateSurvey(
		input: SurveyProviderInput,
	): Promise<AIProviderResponse> {
		try {
			const response = await fetch(
				'https://api.openai.com/v1/chat/completions',
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${this.apiKey}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						model: this.modelName,
						messages: [
							{
								role: 'user',
								content: input.prompt,
							},
						],
						temperature: input.temperature || 0.3,
						max_tokens: input.maxTokens || 2000,
					}),
				},
			)

			if (!response.ok) {
				throw new Error(`OpenAI API error: ${response.status}`)
			}

			const data = await response.json()

			return {
				content: data.choices[0]?.message?.content || '',
				usage: data.usage,
			}
		} catch (error) {
			throw new Error(
				`OpenAI survey generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
		}
	}
}

// AI 提供商工厂
export class AIProviderFactory {
	static createProvider(type: string, config: any): AIProvider {
		console.log('createProvider', type, config)

		switch (type) {
			case 'ollama':
				return new OllamaProviderAdapter(config.modelName || config.model)
			case 'openai':
				return new OpenAIProviderAdapter(
					config.apiKey,
					config.modelName || config.model,
				)
			default:
				throw new Error(`Unsupported AI provider type: ${type}`)
		}
	}

	static getDefaultProvider(): AIProvider {
		return new OllamaProviderAdapter()
	}
}
