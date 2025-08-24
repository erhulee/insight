/**
 * 认证相关的工具函数
 */

/**
 * 获取回调URL，如果没有则返回默认路径
 * @param searchParams URL搜索参数
 * @param defaultPath 默认路径
 * @returns 回调URL
 */
export function getCallbackUrl(searchParams: URLSearchParams, defaultPath: string = '/dashboard'): string {
    const callbackUrl = searchParams.get('callbackUrl')

    // 验证回调URL的安全性，防止开放重定向攻击
    if (callbackUrl && isValidCallbackUrl(callbackUrl)) {
        return callbackUrl
    }

    return defaultPath
}

/**
 * 验证回调URL是否安全
 * @param url 要验证的URL
 * @returns 是否安全
 */
export function isValidCallbackUrl(url: string): boolean {
    try {
        // 检查是否是相对路径
        if (url.startsWith('/')) {
            // 检查是否包含危险字符或路径遍历
            if (url.includes('..') || url.includes('//')) {
                return false
            }
            return true
        }

        // 检查是否是完整的URL
        const parsedUrl = new URL(url)

        // 只允许同源重定向
        if (typeof window !== 'undefined') {
            return parsedUrl.origin === window.location.origin
        }

        return false
    } catch {
        return false
    }
}

/**
 * 构建带有回调URL的链接
 * @param basePath 基础路径
 * @param callbackUrl 回调URL
 * @returns 完整的链接
 */
export function buildCallbackUrl(basePath: string, callbackUrl?: string): string {
    if (!callbackUrl) {
        return basePath
    }

    const separator = basePath.includes('?') ? '&' : '?'
    return `${basePath}${separator}callbackUrl=${encodeURIComponent(callbackUrl)}`
}

/**
 * 处理认证成功后的跳转
 * @param router Next.js路由对象
 * @param callbackUrl 回调URL
 * @param defaultPath 默认路径
 */
export function handleAuthSuccess(
    router: any,
    callbackUrl?: string,
    defaultPath: string = '/dashboard'
): void {
    const targetUrl = callbackUrl && isValidCallbackUrl(callbackUrl) ? callbackUrl : defaultPath
    router.push(targetUrl)
}

/**
 * 获取当前页面的回调URL参数
 * @param pathname 当前路径
 * @returns 回调URL参数
 */
export function getCurrentCallbackUrl(pathname: string): string {
    // 如果当前页面是登录或注册页面，不需要回调
    if (pathname === '/login' || pathname === '/register') {
        return '/dashboard'
    }

    return pathname
}
