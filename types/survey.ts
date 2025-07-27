/**
 * 调查问卷相关类型定义
 */


export interface Question {
    id: string
    type: string
    content: string
    options?: string[]
    required?: boolean
}

