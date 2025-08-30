import { AIServiceConfig, getActiveAIConfig, getStoredAIConfigs } from './ai-service-config'
import { AIService, AIGenerationRequest, AIGenerationResponse, AIGenerationStreamResponse, AIServiceStatus, createAIService } from './ai-service-interface'

export class AIServiceManager {
    private static instance: AIServiceManager
    private activeConfig: AIServiceConfig | null = null

    private constructor() {
        this.loadActiveConfig()
    }

    public static getInstance(): AIServiceManager {
        if (!AIServiceManager.instance) {
            AIServiceManager.instance = new AIServiceManager()
        }
        return AIServiceManager.instance
    }

    private loadActiveConfig(): void {
        this.activeConfig = getActiveAIConfig()
    }

    public getActiveConfig(): AIServiceConfig | null {
        return this.activeConfig
    }

    public getAllConfigs(): AIServiceConfig[] {
        return getStoredAIConfigs()
    }

    public setActiveConfig(configId: string): void {
        const configs = getStoredAIConfigs()
        const targetConfig = configs.find(c => c.id === configId)

        if (targetConfig) {
            // 将所有配置设为非活跃
            configs.forEach(c => c.isActive = false)
            // 设置目标配置为活跃
            targetConfig.isActive = true

            // 保存到本地存储
            localStorage.setItem('ai_service_configs', JSON.stringify(configs))

            // 更新内存中的活跃配置
            this.activeConfig = targetConfig
        }
    }

    public async generateSurvey(prompt: string): Promise<AIGenerationResponse> {
        if (!this.activeConfig) {
            throw new Error('没有可用的AI服务配置')
        }

        const service = createAIService(this.activeConfig.type)
        const request: AIGenerationRequest = {
            prompt: this.buildSurveyPrompt(prompt),
            config: this.activeConfig,
        }

        return await service.generate(request)
    }

    public async generateSurveyStream(
        prompt: string,
        onChunk: (chunk: AIGenerationStreamResponse) => void
    ): Promise<void> {
        if (!this.activeConfig) {
            throw new Error('没有可用的AI服务配置')
        }

        const service = createAIService(this.activeConfig.type)
        const request: AIGenerationRequest = {
            prompt: this.buildSurveyPrompt(prompt),
            config: this.activeConfig,
        }

        await service.generateStream(request, onChunk)
    }

    public async testConnection(config: AIServiceConfig): Promise<{ success: boolean; error?: string }> {
        console.log("testConnection:", config)
        try {
            const service = createAIService(config.type)
            return await service.testConnection(config)
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
    }

    public async getServiceStatus(config: AIServiceConfig): Promise<AIServiceStatus> {
        try {
            const service = createAIService(config.type)
            return await service.getStatus(config)
        } catch (error) {
            return {
                available: false,
                models: [],
                currentModel: '',
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }

    private buildSurveyPrompt(userPrompt: string): string {
        return `你是一个专业的问卷设计专家。请根据用户的描述，生成一个结构化的问卷。

用户需求：${userPrompt}

请生成一个包含以下信息的问卷：
1. 问卷标题：简洁明了的标题
2. 问卷描述：简要说明问卷目的
3. 问题列表：根据需求生成合适的问题，包括：
   - 单选题（single）：提供2-6个选项
   - 多选题（multiple）：提供3-8个选项
   - 文本输入（input）：用于收集开放性问题
   - 文本域（textarea）：用于收集长文本回答

每个问题应包含：
- id：唯一标识符
- title：问题标题
- type：问题类型
- required：是否必填
- description：问题说明（可选）
- options：选项列表（单选题和多选题需要）

请确保问题逻辑清晰，选项合理，能够有效收集用户反馈。

请以JSON格式返回，格式如下：
{
  "title": "问卷标题",
  "description": "问卷描述",
  "questions": [
    {
      "id": "q1",
      "title": "问题标题",
      "type": "single",
      "required": true,
      "description": "问题说明",
      "options": [
        {"id": "opt1", "title": "选项1"},
        {"id": "opt2", "title": "选项2"}
      ]
    }
  ]
}`
    }
}

// 导出单例实例
export const aiServiceManager = AIServiceManager.getInstance()
