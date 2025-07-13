/**
 * 调查问卷相关类型定义
 */

export interface Survey {
    id: string
    name: string
    description: string
    updatedAt: string
    questions: Question[]
    published: boolean
    questionnairesCnt: number
}

export interface Question {
    id: string
    type: string
    content: string
    options?: string[]
    required?: boolean
}

export interface SurveyOverviewProps {
    survey: Survey
    onDelete?: (surveyId: string) => void
    onEdit?: (surveyId: string) => void
    onView?: (surveyId: string) => void
    onViewResults?: (surveyId: string) => void
} 