'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useMemo } from 'react'
import {
	RuntimeDSLAction,
	useRuntimeState,
} from '@/app/(dashboard)/dashboard/_valtio/runtime'
import { BasicConfig } from './basic'
import { InputConfig } from './input'
import { DateConfig } from './date'
import { RatingConfig } from './rating'
import { DisplayLogicConfigurator } from '@/components/survey-editor/display-logic/DisplayLogicConfigurator'
import { SingleConfig } from './single'

export function QuestionConfig() {
	const runtimeState = useRuntimeState()
	useEffect(() => {
		// selection change side-effects can be handled here if needed
	}, [runtimeState.selectedQuestionID])

	const selectedQuestion = useMemo(() => {
		if (runtimeState.selectedQuestionID) {
			return runtimeState.questions.find(
				(q) => q.id === runtimeState.selectedQuestionID,
			)
		} else {
			return null
		}
	}, [runtimeState.selectedQuestionID])

	return (
		<div className="space-y-6">
			<Tabs defaultValue="basic" className="w-full h-full">
				<TabsList className="w-full grid grid-cols-4">
					<TabsTrigger value="basic">基本设置</TabsTrigger>
					<TabsTrigger value="options">选项</TabsTrigger>
					<TabsTrigger value="logic">显示逻辑</TabsTrigger>
					<TabsTrigger value="advanced">高级</TabsTrigger>
				</TabsList>
				<TabsContent value="basic" className="space-y-4 pt-4">
					<BasicConfig />
					{(() => {
						switch (selectedQuestion?.type) {
							case 'input':
							case 'textarea':
								return <InputConfig />
							case 'date':
								return <DateConfig />
							case 'rating':
								return <RatingConfig />
							case 'single':
								return <SingleConfig />
						}
						return null
					})()}
				</TabsContent>

				<TabsContent value="options" className="space-y-4 pt-4">
					{/* {renderOptionsConfig()} */}
				</TabsContent>

				<TabsContent value="logic" className="space-y-4 pt-4 h-full">
					<DisplayLogicConfigurator
						questions={runtimeState.questions.map((q) => ({
							id: q.id,
							type: q.type,
							title: q.title,
							...(typeof q.description !== 'undefined'
								? { description: q.description }
								: {}),
							...(typeof q.required !== 'undefined'
								? { required: q.required }
								: {}),
							...(Array.isArray(q.props?.options)
								? { options: q.props.options }
								: {}),
							...(q.type === 'textarea' ? { multiline: true } : {}),
							...(typeof q.props?.placeholder !== 'undefined'
								? { placeholder: q.props.placeholder }
								: {}),
							...(typeof q.props?.maxRating !== 'undefined'
								? { maxRating: q.props.maxRating }
								: {}),
							...(typeof q.props?.ratingType !== 'undefined'
								? { ratingType: q.props.ratingType }
								: {}),
							...(typeof q.props?.minDate !== 'undefined'
								? { minDate: q.props.minDate }
								: {}),
							...(typeof q.props?.maxDate !== 'undefined'
								? { maxDate: q.props.maxDate }
								: {}),
						}))}
						logicConfig={JSON.parse(
							JSON.stringify(
								runtimeState.displayLogic || { rules: [], enabled: false },
							),
						)}
						onConfigChange={(config) => {
							RuntimeDSLAction.updateDisplayLogic(config)
						}}
					/>
				</TabsContent>

				<TabsContent value="advanced" className="space-y-4 pt-4">
					<div className="space-y-6">
						<div className="bg-muted/50 rounded-md p-3">
							<h4 className="text-sm font-medium mb-2 flex items-center">
								<span className="bg-primary/10 text-primary p-1 rounded mr-2 text-xs">
									验证
								</span>
								数据验证规则
							</h4>
						</div>
						<div className="bg-muted/50 rounded-md p-3">
							<h4 className="text-sm font-medium mb-2 flex items-center">
								<span className="bg-primary/10 text-primary p-1 rounded mr-2 text-xs">
									逻辑
								</span>
								条件逻辑
							</h4>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
