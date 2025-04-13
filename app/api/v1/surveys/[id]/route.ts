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

// 获取单个问卷
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // 验证API密钥
  const auth = await validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  const { id } = params

  try {
    // 从存储中获取问卷
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

    // 返回结果
    return NextResponse.json({ data: survey })
  } catch (error) {
    console.error("Error fetching survey:", error)
    return NextResponse.json(
      {
        error: {
          code: "server_error",
          message: "获取问卷失败",
        },
      },
      { status: 500 },
    )
  }
}

// 更新问卷
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // 验证API密钥
  const auth = await validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  const { id } = params

  try {
    // 从存储中获取问卷
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

    // 解析请求体
    const body = await request.json()

    // 更新问卷
    const updatedSurvey = {
      ...survey,
      title: body.title !== undefined ? body.title : survey.title,
      description: body.description !== undefined ? body.description : survey.description,
      questions: body.questions !== undefined ? body.questions : survey.questions,
      settings: body.settings !== undefined ? body.settings : survey.settings,
      theme: body.theme !== undefined ? body.theme : survey.theme,
      published: body.published !== undefined ? body.published : survey.published,
      updatedAt: new Date().toISOString(),
    }

    // 保存到存储
    localStorage.setItem(surveyKey, JSON.stringify(updatedSurvey))

    // 返回结果
    return NextResponse.json({ data: updatedSurvey })
  } catch (error) {
    console.error("Error updating survey:", error)
    return NextResponse.json(
      {
        error: {
          code: "server_error",
          message: "更新问卷失败",
        },
      },
      { status: 500 },
    )
  }
}

// 删除问卷
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // 验证API密钥
  const auth = await validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  const { id } = params

  try {
    // 从存储中获取问卷
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

    // 删除问卷
    localStorage.removeItem(surveyKey)

    // 返回结果
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting survey:", error)
    return NextResponse.json(
      {
        error: {
          code: "server_error",
          message: "删除问卷失败",
        },
      },
      { status: 500 },
    )
  }
}
