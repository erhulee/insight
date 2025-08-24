export interface AuthConfig {
    requireAuth: boolean
    redirectTo?: string
    roles?: string[]
}

export interface RouteConfig {
    [path: string]: AuthConfig
}

// 默认路由配置
export const DEFAULT_ROUTE_CONFIG: RouteConfig = {
    // 需要认证的路由
    '/dashboard': { requireAuth: true, redirectTo: '/login' },
    '/dashboard/create': { requireAuth: true, redirectTo: '/login' },
    '/dashboard/edit': { requireAuth: true, redirectTo: '/login' },
    '/dashboard/results': { requireAuth: true, redirectTo: '/login' },
    '/dashboard/ai-settings': { requireAuth: true, redirectTo: '/login' },
    '/dashboard/ai-test': { requireAuth: true, redirectTo: '/login' },
    '/account': { requireAuth: true, redirectTo: '/login' },

    // 不需要认证的路由
    '/': { requireAuth: false },
    '/login': { requireAuth: false },
    '/register': { requireAuth: false },
    '/survey': { requireAuth: false },
    '/templates': { requireAuth: false },
    '/demo': { requireAuth: false },
    '/developer': { requireAuth: false },
}

// 检查路径是否需要认证
export function isPathRequireAuth(path: string): boolean {
    // 精确匹配
    if (DEFAULT_ROUTE_CONFIG[path]) {
        return DEFAULT_ROUTE_CONFIG[path].requireAuth
    }

    // 前缀匹配
    for (const route in DEFAULT_ROUTE_CONFIG) {
        if (path.startsWith(route)) {
            return DEFAULT_ROUTE_CONFIG[route].requireAuth
        }
    }

    // 默认不需要认证
    return false
}

// 获取重定向路径
export function getRedirectPath(path: string): string | undefined {
    // 精确匹配
    if (DEFAULT_ROUTE_CONFIG[path]) {
        return DEFAULT_ROUTE_CONFIG[path].redirectTo
    }

    // 前缀匹配
    for (const route in DEFAULT_ROUTE_CONFIG) {
        if (path.startsWith(route)) {
            return DEFAULT_ROUTE_CONFIG[route].redirectTo
        }
    }

    return undefined
}
