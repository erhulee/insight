// 认证相关的工具函数

// 存储 token 到 localStorage
export const setAuthToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', token)
    }
}

// 从 localStorage 获取 token
export const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth-token')
    }
    return null
}

// 清除 token
export const clearAuthToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token')
    }
}

// 检查是否已登录
export const isAuthenticated = (): boolean => {
    return !!getAuthToken()
}

// 获取 cookie 中的 token（SSR 兼容）
export const getCookieToken = (): string | null => {
    if (typeof document !== 'undefined') {
        const value = `; ${document.cookie}`
        const parts = value.split(`; session=`)
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null
        }
    }
    return null
}

// 获取最佳可用的 token（优先 localStorage，然后 cookie）
export const getBestToken = (): string | null => {
    return getAuthToken() || getCookieToken()
} 