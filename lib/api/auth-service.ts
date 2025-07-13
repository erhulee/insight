/**
 * 认证服务客户端
 * 提供登录、注册、登出和获取用户信息的API调用
 */

export interface LoginRequest {
    account: string
    password: string
}

export interface RegisterRequest {
    account: string
    password: string
    username: string
}

export interface User {
    id: string
    account: string
    username: string
    createdAt?: string
}

export interface AuthResponse {
    success: boolean
    user?: User
    token?: string
    error?: string
}

/**
 * 登录
 * @param data 登录信息
 * @returns 认证响应
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        const result = await response.json()
        if (!response.ok) {
            return {
                success: false,
                error: result.error || '登录失败',
            }
        }
        return result
    } catch (error) {
        console.error('Login error:', error)
        return {
            success: false,
            error: '网络错误',
        }
    }
}

/**
 * 注册
 * @param data 注册信息
 * @returns 认证响应
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
    try {
        const response = await fetch('/api/auth', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!response.ok) {
            return {
                success: false,
                error: result.error || '注册失败',
            }
        }

        return result
    } catch (error) {
        console.error('Register error:', error)
        return {
            success: false,
            error: '网络错误',
        }
    }
}

/**
 * 登出
 * @returns 登出响应
 */
export async function logout(): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch('/api/auth', {
            method: 'DELETE',
        })

        const result = await response.json()

        if (!response.ok) {
            return {
                success: false,
                error: result.error || '登出失败',
            }
        }

        return result
    } catch (error) {
        console.error('Logout error:', error)
        return {
            success: false,
            error: '网络错误',
        }
    }
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export async function getCurrentUser(): Promise<AuthResponse> {
    try {
        const response = await fetch('/api/auth', {
            method: 'GET',
        })

        const result = await response.json()

        if (!response.ok) {
            return {
                success: false,
                error: result.error || '获取用户信息失败',
            }
        }

        return result
    } catch (error) {
        console.error('Get current user error:', error)
        return {
            success: false,
            error: '网络错误',
        }
    }
}

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
    try {
        const response = await getCurrentUser()
        return response.success
    } catch (error) {
        return false
    }
} 