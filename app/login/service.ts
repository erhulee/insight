'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// 登录函数 - 使用 tRPC 客户端
export async function login(account: string, password: string) {
  try {
    const response = await fetch('/api/trpc/Login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          account,
          password,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('登录失败')
    }

    const result = await response.json()
    const { user, token } = result.result.data

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

// 注册函数
export async function create(account: string, password: string, username: string) {
  try {
    const response = await fetch('/api/trpc/CreateUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          account,
          password,
          username,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('注册失败')
    }

    // 注册成功后自动登录
    await login(account, password)
  } catch (error) {
    console.error('注册失败:', error)
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
