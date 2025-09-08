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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Download, FileText, BarChart3, Calendar, Users } from 'lucide-react'
import { toast } from 'sonner'

interface ExportPanelProps {
	surveyId: string
}

export function ExportPanel({ surveyId }: ExportPanelProps) {
	const [exportFormat, setExportFormat] = useState<string>('excel')
	const [includeCharts, setIncludeCharts] = useState(true)
	const [includeRawData, setIncludeRawData] = useState(true)
	const [includeAnalysis, setIncludeAnalysis] = useState(true)
	const [isExporting, setIsExporting] = useState(false)

	const handleExport = async () => {
		if (!surveyId) {
			toast.error('请先选择问卷')
			return
		}

		setIsExporting(true)
		try {
			// 这里应该调用实际的导出API
			// const response = await trpc.survey.exportData.mutate({
			//   surveyId,
			//   format: exportFormat,
			//   options: {
			//     includeCharts,
			//     includeRawData,
			//     includeAnalysis,
			//   }
			// })

			// 模拟导出过程
			await new Promise((resolve) => setTimeout(resolve, 2000))

			toast.success('导出成功！文件已开始下载')
		} catch (error) {
			toast.error('导出失败，请稍后重试')
		} finally {
			setIsExporting(false)
		}
	}

	const exportOptions = [
		{
			value: 'excel',
			label: 'Excel 文件',
			description: '包含图表和数据的完整报告',
			icon: <FileText className="h-4 w-4" />,
		},
		{
			value: 'pdf',
			label: 'PDF 报告',
			description: '格式化的分析报告，适合分享',
			icon: <FileText className="h-4 w-4" />,
		},
		{
			value: 'csv',
			label: 'CSV 数据',
			description: '原始响应数据，适合进一步分析',
			icon: <BarChart3 className="h-4 w-4" />,
		},
		{
			value: 'json',
			label: 'JSON 数据',
			description: '完整的结构化数据',
			icon: <BarChart3 className="h-4 w-4" />,
		},
	]

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Download className="h-5 w-5" />
						导出数据报告
					</CardTitle>
					<CardDescription>
						选择导出格式和内容，生成包含分析洞察的数据报告
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* 导出格式选择 */}
					<div className="space-y-3">
						<h4 className="text-sm font-medium">导出格式</h4>
						<Select value={exportFormat} onValueChange={setExportFormat}>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{exportOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										<div className="flex items-center gap-2">
											{option.icon}
											<div>
												<div className="font-medium">{option.label}</div>
												<div className="text-xs text-muted-foreground">
													{option.description}
												</div>
											</div>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Separator />

					{/* 导出内容选择 */}
					<div className="space-y-4">
						<h4 className="text-sm font-medium">导出内容</h4>
						<div className="space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="includeCharts"
									checked={includeCharts}
									onCheckedChange={setIncludeCharts}
								/>
								<label
									htmlFor="includeCharts"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									<BarChart3 className="h-4 w-4 inline mr-2" />
									包含图表和可视化
								</label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="includeRawData"
									checked={includeRawData}
									onCheckedChange={setIncludeRawData}
								/>
								<label
									htmlFor="includeRawData"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									<Users className="h-4 w-4 inline mr-2" />
									包含原始响应数据
								</label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="includeAnalysis"
									checked={includeAnalysis}
									onCheckedChange={setIncludeAnalysis}
								/>
								<label
									htmlFor="includeAnalysis"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									<Calendar className="h-4 w-4 inline mr-2" />
									包含分析洞察
								</label>
							</div>
						</div>
					</div>

					<Separator />

					{/* 导出预览 */}
					<div className="space-y-3">
						<h4 className="text-sm font-medium">导出预览</h4>
						<div className="bg-muted/50 rounded-lg p-4 space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm">文件格式</span>
								<Badge variant="outline">
									{
										exportOptions.find((opt) => opt.value === exportFormat)
											?.label
									}
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm">包含内容</span>
								<div className="flex gap-1">
									{includeCharts && (
										<Badge variant="secondary" className="text-xs">
											图表
										</Badge>
									)}
									{includeRawData && (
										<Badge variant="secondary" className="text-xs">
											原始数据
										</Badge>
									)}
									{includeAnalysis && (
										<Badge variant="secondary" className="text-xs">
											分析
										</Badge>
									)}
								</div>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm">预计大小</span>
								<span className="text-sm text-muted-foreground">~2.5 MB</span>
							</div>
						</div>
					</div>

					{/* 导出按钮 */}
					<Button
						onClick={handleExport}
						disabled={isExporting}
						className="w-full"
						size="lg"
					>
						<Download className="h-4 w-4 mr-2" />
						{isExporting ? '正在导出...' : '开始导出'}
					</Button>
				</CardContent>
			</Card>

			{/* 导出历史 */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">导出历史</CardTitle>
					<CardDescription>查看之前的导出记录</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">暂无导出记录</h3>
						<p className="text-muted-foreground">您还没有导出过任何数据报告</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
