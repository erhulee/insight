import { useEffect, useState } from 'react'
import type { Question } from '@/lib/api-types'
import type {
	DisplayLogicConfig,
	DisplayLogicRule,
	DisplayLogicCondition,
} from '@/lib/custom-display-logic'
import {
	LogicConfigUtils,
	LOGIC_TEMPLATES,
	LOGIC_OPERATORS,
} from '@/lib/custom-display-logic'

export function useConfigurator(params: {
	questions: Question[]
	logicConfig: DisplayLogicConfig
	onConfigChange: (cfg: DisplayLogicConfig) => void
}) {
	const { questions, logicConfig, onConfigChange } = params
	const [config, setConfig] = useState<DisplayLogicConfig>(logicConfig)
	const [selectedRule, setSelectedRule] = useState<DisplayLogicRule | null>(
		null,
	)
	const [showTemplates, setShowTemplates] = useState(false)
	const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set())
	const [drawerOpen, setDrawerOpen] = useState(false)

	useEffect(() => {
		setConfig(logicConfig)
	}, [logicConfig])

	const updateConfig = (newConfig: DisplayLogicConfig) => {
		setConfig(newConfig)
		onConfigChange(newConfig)
	}

	const addRule = () => {
		const newRule = LogicConfigUtils.createRule('')
		const newConfig = {
			...config,
			rules: [...config.rules, newRule],
		}
		console.log('newConfig', newConfig)
		updateConfig(newConfig)
		setSelectedRule(newRule)
		setExpandedRules((prev) => new Set([...prev, newRule.id]))
	}

	const removeRule = (ruleId: string) => {
		const newConfig = {
			...config,
			rules: config.rules.filter((rule) => rule.id !== ruleId),
		}
		updateConfig(newConfig)
		if (selectedRule?.id === ruleId) setSelectedRule(null)
	}

	const updateRule = (ruleId: string, updates: Partial<DisplayLogicRule>) => {
		const newConfig = {
			...config,
			rules: config.rules.map((rule) =>
				rule.id === ruleId ? { ...rule, ...updates } : rule,
			),
		}
		updateConfig(newConfig)
		if (selectedRule?.id === ruleId)
			setSelectedRule({ ...selectedRule, ...updates })
	}

	const addCondition = (ruleId: string) => {
		const rule = config.rules.find((r) => r.id === ruleId)
		if (!rule) return
		const newCondition = LogicConfigUtils.createCondition('')
		const newConfig = {
			...config,
			rules: config.rules.map((r) =>
				r.id === ruleId
					? { ...r, conditions: [...r.conditions, newCondition] }
					: r,
			),
		}
		updateConfig(newConfig)
		if (selectedRule?.id === ruleId) {
			const updatedRule = newConfig.rules.find((r) => r.id === ruleId) || null
			setSelectedRule(updatedRule)
		}
	}

	const removeCondition = (ruleId: string, conditionIndex: number) => {
		const newConfig = {
			...config,
			rules: config.rules.map((rule) =>
				rule.id === ruleId
					? {
							...rule,
							conditions: rule.conditions.filter(
								(_, i) => i !== conditionIndex,
							),
						}
					: rule,
			),
		}
		updateConfig(newConfig)
		if (selectedRule?.id === ruleId) {
			const updatedRule = newConfig.rules.find((r) => r.id === ruleId) || null
			setSelectedRule(updatedRule)
		}
	}

	const updateCondition = (
		ruleId: string,
		conditionIndex: number,
		updates: Partial<DisplayLogicCondition>,
	) => {
		const newConfig = {
			...config,
			rules: config.rules.map((rule) =>
				rule.id === ruleId
					? {
							...rule,
							conditions: rule.conditions.map((c, idx) =>
								idx === conditionIndex ? { ...c, ...updates } : c,
							),
						}
					: rule,
			),
		}
		updateConfig(newConfig)
		if (selectedRule?.id === ruleId) {
			const updatedRule = newConfig.rules.find((r) => r.id === ruleId) || null
			setSelectedRule(updatedRule)
		}
	}

	const applyTemplate = (templateKey: keyof typeof LOGIC_TEMPLATES) => {
		if (questions.length < 3) return
		const tpl = LOGIC_TEMPLATES[templateKey]
		const tplConfig = tpl.template(
			questions[0]?.id || '',
			questions[1]?.id || '',
			questions[2]?.id || '',
		)
		updateConfig({ ...config, rules: [...config.rules, ...tplConfig.rules] })
		setShowTemplates(false)
	}

	const getQuestionOptions = () =>
		questions.map((q) => ({ value: q.id, label: q.title }))

	const getOperatorOptions = () =>
		Object.entries(LOGIC_OPERATORS as unknown as Record<string, string>).map(
			([key, label]) => ({ value: key, label }),
		)

	const toggleRuleExpansion = (ruleId: string) => {
		const next = new Set(expandedRules)
		if (next.has(ruleId)) next.delete(ruleId)
		else next.add(ruleId)
		setExpandedRules(next)
	}

	return {
		config,
		selectedRule,
		showTemplates,
		setShowTemplates,
		expandedRules,
		drawerOpen,
		setDrawerOpen,
		addRule,
		removeRule,
		updateRule,
		addCondition,
		removeCondition,
		updateCondition,
		applyTemplate,
		getQuestionOptions,
		getOperatorOptions,
		toggleRuleExpansion,
		setSelectedRule,
	}
}
