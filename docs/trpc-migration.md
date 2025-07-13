# tRPC 客户端迁移指南

## 概述

本项目已从传统的 fetch API 调用迁移到 tRPC 客户端，提供更好的类型安全性和开发体验。

## 迁移前后对比

### 迁移前 (使用 fetch)

```typescript
// 登录函数
export async function login(account: string, password: string) {
  const response = await fetch('/api/trpc/Login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      json: {
        account,
        password,
      },
    }),
  })

  if (!response.ok) {
    throw new Error('登录失败')
  }

  const result = await response.json()
  const { user, token } = result.result.data
  // 处理结果...
}
```

### 迁移后 (使用 tRPC)

```typescript
// 服务端使用
import { createServerTRPCClient } from '@/lib/trpc-server'

export async function login(account: string, password: string) {
  const client = createServerTRPCClient()
  
  const result = await client.Login.mutate({
    account,
    password,
  })

  const { user, token } = result
  // 处理结果...
}

// 客户端使用
import { trpc } from '@/app/_trpc/client'

export function LoginComponent() {
  const loginMutation = trpc.Login.useMutation()
  
  const handleLogin = async () => {
    const result = await loginMutation.mutateAsync({
      account: 'user@example.com',
      password: 'password',
    })
    // 处理结果...
  }
}
```

## 主要优势

### 1. 类型安全
- **编译时检查**: 参数和返回值都有完整的类型定义
- **自动补全**: IDE 提供完整的代码补全
- **错误预防**: 减少运行时错误

### 2. 开发体验
- **简化调用**: 无需手动构建请求体
- **统一接口**: 所有 API 调用使用相同的模式
- **错误处理**: 内置的错误处理机制

### 3. 性能优化
- **批量请求**: 自动合并多个请求
- **缓存机制**: 内置的缓存和失效策略
- **乐观更新**: 支持乐观更新模式

## 使用方式

### 服务端使用

```typescript
// lib/trpc-server.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { type AppRouter } from '@/server'

export function createServerTRPCClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: process.env.TRPC_URL ?? 'http://localhost:3000/api/trpc',
      }),
    ],
  })
}

// 使用示例
import { createServerTRPCClient } from '@/lib/trpc-server'

export async function someServerFunction() {
  const client = createServerTRPCClient()
  
  // 调用查询
  const userInfo = await client.GetUserInfo.query()
  
  // 调用变更
  const result = await client.Login.mutate({
    account: 'user@example.com',
    password: 'password',
  })
}
```

### 客户端使用

```typescript
// 在 React 组件中使用
import { trpc } from '@/app/_trpc/client'

export function UserProfile() {
  // 查询数据
  const { data: user, isLoading, error } = trpc.GetUserInfo.useQuery()
  
  // 变更操作
  const updateMutation = trpc.UpdateUserInfo.useMutation()
  
  const handleUpdate = async () => {
    await updateMutation.mutateAsync({
      name: 'New Name',
    })
  }
  
  if (isLoading) return <div>加载中...</div>
  if (error) return <div>错误: {error.message}</div>
  
  return (
    <div>
      <h1>{user?.username}</h1>
      <button onClick={handleUpdate}>更新信息</button>
    </div>
  )
}
```

## 认证集成

### 自动认证头

```typescript
// app/_trpc/Provider.tsx
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token') || getCookie('session')
  }
  return null
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: process.env.TRPC_URL ?? 'http://localhost:3000/api/trpc',
          headers: () => {
            const token = getToken()
            return token ? { Authorization: `Bearer ${token}` } : {}
          },
        }),
      ],
    }),
  )
  
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
```

### 中间件集成

```typescript
// middleware.ts
import { validateTokenAPI } from './lib/auth-api'

export async function middleware(request: NextRequest) {
  const token = extractToken(request)
  
  if (token) {
    // 通过 API 验证 token
    const userPayload = await validateTokenAPI(token, baseUrl)
    
    if (userPayload) {
      // 注入用户信息到请求头
      return createAuthenticatedRequest(request, userPayload.userId)
    }
  }
  
  return NextResponse.next()
}
```

## 错误处理

### 服务端错误处理

```typescript
try {
  const result = await client.Login.mutate({
    account: 'user@example.com',
    password: 'password',
  })
} catch (error) {
  if (error instanceof TRPCError) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        console.error('认证失败:', error.message)
        break
      case 'BAD_REQUEST':
        console.error('请求参数错误:', error.message)
        break
      default:
        console.error('未知错误:', error.message)
    }
  }
}
```

### 客户端错误处理

```typescript
const loginMutation = trpc.Login.useMutation({
  onError: (error) => {
    if (error.data?.code === 'UNAUTHORIZED') {
      toast.error('用户名或密码错误')
    } else {
      toast.error('登录失败，请重试')
    }
  },
  onSuccess: (data) => {
    toast.success('登录成功')
    router.push('/dashboard')
  },
})
```

## 最佳实践

### 1. 类型定义

```typescript
// 在 server/index.ts 中定义输入输出类型
export const appRouter = router({
  Login: procedure
    .input(
      z.object({
        account: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async (opt) => {
      // 实现逻辑
      return { user, token }
    }),
})
```

### 2. 错误处理

```typescript
// 统一的错误处理
const handleTRPCError = (error: TRPCClientErrorLike<AppRouter>) => {
  switch (error.data?.code) {
    case 'UNAUTHORIZED':
      return '认证失败'
    case 'BAD_REQUEST':
      return '请求参数错误'
    case 'INTERNAL_SERVER_ERROR':
      return '服务器内部错误'
    default:
      return '未知错误'
  }
}
```

### 3. 缓存策略

```typescript
// 配置查询缓存
const userQuery = trpc.GetUserInfo.useQuery(undefined, {
  staleTime: 5 * 60 * 1000, // 5分钟
  cacheTime: 10 * 60 * 1000, // 10分钟
  refetchOnWindowFocus: false,
})
```

## 迁移检查清单

- [ ] 替换所有 fetch 调用为 tRPC 客户端调用
- [ ] 更新错误处理逻辑
- [ ] 测试所有 API 端点
- [ ] 更新文档和示例
- [ ] 配置开发环境
- [ ] 部署和测试

## 常见问题

### Q: 如何处理复杂的请求参数？
A: 使用 Zod 模式定义输入类型，tRPC 会自动验证和转换。

### Q: 如何实现乐观更新？
A: 使用 `useMutation` 的 `onMutate` 回调实现乐观更新。

### Q: 如何处理认证失败？
A: 在 Provider 中配置认证头，中间件会自动处理认证逻辑。

### Q: 如何调试 tRPC 请求？
A: 使用 React Query DevTools 和浏览器网络面板进行调试。 