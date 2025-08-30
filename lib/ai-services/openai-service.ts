import { AIService, AIGenerationRequest, AIGenerationResponse, AIGenerationStreamResponse, AIServiceStatus } from '../ai-service-interface'
import { AIServiceConfig } from '../ai-service-config'

export class OpenAIService implements AIService {
    async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
        const { prompt, config, options } = request

        try {
            const response = await fetch(`${config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`,
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: options?.temperature ?? config.temperature,
                    top_p: options?.topP ?? config.topP,
                    max_tokens: options?.maxTokens ?? config.maxTokens ?? 4000,
                    stream: false,
                }),
            })

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            const choice = data.choices[0]

            return {
                content: choice.message.content,
                usage: data.usage,
                model: data.model,
                finishReason: choice.finish_reason,
            }
        } catch (error) {
            throw new Error(`OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async generateStream(
        request: AIGenerationRequest,
        onChunk: (chunk: AIGenerationStreamResponse) => void
    ): Promise<void> {
        const { prompt, config, options } = request

        try {
            const response = await fetch(`${config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`,
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: options?.temperature ?? config.temperature,
                    top_p: options?.topP ?? config.topP,
                    max_tokens: options?.maxTokens ?? config.maxTokens ?? 4000,
                    stream: true,
                }),
            })

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
            }

            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error('Failed to get response reader')
            }

            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6)
                        if (data === '[DONE]') {
                            onChunk({
                                content: '',
                                isComplete: true,
                                model: config.model,
                            })
                            return
                        }

                        try {
                            const parsed = JSON.parse(data)
                            if (parsed.choices?.[0]?.delta?.content) {
                                onChunk({
                                    content: parsed.choices[0].delta.content,
                                    isComplete: false,
                                    model: parsed.model,
                                })
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        } catch (error) {
            throw new Error(`OpenAI stream generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async testConnection(config: AIServiceConfig): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${config.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                },
            })

            if (!response.ok) {
                return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
            }

            return { success: true }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
    }

    async getStatus(config: AIServiceConfig): Promise<AIServiceStatus> {
        try {
            const response = await fetch(`${config.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                },
            })

            if (!response.ok) {
                return {
                    available: false,
                    models: [],
                    currentModel: '',
                    error: `HTTP ${response.status}: ${response.statusText}`,
                }
            }

            const data = await response.json()
            const models = data.data?.map((model: any) => model.id) || []

            return {
                available: true,
                models,
                currentModel: config.model,
            }
        } catch (error) {
            return {
                available: false,
                models: [],
                currentModel: '',
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }
}
