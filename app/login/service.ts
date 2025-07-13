'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerTRPCClient } from '@/lib/trpc-server'

// 登录函数 - 使用 tRPC 客户端
export async function login(account: string, password: string) {
  try {
    const client = createServerTRPCClient()

    // 使用 tRPC 客户端调用登录
    const result = await client.Login.mutate({
      account,
      password,
    })

    const { user, token } = result

    // 将 token 存储到 cookie 中（兼容 SSR）
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7天
    })

    redirect('/dashboard')
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}

// 登出函数
export async function logout() {
  try {
    // 调用 tRPC 登出接口
    await fetch('/api/trpc/Logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 清除 cookie
    const cookieStore = await cookies()
    cookieStore.delete('session')
  } catch (error) {
    console.error('登出失败:', error)
  }
}
