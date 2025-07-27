import { Button } from '@/components/ui/button'
import { FileText, Trash2Icon, Eye, BarChart3, ScrollText } from 'lucide-react'
import Link from 'next/link'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { inferProcedureOutput } from '@trpc/server'
import { AppRouter } from '@/server'
interface SurveyActionsProps {
    survey: inferProcedureOutput<AppRouter['GetSurveyList']>['surveys'][number]
    onDelete?: (surveyId: string) => void
    onSaveToTemplate?: () => void
}

/**
 * 调查问卷操作按钮组件
 */
export function SurveyActions({ survey, onDelete, onSaveToTemplate }: SurveyActionsProps) {
    const handleDelete = () => {
        if (onDelete) {
            onDelete(survey.id)
        }
    }

    return (
        <div className="flex gap-1">
            {/* 预览按钮 */}
            <Button variant="ghost" size="icon" asChild>
                <Link href={`/${survey.id}`}>
                    <Eye className="h-4 w-4" />
                </Link>
            </Button>

            {/* 编辑按钮 */}
            <Button variant="ghost" size="icon" asChild>
                <Link href={`/dashboard/edit/${survey.id}`}>
                    <FileText className="h-4 w-4" />
                </Link>
            </Button>
            {/* 保存 */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onSaveToTemplate}
                    >
                        <ScrollText className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>保存到模版</TooltipContent>
            </Tooltip>

            {/* 删除按钮 */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
                <Trash2Icon className="h-4 w-4" />
            </Button>
            {/* 结果按钮 - 仅已发布的问卷显示 */}
            {survey.published && (
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/results/${survey.id}`}>
                        <BarChart3 className="h-4 w-4" />
                    </Link>
                </Button>
            )}
        </div>
    )
} 