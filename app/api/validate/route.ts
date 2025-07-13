import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { account, password } = await request.json()
    // 获取用户信息
    const user = await prisma.user.findFirst({
      where: {
        account: account,
        password: password,
      }
    })
    return NextResponse.json(
      user,
      { status: 200 }
    )
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET 方法用于健康检查
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'auth-validation',
    timestamp: new Date().toISOString()
  })
}