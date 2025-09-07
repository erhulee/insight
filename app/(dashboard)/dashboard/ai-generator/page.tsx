'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Progress } from '@/components/ui/progress'
import {
	Sparkles,
	Wand2,
	Target,
	Users,
	Palette,
	FileText,
	ArrowRight,
	CheckCircle,
	Clock,
	Lightbulb,
	Globe,
	Settings,
} from 'lucide-react'
import { toast } from 'sonner'

interface SurveyTemplate {
	id: string
	name: string
	description: string
	category: string
	icon: React.ReactNode
	estimatedTime: string
	questionCount: number
}

const surveyTemplates: SurveyTemplate[] = [
	{
		id: 'customer-satisfaction',
		name: '客户满意度调研',
		description: '了解客户对产品或服务的满意程度',
		category: '商业',
		icon: <CheckCircle className="h-4 w-4" />,
		estimatedTime: '3-5分钟',
		questionCount: 8,
	},
	{
		id: 'market-research',
		name: '市场调研',
		description: '收集目标市场的需求和偏好信息',
		category: '市场',
		icon: <Target className="h-4 w-4" />,
		estimatedTime: '5-8分钟',
		questionCount: 12,
	},
	{
		id: 'employee-feedback',
		name: '员工反馈',
		description: '收集员工对工作环境和管理的反馈',
		category: '人力资源',
		icon: <Users className="h-4 w-4" />,
		estimatedTime: '4-6分钟',
		questionCount: 10,
	},
	{
		id: 'event-feedback',
		name: '活动反馈',
		description: '收集参与者对活动的评价和建议',
		category: '活动',
		icon: <FileText className="h-4 w-4" />,
		estimatedTime: '2-4分钟',
		questionCount: 6,
	},
]

