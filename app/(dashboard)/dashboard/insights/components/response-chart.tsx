'use client'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	LineChart,
	Line,
} from 'recharts'
import { Calendar, TrendingUp } from 'lucide-react'
import type { ResponseData } from '../hooks/use-insights'

interface ResponseChartProps {
	data: ResponseData[]
	isLoading: boolean
}

export function ResponseChart({ data, isLoading }: ResponseChartProps) {
	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							响应趋势
						</CardTitle>
						<CardDescription>按日期统计的响应数量</CardDescription>
					</CardHeader>
					<CardContent>
						<Skeleton className="h-64 w-full" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							完成率趋势
						</CardTitle>
						<CardDescription>按日期统计的完成率</CardDescription>
					</CardHeader>
					<CardContent>
						<Skeleton className="h-64 w-full" />
					</CardContent>
				</Card>
			</div>
		)
	}

	if (!data || data.length === 0) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-12">
					<div className="text-center">
						<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">暂无响应数据</h3>
						<p className="text-muted-foreground">
							该问卷还没有收到任何响应，请稍后再查看
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	// 格式化数据用于图表显示
	const chartData = data.map((item) => ({
		date: new Date(item.date).toLocaleDateString('zh-CN', {
			month: 'short',
			day: 'numeric',
		}),
		responses: item.responses,
		completions: item.completions,
		completionRate:
			item.completions > 0 ? (item.completions / item.responses) * 100 : 0,
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

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						响应趋势
					</CardTitle>
					<CardDescription>按日期统计的响应数量</CardDescription>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" />
							<YAxis />
							<Tooltip content={<CustomTooltip />} />
							<Bar dataKey="responses" fill="#8884d8" name="总响应" />
							<Bar dataKey="completions" fill="#82ca9d" name="完成数" />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						完成率趋势
					</CardTitle>
					<CardDescription>按日期统计的完成率</CardDescription>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" />
							<YAxis domain={[0, 100]} />
							<Tooltip content={<CustomTooltip />} />
							<Line
								type="monotone"
								dataKey="completionRate"
								stroke="#8884d8"
								strokeWidth={2}
								name="完成率"
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	)
}
