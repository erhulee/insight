"use client"

import {
    Card,
    CardContent,
} from '@/components/ui/card'
import { SurveyHeader } from '@/components/survey/survey-header'
import { SurveyFooter } from '@/components/survey/survey-footer'
import { SurveyOverviewProps } from '@/types/survey'

/**
 * 调查问卷概览组件
 * 显示调查问卷的基本信息、状态和操作按钮
 */
export function SurveyCard({ survey, onDelete }: SurveyOverviewProps) {
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
            <SurveyFooter survey={survey} onDelete={onDelete} />
        </Card>
    )
}
