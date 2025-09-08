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
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	AreaChart,
	Area,
} from 'recharts'
import { TrendingUp, TrendingDown, Activity, Users } from 'lucide-react'
import type { TrendData } from '../hooks/use-insights'

interface TrendAnalysisProps {
	data: TrendData[]
	isLoading: boolean
}

export function TrendAnalysis({ data, isLoading }: TrendAnalysisProps) {
	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-32" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-64 w-full" />
					</CardContent>
				</Card>
				<div className="grid gap-4 md:grid-cols-2">
					{Array.from({ length: 2 }).map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-32 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		)
	}

	if (!data || data.length === 0) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-12">
					<div className="text-center">
						<Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">暂无趋势数据</h3>
						<p className="text-muted-foreground">
							该问卷还没有足够的数据进行趋势分析
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	// 计算趋势指标
	const calculateTrend = (values: number[]) => {
		if (values.length < 2) return { direction: 'stable', percentage: 0 }

		const first = values[0]
		const last = values[values.length - 1]
		const percentage = first > 0 ? ((last - first) / first) * 100 : 0

		return {
			direction: percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable',
			percentage: Math.abs(percentage),
		}
	}

	const responseValues = data.map((d) => d.responses)
	const completionValues = data.map((d) => d.completionRate)

	const responseTrend = calculateTrend(responseValues)
	const completionTrend = calculateTrend(completionValues)

	// 格式化数据用于图表显示
	const chartData = data.map((item) => ({
		date: new Date(item.date).toLocaleDateString('zh-CN', {
			month: 'short',
			day: 'numeric',
		}),
		responses: item.responses,
		completions: item.completions,
		completionRate: item.completionRate,
	}))

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-background border rounded-lg p-3 shadow-lg">
					<p className="font-medium">{label}</p>
					{payload.map((entry: any, index: number) => (
						<p key={index} className="text-sm" style={{ color: entry.color }}>
							{entry.name}: {entry.value}
							{entry.dataKey === 'completionRate' && '%'}
						</p>
					))}
				</div>
			)
		}
		return null
	}

	const getTrendIcon = (direction: string) => {
		switch (direction) {
			case 'up':
				return <TrendingUp className="h-4 w-4 text-green-600" />
			case 'down':
				return <TrendingDown className="h-4 w-4 text-red-600" />
			default:
				return <Activity className="h-4 w-4 text-gray-600" />
		}
	}

	const getTrendColor = (direction: string) => {
		switch (direction) {
			case 'up':
				return 'text-green-600'
			case 'down':
				return 'text-red-600'
			default:
				return 'text-gray-600'
		}
	}

	return (
		<div className="space-y-6">
			{/* 趋势概览 */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">响应趋势</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							{getTrendIcon(responseTrend.direction)}
							<span
								className={`text-2xl font-bold ${getTrendColor(responseTrend.direction)}`}
							>
								{responseTrend.percentage.toFixed(1)}%
							</span>
						</div>
						<p className="text-xs text-muted-foreground">
							{responseTrend.direction === 'up' && '响应数量上升'}
							{responseTrend.direction === 'down' && '响应数量下降'}
							{responseTrend.direction === 'stable' && '响应数量稳定'}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">完成率趋势</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							{getTrendIcon(completionTrend.direction)}
							<span
								className={`text-2xl font-bold ${getTrendColor(completionTrend.direction)}`}
							>
								{completionTrend.percentage.toFixed(1)}%
							</span>
						</div>
						<p className="text-xs text-muted-foreground">
							{completionTrend.direction === 'up' && '完成率上升'}
							{completionTrend.direction === 'down' && '完成率下降'}
							{completionTrend.direction === 'stable' && '完成率稳定'}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* 综合趋势图 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						综合趋势分析
					</CardTitle>
					<CardDescription>
						响应数量、完成数量和完成率的时间趋势
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={400}>
						<AreaChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" />
							<YAxis yAxisId="left" />
							<YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
							<Tooltip content={<CustomTooltip />} />
							<Area
								yAxisId="left"
								type="monotone"
								dataKey="responses"
								stackId="1"
								stroke="#8884d8"
								fill="#8884d8"
								name="总响应"
							/>
							<Area
								yAxisId="left"
								type="monotone"
								dataKey="completions"
								stackId="1"
								stroke="#82ca9d"
								fill="#82ca9d"
								name="完成数"
							/>
							<Line
								yAxisId="right"
								type="monotone"
								dataKey="completionRate"
								stroke="#ff7300"
								strokeWidth={2}
								name="完成率"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* 详细趋势分析 */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">响应数量趋势</CardTitle>
						<CardDescription>每日响应数量变化</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={200}>
							<LineChart data={chartData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip content={<CustomTooltip />} />
								<Line
									type="monotone"
									dataKey="responses"
									stroke="#8884d8"
									strokeWidth={2}
									name="响应数"
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">完成率趋势</CardTitle>
						<CardDescription>每日完成率变化</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={200}>
							<LineChart data={chartData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis domain={[0, 100]} />
								<Tooltip content={<CustomTooltip />} />
								<Line
									type="monotone"
									dataKey="completionRate"
									stroke="#82ca9d"
									strokeWidth={2}
									name="完成率"
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
