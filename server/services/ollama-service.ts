import { TRPCError } from '@trpc/server'
import { ollamaClient } from '@/server/ollama-client'

export interface OllamaGenerateInput {
    prompt: string
    model: string
    options?: {
        temperature?: number
        topP?: number
        repeatPenalty?: number
        maxTokens?: number
    }
}

export interface OllamaGenerateResult {
    response: string
    model: string
    createdAt: Date
    usage?: {
        promptTokens: number
        completionTokens: number
        totalTokens: number
    }
}

export interface OllamaModelInfo {
    name: string
    modifiedAt: Date
    size: number
    digest: string
    details?: {
        format: string
        family: string
        parameterSize: string
        quantizationLevel: string
    }
}

export class OllamaService {
    /**
     * 检查Ollama服务是否可用
     */
    async isAvailable(): Promise<boolean> {
        try {
            return await ollamaClient.isAvailable()
        } catch (error) {
            console.error('检查Ollama可用性失败:', error)
            return false
        }
    }

    /**
     * 生成文本内容
     */
    async generate(input: OllamaGenerateInput): Promise<OllamaGenerateResult> {
        try {
            // 检查服务是否可用
            const isAvailable = await this.isAvailable()
            if (!isAvailable) {
                throw new TRPCError({
                    message: 'Ollama服务不可用',
                    code: 'SERVICE_UNAVAILABLE',
                })
            }

            // 构建生成选项
            const options: any = {}
            if (input.options?.temperature !== undefined) {
                options.temperature = input.options.temperature
            }
            if (input.options?.topP !== undefined) {
                options.topP = input.options.topP
            }
            if (input.options?.repeatPenalty !== undefined) {
                options.repeatPenalty = input.options.repeatPenalty
            }
            if (input.options?.maxTokens !== undefined) {
                options.numPredict = input.options.maxTokens
            }

            // 调用Ollama生成
            const response = await ollamaClient.generate(input.prompt, input.model, options)

            return {
                response,
                model: input.model,
                createdAt: new Date(),
                usage: {
                    promptTokens: 0, // Ollama不提供详细的token统计
                    completionTokens: 0,
                    totalTokens: 0,
                }
            }
        } catch (error) {
            if (error instanceof TRPCError) throw error

            console.error('Ollama生成失败:', error)
            throw new TRPCError({
                message: '生成失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 流式生成文本内容
     */
    async generateStream(
        input: OllamaGenerateInput,
        onChunk: (chunk: any) => void
    ): Promise<void> {
        try {
            // 检查服务是否可用
            const isAvailable = await this.isAvailable()
            if (!isAvailable) {
                throw new TRPCError({
                    message: 'Ollama服务不可用',
                    code: 'SERVICE_UNAVAILABLE',
                })
            }

            // 构建生成选项
            const options: any = {}
            if (input.options?.temperature !== undefined) {
                options.temperature = input.options.temperature
            }
            if (input.options?.topP !== undefined) {
                options.topP = input.options.topP
            }
            if (input.options?.repeatPenalty !== undefined) {
                options.repeatPenalty = input.options.repeatPenalty
            }
            if (input.options?.maxTokens !== undefined) {
                options.numPredict = input.options.maxTokens
            }

            // 调用Ollama流式生成
            await ollamaClient.generateStream(input.prompt, input.model, options, onChunk)
        } catch (error) {
            if (error instanceof TRPCError) throw error

            console.error('Ollama流式生成失败:', error)
            throw new TRPCError({
                message: '流式生成失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 获取可用模型列表
     */
    async getModels(): Promise<OllamaModelInfo[]> {
        try {
            // 检查服务是否可用
            const isAvailable = await this.isAvailable()
            if (!isAvailable) {
                throw new TRPCError({
                    message: 'Ollama服务不可用',
                    code: 'SERVICE_UNAVAILABLE',
                })
            }

            const models = await ollamaClient.listModels()
            return models.map(model => ({
                name: model.name,
                modifiedAt: new Date(model.modified_at),
                size: model.size,
                digest: model.digest,
                details: model.details ? {
                    format: model.details.format,
                    family: model.details.family,
                    parameterSize: model.details.parameter_size,
                    quantizationLevel: model.details.quantization_level,
                } : undefined,
            }))
        } catch (error) {
            if (error instanceof TRPCError) throw error

            console.error('获取Ollama模型列表失败:', error)
            throw new TRPCError({
                message: '获取模型列表失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 获取模型信息
     */
    async getModelInfo(modelName: string): Promise<OllamaModelInfo | null> {
        try {
            // 检查服务是否可用
            const isAvailable = await this.isAvailable()
            if (!isAvailable) {
                throw new TRPCError({
                    message: 'Ollama服务不可用',
                    code: 'SERVICE_UNAVAILABLE',
                })
            }

            const modelInfo = await ollamaClient.getModelInfo(modelName)
            if (!modelInfo) return null

            return {
                name: modelInfo.name,
                modifiedAt: new Date(modelInfo.modified_at),
                size: modelInfo.size,
                digest: modelInfo.digest,
                details: modelInfo.details ? {
                    format: modelInfo.details.format,
                    family: modelInfo.details.family,
                    parameterSize: modelInfo.details.parameter_size,
                    quantizationLevel: modelInfo.details.quantization_level,
                } : undefined,
            }
        } catch (error) {
            if (error instanceof TRPCError) throw error

            console.error('获取Ollama模型信息失败:', error)
            throw new TRPCError({
                message: '获取模型信息失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 拉取模型
     */
    async pullModel(modelName: string): Promise<{ success: boolean; message: string }> {
        try {
            // 检查服务是否可用
            const isAvailable = await this.isAvailable()
            if (!isAvailable) {
                throw new TRPCError({
                    message: 'Ollama服务不可用',
                    code: 'SERVICE_UNAVAILABLE',
                })
            }

            const result = await ollamaClient.pullModel(modelName)
            return {
                success: true,
                message: `模型 ${modelName} 拉取成功`,
            }
        } catch (error) {
            console.error('拉取Ollama模型失败:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : '拉取模型失败',
            }
        }
    }

    /**
     * 删除模型
     */
    async deleteModel(modelName: string): Promise<{ success: boolean; message: string }> {
        try {
            // 检查服务是否可用
            const isAvailable = await this.isAvailable()
            if (!isAvailable) {
                throw new TRPCError({
                    message: 'Ollama服务不可用',
                    code: 'SERVICE_UNAVAILABLE',
                })
            }

            await ollamaClient.deleteModel(modelName)
            return {
                success: true,
                message: `模型 ${modelName} 删除成功`,
            }
        } catch (error) {
            console.error('删除Ollama模型失败:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : '删除模型失败',
            }
        }
    }
}

export const ollamaService = new OllamaService()
