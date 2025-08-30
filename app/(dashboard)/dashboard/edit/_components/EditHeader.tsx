import { Button } from '@/components/ui/button'
import { InsightBrand } from '@/components/common/insight-brand'

import { Save, ArrowLeft, Share2, Smartphone } from 'lucide-react'
import { trpc } from '@/app/_trpc/client'
import { runtimeStore } from '@/app/dashboard/_valtio/runtime'
import { useSnapshot } from 'valtio'
import { toast } from 'sonner'
type Props = {
  handleBackToDashboard: () => void
  handlePublishSurvey: (published: boolean) => void
  handleShareSurvey: () => void
  published: boolean
}
export function EditHeader(props: Props) {
  const runtimeState = useSnapshot(runtimeStore)
  const saveMutation = trpc.SaveSurvey.useMutation({})
  const handleSaveSurvey = () => {
    saveMutation.mutate(
      {
        id: runtimeState.surveyId,
        questions: JSON.stringify(runtimeState.questions),
        pageCnt: runtimeState.pageCount,
      },
      {
        onSuccess: () => {
          toast.success('保存成功')
        },
        onError: () => {
          toast.error('保存失败')
        },
      },
    )
  }
  const { handleBackToDashboard, handleShareSurvey, handlePublishSurvey, published } = props
  return (
    <header className="border-b sticky top-0 z-10 bg-background">
      <div className=" flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBackToDashboard}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <InsightBrand></InsightBrand>
        </div>
        <div className="flex items-center gap-2">
          {published ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handlePublishSurvey(false)
              }}
              className="gap-1"
            >
              <Smartphone className="h-4 w-4" />
              取消发布
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handlePublishSurvey(true)
              }}
              className="gap-1"
            >
              <Smartphone className="h-4 w-4" />
              发布
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleShareSurvey} className="gap-1">
            <Share2 className="h-4 w-4" />
            分享
          </Button>
          <Button variant="default" size="sm" onClick={handleSaveSurvey} className="gap-1">
            <Save className="h-4 w-4" />
            保存
          </Button>
        </div>
      </div>
    </header>
  )
}
