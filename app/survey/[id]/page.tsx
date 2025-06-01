'use client'

import { Separator } from '@/components/ui/separator'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileText, ArrowRight } from 'lucide-react'
import type { Survey, Question } from '@/lib/types'
import { getFromLocalStorage, validateEmail, validatePhone, validateUrl } from '@/lib/utils'

import { toast } from 'sonner'

export default function SurveyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [redirectToThanks, setRedirectToThanks] = useState(false)

  // 加载问卷数据
  useEffect(() => {
    // 模拟从API加载数据
    setTimeout(() => {
      try {
        const loadedSurvey = getFromLocalStorage<Survey>(`survey_${params.id}`, null)

        if (!loadedSurvey) {
          toast('问卷不存在', {
            description: '您访问的问卷不存在或已被删除',
          })
          return
        }

        if (!loadedSurvey.published) {
          toast('问卷未发布', {
            description: '此问卷尚未发布，无法访问',
          })
          return
        }

        setSurvey(loadedSurvey)

        // 初始化答案对象
        const initialAnswers: Record<string, any> = {}
        loadedSurvey.questions.forEach((question) => {
          if (question.type === 'checkbox') {
            initialAnswers[question.id] = []
          } else {
            initialAnswers[question.id] = null
          }
        })

        setAnswers(initialAnswers)
        setIsLoading(false)
      } catch (error) {
        console.error('加载问卷失败:', error)
        toast('加载失败', {
          description: '加载问卷时出现错误',
        })
      }
    }, 1000)
  }, [params.id])

  // 处理答案变更
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))

    // 清除错误
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  // 处理单选题变更
  const handleRadioChange = (questionId: string, value: string) => {
    handleAnswerChange(questionId, value)
  }

  // 处理多选题变更
  const handleCheckboxChange = (questionId: string, value: string, checked: boolean) => {
    setAnswers((prev) => {
      const currentValues = [...(prev[questionId] || [])]

      if (checked) {
        if (!currentValues.includes(value)) {
          currentValues.push(value)
        }
      } else {
        const index = currentValues.indexOf(value)
        if (index !== -1) {
          currentValues.splice(index, 1)
        }
      }

      return {
        ...prev,
        [questionId]: currentValues,
      }
    })

    // 清除错误
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  // 验证答案
  const validateAnswers = () => {
    if (!survey) return false

    const newErrors: Record<string, string> = {}
    let isValid = true

    survey.questions.forEach((question) => {
      // 跳过分节标题
      if (question.type === 'section') return

      const answer = answers[question.id]

      // 必填验证
      if (question.required) {
        if (
          answer === null ||
          answer === undefined ||
          answer === '' ||
          (Array.isArray(answer) && answer.length === 0)
        ) {
          newErrors[question.id] = '此问题为必填项'
          isValid = false
          return
        }
      }

      // 如果没有回答，跳过其他验证
      if (
        answer === null ||
        answer === undefined ||
        answer === '' ||
        (Array.isArray(answer) && answer.length === 0)
      ) {
        return
      }

      // 特定类型验证
      if (question.validationType) {
        switch (question.validationType) {
          case 'email':
            if (!validateEmail(answer)) {
              newErrors[question.id] = question.validationMessage || '请输入有效的电子邮箱地址'
              isValid = false
            }
            break
          case 'phone':
            if (!validatePhone(answer)) {
              newErrors[question.id] = question.validationMessage || '请输入有效的电话号码'
              isValid = false
            }
            break
          case 'url':
            if (!validateUrl(answer)) {
              newErrors[question.id] = question.validationMessage || '请输入有效的网址'
              isValid = false
            }
            break
          case 'number':
            if (isNaN(Number(answer))) {
              newErrors[question.id] = question.validationMessage || '请输入有效的数字'
              isValid = false
            }
            break
          case 'regex':
            if (question.validationRegex) {
              try {
                const regex = new RegExp(question.validationRegex)
                if (!regex.test(String(answer))) {
                  newErrors[question.id] = question.validationMessage || '输入格式不正确'
                  isValid = false
                }
              } catch (error) {
                console.error('Invalid regex:', error)
              }
            }
            break
        }
      }

      // 文本长度验证
      if (question.type === 'text') {
        if (question.minLength && String(answer).length < question.minLength) {
          newErrors[question.id] = `最少需要 ${question.minLength} 个字符`
          isValid = false
        }
        if (question.maxLength && String(answer).length > question.maxLength) {
          newErrors[question.id] = `最多允许 ${question.maxLength} 个字符`
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  // 提交问卷
  const handleSubmit = async () => {
    if (!survey) return

    if (!validateAnswers()) {
      // 滚动到第一个错误
      const firstErrorId = Object.keys(errors)[0]
      if (firstErrorId) {
        const element = document.getElementById(firstErrorId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }

    setIsSubmitting(true)

    try {
      // 准备提交数据
      const submissionData = {
        surveyId: survey.id,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
        createdAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }

      // 模拟API提交
      // 在实际应用中，这里应该调用API提交问卷答案
      console.log('提交问卷答案:', submissionData)

      // 存储到localStorage（仅用于演示）
      const responsesKey = `survey_responses_${survey.id}`
      const existingResponses = getFromLocalStorage<any[]>(responsesKey, [])
      existingResponses.push(submissionData)
      localStorage.setItem(responsesKey, JSON.stringify(existingResponses))

      // 重定向到感谢页面
      setRedirectToThanks(true)
    } catch (error) {
      console.error('提交问卷失败:', error)
      toast('提交失败', {
        description: '提交问卷时出现错误，请重试',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 渲染问题
  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-2">
            {question.multiline ? (
              <Textarea
                id={question.id}
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder={question.placeholder}
                rows={5}
                className={errors[question.id] ? 'border-destructive' : ''}
              />
            ) : (
              <Input
                id={question.id}
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder={question.placeholder}
                className={errors[question.id] ? 'border-destructive' : ''}
              />
            )}
          </div>
        )
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${question.id}-${index}`}
                  name={question.id}
                  value={option.value || option.text}
                  checked={answers[question.id] === (option.value || option.text)}
                  onChange={() => handleRadioChange(question.id, option.value || option.text)}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor={`${question.id}-${index}`} className="text-sm cursor-pointer">
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        )
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${question.id}-${index}`}
                  value={option.value || option.text}
                  checked={(answers[question.id] || []).includes(option.value || option.text)}
                  onChange={(e) =>
                    handleCheckboxChange(question.id, option.value || option.text, e.target.checked)
                  }
                  className="h-4 w-4 text-primary rounded"
                />
                <label htmlFor={`${question.id}-${index}`} className="text-sm cursor-pointer">
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        )
      case 'dropdown':
        return (
          <div className="space-y-2">
            <select
              id={question.id}
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors[question.id] ? 'border-destructive' : 'border-input'
              }`}
            >
              <option value="">请选择...</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option.value || option.text}>
                  {option.text}
                </option>
              ))}
            </select>
          </div>
        )
      case 'rating':
        return (
          <div className="space-y-2">
            <div className="flex space-x-2">
              {Array.from({ length: question.maxRating || 5 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAnswerChange(question.id, index + 1)}
                  className={`w-10 h-10 rounded-md flex items-center justify-center border ${
                    answers[question.id] === index + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )
      case 'date':
        return (
          <div className="space-y-2">
            <Input
              id={question.id}
              type="date"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              min={question.minDate}
              max={question.maxDate}
              className={errors[question.id] ? 'border-destructive' : ''}
            />
          </div>
        )
      case 'file':
        return (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-4 text-center">
              <p className="text-sm text-muted-foreground">点击或拖拽文件到此处上传</p>
              <input
                type="file"
                id={question.id}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleAnswerChange(question.id, e.target.files[0].name)
                  }
                }}
                accept={question.fileTypes}
                multiple={question.maxFiles && question.maxFiles > 1}
                className="hidden"
              />
              <label
                htmlFor={question.id}
                className="mt-2 inline-block px-4 py-2 bg-primary/10 text-primary rounded-md text-sm cursor-pointer"
              >
                选择文件
              </label>
              {answers[question.id] && <p className="mt-2 text-sm">{answers[question.id]}</p>}
            </div>
          </div>
        )
      case 'section':
        return null
      default:
        return (
          <div className="text-sm text-muted-foreground">不支持的问题类型: {question.type}</div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载问卷中...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>问卷不存在</CardTitle>
            <CardDescription>您访问的问卷不存在或已被删除</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/')} className="w-full">
              返回首页
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <FileText className="h-6 w-6" />
            <span>问卷星</span>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-3xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{survey.title}</CardTitle>
            {survey.description && <CardDescription>{survey.description}</CardDescription>}
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {survey.questions.map((question, index) =>
            question.type === 'section' ? (
              <div key={question.id} className="mt-8 mb-4">
                <h3 className="text-xl font-medium">{question.title}</h3>
                {question.description && (
                  <p className="text-muted-foreground mt-1">{question.description}</p>
                )}
                <Separator className="mt-4" />
              </div>
            ) : (
              <Card
                key={question.id}
                id={question.id}
                className={errors[question.id] ? 'border-destructive' : ''}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-1">
                    <CardTitle className="text-base">
                      {question.title}
                      {question.required && <span className="text-destructive ml-1">*</span>}
                    </CardTitle>
                  </div>
                  {question.description && (
                    <CardDescription>{question.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {renderQuestion(question)}
                  {errors[question.id] && (
                    <p className="text-destructive text-sm mt-2">{errors[question.id]}</p>
                  )}
                </CardContent>
              </Card>
            ),
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-1">
            {isSubmitting ? '提交中...' : '提交问卷'}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </main>
    </div>
  )
}
