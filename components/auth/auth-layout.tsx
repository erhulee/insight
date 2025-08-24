'use client'

import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthLayoutProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    redirectTo?: string
}

export function AuthLayout({
    children,
    fallback,
    redirectTo = '/login'
}: AuthLayoutProps) {
    const { isAuthenticated, isLoading } = useAuth({
        requireAuth: true,
        redirectTo
    })
    const router = useRouter()

    // 如果未认证且不在加载中，重定向到登录页
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            const currentPath = window.location.pathname
            const callbackUrl = encodeURIComponent(currentPath)
            router.push(`${redirectTo}?callbackUrl=${callbackUrl}`)
        }
    }, [isAuthenticated, isLoading, redirectTo, router])

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

    // 未认证状态
    if (!isAuthenticated) {
        return null // 会触发重定向
    }

    // 已认证，渲染子组件
    return <>{children}</>
}

// 可选认证布局 - 如果已登录则显示内容，否则显示替代内容
interface OptionalAuthLayoutProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function OptionalAuthLayout({ children, fallback }: OptionalAuthLayoutProps) {
    const { isAuthenticated, isLoading } = useAuth()

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

    return <>{children}</>
}
