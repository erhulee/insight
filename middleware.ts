import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from './lib/session'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value
  try {
    const decoded: any = await decrypt(token)
    const newHeaders = new Headers(request.headers)
    newHeaders.set('x-user-id', decoded.userId)
    return NextResponse.next({
      request: {
        headers: newHeaders,
      },
    })
  } catch (error) {
    console.log('middle ware errpor:', request.url)
    // return NextResponse.redirect(new URL('/login', request.url));
  }
}

// 可以指定 Middleware 应用的匹配路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，可排除 `/api`, `/static`, `/favicon.ico` 等路径
     */
    '/((?!api|static|favicon.ico).*)',
  ],
}
