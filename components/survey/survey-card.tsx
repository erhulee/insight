"use client"
import { Card, CardContent } from '@/components/ui/card'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils/date'
import { jsonValueParse } from '@/lib/utils/jsonValueParse'
import { Button } from '@/components/ui/button'
import { FileText, Trash2Icon, Eye, BarChart3, ScrollText } from 'lucide-react'
import Link from 'next/link'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { inferProcedureOutput } from '@trpc/server'
import { AppRouter } from '@/server'

export interface SurveyOverviewProps {
    survey: inferProcedureOutput<AppRouter['surver']['GetSurveyList']>['surveys'][number]
}

/**
 * 调查问卷概览组件
 * 显示调查问卷的基本信息、状态和操作按钮
 */
export function SurveyCard({ survey }: SurveyOverviewProps) {
    const { id, name, description, published, updatedAt, questions } = survey

    const saveQuestionsToTemplateMutation = trpc.SaveQuestionsToTemplate.useMutation({
        onSuccess: () => toast.success('保存成功'),
        onError: () => toast.error('保存失败')
    })

    const deleteSurveyMutation = trpc.DeleteSurvey.useMutation({
        onSuccess: () => toast.success('删除成功'),
        onError: () => toast.error('删除失败')
    })

    const handleSaveToTemplate = () => {
        saveQuestionsToTemplateMutation.mutate({ question_id: id })
    }

    const handleDelete = () => {
        deleteSurveyMutation.mutate({ id })
    }

    const questionCount = jsonValueParse(questions).length
    const responseCount = published ? 'NaN份回答' : '暂未发布'
    const statusVariant = published ? 'default' : 'secondary'
    const responseBadgeVariant = published ? 'green' : 'blue'

    return (
        <Card key={id} className="overflow-hidden">
            {/* 头部：标题、状态、更新时间 */}
            <div className="p-4 pb-2">
                <div className="text-lg flex gap-2 items-center">
                    <Badge variant={statusVariant}>
                        {published ? '已发布' : '草稿'}
                    </Badge>
                    <div className="flex-1">{name}</div>
                    <Badge
                        variant="outline"
                        className={`border-${responseBadgeVariant}-300 bg-${responseBadgeVariant}-100 text-${responseBadgeVariant}-600 opacity-80`}
                    >
                        {responseCount}
                    </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                    <Clock className="h-3 w-3" />
                    <span>更新于 {formatDate(updatedAt)}</span>
                </div>
            </div>

            {/* 内容：描述信息 */}
            <CardContent className="p-4 pt-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {description}
                </p>
            </CardContent>

            {/* 底部：统计信息和操作按钮 */}
            <div className="p-4 pt-0 flex justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        {questionCount} 个问题
                    </span>
                </div>

                {/* 操作按钮组 */}
                <div className="flex gap-1">
                    {/* 预览按钮 */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`/${id}`}>
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>预览问卷</TooltipContent>
                    </Tooltip>

                    {/* 编辑按钮 */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`/dashboard/edit/${id}`}>
                                    <FileText className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>编辑问卷</TooltipContent>
                    </Tooltip>

                    {/* 保存到模板按钮 */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSaveToTemplate}
                            >
                                <ScrollText className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>保存到模板</TooltipContent>
                    </Tooltip>

                    {/* 删除按钮 */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDelete}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2Icon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>删除问卷</TooltipContent>
                    </Tooltip>

                    {/* 结果按钮 - 仅已发布的问卷显示 */}
                    {published && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/dashboard/results/${id}`}>
                                        <BarChart3 className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>查看结果</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </Card>
    )
}
