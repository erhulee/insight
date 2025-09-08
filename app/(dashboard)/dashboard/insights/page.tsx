'use client'

import { useState } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
	Calendar,
	Download,
	Filter,
	RefreshCw,
	TrendingUp,
	Users,
	BarChart3,
	PieChart,
} from 'lucide-react'
import { useInsights } from './hooks/use-insights'
import {
	OverviewStats,
	ResponseChart,
	QuestionAnalysis,
	TrendAnalysis,
	ExportPanel,
	FilterPanel,
} from './components'

export default function InsightsPage() {
	const [selectedSurvey, setSelectedSurvey] = useState<string>('')
	const [dateRange, setDateRange] = useState<string>('7d')
	const [activeTab, setActiveTab] = useState('overview')

	const {
		surveys,
		selectedSurveyData,
		stats,
		responseData,
		questionAnalysis,
		trends,
		isLoading,
		refetch,
	} = useInsights(selectedSurvey, dateRange)

	return (
		<div className="min-h-screen bg-background">
			{/* 页面头部 */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">数据洞察</h1>
							<p className="text-muted-foreground">
								分析问卷响应数据，获取有价值的洞察和趋势
							</p>
						</div>
						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								size="sm"
								onClick={refetch}
								disabled={isLoading}
							>
								<RefreshCw
									className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
								/>
								刷新数据
							</Button>
							<Button variant="outline" size="sm">
								<Download className="h-4 w-4 mr-2" />
								导出报告
							</Button>
						</div>
					</div>
				</div>
			</div>

			<main className="container mx-auto px-4 py-8">
				{/* 筛选器 */}
				<div className="mb-6 space-y-4">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4" />
							<span className="text-sm font-medium">筛选条件</span>
						</div>
						<Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
							<SelectTrigger className="w-64">
								<SelectValue placeholder="选择问卷" />
							</SelectTrigger>
							<SelectContent>
								{surveys.map((survey: any) => (
									<SelectItem key={survey.id} value={survey.id}>
										{survey.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={dateRange} onValueChange={setDateRange}>
							<SelectTrigger className="w-32">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1d">今天</SelectItem>
								<SelectItem value="7d">最近7天</SelectItem>
								<SelectItem value="30d">最近30天</SelectItem>
								<SelectItem value="90d">最近90天</SelectItem>
								<SelectItem value="all">全部时间</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{selectedSurveyData && (
						<div className="flex items-center gap-2">
							<Badge variant="outline">{selectedSurveyData.name}</Badge>
							<span className="text-sm text-muted-foreground">
								创建于{' '}
								{new Date(selectedSurveyData.createdAt).toLocaleDateString()}
							</span>
							{selectedSurveyData.published && (
								<Badge variant="default">已发布</Badge>
							)}
						</div>
					)}
				</div>

				{/* 主要内容 */}
				{selectedSurvey ? (
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="space-y-6"
					>
						<TabsList className="grid w-full grid-cols-5">
							<TabsTrigger value="overview" className="flex items-center gap-2">
								<BarChart3 className="h-4 w-4" />
								概览
							</TabsTrigger>
							<TabsTrigger
								value="responses"
								className="flex items-center gap-2"
							>
								<Users className="h-4 w-4" />
								响应分析
							</TabsTrigger>
							<TabsTrigger
								value="questions"
								className="flex items-center gap-2"
							>
								<PieChart className="h-4 w-4" />
								题目分析
							</TabsTrigger>
							<TabsTrigger value="trends" className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4" />
								趋势分析
							</TabsTrigger>
							<TabsTrigger value="export" className="flex items-center gap-2">
								<Download className="h-4 w-4" />
								导出
							</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-6">
							<OverviewStats stats={stats} isLoading={isLoading} />
							<ResponseChart data={responseData} isLoading={isLoading} />
						</TabsContent>

						<TabsContent value="responses" className="space-y-6">
							<ResponseChart data={responseData} isLoading={isLoading} />
						</TabsContent>

						<TabsContent value="questions" className="space-y-6">
							<QuestionAnalysis data={questionAnalysis} isLoading={isLoading} />
						</TabsContent>

						<TabsContent value="trends" className="space-y-6">
							<TrendAnalysis data={trends} isLoading={isLoading} />
						</TabsContent>

						<TabsContent value="export" className="space-y-6">
							<ExportPanel surveyId={selectedSurvey} />
						</TabsContent>
					</Tabs>
				) : (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">选择问卷开始分析</h3>
							<p className="text-muted-foreground text-center max-w-md">
								请从上方下拉菜单中选择一个问卷，开始查看其响应数据的洞察分析
							</p>
						</CardContent>
					</Card>
				)}
			</main>
		</div>
	)
}
