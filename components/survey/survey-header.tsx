import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils/date'
import { Survey } from '@/types/survey'

interface SurveyHeaderProps {
    survey: Survey
}

/**
 * 调查问卷头部组件
 */
export function SurveyHeader({ survey }: SurveyHeaderProps) {
    return (
        <div className="p-4 pb-2">
            {/* 标题和状态 */}
            <div className="text-lg flex gap-2 items-center">
                <Badge variant={survey.published ? 'default' : 'secondary'}>
                    {survey.published ? '已发布' : '草稿'}
                </Badge>
                <div className="flex-1">{survey.name}</div>
                <Badge
                    variant="outline"
                    className="border-green-300 bg-green-100 text-green-600 opacity-50"
                >
                    {survey.questionnairesCnt}份回答
                </Badge>
            </div>

            {/* 更新时间 */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>更新于 {formatDate(survey.updatedAt)}</span>
            </div>
        </div>
    )
} 