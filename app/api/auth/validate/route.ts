import { NextRequest, NextResponse } from 'next/server'
import { createServerTRPCClient } from '@/lib/trpc-server'

/**
 * 认证验证 API
 * 供中间件调用，验证 token 并返回用户信息
 */
export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            )
        }

        // 使用 tRPC 客户端验证 token
        const client = createServerTRPCClient()

        // 调用专门的 token 验证方法
        const userInfo = await client.ValidateToken.query({ token })

        if (!userInfo) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            success: true,
            user: {
                userId: userInfo.id,
                username: userInfo.username,
                account: userInfo.account
            }
        })

    } catch (error) {
        console.error('Auth validation error:', error)
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
    return NextResponse.json({ status: 'ok', service: 'auth-validation' })
} 