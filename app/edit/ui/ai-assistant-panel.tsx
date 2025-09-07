'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Bot,
	Wand2,
	Languages,
	CheckCircle,
	AlertTriangle,
	Lightbulb,
	Sparkles,
	FileText,
	Globe,
	BarChart3,
	Settings,
} from 'lucide-react'
import { toast } from 'sonner'

// 表单验证 schema
const generateSurveySchema = z.object({
	goal: z.string().min(1, '请输入调研目标').max(500, '调研目标不能超过500字符'),
	audience: z.string().optional(),
	tone: z.enum(['专业', '友好', '正式', '轻松']).default('专业'),
})

const translateSchema = z.object({
	targetLanguage: z.string().min(1, '请选择目标语言'),
})

type GenerateSurveyForm = z.infer<typeof generateSurveySchema>
type TranslateForm = z.infer<typeof translateSchema>

interface AIAssistantPanelProps {
	surveyId?: string
	selectedQuestionId?: string
	onQuestionUpdate?: (questionId: string, updates: any) => void
	onSurveyUpdate?: (updates: any) => void
}

export function AIAssistantPanel({
	surveyId,
	selectedQuestionId,
	onQuestionUpdate,
	onSurveyUpdate,
}: AIAssistantPanelProps) {
	const [isGenerating, setIsGenerating] = useState(false)
	const [reviewResults, setReviewResults] = useState<any>(null)

	// 生成问卷表单
	const generateForm = useForm<GenerateSurveyForm>({
		resolver: zodResolver(generateSurveySchema),
		defaultValues: {
			goal: '',
			audience: '',
			tone: '专业',
		},
	})

	// 翻译表单
	const translateForm = useForm<TranslateForm>({
		resolver: zodResolver(translateSchema),
		defaultValues: {
			targetLanguage: 'en-US',
		},
	})

	// 自然语言生成问卷
	const handleGenerateSurvey = async (data: GenerateSurveyForm) => {
		setIsGenerating(true)
		try {
			// TODO: 调用 TRPC AI 服务
			// const result = await trpc.ai.generateSurveyFromGoal.mutate({
			//   goal: data.goal,
			//   audience: data.audience,
			//   tone: data.tone
			// })

			// 模拟生成结果
			await new Promise((resolve) => setTimeout(resolve, 2000))

			toast.success('问卷生成成功', {
				description: 'AI 已根据您的需求生成了问卷草案',
			})

			// 更新问卷内容
			onSurveyUpdate?.({
				title: `关于${data.goal}的调研问卷`,
				description: `本问卷旨在了解${data.audience || '目标用户'}对${data.goal}的看法和需求`,
				questions: [
					{
						id: 'q1',
						type: 'single',
						title: `您对${data.goal}的了解程度如何？`,
						options: [
							'非常了解',
							'比较了解',
							'一般了解',
							'不太了解',
							'完全不了解',
						],
					},
					{
						id: 'q2',
						type: 'multiple',
						title: `在${data.goal}方面，您最关注哪些因素？`,
						options: ['价格', '质量', '服务', '品牌', '便利性', '其他'],
					},
				],
			})
		} catch (error) {
			toast.error('生成失败', {
				description: 'AI 服务暂时不可用，请稍后重试',
			})
		} finally {
			setIsGenerating(false)
		}
	}

	// 智能校对
	const handleReviewSurvey = async () => {
		setIsGenerating(true)
		try {
			// TODO: 调用 TRPC AI 校对服务
			// const result = await trpc.ai.reviewSurvey.mutate({
			//   surveyId,
			//   dimensions: ['bias', 'length', 'logic']
			// })

			// 模拟校对结果
			await new Promise((resolve) => setTimeout(resolve, 1500))

			setReviewResults({
				overallScore: 85,
				issues: [
					{
						type: 'bias',
						severity: 'warning',
						message: '问题3可能存在引导性，建议修改表述',
						suggestion:
							'将"您是否认为我们的产品很好？"改为"您对我们产品的评价如何？"',
					},
					{
						type: 'length',
						severity: 'info',
						message: '问卷长度适中，预计完成时间5-8分钟',
						suggestion: '当前长度适合目标受众',
					},
					{
						type: 'logic',
						severity: 'error',
						message: '问题5的跳转逻辑存在死循环',
						suggestion: '检查条件设置，确保每个路径都有出口',
					},
				],
			})

			toast.success('校对完成', {
				description: '发现3个需要关注的问题',
			})
		} catch (error) {
			toast.error('校对失败', {
				description: 'AI 服务暂时不可用，请稍后重试',
			})
		} finally {
			setIsGenerating(false)
		}
	}

	// 多语翻译
	const handleTranslate = async (data: TranslateForm) => {
		setIsGenerating(true)
		try {
			// TODO: 调用 TRPC 翻译服务
			// const result = await trpc.ai.translate.mutate({
			//   surveyId,
			//   targetLocales: [data.targetLanguage]
			// })

			// 模拟翻译结果
			await new Promise((resolve) => setTimeout(resolve, 3000))

			const languageNames: Record<string, string> = {
				'en-US': '英语',
				'ja-JP': '日语',
				'ko-KR': '韩语',
				'es-ES': '西班牙语',
				'fr-FR': '法语',
				'de-DE': '德语',
			}

			toast.success('翻译完成', {
				description: `问卷已成功翻译为${languageNames[data.targetLanguage] || '其他语言'}`,
			})
		} catch (error) {
			toast.error('翻译失败', {
				description: 'AI 服务暂时不可用，请稍后重试',
			})
		} finally {
			setIsGenerating(false)
		}
	}

	// 文案优化
	const handleOptimizeText = async (
		text: string,
		type: 'title' | 'description' | 'option',
	) => {
		setIsGenerating(true)
		try {
			// TODO: 调用 TRPC 文案优化服务
			// const result = await trpc.ai.rewriteQuestion.mutate({
			//   text,
			//   type,
			//   tone
			// })

			// 模拟优化结果
			await new Promise((resolve) => setTimeout(resolve, 1000))

			const optimizedText = `${text}（已优化）`
			toast.success('文案优化完成')
			return optimizedText
		} catch (error) {
			toast.error('优化失败')
			return text
		} finally {
			setIsGenerating(false)
		}
	}

	return (
		<div className="h-full flex flex-col bg-background border-l">
			<div className="p-4 border-b">
				<div className="flex items-center gap-2 mb-2">
					<Bot className="h-5 w-5 text-primary" />
					<h3 className="font-semibold">AI 助手</h3>
					<Badge variant="secondary" className="text-xs">
						Beta
					</Badge>
				</div>
				<p className="text-sm text-muted-foreground">
					智能问卷设计、校对与优化
				</p>
			</div>

			<ScrollArea className="flex-1">
				<div className="p-4">
					<Tabs defaultValue="generate" className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="generate" className="text-xs">
								<Sparkles className="h-3 w-3 mr-1" />
								生成
							</TabsTrigger>
							<TabsTrigger value="review" className="text-xs">
								<CheckCircle className="h-3 w-3 mr-1" />
								校对
							</TabsTrigger>
							<TabsTrigger value="translate" className="text-xs">
								<Languages className="h-3 w-3 mr-1" />
								翻译
							</TabsTrigger>
							<TabsTrigger value="optimize" className="text-xs">
								<Lightbulb className="h-3 w-3 mr-1" />
								优化
							</TabsTrigger>
						</TabsList>

						{/* 生成问卷 */}
						<TabsContent value="generate" className="space-y-4 mt-4">
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm flex items-center gap-2">
										<Wand2 className="h-4 w-4" />
										智能生成问卷
									</CardTitle>
									<CardDescription className="text-xs">
										输入调研目标，AI 将自动生成结构化问卷
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Form {...generateForm}>
										<form
											onSubmit={generateForm.handleSubmit(handleGenerateSurvey)}
											className="space-y-3"
										>
											<FormField
												control={generateForm.control}
												name="goal"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															调研目标 *
														</FormLabel>
														<FormControl>
															<Textarea
																placeholder="例如：了解用户对新产品功能的满意度"
																className="text-sm resize-none"
																rows={3}
																{...field}
															/>
														</FormControl>
														<FormMessage className="text-xs" />
													</FormItem>
												)}
											/>
											<FormField
												control={generateForm.control}
												name="audience"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															目标受众
														</FormLabel>
														<FormControl>
															<Input
																placeholder="例如：25-35岁白领用户"
																className="text-sm"
																{...field}
															/>
														</FormControl>
														<FormMessage className="text-xs" />
													</FormItem>
												)}
											/>
											<FormField
												control={generateForm.control}
												name="tone"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															语气风格
														</FormLabel>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}
														>
															<FormControl>
																<SelectTrigger className="text-sm">
																	<SelectValue placeholder="选择语气风格" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																<SelectItem value="专业">专业</SelectItem>
																<SelectItem value="友好">友好</SelectItem>
																<SelectItem value="正式">正式</SelectItem>
																<SelectItem value="轻松">轻松</SelectItem>
															</SelectContent>
														</Select>
														<FormMessage className="text-xs" />
													</FormItem>
												)}
											/>
											<Button
												type="submit"
												disabled={isGenerating}
												className="w-full"
												size="sm"
											>
												{isGenerating ? (
													<>
														<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
														生成中...
													</>
												) : (
													<>
														<Sparkles className="h-3 w-3 mr-2" />
														生成问卷
													</>
												)}
											</Button>
										</form>
									</Form>
								</CardContent>
							</Card>
						</TabsContent>

						{/* 智能校对 */}
						<TabsContent value="review" className="space-y-4 mt-4">
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm flex items-center gap-2">
										<CheckCircle className="h-4 w-4" />
										智能校对
									</CardTitle>
									<CardDescription className="text-xs">
										检查问卷的偏见、长度、逻辑等问题
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button
										onClick={handleReviewSurvey}
										disabled={isGenerating}
										className="w-full"
										size="sm"
									>
										{isGenerating ? (
											<>
												<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
												校对中...
											</>
										) : (
											<>
												<CheckCircle className="h-3 w-3 mr-2" />
												开始校对
											</>
										)}
									</Button>

									{reviewResults && (
										<div className="mt-4 space-y-3">
											<div className="flex items-center justify-between">
												<span className="text-xs font-medium">总体评分</span>
												<Badge
													variant={
														reviewResults.overallScore >= 80
															? 'default'
															: 'destructive'
													}
												>
													{reviewResults.overallScore}/100
												</Badge>
											</div>
											<Separator />
											<div className="space-y-2">
												{reviewResults.issues.map(
													(issue: any, index: number) => (
														<div
															key={index}
															className="p-2 rounded-md bg-muted/50"
														>
															<div className="flex items-start gap-2">
																{issue.severity === 'error' ? (
																	<AlertTriangle className="h-3 w-3 text-destructive mt-0.5" />
																) : issue.severity === 'warning' ? (
																	<AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5" />
																) : (
																	<CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
																)}
																<div className="flex-1">
																	<p className="text-xs font-medium">
																		{issue.message}
																	</p>
																	<p className="text-xs text-muted-foreground mt-1">
																		{issue.suggestion}
																	</p>
																</div>
															</div>
														</div>
													),
												)}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						{/* 多语翻译 */}
						<TabsContent value="translate" className="space-y-4 mt-4">
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm flex items-center gap-2">
										<Languages className="h-4 w-4" />
										多语翻译
									</CardTitle>
									<CardDescription className="text-xs">
										一键翻译问卷，保持逻辑和变量一致性
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Form {...translateForm}>
										<form
											onSubmit={translateForm.handleSubmit(handleTranslate)}
											className="space-y-3"
										>
											<FormField
												control={translateForm.control}
												name="targetLanguage"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															目标语言
														</FormLabel>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}
														>
															<FormControl>
																<SelectTrigger className="text-sm">
																	<SelectValue placeholder="选择目标语言" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																<SelectItem value="en-US">
																	英语 (English)
																</SelectItem>
																<SelectItem value="ja-JP">
																	日语 (日本語)
																</SelectItem>
																<SelectItem value="ko-KR">
																	韩语 (한국어)
																</SelectItem>
																<SelectItem value="es-ES">
																	西班牙语 (Español)
																</SelectItem>
																<SelectItem value="fr-FR">
																	法语 (Français)
																</SelectItem>
																<SelectItem value="de-DE">
																	德语 (Deutsch)
																</SelectItem>
															</SelectContent>
														</Select>
														<FormMessage className="text-xs" />
													</FormItem>
												)}
											/>
											<Button
												type="submit"
												disabled={isGenerating}
												className="w-full"
												size="sm"
											>
												{isGenerating ? (
													<>
														<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
														翻译中...
													</>
												) : (
													<>
														<Languages className="h-3 w-3 mr-2" />
														开始翻译
													</>
												)}
											</Button>
										</form>
									</Form>
								</CardContent>
							</Card>
						</TabsContent>

						{/* 文案优化 */}
						<TabsContent value="optimize" className="space-y-4 mt-4">
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm flex items-center gap-2">
										<Lightbulb className="h-4 w-4" />
										文案优化
									</CardTitle>
									<CardDescription className="text-xs">
										优化问题标题、描述和选项文案
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="text-xs text-muted-foreground">
										选中问题后，AI 将提供文案优化建议
									</div>
									{selectedQuestionId ? (
										<div className="p-2 rounded-md bg-muted/50">
											<p className="text-xs font-medium">已选择问题</p>
											<p className="text-xs text-muted-foreground">
												问题 ID: {selectedQuestionId}
											</p>
										</div>
									) : (
										<div className="p-2 rounded-md bg-muted/50">
											<p className="text-xs text-muted-foreground">
												请先选择一个问题进行优化
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</ScrollArea>
		</div>
	)
}
