import { OllamaConfig, getOllamaConfig } from '@/lib/ollama-config'
import ollama from 'ollama'
interface OllamaRequest {
    model: string
    prompt: string
    stream?: boolean
    options?: {
        temperature?: number
        top_p?: number
        top_k?: number
        repeat_penalty?: number
    }
}


export class OllamaClient {
    private config: OllamaConfig

    constructor(config?: Partial<OllamaConfig>) {
        this.config = { ...getOllamaConfig(), ...config }
    }

    async generate(prompt: string, model?: string): Promise<string> {
        try {
            const response = await ollama.chat({
                model: model || this.config.model,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                options: {
                    temperature: this.config.temperature,
                    top_p: this.config.topP,
                    repeat_penalty: this.config.repeatPenalty
                },
                stream: false
            })
            return response.message.content
        } catch (error) {
            console.error('Ollama API call failed:', error)
            throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async generateStream(prompt: string, model?: string, onChunk?: (chunk: string) => void): Promise<void> {
        try {
            const response = await ollama.chat({
                model: model || this.config.model,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                options: {
                    temperature: this.config.temperature,
                    top_p: this.config.topP,
                    repeat_penalty: this.config.repeatPenalty
                },
                stream: true
            })

            for await (const part of response) {
                if (part.message.content && onChunk) {
                    onChunk(part.message.content)
                }
            }
        } catch (error) {
            console.error('Ollama stream API call failed:', error)
            throw new Error(`Failed to generate stream content: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async listModels(): Promise<string[]> {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/tags`)
            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.status}`)
            }

            const data = await response.json()
            return data.models?.map((model: any) => model.name) || []
        } catch (error) {
            console.error('Failed to list models:', error)
            return []
        }
    }

    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/tags`)
            return response.ok
        } catch {
            return false
        }
    }
}

// 创建默认的Ollama客户端实例
export const ollamaClient = new OllamaClient() 