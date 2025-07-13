import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { type AppRouter } from '@/server'

/**
 * 创建服务端 tRPC 客户端
 * 用于在服务端组件中调用 tRPC 接口
 */
export function createServerTRPCClient() {
    return createTRPCClient<AppRouter>({
        links: [
            httpBatchLink({
                url: process.env.TRPC_URL ?? 'http://localhost:3000/api/trpc',
            }),
        ],
    })
}

/**
 * 创建带认证的服务端 tRPC 客户端
 * @param token 认证令牌
 */
export function createAuthenticatedServerTRPCClient(token: string) {
    return createTRPCClient<AppRouter>({
        links: [
            httpBatchLink({
                url: process.env.TRPC_URL ?? 'http://localhost:3000/api/trpc',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        ],
    })
} 