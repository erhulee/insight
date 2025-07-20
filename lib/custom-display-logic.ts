/**
 * 自定义展示逻辑系统
 * 参考腾讯问卷的自定义展示逻辑实现
 */

export interface DisplayLogicCondition {
    questionId: string
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
    value?: string | number | string[]
    valueType?: 'string' | 'number' | 'array'
}

export interface DisplayLogicRule {
    id: string
    conditions: DisplayLogicCondition[]
    operator: 'AND' | 'OR' // 多个条件之间的逻辑关系
    action: 'show' | 'hide'
    targetQuestionId: string
}

export interface DisplayLogicConfig {
    rules: DisplayLogicRule[]
    enabled: boolean
}

/**
 * 逻辑操作符映射
 */
export const LOGIC_OPERATORS = {
    equals: '等于',
    not_equals: '不等于',
    contains: '包含',
    not_contains: '不包含',
    greater_than: '大于',
    less_than: '小于',
    is_empty: '为空',
    is_not_empty: '不为空'
} as const

/**
 * 逻辑评估引擎
 */
export class DisplayLogicEvaluator {
    private answers: Record<string, any> = {}

    constructor(answers: Record<string, any> = {}) {
        this.answers = answers
    }

    /**
     * 评估单个条件
     */
    private evaluateCondition(condition: DisplayLogicCondition): boolean {
        const answer = this.answers[condition.questionId]

        switch (condition.operator) {
            case 'equals':
                return answer === condition.value

            case 'not_equals':
                return answer !== condition.value

            case 'contains':
                if (Array.isArray(answer)) {
                    return answer.includes(condition.value)
                }
                return String(answer).includes(String(condition.value))

            case 'not_contains':
                if (Array.isArray(answer)) {
                    return !answer.includes(condition.value)
                }
                return !String(answer).includes(String(condition.value))

            case 'greater_than':
                return Number(answer) > Number(condition.value)

            case 'less_than':
                return Number(answer) < Number(condition.value)

            case 'is_empty':
                return !answer || answer === '' || (Array.isArray(answer) && answer.length === 0)

            case 'is_not_empty':
                return answer && answer !== '' && (!Array.isArray(answer) || answer.length > 0)

            default:
                return false
        }
    }

    /**
     * 评估规则
     */
    private evaluateRule(rule: DisplayLogicRule): boolean {
        if (rule.conditions.length === 0) return true

        const conditionResults = rule.conditions.map(condition =>
            this.evaluateCondition(condition)
        )

        if (rule.operator === 'AND') {
            return conditionResults.every(result => result)
        } else {
            return conditionResults.some(result => result)
        }
    }

    /**
     * 评估问题是否应该显示
     */
    evaluateQuestionVisibility(questionId: string, logicConfig: DisplayLogicConfig): boolean {
        if (!logicConfig.enabled || !logicConfig.rules) return true

        const relevantRules = logicConfig.rules.filter(rule =>
            rule.targetQuestionId === questionId
        )

        if (relevantRules.length === 0) return true

        // 如果有多个规则影响同一个问题，只要有一个规则决定显示就显示
        for (const rule of relevantRules) {
            const shouldShow = this.evaluateRule(rule)
            if (rule.action === 'show' && shouldShow) return true
            if (rule.action === 'hide' && shouldShow) return false
        }

        // 默认显示
        return true
    }

    /**
     * 获取所有应该隐藏的问题ID
     */
    getHiddenQuestionIds(logicConfig: DisplayLogicConfig): string[] {
        if (!logicConfig.enabled || !logicConfig.rules) return []

        const hiddenIds: string[] = []

        for (const rule of logicConfig.rules) {
            if (rule.action === 'hide') {
                const shouldHide = this.evaluateRule(rule)
                if (shouldHide) {
                    hiddenIds.push(rule.targetQuestionId)
                }
            }
        }

        return [...new Set(hiddenIds)]
    }

