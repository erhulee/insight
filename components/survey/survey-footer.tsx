import { SurveyActions } from './survey-actions'
import { Survey } from '@/types/survey'

interface SurveyFooterProps {
    survey: Survey
    onDelete?: (surveyId: string) => void
}

/**
 * 调查问卷底部组件
 */
export function SurveyFooter({ survey, onDelete }: SurveyFooterProps) {
    return (
        <div className="p-4 pt-0 flex justify-between">
            {/* 统计信息 */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                    {survey.questions?.length} 个问题
                </span>
            </div>

            {/* 操作按钮 */}
            <SurveyActions survey={survey} onDelete={onDelete} />
        </div>
    )
} 