/**
 * 认证API客户端
 * 供中间件调用，避免直接使用Redis和JWT
 */

export interface AuthResponse {
    success: boolean
    user?: {
        userId: string
    }
    error?: string
}

export interface UserPayload {
    userId: string
    [key: string]: any
}

/**
 * 验证token的API调用
 * @param token 认证令牌
 * @param baseUrl API基础URL
 * @returns 用户信息或null
 */
export async function validateTokenAPI(
    token: string,
    baseUrl: string = 'http://localhost:3000'
): Promise<UserPayload | null> {
    try {
        const apiUrl = `${baseUrl}/api/auth/validate`
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        })

        if (!response.ok) {
            console.error(`Auth API error: ${response.status} ${response.statusText}`)
            return null
        }

        const data: AuthResponse = await response.json()

        if (data.success && data.user) {
            return data.user as UserPayload
        }

        return null
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Token validation API error:', errorMessage)
        return null
    }
}

/**
 * 健康检查API调用
 * @param baseUrl API基础URL
 * @returns 健康状态
 */
export async function healthCheckAPI(
    baseUrl: string = 'http://localhost:3000'
): Promise<boolean> {
    try {
        const apiUrl = `${baseUrl}/api/auth/validate`
        const response = await fetch(apiUrl, { method: 'GET' })
        return response.ok
    } catch (error) {
        console.error('Health check failed:', error)
        return false
    }
} 