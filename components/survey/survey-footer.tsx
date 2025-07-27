import { SurveyActions } from './survey-actions'
import { inferProcedureOutput } from '@trpc/server'
import { AppRouter } from '@/server'
import { jsonValueParse } from '@/lib/utils/jsonValueParse'

interface SurveyFooterProps {
    survey: inferProcedureOutput<AppRouter['GetSurveyList']>['surveys'][number]
    onDelete?: (surveyId: string) => void
    onSaveToTemplate: () => void
}

/**
 * 调查问卷底部组件
 */
export function SurveyFooter({ survey, onDelete, onSaveToTemplate }: SurveyFooterProps) {
    const questions = jsonValueParse(survey.questions)
    return (
        <div className="p-4 pt-0 flex justify-between">
            {/* 统计信息 */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                    {questions.length} 个问题
                </span>
            </div>
            {/* 操作按钮 */}
            <SurveyActions
                survey={survey}
                onDelete={onDelete}
                onSaveToTemplate={onSaveToTemplate} />
        </div>
    )
} 