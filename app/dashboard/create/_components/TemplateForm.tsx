import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
export function TemplateForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
  })
  const createMutation = trpc.CreateSurvey.useMutation()
  const handleCreateBlankSurvey = async () => {
    const survey = await createMutation.mutateAsync({
      name: form.title,
      description: form.description,
    })
    if (survey) {
      window.location.href = `/dashboard/edit/${survey.id}/edit`
    } else {
      toast.error('创建失败')
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>创建空白问卷</CardTitle>
        <CardDescription>从零开始创建一个全新的问卷</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            问卷标题 <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => {
              setForm({
                ...form,
                title: e.target.value,
              })
            }}
            placeholder="输入问卷标题"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            问卷描述（可选）
          </label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => {
              setForm({
                ...form,
                description: e.target.value,
              })
            }}
            placeholder="输入问卷描述或说明"
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateBlankSurvey} className="w-full">
          {/* {isCreating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            创建中...
                        </>
                    ) : ( */}
          创建问卷
          {/* )} */}
        </Button>
      </CardFooter>
    </Card>
  )
}
