export interface OllamaConfig {
    baseUrl: string
    model: string
    temperature: number
    topP: number
    repeatPenalty: number
}

// 默认配置
export const defaultOllamaConfig: OllamaConfig = {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
    temperature: 0.7,
    topP: 0.9,
    repeatPenalty: 1.1
}

// 获取当前配置
export function getOllamaConfig(): OllamaConfig {
    return {
        ...defaultOllamaConfig,
        baseUrl: process.env.OLLAMA_BASE_URL || defaultOllamaConfig.baseUrl,
        model: process.env.OLLAMA_MODEL || defaultOllamaConfig.model
    }
}

// 验证配置
export function validateOllamaConfig(config: OllamaConfig): boolean {
    return !!(config.baseUrl && config.model)
} 