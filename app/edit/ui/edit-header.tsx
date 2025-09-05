import { Button } from '@/components/ui/button'
import { InsightBrand } from '@/components/common/insight-brand'
import { Save, ArrowLeft, Share2, Smartphone } from 'lucide-react'
import { trpc } from '@/app/_trpc/client'
import { useSnapshot } from 'valtio'
import { toast } from 'sonner'
import { runtimeStore } from '@/app/(dashboard)/dashboard/_valtio/runtime'

interface PublishProps {
    isPublished: boolean
    mutationStatus: string
    handlePublishSurvey: (published: boolean) => void
}

interface EditHeaderProps {
    handleBackToDashboard: () => void
    publish: PublishProps
    handleShareSurvey: () => void
}

export function EditHeader({
    handleBackToDashboard,
    publish,
    handleShareSurvey,
}: EditHeaderProps) {
    const runtimeState = useSnapshot(runtimeStore)
    const { isPublished, mutationStatus, handlePublishSurvey } = publish

    const saveMutation = trpc.surver.SaveSurvey.useMutation({
        onSuccess: () => {
            toast.success('保存成功')
        },
        onError: (error: any) => {
            console.error('保存失败:', error)
            toast.error('保存失败')
        },
    })

    const handleSaveSurvey = () => {
        if (!runtimeState.surveyId) {
            toast.error('问卷ID不存在')
            return
        }

        saveMutation.mutate({
            id: runtimeState.surveyId,
            questions: JSON.stringify(runtimeState.questions),
            pageCnt: runtimeState.pageCount,
        })
    }

    const isMutationPending = mutationStatus === 'pending'
    const isSavePending = saveMutation.isPending

    return (
        <header className="flex h-16 items-center justify-between px-4">
            {/* 左侧区域 */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToDashboard}
                    aria-label="返回仪表板"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <InsightBrand />
            </div>

            {/* 右侧操作区域 */}
            <div className="flex items-center gap-2">
                {/* 发布/取消发布按钮 */}
                {isPublished ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishSurvey(false)}
                        disabled={isMutationPending}
                        className="gap-1"
                    >
                        <Smartphone className="h-4 w-4" />
                        取消发布
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishSurvey(true)}
                        disabled={isMutationPending}
                        className="gap-1"
                    >
                        <Smartphone className="h-4 w-4" />
                        发布
                    </Button>
                )}

                {/* 分享按钮 */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareSurvey}
                    className="gap-1"
                >
                    <Share2 className="h-4 w-4" />
                    分享
                </Button>

                {/* 保存按钮 */}
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveSurvey}
                    disabled={isSavePending}
                    className="gap-1"
                >
                    <Save className="h-4 w-4" />
                    {isSavePending ? '保存中...' : '保存'}
                </Button>
            </div>
        </header>
    )
}
