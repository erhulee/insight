import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from './lib/session'

export async function middleware(request: NextRequest) {
  // 从 cookie 获取 token（兼容 SSR）
  let token = request.cookies.get('session')?.value

  // 如果没有 cookie token，尝试从 header 获取
  if (!token) {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '')
    }
  }

  try {
    if (token) {
      const decoded: any = await decrypt(token)
      if (decoded && decoded.userId) {
        const newHeaders = new Headers(request.headers)
        newHeaders.set('x-user-id', decoded.userId)
        return NextResponse.next({
          request: {
            headers: newHeaders,
          },
        })
      }
    }
  } catch (error) {
    console.log('middleware error:', request.url, error)
    // 可以选择重定向到登录页面
    // return NextResponse.redirect(new URL('/login', request.url));
  }

  // 如果没有有效 token，继续请求（让具体页面处理鉴权）
  return NextResponse.next()
}

// 可以指定 Middleware 应用的匹配路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，可排除 `/api`, `/static`, `/favicon.ico` 等路径
     */
    '/((?!api|static|favicon.ico|_next).*)',
  ],
}
