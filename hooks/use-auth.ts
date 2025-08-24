'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export interface UseAuthOptions {
    requireAuth?: boolean
    redirectTo?: string
    onUnauthenticated?: () => void
}

export function useAuth(options: UseAuthOptions = {}) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    const {
        requireAuth = false,
        redirectTo = '/login',
        onUnauthenticated
    } = options

    useEffect(() => {
        if (status === 'loading') return // 还在加载中

        if (requireAuth && status === 'unauthenticated') {
            if (onUnauthenticated) {
                onUnauthenticated()
            } else {
                // 保存当前路径，登录后可以跳转回来
                const callbackUrl = encodeURIComponent(pathname)
                router.push(`${redirectTo}?callbackUrl=${callbackUrl}`)
            }
        }
    }, [status, requireAuth, redirectTo, onUnauthenticated, router, pathname])

    return {
        session,
        status,
        isAuthenticated: status === 'authenticated',
        isLoading: status === 'loading',
        user: session?.user
    }
}

// 简化的认证状态 hook
export function useAuthStatus() {
    const { data: session, status } = useSession()

    return {
        isAuthenticated: status === 'authenticated',
        isLoading: status === 'loading',
        user: session?.user
    }
}
