import { QuestionType } from '@/components/survey-editor/buildin/form-item'

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
  pageCount: number
}

export interface Question {
  field: string
  id: string
  name: string
  type: QuestionType
  attr: Record<string, any>
  ownerPage: number
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
