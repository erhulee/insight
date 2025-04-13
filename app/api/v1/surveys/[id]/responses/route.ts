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

// 获取问卷回复列表
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

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const sort = searchParams.get("sort") || "created_at"
    const order = searchParams.get("order") || "desc"

    // 从存储中获取问卷回复
    const responsesKey = `survey_responses_${id}`
    const responsesData = localStorage.getItem(responsesKey)
    const allResponses = responsesData ? JSON.parse(responsesData) : []

    // 排序
    allResponses.sort((a: any, b: any) => {
      const aValue = a[sort as keyof typeof a]
      const bValue = b[sort as keyof typeof b]

      if (order === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // 分页
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedResponses = allResponses.slice(startIndex, endIndex)

    // 返回结果
    return NextResponse.json({
      data: paginatedResponses,
      meta: {
        current_page: page,
        total_pages: Math.ceil(allResponses.length / limit),
        total_count: allResponses.length,
        limit: limit,
      },
    })
  } catch (error) {
    console.error("Error fetching responses:", error)
    return NextResponse.json(
      {
        error: {
          code: "server_error",
          message: "获取问卷回复失败",
        },
      },
      { status: 500 },
    )
  }
}

// 提交问卷回复
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // 检查问卷是否已发布
    if (!survey.published) {
      return NextResponse.json(
        {
          error: {
            code: "validation_error",
            message: "问卷未发布，无法提交回复",
          },
        },
        { status: 400 },
      )
    }

    // 解析请求体
    const body = await request.json()

    // 验证必填字段
    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json(
        {
          error: {
            code: "validation_error",
            message: "回复必须包含answers字段，且为数组",
          },
        },
        { status: 400 },
      )
    }

    // 创建新回复
    const newResponse = {
      id: `response-${Date.now()}`,
      survey_id: id,
      answers: body.answers,
      created_at: new Date().toISOString(),
      user_agent: request.headers.get("user-agent") || "",
      ip_address: request.headers.get("x-forwarded-for") || request.ip || "",
      email: body.email || null,
    }

    // 保存到存储
    const responsesKey = `survey_responses_${id}`
    const responsesData = localStorage.getItem(responsesKey)
    const responses = responsesData ? JSON.parse(responsesData) : []
    responses.push(newResponse)
    localStorage.setItem(responsesKey, JSON.stringify(responses))

    // 返回结果
    return NextResponse.json({ data: newResponse }, { status: 201 })
  } catch (error) {
    console.error("Error submitting response:", error)
    return NextResponse.json(
      {
        error: {
          code: "server_error",
          message: "提交问卷回复失败",
        },
      },
      { status: 500 },
    )
  }
}
