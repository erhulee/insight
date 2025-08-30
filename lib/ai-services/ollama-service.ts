import { AIService, AIGenerationRequest, AIGenerationResponse, AIGenerationStreamResponse, AIServiceStatus } from '../ai-service-interface'
import { AIServiceConfig } from '../ai-service-config'

export class OllamaService implements AIService {
    async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
        const { prompt, config, options } = request

        try {
            const response = await fetch(`${config.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [{ role: 'user', content: prompt }],
                    options: {
                        temperature: options?.temperature ?? config.temperature,
                        top_p: options?.topP ?? config.topP,
                        repeat_penalty: options?.repeatPenalty ?? config.repeatPenalty,
                    },
                    stream: false,
                }),
            })

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()

            return {
                content: data.message.content,
                model: config.model,
            }
        } catch (error) {
            throw new Error(`Ollama generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async generateStream(
        request: AIGenerationRequest,
        onChunk: (chunk: AIGenerationStreamResponse) => void
    ): Promise<void> {
        const { prompt, config, options } = request

        try {
            const response = await fetch(`${config.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [{ role: 'user', content: prompt }],
                    options: {
                        temperature: options?.temperature ?? config.temperature,
                        top_p: options?.topP ?? config.topP,
                        repeat_penalty: options?.repeatPenalty ?? config.repeatPenalty,
                    },
                    stream: true,
                }),
            })

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
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
                    if (line.trim()) {
                        try {
                            const parsed = JSON.parse(line)
                            if (parsed.message?.content) {
                                onChunk({
                                    content: parsed.message.content,
                                    isComplete: false,
                                    model: config.model,
                                })
                            }
                            if (parsed.done) {
                                onChunk({
                                    content: '',
                                    isComplete: true,
                                    model: config.model,
                                })
                                return
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        } catch (error) {
            throw new Error(`Ollama stream generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async testConnection(config: AIServiceConfig): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${config.baseUrl}/api/tags`)
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
            const response = await fetch(`${config.baseUrl}/api/tags`)
            if (!response.ok) {
                return {
                    available: false,
                    models: [],
                    currentModel: '',
                    error: `HTTP ${response.status}: ${response.statusText}`,
                }
            }

            const data = await response.json()
            const models = data.models?.map((model: any) => model.name) || []

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
