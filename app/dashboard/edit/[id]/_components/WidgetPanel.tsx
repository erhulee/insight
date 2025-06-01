'use client'
import { addQuestion, runtimeStore } from '@/app/dashboard/_valtio/runtime'
import { preset, QuestionType } from '@/components/survey-editor/buildin/form-item'
import { Button } from '@/components/ui/button'
import { Question } from '@/lib/types'
import { Settings } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useSnapshot } from 'valtio'
// 问题类型定义
const questionTypes = preset.map((item) => ({
  id: item.type,
  name: item.title,
  icon: <item.icon className="h-4 w-4"></item.icon>,
}))
export function WidgetPanel() {
  const currentPageIndex = useSnapshot(runtimeStore).currentPage
  const handleAddQuestion = (questionType: QuestionType) => {
    const meta = preset.find((item) => item.type === questionType)!
    const id = uuidv4()
    const newQuestion: Question = {
      field: id,
      id: id,
      type: questionType,
      name: meta.title,
      attr: meta.attrs.reduce((pre, cur) => {
        return {
          ...pre,
          [cur.name]: cur.defaultValue,
          field: id,
        }
      }, {}),
      ownerPage: currentPageIndex,
    }
    addQuestion(newQuestion)
  }
  return (
    <div className="w-64 border-r bg-muted/30 overflow-y-auto hidden lg:block">
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium mb-2">基础模块</h3>
        <div className="grid grid-cols-2 gap-2">
          {questionTypes.map((type) => (
            <Button
              key={type.id}
              variant="outline"
              size="sm"
              onClick={() => handleAddQuestion(type.id)}
              className="justify-start gap-1 h-auto py-2"
            >
              {type.icon}
              <span className="text-xs">{type.name}</span>
            </Button>
          ))}
        </div>
      </div>
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium mb-2">高级模块</h3>
        <div className="grid grid-cols-2 gap-2">
          {questionTypes.slice(4).map((type) => (
            <Button
              key={type.id}
              variant="outline"
              size="sm"
              onClick={() => handleAddQuestion(type.id)}
              className="justify-start gap-1 h-auto py-2"
            >
              {type.icon}
              <span className="text-xs">{type.name}</span>
            </Button>
          ))}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium mb-2">问卷设置</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-1"
            onClick={() => {}}
          >
            <Settings className="h-4 w-4" />
            基本设置
          </Button>
        </div>
      </div>
    </div>
  )
}
