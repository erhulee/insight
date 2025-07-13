import { ScrollArea } from '@/components/ui/scroll-area'
import { useSnapshot } from 'valtio'
import { runtimeStore } from '@/app/dashboard/_valtio/runtime'
import { QuestionConfig } from './QuestionConfig'
import { useMemo } from 'react'

function Empty() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p>选择一个问题来配置其属性</p>
      <p className="text-xs mt-2">或从左侧添加一个新问题</p>
    </div>
  )
}
export function EditQuestionConfig() {
  const runtimeState = useSnapshot(runtimeStore)
  const selectedQuestion = useMemo(() => {
    return runtimeState.currentQuestion.find((q) => q.id === runtimeState.selectedQuestionID)
  }, [runtimeState.selectedQuestionID])
  return (
    <div className="w-80 border-l bg-muted/30 overflow-hidden hidden md:block fixed top-[64px] right-0 h-screen">
      <div className="border-b p-4">
        <h3 className="font-medium">问题配置</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {selectedQuestion ? '编辑问题的属性和选项' : '请从左侧选择一个问题进行编辑'}
        </p>
      </div>
      <ScrollArea>
        <div className="p-4">{selectedQuestion ? <QuestionConfig /> : <Empty></Empty>}</div>
      </ScrollArea>
    </div>
  )
}
