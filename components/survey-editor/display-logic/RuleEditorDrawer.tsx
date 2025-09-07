'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type {
	DisplayLogicRule,
	DisplayLogicCondition,
} from '@/lib/custom-display-logic'
import { Plus } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

type QuestionOption = { value: string; label: string }
type OperatorOption = { value: string; label: string }

function RuleForm(props: {
	rule: DisplayLogicRule
	getQuestionOptions: () => QuestionOption[]
	getOperatorOptions: () => OperatorOption[]
	updateRule: (ruleId: string, updates: Partial<DisplayLogicRule>) => void
	addCondition: (ruleId: string) => void
	updateCondition: (
		ruleId: string,
		index: number,
		updates: Partial<DisplayLogicCondition>,
	) => void
	removeCondition: (ruleId: string, index: number) => void
}) {
	const {
		rule,
		getQuestionOptions,
		getOperatorOptions,
		updateRule,
		addCondition,
		updateCondition,
		removeCondition,
	} = props

	return (
		<>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label className="text-xs font-medium text-muted-foreground">
						目标问题
					</Label>
					<Select
						value={rule.targetQuestionId}
						onValueChange={(value) =>
							updateRule(rule.id, { targetQuestionId: value })
						}
					>
						<SelectTrigger className="h-8 mt-2">
							<SelectValue placeholder="选择目标问题" />
						</SelectTrigger>
						<SelectContent>
							{getQuestionOptions().map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label className="text-xs font-medium text-muted-foreground">
						操作类型
					</Label>
					<Select
						value={rule.action}
						onValueChange={(value: 'show' | 'hide') =>
							updateRule(rule.id, { action: value })
						}
					>
						<SelectTrigger className="h-8 mt-2">
							<SelectValue />
						</SelectTrigger>
						<SelectContent position="popper">
							<SelectItem value="show">显示问题</SelectItem>
							<SelectItem value="hide">隐藏问题</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex justify-between items-center">
					<Label className="text-xs font-medium text-muted-foreground">
						条件
					</Label>
					<Button
						size="sm"
						variant="outline"
						onClick={() => addCondition(rule.id)}
						className="h-7 px-2 text-xs"
					>
						添加条件
					</Button>
				</div>

				{rule.conditions.map((condition, index) => (
					<div
						key={index}
						className="flex items-center gap-2 p-2 bg-background border rounded-md"
					>
						<Select
							value={condition.questionId}
							onValueChange={(value) =>
								updateCondition(rule.id, index, { questionId: value })
							}
						>
							<SelectTrigger className="h-7 w-44 text-xs">
								<SelectValue placeholder="选择问题" />
							</SelectTrigger>
							<SelectContent>
								{getQuestionOptions().map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={(condition as any).op}
							onValueChange={(value: any) =>
								updateCondition(rule.id, index, { op: value })
							}
						>
							<SelectTrigger className="h-7 w-28 text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{getOperatorOptions().map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{!['isEmpty', 'isNotEmpty'].includes((condition as any).op) &&
							(() => {
								const op = (condition as any).op as string
								if (['gt', 'gte', 'lt', 'lte'].includes(op)) {
									const num =
										typeof (condition as any).value === 'number'
											? (condition as any).value
											: ''
									return (
										<Input
											type="number"
											placeholder="数字值"
											value={num as any}
											onChange={(e) =>
												updateCondition(rule.id, index, {
													value:
														e.target.value === ''
															? undefined
															: Number(e.target.value),
												})
											}
											className="h-7 w-28 text-xs"
										/>
									)
								}
								if (['in', 'notIn'].includes(op)) {
									const raw = Array.isArray((condition as any).value)
										? ((condition as any).value as string[]).join(',')
										: typeof (condition as any).value === 'string'
											? ((condition as any).value as string)
											: ''
									return (
										<Input
											placeholder="逗号分隔的值"
											value={raw}
											onChange={(e) => {
												const parts = e.target.value
													.split(',')
													.map((s) => s.trim())
													.filter((s) => s.length > 0)
												updateCondition(rule.id, index, {
													value: parts,
												})
											}}
											className="h-7 w-40 text-xs"
										/>
									)
								}
								return (
									<Input
										placeholder="值"
										value={String((condition as any).value ?? '')}
										onChange={(e) =>
											updateCondition(rule.id, index, {
												value: e.target.value,
											})
										}
										className="h-7 w-28 text-xs"
									/>
								)
							})()}

						<Button
							variant="ghost"
							size="sm"
							onClick={() => removeCondition(rule.id, index)}
							className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
						>
							删除
						</Button>
					</div>
				))}
			</div>
		</>
	)
}

export function RuleEditorDrawer(props: {
	open: boolean
	onOpenChange: (open: boolean) => void
	rules: Array<DisplayLogicRule> | null
	getQuestionOptions: () => QuestionOption[]
	getOperatorOptions: () => OperatorOption[]
	updateRule: (ruleId: string, updates: Partial<DisplayLogicRule>) => void
	addCondition: (ruleId: string) => void
	updateCondition: (
		ruleId: string,
		index: number,
		updates: Partial<DisplayLogicCondition>,
	) => void
	removeCondition: (ruleId: string, index: number) => void
	addRule?: (openDrawer?: boolean) => void
}) {
	const {
		open,
		onOpenChange,
		rules,
		getQuestionOptions,
		getOperatorOptions,
		updateRule,
		addCondition,
		updateCondition,
		removeCondition,
		addRule,
	} = props
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-[520px] sm:w-[600px] p-0">
				<SheetHeader className="px-4 py-3 border-b">
					<div className="flex items-center justify-between">
						<SheetTitle>编辑逻辑规则</SheetTitle>
					</div>
				</SheetHeader>
				<div className="p-4 space-y-4">
					{rules?.length == 0 ? (
						<div>empty </div>
					) : (
						<>
							{rules?.map((rule) => (
								<>
									<Separator></Separator>
									<RuleForm
										rule={rule}
										getQuestionOptions={getQuestionOptions}
										getOperatorOptions={getOperatorOptions}
										updateRule={updateRule}
										addCondition={addCondition}
										updateCondition={updateCondition}
										removeCondition={removeCondition}
									/>
								</>
							))}
						</>
					)}
				</div>
				<SheetFooter className="px-4 py-3 border-t">
					{addRule && (
						<Button size="sm" variant="default" onClick={() => addRule()}>
							<Plus className="h-4 w-4 mr-1" />
							增加规则
						</Button>
					)}
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						size="sm"
					>
						关闭
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
