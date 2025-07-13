import { NextRequest, NextResponse } from 'next/server'
import { healthCheckAPI } from '@/lib/auth-api'

/**
 * 健康检查 API
 * 监控系统各个组件的状态
 */
export async function GET(request: NextRequest) {
    const startTime = Date.now()

    try {
        // 检查认证API状态
        const baseUrl = request.nextUrl.origin || 'http://localhost:3000'
        const authApiHealthy = await healthCheckAPI(baseUrl)

        const response = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            services: {
                auth: {
                    status: authApiHealthy ? 'healthy' : 'unhealthy',
                    endpoint: `${baseUrl}/api/auth/validate`
                }
            },
            environment: {
                nodeEnv: process.env.NODE_ENV || 'development',
                redisUrl: process.env.REDIS_URL ? 'configured' : 'not-configured'
            }
        }

        const statusCode = authApiHealthy ? 200 : 503
        const responseTime = Date.now() - startTime

        return NextResponse.json(response, {
            status: statusCode,
            headers: {
                'X-Response-Time': `${responseTime}ms`
            }
        })

    } catch (error) {
        console.error('Health check error:', error)

        return NextResponse.json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
            services: {
                auth: {
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            }
        }, { status: 500 })
    }
} 