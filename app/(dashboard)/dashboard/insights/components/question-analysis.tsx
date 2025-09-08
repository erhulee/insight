'use client'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
} from 'recharts'
import { HelpCircle, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import type { QuestionAnalysis } from '../hooks/use-insights'

interface QuestionAnalysisProps {
	data: QuestionAnalysis[]
	isLoading: boolean
}

const COLORS = [
	'#0088FE',
	'#00C49F',
	'#FFBB28',
	'#FF8042',
	'#8884D8',
	'#82CA9D',
]

export function QuestionAnalysis({ data, isLoading }: QuestionAnalysisProps) {
	if (isLoading) {
		return (
			<div className="space-y-6">
				{Array.from({ length: 3 }).map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-4 w-32" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-64 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	if (!data || data.length === 0) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-12">
					<div className="text-center">
						<HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">暂无题目分析数据</h3>
						<p className="text-muted-foreground">
							该问卷还没有足够的响应数据进行分析
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	const getQuestionTypeLabel = (type: string) => {
		const typeMap: Record<string, string> = {
			single: '单选题',
			multiple: '多选题',
			input: '文本输入',
			textarea: '多行文本',
			rating: '评分题',
			date: '日期选择',
			description: '描述文本',
		}
		return typeMap[type] || type
	}

	const getQuestionTypeColor = (type: string) => {
		const colorMap: Record<string, string> = {
			single: 'bg-blue-100 text-blue-800',
			multiple: 'bg-green-100 text-green-800',
			input: 'bg-yellow-100 text-yellow-800',
			textarea: 'bg-orange-100 text-orange-800',
			rating: 'bg-purple-100 text-purple-800',
			date: 'bg-pink-100 text-pink-800',
			description: 'bg-gray-100 text-gray-800',
		}
		return colorMap[type] || 'bg-gray-100 text-gray-800'
	}

	const renderAnalysisChart = (question: QuestionAnalysis) => {
		if (!question.analysis) return null

		// 根据题目类型渲染不同的图表
		switch (question.questionType) {
			case 'single':
			case 'multiple':
				return renderOptionChart(question)
			case 'rating':
				return renderRatingChart(question)
			case 'input':
			case 'textarea':
				return renderTextAnalysis(question)
			default:
				return renderDefaultChart(question)
		}
	}

	const renderOptionChart = (question: QuestionAnalysis) => {
		if (!question.analysis?.options) return null

		const chartData = question.analysis.options.map(
			(option: any, index: number) => ({
				name: option.label,
				value: option.count,
				percentage: option.percentage,
				color: COLORS[index % COLORS.length],
			}),
		)

		return (
			<div className="grid gap-4 md:grid-cols-2">
				<div>
					<h4 className="text-sm font-medium mb-3">选项分布</h4>
					<ResponsiveContainer width="100%" height={200}>
						<PieChart>
							<Pie
								data={chartData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={({ name, percentage }) => `${name} (${percentage}%)`}
								outerRadius={80}
								fill="#8884d8"
								dataKey="value"
							>
								{chartData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
				</div>
				<div>
					<h4 className="text-sm font-medium mb-3">详细数据</h4>
					<div className="space-y-2">
						{chartData.map((option, index) => (
							<div key={index} className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div
										className="w-3 h-3 rounded-full"
										style={{ backgroundColor: option.color }}
									/>
									<span className="text-sm">{option.name}</span>
								</div>
								<div className="text-sm font-medium">
									{option.value} ({option.percentage}%)
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		)
	}

	const renderRatingChart = (question: QuestionAnalysis) => {
		if (!question.analysis?.ratings) return null

		const chartData = question.analysis.ratings.map((rating: any) => ({
			rating: rating.value,
			count: rating.count,
		}))

		return (
			<div>
				<h4 className="text-sm font-medium mb-3">评分分布</h4>
				<ResponsiveContainer width="100%" height={200}>
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="rating" />
						<YAxis />
						<Tooltip />
						<Bar dataKey="count" fill="#8884d8" />
					</BarChart>
				</ResponsiveContainer>
				<div className="mt-4 text-sm text-muted-foreground">
					平均评分: {question.analysis.averageRating?.toFixed(1) || 'N/A'}
				</div>
			</div>
		)
	}

	const renderTextAnalysis = (question: QuestionAnalysis) => {
		if (!question.analysis) return null

		return (
			<div className="space-y-4">
				<div className="grid gap-4 md:grid-cols-3">
					<div className="text-center">
						<div className="text-2xl font-bold">
							{question.analysis.totalWords || 0}
						</div>
						<div className="text-sm text-muted-foreground">总词数</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold">
							{question.analysis.averageWords || 0}
						</div>
						<div className="text-sm text-muted-foreground">平均词数</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold">
							{question.analysis.uniqueWords || 0}
						</div>
						<div className="text-sm text-muted-foreground">独特词数</div>
					</div>
				</div>
				{question.analysis.topWords && (
					<div>
						<h4 className="text-sm font-medium mb-3">高频词汇</h4>
						<div className="flex flex-wrap gap-2">
							{question.analysis.topWords
								.slice(0, 10)
								.map((word: any, index: number) => (
									<Badge key={index} variant="outline">
										{word.text} ({word.count})
									</Badge>
								))}
						</div>
					</div>
				)}
			</div>
		)
	}

	const renderDefaultChart = (question: QuestionAnalysis) => {
		return (
			<div className="text-center py-8">
				<BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<p className="text-muted-foreground">该题目类型暂不支持详细分析</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{data.map((question, index) => (
				<Card key={question.questionId}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<CardTitle className="text-lg mb-2">
									题目 {index + 1}: {question.questionTitle}
								</CardTitle>
								<div className="flex items-center gap-2 mb-2">
									<Badge
										className={getQuestionTypeColor(question.questionType)}
									>
										{getQuestionTypeLabel(question.questionType)}
									</Badge>
									<span className="text-sm text-muted-foreground">
										{question.totalResponses} 个响应
									</span>
								</div>
							</div>
						</div>
						<CardDescription>
							<div className="flex items-center gap-4">
								<span>
									完成率: {Math.round(question.completionRate * 100)}%
								</span>
								<Progress
									value={question.completionRate * 100}
									className="flex-1 max-w-32"
								/>
							</div>
						</CardDescription>
					</CardHeader>
					<CardContent>{renderAnalysisChart(question)}</CardContent>
				</Card>
			))}
		</div>
	)
}
