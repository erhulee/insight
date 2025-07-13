/**
 * 中间件配置管理
 * 提供灵活的配置选项，支持环境变量覆盖
 */

export interface MiddlewareConfig {
    // 日志配置
    enableLogging: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'

    // 认证配置
    redirectToLogin: boolean
    loginPath: string
    sessionCookieName: string

    // 请求头配置
    authHeaders: {
        userId: string
        authenticated: string
        token: string
    }

    // 路径配置
    excludedPaths: string[]
    protectedPaths: string[]

    // 性能配置
    enableCaching: boolean
    cacheTimeout: number
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: MiddlewareConfig = {
    // 日志配置
    enableLogging: process.env.NODE_ENV === 'development',
    logLevel: (process.env.MIDDLEWARE_LOG_LEVEL as any) || 'info',

    // 认证配置
    redirectToLogin: process.env.MIDDLEWARE_REDIRECT_TO_LOGIN === 'true',
    loginPath: process.env.MIDDLEWARE_LOGIN_PATH || '/login',
    sessionCookieName: process.env.SESSION_COOKIE_NAME || 'session',

    // 请求头配置
    authHeaders: {
        userId: 'x-user-id',
        authenticated: 'x-authenticated',
        token: 'x-auth-token'
    },

    // 路径配置
    excludedPaths: [
        '/api',
        '/static',
        '/favicon.ico',
        '/_next',
        '/_vercel',
        '/robots.txt',
        '/sitemap.xml',
        '/health',
        '/ping'
    ],
    protectedPaths: [
        '/dashboard',
        '/admin',
        '/profile'
    ],

    // 性能配置
    enableCaching: process.env.MIDDLEWARE_ENABLE_CACHE === 'true',
    cacheTimeout: parseInt(process.env.MIDDLEWARE_CACHE_TIMEOUT || '300000') // 5分钟
}

/**
 * 获取中间件配置
 * @param overrides 可选的配置覆盖
 * @returns 合并后的配置
 */
export function getMiddlewareConfig(overrides?: Partial<MiddlewareConfig>): MiddlewareConfig {
    return {
        ...DEFAULT_CONFIG,
        ...overrides
    }
}

/**
 * 检查路径是否被排除
 * @param path 请求路径
 * @param excludedPaths 排除路径列表
 * @returns 是否被排除
 */
export function isPathExcluded(path: string, excludedPaths: string[]): boolean {
    return excludedPaths.some(excludedPath =>
        path.startsWith(excludedPath) || path === excludedPath
    )
}

/**
 * 检查路径是否需要保护
 * @param path 请求路径
 * @param protectedPaths 保护路径列表
 * @returns 是否需要保护
 */
export function isPathProtected(path: string, protectedPaths: string[]): boolean {
    return protectedPaths.some(protectedPath =>
        path.startsWith(protectedPath) || path === protectedPath
    )
}

/**
 * 格式化日志消息
 * @param level 日志级别
 * @param message 消息内容
 * @param data 额外数据
 * @returns 格式化的日志消息
 */
export function formatLogMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const baseMessage = `[Middleware:${level.toUpperCase()}] ${timestamp} - ${message}`

    if (data) {
        return `${baseMessage} - ${JSON.stringify(data)}`
    }

    return baseMessage
} 