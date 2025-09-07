// Jest globals are available in the environment
import {
	evaluateAll,
	evalCondition,
	evalRule,
	buildDependencyGraph,
	collectAffectedTargets,
} from '../engine'
import type { DisplayLogicConfig, LogicCondition, LogicRule } from '../dsl'

const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }]

describe('engine - evalCondition', () => {
	it('handles equals/notEquals and emptiness', () => {
		const ans = { q1: 'yes', q2: '' }
		const c1: LogicCondition = { questionId: 'q1', op: 'equals', value: 'yes' }
		const c2: LogicCondition = {
			questionId: 'q1',
			op: 'notEquals',
			value: 'no',
		}
		const c3: LogicCondition = { questionId: 'q2', op: 'isEmpty' }
		const c4: LogicCondition = { questionId: 'q2', op: 'isNotEmpty' }
		expect(evalCondition(c1, ans)).toBe(true)
		expect(evalCondition(c2, ans)).toBe(true)
		expect(evalCondition(c3, ans)).toBe(true)
		expect(evalCondition(c4, ans)).toBe(false)
	})

	// legacy operator support removed
})

describe('engine - evalRule', () => {
	it('AND requires all conditions true; OR requires any', () => {
		const ans = { q1: 'yes', q2: 2 }
		const conds: LogicCondition[] = [
			{ questionId: 'q1', op: 'equals', value: 'yes' },
			{ questionId: 'q2', op: 'gte', value: 2 },
		]
		const rAnd: LogicRule = {
			id: 'r',
			targetQuestionId: 'q3',
			action: 'show',
			operator: 'AND',
			conditions: conds,
		}
		const rOr: LogicRule = { ...rAnd, operator: 'OR' }
		expect(evalRule(rAnd, ans)).toBe(true)
		expect(evalRule(rOr, ans)).toBe(true)
	})
})

describe('engine - evaluateAll', () => {
	it('applies show rules with conjunction and hide rules precedence', () => {
		const cfg: DisplayLogicConfig = {
			enabled: true,
			version: 1,
			rules: [
				{
					id: 'r1',
					targetQuestionId: 'q2',
					action: 'show',
					operator: 'AND',
					conditions: [{ questionId: 'q1', op: 'equals', value: 'ok' }],
				},
				{
					id: 'r2',
					targetQuestionId: 'q2',
					action: 'hide',
					operator: 'OR',
					conditions: [{ questionId: 'q1', op: 'equals', value: 'bad' }],
				},
			],
		}
		const vis1 = evaluateAll({ q1: 'ok' }, cfg, questions)
		expect(vis1.get('q2')).toBe(true)
		const vis2 = evaluateAll({ q1: 'bad' }, cfg, questions)
		expect(vis2.get('q2')).toBe(false)
	})
})

describe('engine - dependency graph', () => {
	it('builds graph and collects affected targets', () => {
		const rules: LogicRule[] = [
			{
				id: 'r1',
				targetQuestionId: 'q2',
				action: 'show',
				operator: 'AND',
				conditions: [{ questionId: 'q1', op: 'equals', value: 'x' }],
			},
			{
				id: 'r2',
				targetQuestionId: 'q3',
				action: 'hide',
				operator: 'AND',
				conditions: [{ questionId: 'q2', op: 'equals', value: 'y' }],
			},
		]
		const dep = buildDependencyGraph(rules)
		expect([...dep.get('q1')!]).toEqual(['q2'])
		expect([...dep.get('q2')!]).toEqual(['q3'])
		const affected = collectAffectedTargets('q1', dep)
		expect(affected.has('q2')).toBe(true)
		expect(affected.has('q3')).toBe(true)
	})
})
