import { NextRequest, NextResponse } from 'next/server'
import {
  getMiddlewareConfig,
  isPathExcluded,
  isPathProtected,
  formatLogMessage,
} from './lib/middleware-config'
import { validateTokenAPI, type UserPayload } from './lib/auth-api'

// 获取配置
const middlewareConfig = getMiddlewareConfig()

/**
 * 从请求中提取认证令牌
 * @param request NextRequest 对象
 * @returns 提取到的令牌或 null
 */
function extractToken(request: NextRequest): string | null {
  // 优先从 cookie 获取 token（兼容 SSR）
  let token = request.cookies.get(middlewareConfig.sessionCookieName)?.value

  // 如果没有 cookie token，尝试从 header 获取
  if (!token) {
    const authHeader = request.headers.get('authorization') ||
      request.headers.get('Authorization') ||
      request.headers.get(middlewareConfig.authHeaders.token)

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '')
    } else if (authHeader && !authHeader.startsWith('Bearer ')) {
      // 兼容不带 Bearer 前缀的 token
      token = authHeader
    }
  }

  return token || null
}

/**
 * 创建带有用户信息的请求头
 * @param request 原始请求
 * @param userId 用户ID
 * @returns 新的请求对象
 */
function createAuthenticatedRequest(request: NextRequest, userId: string): NextResponse {
  const newHeaders = new Headers(request.headers)
  newHeaders.set(middlewareConfig.authHeaders.userId, userId)
  newHeaders.set(middlewareConfig.authHeaders.authenticated, 'true')

  return NextResponse.next({
    request: {
      headers: newHeaders,
    },
  })
}

/**
 * 记录中间件日志
 * @param level 日志级别
 * @param message 消息内容
 * @param data 额外数据
 */
function logMiddleware(level: string, message: string, data?: any): void {
  if (middlewareConfig.enableLogging) {
    const logMessage = formatLogMessage(level, message, data)
    console.log(logMessage)
  }
}

/**
 * Next.js 中间件函数
 * 处理认证和用户信息注入
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 记录请求处理
  logMiddleware('info', `Processing request`, {
    method: request.method,
    pathname,
    url: request.url
  })

  // 检查是否排除路径
  if (isPathExcluded(pathname, middlewareConfig.excludedPaths)) {
    logMiddleware('debug', `Path excluded`, { pathname })
    return NextResponse.next()
  }

  // 提取认证令牌
  const token = extractToken(request)

  // 如果没有 token，检查是否需要重定向
  if (!token) {
    logMiddleware('info', `No token found`, { pathname })

    // 如果是保护路径且配置了重定向，则重定向到登录页
    if (isPathProtected(pathname, middlewareConfig.protectedPaths) && middlewareConfig.redirectToLogin) {
      const loginUrl = new URL(middlewareConfig.loginPath, request.url)
      logMiddleware('info', `Redirecting to login`, {
        from: pathname,
        to: middlewareConfig.loginPath
      })
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  // 通过API验证令牌
  const baseUrl = request.nextUrl.origin || 'http://localhost:3000'
  const userPayload = await validateTokenAPI(token, baseUrl)

  if (userPayload) {
    logMiddleware('info', `User authenticated`, {
      userId: userPayload.userId,
      pathname
    })
    return createAuthenticatedRequest(request, userPayload.userId)
  }

  // 令牌无效时的处理
  logMiddleware('warn', `Invalid token`, { pathname })

  // 如果是保护路径且配置了重定向，则重定向到登录页
  if (isPathProtected(pathname, middlewareConfig.protectedPaths) && middlewareConfig.redirectToLogin) {
    const loginUrl = new URL(middlewareConfig.loginPath, request.url)
    logMiddleware('info', `Redirecting to login due to invalid token`, {
      from: pathname,
      to: middlewareConfig.loginPath
    })
    return NextResponse.redirect(loginUrl)
  }

  // 继续请求，让具体页面处理鉴权
  return NextResponse.next()
}

// 中间件配置
export const config = {
  matcher: [
    /*
     * 匹配所有路径，排除以下路径：
     * - /api: API 路由
     * - /static: 静态资源
     * - /favicon.ico: 网站图标
     * - /_next: Next.js 内部文件
     * - /_vercel: Vercel 部署相关
     * - /robots.txt: 搜索引擎爬虫文件
     * - /sitemap.xml: 网站地图
     * - /health: 健康检查
     * - /ping: 连通性检查
     */
    '/((?!api|static|favicon.ico|_next|_vercel|robots.txt|sitemap.xml|health|ping).*)',
  ],
}
