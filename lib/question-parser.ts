import { Question, QuestionOption } from './api-types'

/**
 * 题目解析器 - 用于解析和验证不同类型的题目数据
 */
export class QuestionParser {
    /**
     * 解析题目类型
     */
    static parseQuestionType(type: string): string {
        const typeMap: Record<string, string> = {
            'text': 'text',
            'textarea': 'textarea',
            'select': 'select',
            'radio': 'radio',
            'checkbox': 'checkbox',
            'rating': 'rating',
            'date': 'date',
            'number': 'number',
            'email': 'email',
            'phone': 'phone',
            'url': 'url',
            'file': 'file',
            'image': 'image',
            'location': 'location',
            'signature': 'signature'
        }

        return typeMap[type] || 'text'
    }

    /**
     * 验证题目数据完整性
     */
    static validateQuestion(question: Question): { isValid: boolean; errors: string[] } {
        const errors: string[] = []

        // 必填字段验证
        if (!question.id) {
            errors.push('题目ID不能为空')
        }
        if (!question.title) {
            errors.push('题目标题不能为空')
        }
        if (!question.type) {
            errors.push('题目类型不能为空')
        }

        // 类型特定验证
        switch (question.type) {
            case 'select':
            case 'radio':
            case 'checkbox':
                if (!question.options || question.options.length === 0) {
                    errors.push(`${question.type}类型题目必须包含选项`)
                }
                break
            case 'rating':
                if (question.maxRating && (question.maxRating < 1 || question.maxRating > 10)) {
                    errors.push('评分范围必须在1-10之间')
                }
                break
            case 'date':
                if (question.minDate && question.maxDate && question.minDate > question.maxDate) {
                    errors.push('最小日期不能大于最大日期')
                }
                break
            case 'number':
                if (question.validationType === 'range') {
                    const min = parseFloat(question.validationRegex?.split(',')[0] || '0')
                    const max = parseFloat(question.validationRegex?.split(',')[1] || '100')
                    if (min >= max) {
                        errors.push('数值范围的最小值必须小于最大值')
                    }
                }
                break
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    /**
     * 解析题目选项
     */
    static parseOptions(options: any[]): QuestionOption[] {
        if (!Array.isArray(options)) {
            return []
        }

        return options.map((option, index) => {
            if (typeof option === 'string') {
                return {
                    text: option,
                    value: option
                }
            }

            if (typeof option === 'object') {
                return {
                    text: option.text || option.label || `选项${index + 1}`,
                    value: option.value || option.text || option.label || `选项${index + 1}`,
                    image: option.image || option.img || undefined
                }
            }

            return {
                text: `选项${index + 1}`,
                value: `选项${index + 1}`
            }
        })
    }

    /**
     * 获取题目的默认值
     */
    static getDefaultValue(question: Question): any {
        switch (question.type) {
            case 'checkbox':
                return []
            case 'rating':
                return 0
            case 'date':
                return new Date().toISOString().split('T')[0]
            case 'number':
                return ''
            case 'text':
            case 'textarea':
            case 'email':
            case 'phone':
            case 'url':
            default:
                return ''
        }
    }

    /**
     * 验证答案格式
     */
    static validateAnswer(question: Question, answer: any): { isValid: boolean; error?: string } {
        if (question.required && (answer === null || answer === undefined || answer === '')) {
            return { isValid: false, error: '此问题为必填项' }
        }

        if (answer === null || answer === undefined || answer === '') {
            return { isValid: true }
        }

        switch (question.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(answer)) {
                    return { isValid: false, error: '请输入有效的邮箱地址' }
                }
                break

            case 'phone':
                const phoneRegex = /^1[3-9]\d{9}$/
                if (!phoneRegex.test(answer)) {
                    return { isValid: false, error: '请输入有效的手机号码' }
                }
                break

            case 'url':
                try {
                    new URL(answer)
                } catch {
                    return { isValid: false, error: '请输入有效的网址' }
                }
                break

            case 'number':
                if (isNaN(Number(answer))) {
                    return { isValid: false, error: '请输入有效的数字' }
                }
                if (question.validationType === 'range') {
                    const num = Number(answer)
                    const [min, max] = (question.validationRegex || '0,100').split(',').map(Number)
                    if (num < min || num > max) {
                        return { isValid: false, error: `数值必须在${min}-${max}之间` }
                    }
                }
                break

            case 'rating':
                const rating = Number(answer)
                if (rating < 1 || rating > (question.maxRating || 5)) {
                    return { isValid: false, error: `评分必须在1-${question.maxRating || 5}之间` }
                }
                break

            case 'date':
                if (question.minDate && answer < question.minDate) {
                    return { isValid: false, error: `日期不能早于${question.minDate}` }
                }
                if (question.maxDate && answer > question.maxDate) {
                    return { isValid: false, error: `日期不能晚于${question.maxDate}` }
                }
                break

            case 'checkbox':
                if (!Array.isArray(answer)) {
                    return { isValid: false, error: '请选择至少一个选项' }
                }
                if (answer.length === 0 && question.required) {
                    return { isValid: false, error: '请至少选择一个选项' }
                }
                break
        }

        return { isValid: true }
    }

    /**
     * 格式化题目显示
     */
    static formatQuestionDisplay(question: Question): {
        title: string
        description?: string
        placeholder?: string
        options?: QuestionOption[]
    } {
        return {
            title: question.title || '未命名题目',
            description: question.description,
            placeholder: question.placeholder,
            options: question.options ? this.parseOptions(question.options) : undefined
        }
    }

    /**
     * 获取题目的输入类型
     */
    static getInputType(question: Question): string {
        switch (question.type) {
            case 'email':
                return 'email'
            case 'phone':
                return 'tel'
            case 'url':
                return 'url'
            case 'number':
                return 'number'
            case 'date':
                return 'date'
            case 'text':
            default:
                return 'text'
        }
    }

    /**
     * 检查题目是否支持逻辑跳转
     */
    static supportsLogicJump(question: Question): boolean {
        const supportedTypes = ['select', 'radio', 'checkbox', 'rating']
        return supportedTypes.includes(question.type)
    }

    /**
     * 获取题目的可能答案
     */
    static getPossibleAnswers(question: Question): any[] {
        switch (question.type) {
            case 'select':
            case 'radio':
                return question.options?.map(opt => opt.value || opt.text) || []
            case 'checkbox':
                return question.options?.map(opt => opt.value || opt.text) || []
            case 'rating':
                const maxRating = question.maxRating || 5
                return Array.from({ length: maxRating }, (_, i) => i + 1)
            case 'date':
                return [] // 日期类型没有预定义答案
            default:
                return []
        }
    }
}
