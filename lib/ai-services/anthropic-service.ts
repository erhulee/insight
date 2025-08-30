import { AIService, AIGenerationRequest, AIGenerationResponse, AIGenerationStreamResponse, AIServiceStatus } from '../ai-service-interface'
import { AIServiceConfig } from '../ai-service-config'

export class AnthropicService implements AIService {
    async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
        const { prompt, config, options } = request

        try {
            const response = await fetch(`${config.baseUrl}/v1/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': config.apiKey!,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: config.model,
                    max_tokens: options?.maxTokens ?? config.maxTokens ?? 4000,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: options?.temperature ?? config.temperature,
                    top_p: options?.topP ?? config.topP,
                }),
            })

            if (!response.ok) {
                throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            const content = data.content[0]?.text || ''

            return {
                content,
                usage: data.usage,
                model: data.model,
                finishReason: data.stop_reason,
            }
        } catch (error) {
            throw new Error(`Anthropic generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async generateStream(
        request: AIGenerationRequest,
        onChunk: (chunk: AIGenerationStreamResponse) => void
    ): Promise<void> {
        const { prompt, config, options } = request

        try {
            const response = await fetch(`${config.baseUrl}/v1/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': config.apiKey!,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: config.model,
                    max_tokens: options?.maxTokens ?? config.maxTokens ?? 4000,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: options?.temperature ?? config.temperature,
                    top_p: options?.topP ?? config.topP,
                    stream: true,
                }),
            })

            if (!response.ok) {
                throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
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
                            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                                onChunk({
                                    content: parsed.delta.text,
                                    isComplete: false,
                                    model: parsed.model || config.model,
                                })
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        } catch (error) {
            throw new Error(`Anthropic stream generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async testConnection(config: AIServiceConfig): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${config.baseUrl}/v1/models`, {
                headers: {
                    'x-api-key': config.apiKey!,
                    'anthropic-version': '2023-06-01',
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
            const response = await fetch(`${config.baseUrl}/v1/models`, {
                headers: {
                    'x-api-key': config.apiKey!,
                    'anthropic-version': '2023-06-01',
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
