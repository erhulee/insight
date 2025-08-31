// 导出所有服务
export { userService } from './user-service'
export { surveyService } from './survey-service'
export { templateService } from './template-service'
export { apiKeyService } from './api-key-service'
export { aiConfigService } from './ai-config-service'
export { ollamaService } from './ollama-service'

// 导出类型
export type {
    CreateUserInput,
    UpdateUserInput,
    UserInfo,
} from './user-service'

export type {
    CreateSurveyInput,
    UpdateSurveyInput,
    SurveyListInput,
    SurveyListResult,
    SurveyResponseInput,
    SurveyResponsesInput,
    SurveyResponsesResult,
} from './survey-service'

export type {
    CreateTemplateInput,
    TemplateListInput,
    TemplateListResult,
} from './template-service'

export type {
    CreateApiKeyInput,
    ApiKeyInfo,
    ApiKeyListResult,
} from './api-key-service'

export type {
    TestConnectionInput,
    GetStatusInput,
    GenerateSurveyInput,
    GenerateSurveyStreamInput,
} from './ai-config-service'

export type {
    OllamaGenerateInput,
    OllamaGenerateResult,
    OllamaModelInfo,
} from './ollama-service'
