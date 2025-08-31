import { TRPCError } from '@trpc/server'
import { AIServiceConfig, validateAIServiceConfig } from '@/lib/ai-service-config'
import { createAIService } from '@/lib/ai-service-interface'
import { buildSurveyPrompt } from '@/server/ai-service'

export interface TestConnectionInput {
    type: 'openai' | 'ollama' | 'anthropic' | 'custom'
    baseUrl: string
    apiKey?: string
    model: string
    temperature: number
    topP: number
    repeatPenalty?: number
    maxTokens?: number
}

export interface GetStatusInput {
    type: 'openai' | 'ollama' | 'anthropic' | 'custom'
    baseUrl: string
    apiKey?: string
    model: string
    temperature: number
    topP: number
    repeatPenalty?: number
    maxTokens?: number
}

export interface GenerateSurveyInput {
    prompt: string
    config: TestConnectionInput
}

export interface GenerateSurveyStreamInput {
    prompt: string
    config: TestConnectionInput
}

export class AIConfigService {
    /**
     * 测试AI服务连接
     */
    async testConnection(input: TestConnectionInput): Promise<{ success: boolean; error?: string }> {
        try {
            // 验证配置
            const config = input as AIServiceConfig
            const validation = validateAIServiceConfig(config)
            if (!validation.valid) {
                return { success: false, error: validation.errors.join(', ') }
            }

            // 创建AI服务实例
            const service = createAIService(input.type)

            // 测试连接
            const result = await service.testConnection(config)

            return result
        } catch (error) {
            console.error('AI连接测试失败:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : '连接测试失败'
            }
        }
    }

    /**
     * 获取AI服务状态
     */
    async getServiceStatus(input: GetStatusInput): Promise<{
        available: boolean;
        models: string[];
        currentModel: string;
        error?: string
    }> {
        try {
            // 验证配置
            const config = input as AIServiceConfig
            const validation = validateAIServiceConfig(config)
            if (!validation.valid) {
                return {
                    available: false,
                    models: [],
                    currentModel: '',
                    error: validation.errors.join(', '),
                }
            }

            // 创建AI服务实例
            const service = createAIService(input.type)

            // 获取服务状态
            const status = await service.getStatus(config)

            return status
        } catch (error) {
            console.error('获取AI服务状态失败:', error)
            return {
                available: false,
                models: [],
                currentModel: '',
                error: error instanceof Error ? error.message : '获取状态失败',
            }
        }
    }

    /**
     * 使用指定配置生成问卷
     */
    async generateSurvey(input: GenerateSurveyInput): Promise<any> {
        try {
            // 验证配置
            const config = input.config as AIServiceConfig
            const validation = validateAIServiceConfig(config)
            if (!validation.valid) {
                throw new TRPCError({
                    message: `配置验证失败: ${validation.errors.join(', ')}`,
                    code: 'BAD_REQUEST',
                })
            }

            // 创建AI服务实例
            const service = createAIService(input.config.type)

            // 构建问卷生成提示
            const surveyPrompt = buildSurveyPrompt(input.prompt)

            // 生成问卷
            const result = await service.generate({
                prompt: surveyPrompt,
                config: config,
            })

            return result
        } catch (error) {
            console.error('AI生成问卷失败:', error)
            if (error instanceof TRPCError) throw error

            throw new TRPCError({
                message: 'AI生成问卷失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 流式生成问卷
     */
    async generateSurveyStream(
        input: GenerateSurveyStreamInput,
        onChunk: (chunk: any) => void
    ): Promise<void> {
        try {
            // 验证配置
            const config = input.config as AIServiceConfig
            const validation = validateAIServiceConfig(config)
            if (!validation.valid) {
                throw new TRPCError({
                    message: `配置验证失败: ${validation.errors.join(', ')}`,
                    code: 'BAD_REQUEST',
                })
            }

            // 创建AI服务实例
            const service = createAIService(input.config.type)

            // 构建问卷生成提示
            const surveyPrompt = buildSurveyPrompt(input.prompt)

            // 流式生成问卷
            await service.generateStream(
                {
                    prompt: surveyPrompt,
                    config: config,
                },
                onChunk
            )
        } catch (error) {
            console.error('流式生成失败:', error)
            if (error instanceof TRPCError) throw error

            throw new TRPCError({
                message: '流式生成失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }
}

export const aiConfigService = new AIConfigService()
