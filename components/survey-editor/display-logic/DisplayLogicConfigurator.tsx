'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
	Plus,
	Trash2,
	Settings,
	Eye,
	EyeOff,
	ChevronDown,
	ChevronRight,
} from 'lucide-react'
import { RuleEditorDrawer } from './RuleEditorDrawer'
import { useConfigurator } from './use-configurator'
import {
	DisplayLogicConfig,
	LOGIC_TEMPLATES,
	LOGIC_OPERATORS,
} from '@/lib/custom-display-logic'
import { Question } from '@/lib/api-types'

interface DisplayLogicConfiguratorProps {
	questions: Question[]
	logicConfig: DisplayLogicConfig
	onConfigChange: (config: DisplayLogicConfig) => void
}

export function DisplayLogicConfigurator({
	questions,
	logicConfig,
	onConfigChange,
}: DisplayLogicConfiguratorProps) {
	const {
		config,
		selectedRule,
		setSelectedRule,
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
	} = useConfigurator({ questions, logicConfig, onConfigChange })

	useEffect(() => {
		// setConfig(logicConfig) // Removed leftover local sync to logicConfig and updateConfig since hook manages state
	}, [logicConfig])

	// const updateConfig = (newConfig: DisplayLogicConfig) => { // Removed leftover local sync to logicConfig and updateConfig since hook manages state
	// 	setConfig(newConfig)
	// 	onConfigChange(newConfig)
	// }

	// removed local applyTemplate; using hook's applyTemplate instead

	return (
		<div className="space-y-6">
			<>
				{/* 模板选择 */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-medium text-muted-foreground">
							快速模板
						</h4>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowTemplates(!showTemplates)}
							className="h-8 px-2"
						>
							{showTemplates ? (
								<>
									<ChevronDown className="h-4 w-4 mr-1" />
									收起
								</>
							) : (
								<>
									<ChevronRight className="h-4 w-4 mr-1" />
									展开
								</>
							)}
						</Button>
					</div>

					{showTemplates && (
						<div className="space-y-2">
							{Object.entries(LOGIC_TEMPLATES).map(([key, template]) => (
								<div key={key} className="p-3 bg-muted/30 rounded-lg border">
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<h5 className="font-medium text-sm">{template.name}</h5>
											<p className="text-xs text-muted-foreground mt-1">
												{template.description}
											</p>
										</div>
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												applyTemplate(key as keyof typeof LOGIC_TEMPLATES)
											}
											className="ml-3 h-7 px-3"
										>
											应用
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* 规则列表 */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-medium text-muted-foreground">
							逻辑规则
						</h4>
						<Button
							onClick={() => setDrawerOpen(true)}
							size="sm"
							variant="outline"
						>
							<Plus className="h-4 w-4 mr-2" />
							添加规则
						</Button>
					</div>
					<div className="space-y-3">
						{config.rules.map((rule) => {
							const isExpanded = expandedRules.has(rule.id)
							const targetQuestion = questions.find(
								(q) => q.id === rule.targetQuestionId,
							)

							return (
								<div key={rule.id} className="border rounded-lg bg-background">
									{/* 规则头部 */}
									<div className="p-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => toggleRuleExpansion(rule.id)}
													className="h-6 w-6 p-0"
												>
													{isExpanded ? (
														<ChevronDown className="h-4 w-4" />
													) : (
														<ChevronRight className="h-4 w-4" />
													)}
												</Button>
												<Badge
													variant={
														rule.action === 'show' ? 'default' : 'secondary'
													}
													className="text-xs"
												>
													{rule.action === 'show' ? (
														<>
															<Eye className="h-3 w-3 mr-1" />
															显示
														</>
													) : (
														<>
															<EyeOff className="h-3 w-3 mr-1" />
															隐藏
														</>
													)}
												</Badge>
												<span className="text-sm font-medium">
													{targetQuestion?.title || rule.targetQuestionId}
												</span>
												{rule.conditions.length > 0 && (
													<span className="text-xs text-muted-foreground">
														{rule.conditions.length} 个条件
													</span>
												)}
											</div>
											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setSelectedRule(rule)
														setDrawerOpen(true)
													}}
													className="h-7 px-2 text-xs"
												>
													编辑
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => removeRule(rule.id)}
													className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>

									{/* 规则配置 - 展开内容 */}
									{isExpanded && (
										<div className="px-3 pb-3 border-t bg-muted/20">
											<div className="pt-3 space-y-4">
												<div className="grid grid-cols-2 gap-4">
													<div>
														<Label className="text-xs font-medium text-muted-foreground">
															目标问题
														</Label>
														<div className="mt-2 text-sm">
															{targetQuestion?.title || rule.targetQuestionId}
														</div>
													</div>
													<div>
														<Label className="text-xs font-medium text-muted-foreground">
															操作类型
														</Label>
														<div className="mt-2 text-sm">
															{rule.action === 'show' ? '显示问题' : '隐藏问题'}
														</div>
													</div>
												</div>

												{/* 条件列表（只读展示） */}
												<div>
													<div className="flex justify-between items-center mb-3">
														<Label className="text-xs font-medium text-muted-foreground">
															条件
														</Label>
													</div>

													<div className="space-y-2">
														{rule.conditions.map((condition, index) => (
															<div
																key={index}
																className="flex items-center gap-2 p-2 bg-background border rounded-md"
															>
																<span className="text-xs text-muted-foreground">
																	{getQuestionOptions().find(
																		(o) => o.value === condition.questionId,
																	)?.label || condition.questionId}
																</span>
																<span className="text-xs">
																	{
																		LOGIC_OPERATORS[
																			condition.op as keyof typeof LOGIC_OPERATORS
																		]
																	}
																</span>
																{!['isEmpty', 'isNotEmpty'].includes(
																	condition.op,
																) && (
																	<span className="text-xs">
																		{String(condition.value ?? '')}
																	</span>
																)}
															</div>
														))}
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							)
						})}

						{config.rules.length === 0 && (
							<div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
								<Settings className="h-8 w-8 mx-auto mb-3 opacity-50" />
								<p className="text-sm font-medium">暂无逻辑规则</p>
								<p className="text-xs">点击"添加规则"开始配置</p>
							</div>
						)}
					</div>
				</div>
			</>

			{/* Drawer: 规则详细编辑 */}
			<RuleEditorDrawer
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				rules={config['rules']}
				getQuestionOptions={getQuestionOptions}
				getOperatorOptions={getOperatorOptions}
				updateRule={updateRule}
				addCondition={addCondition}
				updateCondition={updateCondition}
				removeCondition={removeCondition}
				addRule={addRule}
			/>
		</div>
	)
}
