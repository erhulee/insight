'use client'
import { addQuestion } from '@/app/(dashboard)/dashboard/_valtio/runtime'
import { preset } from '@/components/survey-editor/buildin/form-item'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { QuestionSchemaType } from '@/lib/dsl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
// 问题类型定义
const questionTypes = preset.map((item) => ({
  id: item.type,
  name: item.title,
  icon: <item.icon className="h-4 w-4"></item.icon>,
}))
export function WidgetPanel() {
  const path = usePathname()
  const handleAddQuestion = (questionType: string) => {
    const meta = preset.find((item) => item.type === questionType)!
    const id = uuidv4()
    const newQuestion: QuestionSchemaType = meta.schema.parse({
      id: id,
      type: questionType as QuestionSchemaType['type'],
      title: meta.title,
      props: {},
    })
    addQuestion(newQuestion)
  }
  return (
    <div className="border-r bg-muted/30 overflow-y-auto hidden lg:block  h-screen">
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

      <div className="p-4">
        <h3 className="text-sm font-medium mb-2">问卷设置</h3>
        <div className="space-y-2">
          <Link href={`${path}?tab=page`}>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-1"
            >
              <Settings className="h-4 w-4" />
              基本设置
            </Button>
          </Link>
          <div className="text-xs text-muted-foreground px-2">
            点击可配置问卷基本信息和封面设置
          </div>
        </div>
      </div>
    </div>
  )
}
