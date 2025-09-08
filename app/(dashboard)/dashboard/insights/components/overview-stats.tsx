'use client'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import type { OverviewStats } from '../hooks/use-insights'

interface OverviewStatsProps {
	stats: OverviewStats | null
	isLoading: boolean
}

export function OverviewStats({ stats, isLoading }: OverviewStatsProps) {
	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-4" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-16 mb-2" />
							<Skeleton className="h-3 w-20" />
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	if (!stats) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<p className="text-muted-foreground">暂无统计数据</p>
				</CardContent>
			</Card>
		)
	}

	const formatTime = (seconds: number) => {
		if (seconds < 60) return `${Math.round(seconds)}秒`
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = Math.round(seconds % 60)
		return `${minutes}分${remainingSeconds}秒`
	}

	const formatPercentage = (value: number) => {
		return `${Math.round(value * 100)}%`
	}

	const formatGrowth = (value: number) => {
		const sign = value >= 0 ? '+' : ''
		return `${sign}${Math.round(value * 100)}%`
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">总响应数</CardTitle>
					<Users className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.totalResponses}</div>
					<p className="text-xs text-muted-foreground">所有时间段的响应总数</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">完成率</CardTitle>
					<CheckCircle className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{formatPercentage(stats.completionRate)}
					</div>
					<p className="text-xs text-muted-foreground">完成问卷的用户比例</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">平均用时</CardTitle>
					<Clock className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{formatTime(stats.averageTime)}
					</div>
					<p className="text-xs text-muted-foreground">
						用户完成问卷的平均时间
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">响应增长</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold flex items-center gap-2">
						{formatGrowth(stats.responseGrowth)}
						<Badge
							variant={stats.responseGrowth >= 0 ? 'default' : 'destructive'}
							className="text-xs"
						>
							{stats.responseGrowth >= 0 ? '上升' : '下降'}
						</Badge>
					</div>
					<p className="text-xs text-muted-foreground">相比上一周期的变化</p>
				</CardContent>
			</Card>
		</div>
	)
}
