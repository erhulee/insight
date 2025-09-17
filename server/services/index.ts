// 导出所有服务
export { userService } from './user-service'
export { surveyService } from './survey'
export { templateService } from './template-service'

// 导出类型
export type { CreateUserInput, UpdateUserInput, UserInfo } from './user-service'

export type {
	CreateSurveyInput,
	SurveyListInput,
	SurveyListResult,
	SurveyResponseInput,
	SurveyResponsesInput,
	SurveyResponsesResult,
} from './survey'

export type {
	CreateTemplateInput,
	TemplateListInput,
	TemplateListResult,
} from './template-service'

export type { TestConnectionInput } from './ai-config.service'
