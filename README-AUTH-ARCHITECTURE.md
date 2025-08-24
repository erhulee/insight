# 认证架构使用说明

## 概述

本项目实现了一个分层的认证架构，用于区分处理登录态页面和非登录态页面。通过多种方式实现认证保护，确保代码的可维护性和灵活性。

## 架构组件

### 1. 认证 Hooks

#### `useAuth` - 主要认证 Hook
```typescript
import { useAuth } from '@/hooks/use-auth'

function MyComponent() {
  const { isAuthenticated, isLoading, user } = useAuth({
    requireAuth: true,        // 是否需要认证
    redirectTo: '/login',     // 重定向路径
    onUnauthenticated: () => {} // 自定义未认证处理
  })

  if (isLoading) return <div>加载中...</div>
  if (!isAuthenticated) return null // 会触发重定向

  return <div>已认证用户: {user?.name}</div>
}
```

#### `useAuthStatus` - 简化认证状态 Hook
```typescript
import { useAuthStatus } from '@/hooks/use-auth'

function MyComponent() {
  const { isAuthenticated, isLoading, user } = useAuthStatus()
  
  // 仅获取状态，不处理重定向
  return (
    <div>
      {isAuthenticated ? `欢迎, ${user?.name}` : '请登录'}
    </div>
  )
}
```

### 2. 认证布局组件

#### `AuthLayout` - 强制认证布局
```typescript
import { AuthLayout } from '@/components/auth/auth-layout'

export default function ProtectedPage() {
  return (
    <AuthLayout redirectTo="/login">
      <div>这个页面需要登录才能访问</div>
    </AuthLayout>
  )
}
```

#### `OptionalAuthLayout` - 可选认证布局
```typescript
import { OptionalAuthLayout } from '@/components/auth/auth-layout'

export default function OptionalPage() {
  return (
    <OptionalAuthLayout fallback={<div>请登录查看完整内容</div>}>
      <div>登录用户可以看到的完整内容</div>
    </OptionalAuthLayout>
  )
}
```

### 3. 高阶组件 (HOC)

#### `withAuth` - 认证 HOC
```typescript
import { withAuth } from '@/components/auth/with-auth'

function MyComponent() {
  return <div>需要认证的组件</div>
}

// 使用 HOC 包装
export default withAuth(MyComponent, {
  redirectTo: '/login',
  fallback: <div>加载中...</div>
})
```

#### `withOptionalAuth` - 可选认证 HOC
```typescript
import { withOptionalAuth } from '@/components/auth/with-auth'

function MyComponent() {
  return <div>可选认证的组件</div>
}

// 使用 HOC 包装
export default withOptionalAuth(MyComponent, <div>请登录查看内容</div>)
```

## 使用场景

### 1. 需要强制登录的页面

```typescript
// 使用 AuthLayout 包装
export default function DashboardPage() {
  return (
    <AuthLayout>
      <div>仪表板内容</div>
    </AuthLayout>
  )
}

// 或使用 HOC
export default withAuth(DashboardPage)
```

### 2. 可选登录的页面

```typescript
// 使用 OptionalAuthLayout
export default function HomePage() {
  return (
    <OptionalAuthLayout fallback={<div>登录后查看更多功能</div>}>
      <div>完整功能内容</div>
    </OptionalAuthLayout>
  )
}

// 或使用 HOC
export default withOptionalAuth(HomePage, <div>登录后查看更多功能</div>)
```

### 3. 组件级别的认证检查

```typescript
function UserProfile() {
  const { isAuthenticated, user } = useAuthStatus()
  
  if (!isAuthenticated) {
    return <div>请登录查看个人资料</div>
  }
  
  return <div>欢迎, {user?.name}</div>
}
```

## 路由配置

### 自动路由保护

在 `types/auth.ts` 中配置路由的认证要求：

```typescript
export const DEFAULT_ROUTE_CONFIG: RouteConfig = {
  // 需要认证的路由
  '/dashboard': { requireAuth: true, redirectTo: '/login' },
  '/account': { requireAuth: true, redirectTo: '/login' },
  
  // 不需要认证的路由
  '/': { requireAuth: false },
  '/login': { requireAuth: false },
  '/register': { requireAuth: false },
}
```

### 动态路由保护

```typescript
import { isPathRequireAuth, getRedirectPath } from '@/types/auth'

function MyComponent() {
  const pathname = usePathname()
  const requireAuth = isPathRequireAuth(pathname)
  const redirectTo = getRedirectPath(pathname)
  
  const { isAuthenticated } = useAuth({ 
    requireAuth, 
    redirectTo 
  })
  
  // 组件逻辑...
}
```

## 最佳实践

### 1. 选择合适的认证方式

- **页面级别**: 使用 `AuthLayout` 或 `withAuth` HOC
- **组件级别**: 使用 `useAuth` 或 `useAuthStatus` hooks
- **条件渲染**: 使用 `OptionalAuthLayout` 或 `withOptionalAuth` HOC

### 2. 错误处理

```typescript
function MyComponent() {
  const { isAuthenticated, isLoading } = useAuth({
    requireAuth: true,
    onUnauthenticated: () => {
      // 自定义错误处理
      console.log('用户未登录')
      // 可以显示错误提示而不是重定向
    }
  })
  
  // 组件逻辑...
}
```

### 3. 加载状态处理

```typescript
function MyComponent() {
  const { isLoading } = useAuth({ requireAuth: true })
  
  if (isLoading) {
    return <div>验证登录状态中...</div>
  }
  
  return <div>组件内容</div>
}
```

### 4. 回调 URL 处理

认证系统会自动保存用户访问的路径，登录成功后可以跳转回来：

```typescript
// 登录成功后跳转回原页面
const searchParams = useSearchParams()
const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

// 登录成功后跳转
router.push(callbackUrl)
```

## 配置选项

### 环境变量

```bash
# 中间件配置
MIDDLEWARE_REDIRECT_TO_LOGIN=true
MIDDLEWARE_LOGIN_PATH=/login
SESSION_COOKIE_NAME=session

# 日志配置
MIDDLEWARE_LOG_LEVEL=info
MIDDLEWARE_ENABLE_CACHE=true
MIDDLEWARE_CACHE_TIMEOUT=300000
```

### 自定义配置

```typescript
import { getMiddlewareConfig } from '@/lib/middleware-config'

const customConfig = getMiddlewareConfig({
  redirectToLogin: true,
  loginPath: '/auth/login',
  protectedPaths: ['/admin', '/settings']
})
```

## 故障排除

### 常见问题

1. **无限重定向**: 检查 `redirectTo` 路径是否正确
2. **认证状态不更新**: 确保使用了 `AuthProvider` 包装
3. **中间件不生效**: 检查 `middleware.ts` 配置和 matcher 设置

### 调试技巧

```typescript
// 启用调试日志
console.log('认证状态:', { isAuthenticated, isLoading, user })

// 检查路由配置
console.log('当前路径:', pathname)
console.log('需要认证:', isPathRequireAuth(pathname))
```

## 总结

这个认证架构提供了：

- **灵活性**: 多种认证方式满足不同需求
- **可维护性**: 清晰的代码结构和类型定义
- **用户体验**: 自动重定向和回调 URL 支持
- **性能**: 合理的加载状态和缓存策略

通过合理使用这些组件和 hooks，可以轻松实现页面级别的认证保护，提升应用的安全性和用户体验。
