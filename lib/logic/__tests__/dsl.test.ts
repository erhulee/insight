// Jest globals are available in the environment
import { zDisplayLogicConfig, validateDisplayLogicConfig } from '../dsl'

// normalizeOp removed: legacy operators no longer supported

describe('DSL - zDisplayLogicConfig', () => {
	it('validates a minimal valid config', () => {
		const raw = {
			enabled: true,
			rules: [
				{
					id: 'r1',
					targetQuestionId: 'q2',
					action: 'show',
					operator: 'AND',
					conditions: [{ questionId: 'q1', op: 'equals', value: 'yes' }],
				},
			],
		}
		const parsed = zDisplayLogicConfig.parse(raw)
		expect(parsed.enabled).toBe(true)
		expect(parsed.rules).toHaveLength(1)
	})

	it('rejects jumpTo without jumpTargetId', () => {
		const raw = {
			enabled: true,
			rules: [
				{
					id: 'r1',
					targetQuestionId: 'q2',
					action: 'jumpTo',
					operator: 'AND',
					conditions: [],
				},
			],
		}
		expect(() => zDisplayLogicConfig.parse(raw)).toThrow()
	})
})

describe('DSL - validateDisplayLogicConfig', () => {
	it('adds version=1 to validated config', () => {
		const raw = {
			enabled: false,
			rules: [],
		}
		const cfg = validateDisplayLogicConfig(raw)
		expect(cfg.version).toBe(1)
		expect(cfg.enabled).toBe(false)
	})
})
