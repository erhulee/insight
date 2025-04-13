import { type NextRequest, NextResponse } from "next/server"
import { getFromLocalStorage } from "@/lib/utils"

// 验证API密钥
async function validateApiKey(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      valid: false,
      error: {
        code: "unauthorized",
        message: "未提供API密钥",
      },
    }
  }

  const apiKey = authHeader.replace("Bearer ", "")

  // 从存储中获取API密钥
  const storedKeys = getFromLocalStorage("api_keys", [])
  const validKey = storedKeys.find((key) => key.key === apiKey)

  if (!validKey) {
    return {
      valid: false,
      error: {
        code: "unauthorized",
        message: "无效的API密钥",
      },
    }
  }

  // 更新最后使用时间
  validKey.lastUsed = new Date().toISOString()
  localStorage.setItem("api_keys", JSON.stringify(storedKeys))

  return { valid: true, userId: validKey.id }
}

// 获取问卷统计数据
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // 验证API密钥
  const auth = await validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  const { id } = params

  try {
    // 检查问卷是否存在
    const surveyKey = `survey_${id}`
    const surveyData = localStorage.getItem(surveyKey)

    if (!surveyData) {
      return NextResponse.json(
        {
          error: {
            code: "not_found",
            message: "问卷不存在",
          },
        },
        { status: 404 },
      )
    }

    const survey = JSON.parse(surveyData)

    // 获取问卷回复
    const responsesKey = `survey_responses_${id}`
    const responsesData = localStorage.getItem(responsesKey)
    const responses = responsesData ? JSON.parse(responsesData) : []

    // 计算统计数据
    const totalResponses = responses.length
    const completionRate = totalResponses > 0 ? 98.5 : 0 // 模拟数据
    const averageTime = "3:42" // 模拟数据

    // 计算问题统计数据
    const questionStats = survey.questions.map((question: any) => {
      const questionStat: any = {
        question_id: question.id,
        question_title: question.title,
        question_type: question.type,
        total_answers: 0,
      }

      // 获取该问题的所有回答
      const answers = responses
        .map((response: any) => response.answers.find((a: any) => a.question_id === question.id))
        .filter(Boolean)

      questionStat.total_answers = answers.length

      // 根据问题类型计算统计数据
      if (question.type === "radio" || question.type === "checkbox") {
        // 选项统计
        const optionCounts: Record<string, number> = {}

        answers.forEach((answer: any) => {
          const values = Array.isArray(answer.value) ? answer.value : [answer.value]

          values.forEach((value: string) => {
            optionCounts[value] = (optionCounts[value] || 0) + 1
          })
        })

        questionStat.stats = question.options.map((option: any) => {
          const optionValue = option.value || option.text
          const count = optionCounts[optionValue] || 0
          const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0

          return {
            option: option.text,
            count,
            percentage: Number.parseFloat(percentage.toFixed(1)),
          }
        })
      } else if (question.type === "rating") {
        // 评分统计
        const ratings = answers.map((answer: any) => Number.parseInt(answer.value)).filter((v: any) => !isNaN(v))

        const min = ratings.length > 0 ? Math.min(...ratings) : 0
        const max = ratings.length > 0 ? Math.max(...ratings) : 0
        const sum = ratings.reduce((acc: number, val: number) => acc + val, 0)
        const average = ratings.length > 0 ? Number.parseFloat((sum / ratings.length).toFixed(1)) : 0

        questionStat.stats = { min, max, average }
      } else if (question.type === "text") {
        // 文本回答列表
        questionStat.stats = answers.map((answer: any) => answer.value).filter(Boolean)
      }

      return questionStat
    })

    // 返回结果
    return NextResponse.json({
      data: {
        total_responses: totalResponses,
        completion_rate: completionRate,
        average_time: averageTime,
        question_stats: questionStats,
      },
    })
  } catch (error) {
    console.error("Error fetching survey stats:", error)
    return NextResponse.json(
      {
        error: {
          code: "server_error",
          message: "获取问卷统计数据失败",
        },
      },
      { status: 500 },
    )
  }
}
