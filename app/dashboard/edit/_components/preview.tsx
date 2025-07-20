import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
type Props = {
  survey: any
  questions: any[]
}
export function Preview(props: Props) {
  const { questions, survey } = props
  // 渲染预览内容
  return (
    <div className="min-h-full bg-background p-4">
      {/* 问卷标题和描述 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{survey.name}</h1>
        {survey.description && <p className="text-muted-foreground">{survey.description}</p>}
      </div>

      {/* 问题列表 */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-card rounded-lg border p-4 shadow-sm">
            {question.type === 'section' ? (
              <div>
                <h3 className="text-xl font-medium">{question.title}</h3>
                {question.description && (
                  <p className="text-muted-foreground mt-1">{question.description}</p>
                )}
                <Separator className="mt-4" />
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-1 mb-2">
                  <h3 className="text-base font-medium">
                    {index + 1}. {question.title}
                    {question.required && <span className="text-destructive ml-1">*</span>}
                  </h3>
                </div>
                {question.description && (
                  <p className="text-sm text-muted-foreground mb-4">{question.description}</p>
                )}

                {/* 根据问题类型渲染不同的输入控件 */}
                {question.type === 'text' &&
                  (question.multiline ? (
                    <Textarea placeholder={question.placeholder} className="w-full" />
                  ) : (
                    <Input placeholder={question.placeholder} className="w-full" />
                  ))}

                {question.type === 'radio' && (
                  <div className="space-y-2">
                    {question.options?.map((option, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`${question.id}-${i}`}
                          name={question.id}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`${question.id}-${i}`} className="text-sm">
                          {option.text}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'checkbox' && (
                  <div className="space-y-2">
                    {question.options?.map((option, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`${question.id}-${i}`}
                          className="h-4 w-4 rounded"
                        />
                        <label htmlFor={`${question.id}-${i}`} className="text-sm">
                          {option.text}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'dropdown' && (
                  <select className="w-full p-2 border rounded-md">
                    <option value="">请选择...</option>
                    {question.options?.map((option, i) => (
                      <option key={i} value={option.value}>
                        {option.text}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === 'rating' && (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      {Array.from({ length: question.maxRating || 5 }).map((_, i) => (
                        <button
                          key={i}
                          className="w-10 h-10 rounded-md flex items-center justify-center border bg-background hover:bg-muted"
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    {question.props?.minLabel && question.props?.maxLabel && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          {question.props.minLabel}
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          {question.props.maxLabel}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {question.type === 'date' && <Input type="date" className="w-full" />}

                {question.type === 'file' && (
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-4 text-center">
                    <p className="text-sm text-muted-foreground">点击或拖拽文件到此处上传</p>
                    <button className="mt-2 px-4 py-2 bg-primary/10 text-primary rounded-md text-sm">
                      选择文件
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 提交按钮 */}
      <div className="mt-8 flex justify-end">
        <Button className="px-8">提交问卷</Button>
      </div>
    </div>
  )
}
