"use client"
import {
    Card,
    CardContent,
} from '@/components/ui/card'
import { SurveyHeader } from '@/components/survey/survey-header'
import { SurveyFooter } from '@/components/survey/survey-footer'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { inferProcedureOutput } from '@trpc/server'
import { AppRouter } from '@/server'
export interface SurveyOverviewProps {
    survey: inferProcedureOutput<AppRouter['GetSurveyList']>['surveys'][number]
    onDelete: (surveyId: string) => void
    onEdit?: (surveyId: string) => void
    onView?: (surveyId: string) => void
    onViewResults?: (surveyId: string) => void
}
/**
 * 调查问卷概览组件
 * 显示调查问卷的基本信息、状态和操作按钮
 */
export function SurveyCard({ survey }: SurveyOverviewProps) {
    const saveQuestionsToTemplateMutation = trpc.SaveQuestionsToTemplate.useMutation({
        onSuccess: () => {
            toast.success('保存成功')
        },
        onError: () => {
            toast.error('保存失败')
        }
    })
    const deleteSurveyMutation = trpc.DeleteSurvey.useMutation({
        onSuccess: () => {
            toast.success('删除成功')
        },
        onError: () => {
            toast.error('删除失败')
        }
    })
    const handleSaveToTemplate = () => {
        saveQuestionsToTemplateMutation.mutate({
            question_id: survey.id
        })
    }
    const handleDelete = () => {
        deleteSurveyMutation.mutate({
            id: survey.id
        })
    }
    return (
        <Card key={survey.id} className="overflow-hidden">
            {/* 头部：标题、状态、更新时间 */}
            <SurveyHeader survey={survey} />

            {/* 内容：描述信息 */}
            <CardContent className="p-4 pt-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {survey.description}
                </p>
            </CardContent>

            {/* 底部：统计信息和操作按钮 */}
            <SurveyFooter survey={survey} onDelete={handleDelete} onSaveToTemplate={handleSaveToTemplate} />
        </Card>
    )
}
