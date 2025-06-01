import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'

type Props = {
  templateId: string
  title: string
  description: string
  tags: string[]
  questionsCnt: number
}
export function TemplateCard(props: Props) {
  // 使用模板创建问卷
  const { mutateAsync, isPending } = trpc.CreateSurveyByTemplate.useMutation()
  const handleUseTemplate = async (templateId: string) => {
    const survey = await mutateAsync({
      templateId: templateId,
    })
    if (survey?.id) {
      toast.success('创建成功', {
        description: '3s后跳转到问卷编辑页面',
      })
      setTimeout(() => {
        window.location.href = `/dashboard/edit/${survey.id}`
      }, 3000)
    } else {
      toast.error('创建失败')
    }
  }
  const { templateId, tags, title, description, questionsCnt } = props
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {tags.map((tag) => (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center gap-1">
              {tag}
            </span>
          ))}
          <span>{questionsCnt} 个问题</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleUseTemplate(templateId)}
          disabled={isPending}
        >
          使用此模板
        </Button>
      </CardFooter>
    </Card>
  )
}
