export interface Survey {
  id: string
  title: string
  description?: string
  questions: Question[]
  createdAt: string
  updatedAt: string
  published: boolean
  settings?: SurveySettings
  theme?: SurveyTheme
}

export interface Question {
  id: string
  name: string
  type: string
  title: string
  description?: string
  required?: boolean

  // 选项类问题（单选、多选、下拉）
  options?: QuestionOption[]
  randomize?: boolean

  // 文本题
  placeholder?: string
  multiline?: boolean
  minLength?: number
  maxLength?: number

  // 评分题
  maxRating?: number
  ratingType?: string

  // 日期题
  minDate?: string
  maxDate?: string

  // 文件上传题
  maxFiles?: number
  maxSize?: number
  fileTypes?: string

  // 条件逻辑
  hasLogic?: boolean
  logicCondition?: string
  logicValue?: string
  logicAction?: string
  logicTarget?: string

  // 验证
  validationType?: string
  validationRegex?: string
  validationMessage?: string
}

export interface QuestionOption {
  text: string
  value?: string
  image?: string
}

export interface SurveySettings {
  showProgressBar?: boolean
  showQuestionNumbers?: boolean
  randomizeQuestions?: boolean
  collectEmail?: boolean
  oneResponsePerUser?: boolean
  welcomeScreen?: {
    enabled: boolean
    title?: string
    description?: string
  }
  thankYouScreen?: {
    enabled: boolean
    title?: string
    description?: string
    redirectUrl?: string
    redirectDelay?: number
  }
}

export interface SurveyTheme {
  primaryColor?: string
  backgroundColor?: string
  fontFamily?: string
  borderRadius?: string
  questionSpacing?: string
  preset?: string
}

export interface SurveyResponse {
  id: string
  surveyId: string
  answers: Answer[]
  createdAt: string
  userAgent?: string
  ipAddress?: string
  email?: string
}

export interface Answer {
  questionId: string
  value: string | string[] | number | null
}