export default function AIGeneratorPage() {
	const router = useRouter()
	const [activeTab, setActiveTab] = useState<'custom' | 'template'>('custom')
	const [isGenerating, setIsGenerating] = useState(false)
	const [generationStep, setGenerationStep] = useState(0)
	const [generatedSurvey, setGeneratedSurvey] = useState<any>(null)

	// 自定义生成表单状态
	const [goal, setGoal] = useState('')
	const [audience, setAudience] = useState('')
	const [tone, setTone] = useState('专业')
	const [questionCount, setQuestionCount] = useState(8)
	const [includeLogic, setIncludeLogic] = useState(true)

	// 模板选择状态
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

	const handleCustomGenerate = async () => {
		if (!goal.trim()) {
			toast.error('请输入调研目标')
			return
		}

		setIsGenerating(true)
		setGenerationStep(0)

		try {
			// 模拟生成过程
			const steps = [
				'分析调研目标...',
				'设计问题结构...',
				'生成问题内容...',
				'优化逻辑流程...',
				'完成问卷生成',
			]

			for (let i = 0; i < steps.length; i++) {
				setGenerationStep(i)
				await new Promise((resolve) => setTimeout(resolve, 1000))
			}

			// 模拟生成结果
			const mockSurvey = {
				id: `survey_${Date.now()}`,
				title: `关于${goal}的调研问卷`,
				description: `本问卷旨在了解${audience || '目标用户'}对${goal}的看法和需求`,
				estimatedTime: `${Math.ceil(questionCount * 0.5)}-${Math.ceil(questionCount * 0.8)}分钟`,
				questionCount,
				questions: [
					{
						id: 'q1',
						type: 'single',
						title: `您对${goal}的了解程度如何？`,
						options: [
							'非常了解',
							'比较了解',
							'一般了解',
							'不太了解',
							'完全不了解',
						],
						required: true,
					},
					{
						id: 'q2',
						type: 'multiple',
						title: `在${goal}方面，您最关注哪些因素？`,
						options: ['价格', '质量', '服务', '品牌', '便利性', '其他'],
						required: true,
					},
					{
						id: 'q3',
						type: 'rating',
						title: `请对${goal}进行整体评价`,
						scale: 5,
						labels: ['非常不满意', '不满意', '一般', '满意', '非常满意'],
						required: true,
					},
					{
						id: 'q4',
						type: 'textarea',
						title: `请分享您对${goal}的具体建议或意见`,
						placeholder: '请输入您的想法...',
						required: false,
					},
				],
				logic: includeLogic
					? [
							{
								id: 'logic1',
								condition: {
									questionId: 'q1',
									operator: 'equals',
									value: '完全不了解',
								},
								action: { type: 'skip', targetQuestionId: 'q3' },
							},
						]
					: [],
			}

			setGeneratedSurvey(mockSurvey)
			toast.success('问卷生成成功！', {
				description: 'AI 已根据您的需求生成了完整的问卷',
			})
		} catch (error) {
			toast.error('生成失败', {
				description: 'AI 服务暂时不可用，请稍后重试',
			})
		} finally {
			setIsGenerating(false)
		}
	}

	const handleTemplateGenerate = async (templateId: string) => {
		const template = surveyTemplates.find((t) => t.id === templateId)
		if (!template) return

		setIsGenerating(true)
		setGenerationStep(0)

		try {
			// 模拟基于模板生成
			const steps = [
				'加载模板结构...',
				'个性化问题内容...',
				'优化问卷逻辑...',
				'完成问卷生成',
			]

			for (let i = 0; i < steps.length; i++) {
				setGenerationStep(i)
				await new Promise((resolve) => setTimeout(resolve, 800))
			}

			// 模拟基于模板的生成结果
			const mockSurvey = {
				id: `survey_${Date.now()}`,
				title: template.name,
				description: template.description,
				estimatedTime: template.estimatedTime,
				questionCount: template.questionCount,
				templateId: template.id,
				questions: Array.from({ length: template.questionCount }, (_, i) => ({
					id: `q${i + 1}`,
					type:
						i % 4 === 0
							? 'single'
							: i % 4 === 1
								? 'multiple'
								: i % 4 === 2
									? 'rating'
									: 'textarea',
					title: `${template.name}相关问题 ${i + 1}`,
					options: ['选项1', '选项2', '选项3', '选项4'],
					required: i < 6,
				})),
			}

			setGeneratedSurvey(mockSurvey)
			toast.success('问卷生成成功！', {
				description: `基于${template.name}模板生成完成`,
			})
		} catch (error) {
			toast.error('生成失败', {
				description: 'AI 服务暂时不可用，请稍后重试',
			})
		} finally {
			setIsGenerating(false)
		}
	}

	const handleEditSurvey = () => {
		if (generatedSurvey) {
			// 创建新问卷并跳转到编辑器
			router.push(`/edit/${generatedSurvey.id}`)
		}
	}

	const handleSaveAsDraft = () => {
		toast.success('已保存为草稿', {
			description: '问卷已保存到您的草稿箱',
		})
	}

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			{/* 页面标题 */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<Sparkles className="h-8 w-8 text-primary" />
					<h1 className="text-3xl font-bold">AI 问卷生成器</h1>
					<Badge variant="secondary" className="text-sm">
						Beta
					</Badge>
				</div>
				<p className="text-muted-foreground text-lg">
					使用 AI 技术，从自然语言描述快速生成专业问卷
				</p>
			</div>

			{/* 生成进度 */}
			{isGenerating && (
				<Card className="mb-6">
					<CardContent className="pt-6">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
								<span className="font-medium">AI 正在生成问卷...</span>
							</div>
							<Progress value={(generationStep + 1) * 20} className="h-2" />
							<div className="text-sm text-muted-foreground">
								步骤 {generationStep + 1} / 5
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* 生成结果 */}
			{generatedSurvey && !isGenerating && (
				<Card className="mb-6 border-green-200 bg-green-50/50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-green-700">
							<CheckCircle className="h-5 w-5" />
							问卷生成完成
						</CardTitle>
						<CardDescription>
							您的问卷已成功生成，包含 {generatedSurvey.questionCount} 个问题
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">
									{generatedSurvey.questionCount} 个问题
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">{generatedSurvey.estimatedTime}</span>
							</div>
							<div className="flex items-center gap-2">
								<Lightbulb className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">包含智能逻辑</span>
							</div>
						</div>
						<div className="flex gap-3">
							<Button onClick={handleEditSurvey} className="flex-1">
								<Wand2 className="h-4 w-4 mr-2" />
								进入编辑器
							</Button>
							<Button variant="outline" onClick={handleSaveAsDraft}>
								保存草稿
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* 主要内容 */}
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as any)}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-2 mb-6">
					<TabsTrigger value="custom" className="flex items-center gap-2">
						<Wand2 className="h-4 w-4" />
						自定义生成
					</TabsTrigger>
					<TabsTrigger value="template" className="flex items-center gap-2">
						<FileText className="h-4 w-4" />
						模板生成
					</TabsTrigger>
				</TabsList>

				{/* 自定义生成 */}
				<TabsContent value="custom" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Target className="h-5 w-5" />
								调研目标
							</CardTitle>
							<CardDescription>描述您想要调研的具体目标和内容</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-sm font-medium mb-2 block">
									调研目标 *
								</label>
								<Textarea
									placeholder="例如：了解用户对新产品功能的满意度，收集改进建议"
									value={goal}
									onChange={(e) => setGoal(e.target.value)}
									rows={3}
									className="resize-none"
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-2 block">
									目标受众
								</label>
								<Input
									placeholder="例如：25-35岁白领用户、企业客户、学生群体"
									value={audience}
									onChange={(e) => setAudience(e.target.value)}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Settings className="h-5 w-5" />
								生成设置
							</CardTitle>
							<CardDescription>配置问卷的基本参数和风格</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium mb-2 block">
										语气风格
									</label>
									<select
										value={tone}
										onChange={(e) => setTone(e.target.value)}
										className="w-full px-3 py-2 border rounded-md"
									>
										<option value="专业">专业</option>
										<option value="友好">友好</option>
										<option value="正式">正式</option>
										<option value="轻松">轻松</option>
									</select>
								</div>
								<div>
									<label className="text-sm font-medium mb-2 block">
										问题数量
									</label>
									<select
										value={questionCount}
										onChange={(e) => setQuestionCount(Number(e.target.value))}
										className="w-full px-3 py-2 border rounded-md"
									>
										<option value={5}>5 个问题</option>
										<option value={8}>8 个问题</option>
										<option value={12}>12 个问题</option>
										<option value={15}>15 个问题</option>
									</select>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="includeLogic"
									checked={includeLogic}
									onChange={(e) => setIncludeLogic(e.target.checked)}
									className="rounded"
								/>
								<label htmlFor="includeLogic" className="text-sm font-medium">
									包含智能跳转逻辑
								</label>
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-center">
						<Button
							onClick={handleCustomGenerate}
							disabled={isGenerating || !goal.trim()}
							size="lg"
							className="px-8"
						>
							{isGenerating ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
									生成中...
								</>
							) : (
								<>
									<Sparkles className="h-4 w-4 mr-2" />
									开始生成问卷
									<ArrowRight className="h-4 w-4 ml-2" />
								</>
							)}
						</Button>
					</div>
				</TabsContent>

				{/* 模板生成 */}
				<TabsContent value="template" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								选择模板
							</CardTitle>
							<CardDescription>从专业模板开始，快速生成问卷</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{surveyTemplates.map((template) => (
									<Card
										key={template.id}
										className={`cursor-pointer transition-all hover:shadow-md ${
											selectedTemplate === template.id
												? 'ring-2 ring-primary'
												: ''
										}`}
										onClick={() => setSelectedTemplate(template.id)}
									>
										<CardContent className="p-4">
											<div className="flex items-start gap-3">
												<div className="p-2 rounded-lg bg-primary/10 text-primary">
													{template.icon}
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<h3 className="font-medium">{template.name}</h3>
														<Badge variant="secondary" className="text-xs">
															{template.category}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground mb-2">
														{template.description}
													</p>
													<div className="flex items-center gap-4 text-xs text-muted-foreground">
														<span className="flex items-center gap-1">
															<FileText className="h-3 w-3" />
															{template.questionCount} 题
														</span>
														<span className="flex items-center gap-1">
															<Clock className="h-3 w-3" />
															{template.estimatedTime}
														</span>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-center">
						<Button
							onClick={() =>
								selectedTemplate && handleTemplateGenerate(selectedTemplate)
							}
							disabled={isGenerating || !selectedTemplate}
							size="lg"
							className="px-8"
						>
							{isGenerating ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
									生成中...
								</>
							) : (
								<>
									<Sparkles className="h-4 w-4 mr-2" />
									基于模板生成
									<ArrowRight className="h-4 w-4 ml-2" />
								</>
							)}
						</Button>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
