'use client'

import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface WithAuthOptions {
    redirectTo?: string
    fallback?: React.ReactNode
    requireAuth?: boolean
}

export function withAuth<P extends object>(
    Component: React.ComponentType<P>,
    options: WithAuthOptions = {}
) {
    const { redirectTo = '/login', fallback, requireAuth = true } = options

    function AuthenticatedComponent(props: P) {
        const { isAuthenticated, isLoading } = useAuth({
            requireAuth,
            redirectTo
        })
        const router = useRouter()

        useEffect(() => {
            if (!isLoading && !isAuthenticated && requireAuth) {
                const currentPath = window.location.pathname
                const callbackUrl = encodeURIComponent(currentPath)
                router.push(`${redirectTo}?callbackUrl=${callbackUrl}`)
            }
        }, [isAuthenticated, isLoading, requireAuth, redirectTo, router])

        // 加载状态
        if (isLoading) {
            return fallback || (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            )
        }

        // 需要认证但未认证
        if (requireAuth && !isAuthenticated) {
            return null // 会触发重定向
        }

        // 已认证或不需要认证，渲染组件
        return <Component {...props} />
    }

    // 设置显示名称
    AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`

    return AuthenticatedComponent
}

// 可选认证 HOC - 如果已登录则显示内容，否则显示替代内容
export function withOptionalAuth<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ReactNode
) {
    function OptionalAuthComponent(props: P) {
        const { isAuthenticated, isLoading } = useAuth()
        console.log('isAuthenticated', isAuthenticated)

        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
            )
        }

        if (!isAuthenticated) {
            return fallback || null
        }

        return <Component {...props} />
    }

    OptionalAuthComponent.displayName = `withOptionalAuth(${Component.displayName || Component.name})`

    return OptionalAuthComponent
}
