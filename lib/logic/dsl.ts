import { z } from 'zod'

export type LogicOperator = 'AND' | 'OR'

export type LogicAction = 'show' | 'hide' | 'jumpTo'

export type ConditionOp =
	| 'equals'
	| 'notEquals'
	| 'contains'
	| 'notContains'
	| 'in'
	| 'notIn'
	| 'isEmpty'
	| 'isNotEmpty'
	| 'gt'
	| 'gte'
	| 'lt'
	| 'lte'

export interface LogicCondition {
	questionId: string
	op: ConditionOp
	value?: unknown
}

export interface LogicRule {
	id: string
	targetQuestionId: string
	action: LogicAction
	operator: LogicOperator
	conditions: LogicCondition[]
	jumpTargetId?: string
}

export interface DisplayLogicConfig {
	enabled: boolean
	version?: 1
	rules: LogicRule[]
}

export const zCondition = z.object({
	questionId: z.string().min(1),
	op: z.enum([
		'equals',
		'notEquals',
		'contains',
		'notContains',
		'in',
		'notIn',
		'isEmpty',
		'isNotEmpty',
		'gt',
		'gte',
		'lt',
		'lte',
	] as [ConditionOp, ...ConditionOp[]]),
	value: z.unknown().optional(),
})

export const zRule = z
	.object({
		id: z.string().min(1),
		targetQuestionId: z.string().min(1),
		action: z.enum(['show', 'hide', 'jumpTo']),
		operator: z.enum(['AND', 'OR']),
		conditions: z.array(zCondition),
		jumpTargetId: z.string().min(1).optional(),
	})
	.refine((r) => r.action !== 'jumpTo' || !!r.jumpTargetId, {
		message: 'jumpTo 需要 jumpTargetId',
	})

export const zDisplayLogicConfig = z.object({
	enabled: z.boolean(),
	version: z.literal(1).optional(),
	rules: z.array(zRule),
})

export function validateDisplayLogicConfig(raw: unknown): DisplayLogicConfig {
	const parsed = zDisplayLogicConfig.parse(raw)
	const normalizedRules = parsed.rules.map((r) => {
		const { jumpTargetId, ...rest } = r
		return typeof jumpTargetId === 'string' ? { ...rest, jumpTargetId } : rest
	})
	return { ...parsed, version: 1, rules: normalizedRules }
}