    /**
     * 更新答案
     */
    updateAnswers(answers: Record<string, any>) {
        this.answers = { ...this.answers, ...answers }
    }
}

/**
 * 逻辑配置工具函数
 */
export const LogicConfigUtils = {
    /**
     * 创建新的逻辑规则
     */
    createRule(questionId: string): DisplayLogicRule {
        return {
            id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            conditions: [],
            operator: 'AND',
            action: 'show',
            targetQuestionId: questionId
        }
    },

    /**
     * 创建新的条件
     */
    createCondition(questionId: string): DisplayLogicCondition {
        return {
            questionId,
            operator: 'equals',
            value: '',
            valueType: 'string'
        }
    },

    /**
     * 验证逻辑配置
     */
    validateConfig(config: DisplayLogicConfig): { valid: boolean; errors: string[] } {
        const errors: string[] = []

        if (!config.rules) {
            errors.push('逻辑规则不能为空')
            return { valid: false, errors }
        }

        for (const rule of config.rules) {
            if (!rule.targetQuestionId) {
                errors.push('规则必须指定目标问题')
            }

            if (rule.conditions.length === 0) {
                errors.push('规则必须包含至少一个条件')
            }

            for (const condition of rule.conditions) {
                if (!condition.questionId) {
                    errors.push('条件必须指定问题ID')
                }

                if (['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than'].includes(condition.operator)) {
                    if (condition.value === undefined || condition.value === '') {
                        errors.push('条件必须指定比较值')
                    }
                }
            }
        }

        return { valid: errors.length === 0, errors }
    }
}

/**
 * 预设逻辑模板
 */
export const LOGIC_TEMPLATES = {
    // 性别相关逻辑
    genderBased: {
        name: '基于性别显示',
        description: '根据性别选择显示不同的问题',
        template: (genderQuestionId: string, maleQuestionId: string, femaleQuestionId: string): DisplayLogicConfig => ({
            rules: [
                {
                    id: `rule_${Date.now()}_1`,
                    conditions: [{ questionId: genderQuestionId, operator: 'equals' as const, value: 'male' }],
                    operator: 'AND',
                    action: 'show',
                    targetQuestionId: maleQuestionId
                },
                {
                    id: `rule_${Date.now()}_2`,
                    conditions: [{ questionId: genderQuestionId, operator: 'equals' as const, value: 'female' }],
                    operator: 'AND',
                    action: 'show',
                    targetQuestionId: femaleQuestionId
                }
            ],
            enabled: true
        })
    },

    // 年龄相关逻辑
    ageBased: {
        name: '基于年龄显示',
        description: '根据年龄范围显示不同的问题',
        template: (ageQuestionId: string, youngQuestionId: string, adultQuestionId: string): DisplayLogicConfig => ({
            rules: [
                {
                    id: `rule_${Date.now()}_1`,
                    conditions: [{ questionId: ageQuestionId, operator: 'less_than' as const, value: 18 }],
                    operator: 'AND',
                    action: 'show',
                    targetQuestionId: youngQuestionId
                },
                {
                    id: `rule_${Date.now()}_2`,
                    conditions: [{ questionId: ageQuestionId, operator: 'greater_than' as const, value: 17 }],
                    operator: 'AND',
                    action: 'show',
                    targetQuestionId: adultQuestionId
                }
            ],
            enabled: true
        })
    },

    // 满意度相关逻辑
    satisfactionBased: {
        name: '基于满意度显示',
        description: '根据满意度评分显示后续问题',
        template: (satisfactionQuestionId: string, followUpQuestionId: string): DisplayLogicConfig => ({
            rules: [
                {
                    id: `rule_${Date.now()}_1`,
                    conditions: [{ questionId: satisfactionQuestionId, operator: 'less_than' as const, value: 3 }],
                    operator: 'AND',
                    action: 'show',
                    targetQuestionId: followUpQuestionId
                }
            ],
            enabled: true
        })
    }
} 