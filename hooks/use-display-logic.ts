import { useState, useCallback, useMemo } from 'react'
import { DisplayLogicConfig, DisplayLogicEvaluator, LogicConfigUtils } from '@/lib/custom-display-logic'
import { Question } from '@/lib/api-types'

export function useDisplayLogic(questions: Question[]) {
    const [logicConfig, setLogicConfig] = useState<DisplayLogicConfig>({
        rules: [],
        enabled: false
    })

    const [answers, setAnswers] = useState<Record<string, any>>({})

    // 创建评估器实例
    const evaluator = useMemo(() => {
        const evalInstance = new DisplayLogicEvaluator(answers)
        return evalInstance
    }, [answers])

    // 更新答案
    const updateAnswers = useCallback((questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }))
        evaluator.updateAnswers({ [questionId]: value })
    }, [evaluator])

    // 批量更新答案
    const updateAnswersBatch = useCallback((newAnswers: Record<string, any>) => {
        setAnswers(prev => ({
            ...prev,
            ...newAnswers
        }))
        evaluator.updateAnswers(newAnswers)
    }, [evaluator])

    // 检查问题是否应该显示
    const isQuestionVisible = useCallback((questionId: string) => {
        return evaluator.evaluateQuestionVisibility(questionId, logicConfig)
    }, [evaluator, logicConfig])

    // 获取所有隐藏的问题ID
    const getHiddenQuestionIds = useCallback(() => {
        return evaluator.getHiddenQuestionIds(logicConfig)
    }, [evaluator, logicConfig])

    // 获取可见的问题
    const getVisibleQuestions = useCallback(() => {
        return questions.filter(question => isQuestionVisible(question.id))
    }, [questions, isQuestionVisible])

    // 更新逻辑配置
    const updateLogicConfig = useCallback((newConfig: DisplayLogicConfig) => {
        setLogicConfig(newConfig)
    }, [])

    // 添加规则
    const addRule = useCallback((targetQuestionId: string) => {
        const newRule = LogicConfigUtils.createRule(targetQuestionId)
        const newConfig = {
            ...logicConfig,
            rules: [...logicConfig.rules, newRule]
        }
        setLogicConfig(newConfig)
        return newRule
    }, [logicConfig])

    // 删除规则
    const removeRule = useCallback((ruleId: string) => {
        const newConfig = {
            ...logicConfig,
            rules: logicConfig.rules.filter(rule => rule.id !== ruleId)
        }
        setLogicConfig(newConfig)
    }, [logicConfig])

    // 更新规则
    const updateRule = useCallback((ruleId: string, updates: Partial<typeof logicConfig.rules[0]>) => {
        const newConfig = {
            ...logicConfig,
            rules: logicConfig.rules.map(rule =>
                rule.id === ruleId ? { ...rule, ...updates } : rule
            )
        }
        setLogicConfig(newConfig)
    }, [logicConfig])

    // 验证配置
    const validateConfig = useCallback(() => {
        return LogicConfigUtils.validateConfig(logicConfig)
    }, [logicConfig])

    // 重置答案
    const resetAnswers = useCallback(() => {
        setAnswers({})
        evaluator.updateAnswers({})
    }, [evaluator])

    // 获取问题选项（用于配置界面）
    const getQuestionOptions = useCallback(() => {
        return questions.map(q => ({
            value: q.id,
            label: q.title
        }))
    }, [questions])

    // 获取特定问题的选项值（用于条件配置）
    const getQuestionOptionValues = useCallback((questionId: string) => {
        const question = questions.find(q => q.id === questionId)
        if (!question || !question.options) return []

        return question.options.map(option => ({
            value: option.value || option.text,
            label: option.text
        }))
    }, [questions])

    return {
        // 状态
        logicConfig,
        answers,

        // 评估方法
        isQuestionVisible,
        getHiddenQuestionIds,
        getVisibleQuestions,

        // 配置管理
        updateLogicConfig,
        addRule,
        removeRule,
        updateRule,
        validateConfig,

        // 答案管理
        updateAnswers,
        updateAnswersBatch,
        resetAnswers,

        // 工具方法
        getQuestionOptions,
        getQuestionOptionValues,

        // 评估器实例（用于高级用法）
        evaluator
    }
} 