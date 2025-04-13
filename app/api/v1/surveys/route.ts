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

// 获取问卷列表
export async function GET(request: NextRequest) {
  // 验证API密钥
  const auth = await validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  // 获取查询参数
  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const status = searchParams.get("status") || "all"
  const sort = searchParams.get("sort") || "updated_at"
  const order = searchParams.get("order") || "desc"

  try {
    // 从存储中获取问卷
    const allSurveys = []

    // 遍历localStorage中的所有问卷
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("survey_")) {
        try {
          const survey = JSON.parse(localStorage.getItem(key) || "")

          // 根据状态筛选
          if (
            status === "all" ||
            (status === "published" && survey.published) ||
            (status === "draft" && !survey.published)
          ) {
            allSurveys.push({
              id: survey.id,
              title: survey.title,
              description: survey.description,
              questions_count: survey.questions?.length || 0,
              responses_count: 0, // 在实际应用中，这应该从响应存储中获取
              created_at: survey.createdAt,
              updated_at: survey.updatedAt,
              published: survey.published,
            })
          }
        } catch (error) {
          console.error("Error parsing survey:", error)
        }
      }
    }

    // 排序
    allSurveys.sort((a, b) => {
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
    const paginatedSurveys = allSurveys.slice(startIndex, endIndex)

    // 返回结果
    return NextResponse.json({
      data: paginatedSurveys,
      meta: {
        current_page: page,
        total_pages: Math.ceil(allSurveys.length / limit),
        total_count: allSurveys.length,
        limit: limit,
      },
    })
  } catch (error) {
    console.error("Error fetching surveys:", error)
    return NextResponse.json(
      {
        error: {
          code: "server_error",
          message: "获取问卷列表失败",
        },
      },
      { status: 500 },
    )
  }
}

// 创建问卷
export async function POST(request: NextRequest) {
  // 验证API密钥
  const auth = await validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    // 解析请求体
    const body = await request.json()

    // 验证必填字段
    if (!body.title) {
      return NextResponse.json(
        {
          error: {
            code: "validation_error",
            message: "问卷标题是必填项",
          },
        },
        { status: 400 },
      )
    }

    // 创建新问卷
    const newSurvey = {
      id: `survey-${Date.now()}`,
      title: body.title,
      description: body.description || "",
      questions: body.questions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: body.published || false,
      settings: body.settings || {},
      theme: body.theme || {},
    }

    // 保存到存储
    localStorage.setItem(`survey_${newSurvey.id}`, JSON.stringify(newSurvey))

    // 返回结果
    return NextResponse.json({ data: newSurvey }, { status: 201 })
  } catch (error) {
    console.error("Error creating survey:", error)
    return NextResponse.json(
      {
        error: {
          code: "server_error",
          message: "创建问卷失败",
        },
      },
      { status: 500 },
    )
  }
}
