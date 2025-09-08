'use client'

import { useState } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Filter, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
	onFilterChange: (filters: any) => void
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
	const [filters, setFilters] = useState({
		dateRange: '7d',
		customDateFrom: undefined as Date | undefined,
		customDateTo: undefined as Date | undefined,
		responseStatus: 'all',
		completionRate: 'all',
		deviceType: 'all',
	})

	const updateFilter = (key: string, value: any) => {
		const newFilters = { ...filters, [key]: value }
		setFilters(newFilters)
		onFilterChange(newFilters)
	}

	const clearFilters = () => {
		const defaultFilters = {
			dateRange: '7d',
			customDateFrom: undefined,
			customDateTo: undefined,
			responseStatus: 'all',
			completionRate: 'all',
			deviceType: 'all',
		}
		setFilters(defaultFilters)
		onFilterChange(defaultFilters)
	}

	const hasActiveFilters = Object.values(filters).some(
		(value) => value !== 'all' && value !== '7d' && value !== undefined,
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Filter className="h-5 w-5" />
					高级筛选
				</CardTitle>
				<CardDescription>设置筛选条件来精确分析数据</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* 时间范围 */}
				<div className="space-y-2">
					<label className="text-sm font-medium">时间范围</label>
					<Select
						value={filters.dateRange}
						onValueChange={(value) => updateFilter('dateRange', value)}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="1d">今天</SelectItem>
							<SelectItem value="7d">最近7天</SelectItem>
							<SelectItem value="30d">最近30天</SelectItem>
							<SelectItem value="90d">最近90天</SelectItem>
							<SelectItem value="custom">自定义范围</SelectItem>
							<SelectItem value="all">全部时间</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* 自定义日期范围 */}
				{filters.dateRange === 'custom' && (
					<div className="grid grid-cols-2 gap-2">
						<div className="space-y-2">
							<label className="text-sm font-medium">开始日期</label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											'w-full justify-start text-left font-normal',
											!filters.customDateFrom && 'text-muted-foreground',
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{filters.customDateFrom
											? format(filters.customDateFrom, 'PPP')
											: '选择日期'}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={filters.customDateFrom}
										onSelect={(date) => updateFilter('customDateFrom', date)}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">结束日期</label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											'w-full justify-start text-left font-normal',
											!filters.customDateTo && 'text-muted-foreground',
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{filters.customDateTo
											? format(filters.customDateTo, 'PPP')
											: '选择日期'}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={filters.customDateTo}
										onSelect={(date) => updateFilter('customDateTo', date)}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				)}

				{/* 响应状态 */}
				<div className="space-y-2">
					<label className="text-sm font-medium">响应状态</label>
					<Select
						value={filters.responseStatus}
						onValueChange={(value) => updateFilter('responseStatus', value)}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">全部</SelectItem>
							<SelectItem value="completed">已完成</SelectItem>
							<SelectItem value="incomplete">未完成</SelectItem>
							<SelectItem value="abandoned">已放弃</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* 完成率范围 */}
				<div className="space-y-2">
					<label className="text-sm font-medium">完成率范围</label>
					<Select
						value={filters.completionRate}
						onValueChange={(value) => updateFilter('completionRate', value)}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">全部</SelectItem>
							<SelectItem value="high">高完成率 (80%+)</SelectItem>
							<SelectItem value="medium">中等完成率 (50-80%)</SelectItem>
							<SelectItem value="low">低完成率 (&lt;50%)</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* 设备类型 */}
				<div className="space-y-2">
					<label className="text-sm font-medium">设备类型</label>
					<Select
						value={filters.deviceType}
						onValueChange={(value) => updateFilter('deviceType', value)}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">全部</SelectItem>
							<SelectItem value="desktop">桌面端</SelectItem>
							<SelectItem value="mobile">移动端</SelectItem>
							<SelectItem value="tablet">平板端</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* 活跃筛选器显示 */}
				{hasActiveFilters && (
					<div className="space-y-2">
						<label className="text-sm font-medium">当前筛选</label>
						<div className="flex flex-wrap gap-2">
							{filters.dateRange !== '7d' && (
								<Badge variant="secondary" className="flex items-center gap-1">
									时间:{' '}
									{filters.dateRange === 'custom'
										? '自定义'
										: filters.dateRange}
									<X
										className="h-3 w-3 cursor-pointer"
										onClick={() => updateFilter('dateRange', '7d')}
									/>
								</Badge>
							)}
							{filters.responseStatus !== 'all' && (
								<Badge variant="secondary" className="flex items-center gap-1">
									状态: {filters.responseStatus}
									<X
										className="h-3 w-3 cursor-pointer"
										onClick={() => updateFilter('responseStatus', 'all')}
									/>
								</Badge>
							)}
							{filters.completionRate !== 'all' && (
								<Badge variant="secondary" className="flex items-center gap-1">
									完成率: {filters.completionRate}
									<X
										className="h-3 w-3 cursor-pointer"
										onClick={() => updateFilter('completionRate', 'all')}
									/>
								</Badge>
							)}
							{filters.deviceType !== 'all' && (
								<Badge variant="secondary" className="flex items-center gap-1">
									设备: {filters.deviceType}
									<X
										className="h-3 w-3 cursor-pointer"
										onClick={() => updateFilter('deviceType', 'all')}
									/>
								</Badge>
							)}
						</div>
					</div>
				)}

				{/* 操作按钮 */}
				<div className="flex gap-2 pt-2">
					<Button
						variant="outline"
						size="sm"
						onClick={clearFilters}
						className="flex-1"
					>
						清除筛选
					</Button>
					<Button size="sm" className="flex-1">
						应用筛选
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
