export interface AIServiceConfig {
    id: string
    name: string
    type: 'openai' | 'ollama' | 'anthropic' | 'custom'
    baseUrl: string
    apiKey?: string
    model: string
    temperature: number
    topP: number
    repeatPenalty?: number
    maxTokens?: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface AIServiceProvider {
    id: string
    name: string
    type: 'openai' | 'ollama' | 'anthropic' | 'custom'
    description: string
    baseUrl: string
    models: string[]
    defaultConfig: Partial<AIServiceConfig>
}

// 预定义的AI服务提供商
export const AI_SERVICE_PROVIDERS: AIServiceProvider[] = [
    {
        id: 'openai',
        name: 'OpenAI',
        type: 'openai',
        description: 'OpenAI官方API服务，支持GPT-4、GPT-3.5等模型',
        baseUrl: 'https://api.openai.com/v1',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
        defaultConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxTokens: 4000,
        },
    },
    {
        id: 'ollama',
        name: 'Ollama',
        type: 'ollama',
        description: '本地大模型服务，支持多种开源模型',
        baseUrl: 'http://localhost:11434',
        models: ['qwen2.5:7b', 'llama3.1:8b', 'mistral:7b', 'codellama:7b'],
        defaultConfig: {
            temperature: 0.7,
            topP: 0.9,
            repeatPenalty: 1.1,
        },
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        type: 'anthropic',
        description: 'Anthropic Claude API服务，支持Claude-3等模型',
        baseUrl: 'https://api.anthropic.com',
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        defaultConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxTokens: 4000,
        },
    },
    {
        id: 'custom',
        name: '自定义服务',
        type: 'custom',
        description: '自定义AI服务配置',
        baseUrl: '',
        models: [],
        defaultConfig: {
            temperature: 0.7,
            topP: 0.9,
        },
    },
]

// 默认配置
export const DEFAULT_AI_CONFIG: AIServiceConfig = {
    id: 'default',
    name: '默认配置',
    type: 'ollama',
    baseUrl: 'http://localhost:11434',
    model: 'qwen2.5:7b',
    temperature: 0.7,
    topP: 0.9,
    repeatPenalty: 1.1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
}

// 验证配置
export function validateAIServiceConfig(config: AIServiceConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.name?.trim()) {
        errors.push('服务名称不能为空')
    }

    if (!config.baseUrl?.trim()) {
        errors.push('服务地址不能为空')
    }

    if (config.type === 'openai' || config.type === 'anthropic') {
        if (!config.apiKey?.trim()) {
            errors.push('API密钥不能为空')
        }
    }

    if (!config.model?.trim()) {
        errors.push('模型名称不能为空')
    }

    if (config.temperature < 0 || config.temperature > 2) {
        errors.push('Temperature值必须在0-2之间')
    }

    if (config.topP < 0 || config.topP > 1) {
        errors.push('Top P值必须在0-1之间')
    }

    if (config.repeatPenalty && (config.repeatPenalty < 0 || config.repeatPenalty > 2)) {
        errors.push('重复惩罚值必须在0-2之间')
    }

    if (config.maxTokens && (config.maxTokens < 1 || config.maxTokens > 8000)) {
        errors.push('最大令牌数必须在1-8000之间')
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

// 获取本地存储的配置
export function getStoredAIConfigs(): AIServiceConfig[] {
    if (typeof window === 'undefined') return []

    try {
        const stored = localStorage.getItem('ai_service_configs')
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

// 保存配置到本地存储
export function saveAIConfigToStorage(config: AIServiceConfig): void {
    if (typeof window === 'undefined') return

    try {
        const configs = getStoredAIConfigs()
        const existingIndex = configs.findIndex(c => c.id === config.id)

        if (existingIndex >= 0) {
            configs[existingIndex] = { ...config, updatedAt: new Date() }
        } else {
            configs.push({ ...config, createdAt: new Date(), updatedAt: new Date() })
        }

        localStorage.setItem('ai_service_configs', JSON.stringify(configs))
    } catch (error) {
        console.error('保存AI配置失败:', error)
    }
}

// 删除本地存储的配置
export function deleteAIConfigFromStorage(configId: string): void {
    if (typeof window === 'undefined') return

    try {
        const configs = getStoredAIConfigs()
        const filtered = configs.filter(c => c.id !== configId)
        localStorage.setItem('ai_service_configs', JSON.stringify(filtered))
    } catch (error) {
        console.error('删除AI配置失败:', error)
    }
}

// 获取活跃的配置
export function getActiveAIConfig(): AIServiceConfig | null {
    const configs = getStoredAIConfigs()
    return configs.find(c => c.isActive) || null
}
