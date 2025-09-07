import type { DisplayLogicConfig, LogicCondition, LogicRule } from './dsl'
import type { ConditionOp } from './dsl'

export type VisibleMap = Record<string, boolean>

export function buildDependencyGraph(
	rules: LogicRule[],
): Map<string, Set<string>> {
	const graph = new Map<string, Set<string>>()
	for (const rule of rules) {
		for (const c of rule.conditions) {
			if (!graph.has(c.questionId)) graph.set(c.questionId, new Set())
			graph.get(c.questionId)!.add(rule.targetQuestionId)
		}
	}
	return graph
}

export function evalCondition(
	c: LogicCondition,
	answers: Record<string, unknown>,
): boolean {
	const op = c.op as ConditionOp
	const actual = answers[c.questionId]
	switch (op) {
		case 'equals':
			return actual === c.value
		case 'notEquals':
			return actual !== c.value
		case 'contains':
			return Array.isArray(actual) && actual.includes(c.value as any)
		case 'notContains':
			return Array.isArray(actual) && !actual.includes(c.value as any)
		case 'in':
			return (
				Array.isArray(c.value) && (c.value as unknown[]).includes(actual as any)
			)
		case 'notIn':
			return (
				Array.isArray(c.value) &&
				!(c.value as unknown[]).includes(actual as any)
			)
		case 'isEmpty':
			return (
				actual == null ||
				(Array.isArray(actual) && actual.length === 0) ||
				actual === ''
			)
		case 'isNotEmpty':
			return !(
				actual == null ||
				(Array.isArray(actual) && actual.length === 0) ||
				actual === ''
			)
		case 'gt':
			return (
				typeof actual === 'number' &&
				typeof c.value === 'number' &&
				actual > c.value
			)
		case 'gte':
			return (
				typeof actual === 'number' &&
				typeof c.value === 'number' &&
				actual >= c.value
			)
		case 'lt':
			return (
				typeof actual === 'number' &&
				typeof c.value === 'number' &&
				actual < c.value
			)
		case 'lte':
			return (
				typeof actual === 'number' &&
				typeof c.value === 'number' &&
				actual <= c.value
			)
		default:
			return false
	}
}

export function evalRule(
	rule: LogicRule,
	answers: Record<string, unknown>,
): boolean {
	const results = rule.conditions.map((c) => evalCondition(c, answers))
	return rule.operator === 'AND'
		? results.every(Boolean)
		: results.some(Boolean)
}

export function evaluateAll(
	answers: Record<string, unknown>,
	config: DisplayLogicConfig,
	questions: { id: string }[],
): Map<string, boolean> {
	const visible = new Map<string, boolean>(questions.map((q) => [q.id, true]))
	if (!config?.enabled) return visible

	for (const rule of config.rules) {
		const ok = evalRule(rule, answers)
		if (rule.action === 'show') {
			visible.set(
				rule.targetQuestionId,
				Boolean(visible.get(rule.targetQuestionId)) && ok,
			)
		}
		if (rule.action === 'hide' && ok) {
			visible.set(rule.targetQuestionId, false)
		}
	}
	return visible
}

export function evaluateTargetVisibility(
	targetId: string,
	answers: Record<string, unknown>,
	config: DisplayLogicConfig,
): boolean {
	if (!config?.enabled) return true
	let visible = true
	for (const rule of config.rules) {
		if (rule.targetQuestionId !== targetId) continue
		const ok = evalRule(rule, answers)
		if (rule.action === 'show') visible = visible && ok
		if (rule.action === 'hide' && ok) visible = false
	}
	return visible
}

export function collectAffectedTargets(
	changedId: string,
	dep: Map<string, Set<string>>,
): Set<string> {
	const visited = new Set<string>()
	const queue: string[] = [changedId]
	while (queue.length) {
		const cur = queue.shift()!
		const next = dep.get(cur)
		if (!next) continue
		for (const t of next) {
			if (visited.has(t)) continue
			visited.add(t)
			queue.push(t)
		}
	}
	return visited
}
