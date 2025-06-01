// API相关工具函数

/**
 * 验证API密钥
 * @param apiKey API密钥
 * @returns 验证结果
 */
export async function validateApiKey(
  apiKey: string,
): Promise<{ valid: boolean; userId?: string; error?: { code: string; message: string } }> {
  if (!apiKey) {
    return {
      valid: false,
      error: {
        code: 'unauthorized',
        message: '未提供API密钥',
      },
    }
  }

  try {
    // 从存储中获取API密钥
    const storedKeysJson = localStorage.getItem('api_keys')
    if (!storedKeysJson) {
      return {
        valid: false,
        error: {
          code: 'unauthorized',
          message: '无效的API密钥',
        },
      }
    }

    const storedKeys = JSON.parse(storedKeysJson)
    const validKey = storedKeys.find((key: any) => key.key === apiKey)

    if (!validKey) {
      return {
        valid: false,
        error: {
          code: 'unauthorized',
          message: '无效的API密钥',
        },
      }
    }

    // 更新最后使用时间
    validKey.lastUsed = new Date().toISOString()
    localStorage.setItem('api_keys', JSON.stringify(storedKeys))

    return { valid: true, userId: validKey.id }
  } catch (error) {
    console.error('验证API密钥失败:', error)
    return {
      valid: false,
      error: {
        code: 'server_error',
        message: '验证API密钥时出错',
      },
    }
  }
}

/**
 * 生成API密钥
 * @returns 生成的API密钥
 */
export function generateApiKey(): string {
  // 生成一个随机的API密钥
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = ''
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

/**
 * 解析OpenAPI规范
 * @param content 规范内容
 * @returns 解析结果
 */
export function parseOpenApiSpec(content: string): {
  valid: boolean
  spec?: any
  errors?: string[]
} {
  try {
    // 尝试解析JSON
    let spec
    try {
      spec = JSON.parse(content)
    } catch {
      // 如果不是JSON，假设是YAML
      // 在实际应用中，这里应该使用YAML解析库
      return {
        valid: false,
        errors: ['无法解析规范内容。请确保内容是有效的JSON或YAML格式。'],
      }
    }

    // 验证基本结构
    const errors = []

    if (!spec.openapi) {
      errors.push("缺少'openapi'字段。规范必须包含OpenAPI版本。")
    }

    if (!spec.info) {
      errors.push("缺少'info'字段。规范必须包含API信息。")
    } else {
      if (!spec.info.title) {
        errors.push("缺少'info.title'字段。规范必须包含API标题。")
      }
      if (!spec.info.version) {
        errors.push("缺少'info.version'字段。规范必须包含API版本。")
      }
    }

    if (!spec.paths) {
      errors.push("缺少'paths'字段。规范必须包含API路径。")
    }

    if (errors.length > 0) {
      return { valid: false, errors }
    }

    return { valid: true, spec }
  } catch (error) {
    console.error('解析OpenAPI规范失败:', error)
    return {
      valid: false,
      errors: ['解析规范时出错。请确保内容是有效的OpenAPI规范。'],
    }
  }
}

/**
 * 从OpenAPI规范生成问卷
 * @param spec OpenAPI规范
 * @returns 生成的问卷
 */
export function generateSurveyFromSpec(spec: any): any {
  // 这里应该根据OpenAPI规范生成问卷
  // 这是一个简化的示例
  return {
    title: spec.info.title || '问卷',
    description: spec.info.description || '',
    questions: [
      {
        id: 'q1',
        type: 'text',
        title: '示例问题',
        required: true,
      },
    ],
  }
}
