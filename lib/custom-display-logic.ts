/**
 * 自定义展示逻辑系统（新版 DSL 封装）
 */
import type {
	DisplayLogicConfig as DslDisplayLogicConfig,
	LogicCondition,
	LogicRule,
} from '@/lib/logic/dsl'
import { evaluateTargetVisibility } from '@/lib/logic/engine'

export type DisplayLogicCondition = LogicCondition
export type DisplayLogicRule = LogicRule
export type DisplayLogicConfig = DslDisplayLogicConfig

/**
 * 逻辑操作符映射（新版 camelCase + 数值比较缩写）
 */
export const LOGIC_OPERATORS = {
	equals: '等于',
	notEquals: '不等于',
	contains: '包含',
	notContains: '不包含',
	in: '属于集合',
	notIn: '不属于集合',
	gt: '大于',
	gte: '大于等于',
	lt: '小于',
	lte: '小于等于',
	isEmpty: '为空',
	isNotEmpty: '不为空',
} as const

/**
 * 逻辑评估器（基于 engine 封装）
 */
export class DisplayLogicEvaluator {
	private answers: Record<string, any> = {}

	constructor(answers: Record<string, any> = {}) {
		this.answers = answers
	}

	/**
	 * 评估问题是否应该显示
	 */
	evaluateQuestionVisibility(
		questionId: string,
		logicConfig: DisplayLogicConfig,
	): boolean {
		if (!logicConfig?.enabled) return true
		return evaluateTargetVisibility(questionId, this.answers, logicConfig)
	}

	/**
	 * 获取所有应该隐藏的问题ID（基于配置中出现过的 targetQuestionId 集合进行判定）
	 */
	getHiddenQuestionIds(logicConfig: DisplayLogicConfig): string[] {
		if (!logicConfig?.enabled) return []
		const targets = Array.from(
			new Set(logicConfig.rules.map((r) => r.targetQuestionId)),
		)
		return targets.filter(
			(tid) => !this.evaluateQuestionVisibility(tid, logicConfig),
		)
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
	 * 创建新的逻辑规则（默认 AND + show）
	 */
	createRule(questionId: string): DisplayLogicRule {
		return {
			id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			conditions: [],
			operator: 'AND',
			action: 'show',
			targetQuestionId: questionId,
		}
	},

	/**
	 * 创建新的条件（默认 equals）
	 */
	createCondition(questionId: string): DisplayLogicCondition {
		return {
			questionId,
			op: 'equals',
			value: '',
		}
	},

	/**
	 * 验证逻辑配置
	 */
	validateConfig(config: DisplayLogicConfig): {
		valid: boolean
		errors: string[]
	} {
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

				const needValue = [
					'equals',
					'notEquals',
					'contains',
					'notContains',
					'gt',
					'gte',
					'lt',
					'lte',
					'in',
					'notIn',
				]
				if (needValue.includes(condition.op)) {
					if (
						condition.value === undefined ||
						(typeof condition.value === 'string' && condition.value === '')
					) {
						errors.push('条件必须指定比较值')
					}
				}
			}
		}

		return { valid: errors.length === 0, errors }
	},
}

/**
 * 预设逻辑模板（新版 DSL）
 */
export const LOGIC_TEMPLATES = {
	// 性别相关逻辑
	genderBased: {
		name: '基于性别显示',
		description: '根据性别选择显示不同的问题',
		template: (
			genderQuestionId: string,
			maleQuestionId: string,
			femaleQuestionId: string,
		): DisplayLogicConfig => ({
			rules: [
				{
					id: `rule_${Date.now()}_1`,
					conditions: [
						{
							questionId: genderQuestionId,
							op: 'equals' as const,
							value: 'male',
						},
					],
					operator: 'AND',
					action: 'show',
					targetQuestionId: maleQuestionId,
				},
				{
					id: `rule_${Date.now()}_2`,
					conditions: [
						{
							questionId: genderQuestionId,
							op: 'equals' as const,
							value: 'female',
						},
					],
					operator: 'AND',
					action: 'show',
					targetQuestionId: femaleQuestionId,
				},
			],
			enabled: true,
		}),
	},

	// 年龄相关逻辑
	ageBased: {
		name: '基于年龄显示',
		description: '根据年龄范围显示不同的问题',
		template: (
			ageQuestionId: string,
			youngQuestionId: string,
			adultQuestionId: string,
		): DisplayLogicConfig => ({
			rules: [
				{
					id: `rule_${Date.now()}_1`,
					conditions: [
						{ questionId: ageQuestionId, op: 'lt' as const, value: 18 },
					],
					operator: 'AND',
					action: 'show',
					targetQuestionId: youngQuestionId,
				},
				{
					id: `rule_${Date.now()}_2`,
					conditions: [
						{ questionId: ageQuestionId, op: 'gt' as const, value: 17 },
					],
					operator: 'AND',
					action: 'show',
					targetQuestionId: adultQuestionId,
				},
			],
			enabled: true,
		}),
	},

	// 满意度相关逻辑
	satisfactionBased: {
		name: '基于满意度显示',
		description: '根据满意度评分显示后续问题',
		template: (
			satisfactionQuestionId: string,
			followUpQuestionId: string,
		): DisplayLogicConfig => ({
			rules: [
				{
					id: `rule_${Date.now()}_1`,
					conditions: [
						{ questionId: satisfactionQuestionId, op: 'lt' as const, value: 3 },
					],
					operator: 'AND',
					action: 'show',
					targetQuestionId: followUpQuestionId,
				},
			],
			enabled: true,
		}),
	},
}
