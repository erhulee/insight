// API相关类型定义

/**
 * API密钥
 */
export interface ApiKey {
  id: string
  name: string
  key: string
  prefix: string
  createdAt: string
  lastUsed?: string
}

/**
 * 问卷摘要
 */
export interface SurveySummary {
  id: string
  title: string
  description?: string
  questions_count: number
  responses_count: number
  created_at: string
  updated_at: string
  published: boolean
}

/**
 * 问卷
 */
export interface Survey {
  id: string
  title: string
  description?: string
  questions: Question[]
  settings?: SurveySettings
  theme?: SurveyTheme
  created_at: string
  updated_at: string
  published: boolean
}

/**
 * 问题
 */
export interface Question {
  id: string
  type: string
  title: string
  description?: string
  required?: boolean
  options?: QuestionOption[]
  multiline?: boolean
  placeholder?: string
  maxRating?: number
  ratingType?: string
  minDate?: string
  maxDate?: string
  maxFiles?: number
  maxSize?: number
  fileTypes?: string
  validationType?: string
  validationRegex?: string
  validationMessage?: string
}

/**
 * 问题选项
 */
export interface QuestionOption {
  text: string
  value?: string
  image?: string
}

/**
 * 问卷设置
 */
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

/**
 * 问卷主题
 */
export interface SurveyTheme {
  primaryColor?: string
  backgroundColor?: string
  fontFamily?: string
  borderRadius?: string
  questionSpacing?: string
  preset?: string
}

/**
 * 问卷回复
 */
export interface SurveyResponse {
  id: string
  survey_id: string
  answers: Answer[]
  created_at: string
  user_agent?: string
  ip_address?: string
  email?: string
}

/**
 * 回答
 */
export interface Answer {
  question_id: string
  value: string | string[] | number | null
}

/**
 * 问卷统计
 */
export interface SurveyStats {
  total_responses: number
  completion_rate: number
  average_time: string
  question_stats: QuestionStats[]
}

/**
 * 问题统计
 */
export interface QuestionStats {
  question_id: string
  question_title: string
  question_type: string
  total_answers: number
  stats: OptionStats[] | string[] | RatingStats
}

/**
 * 选项统计
 */
export interface OptionStats {
  option: string
  count: number
  percentage: number
}

/**
 * 评分统计
 */
export interface RatingStats {
  min: number
  max: number
  average: number
}

/**
 * Webhook
 */
export interface Webhook {
  id: string
  url: string
  events: string[]
  active: boolean
  created_at: string
  updated_at: string
}

/**
 * 分页元数据
 */
export interface PaginationMeta {
  current_page: number
  total_pages: number
  total_count: number
  limit: number
}

/**
 * API错误
 */
export interface ApiError {
  error: {
    code: string
    message: string
  }
}
