# 中间件使用指南

## 概述

本项目使用 Next.js 中间件来处理用户认证和会话管理。中间件在请求到达页面组件之前执行，可以：

- 验证用户身份
- 注入用户信息到请求头
- 重定向未认证用户
- 记录请求日志

## 功能特性

### 🔐 多方式认证支持
- **Cookie 认证**: 兼容 SSR，支持 `session` cookie
- **Header 认证**: 支持 `Authorization: Bearer <token>` 和 `x-auth-token` header
- **自动降级**: 优先使用 cookie，失败时尝试 header

### 🛡️ 灵活的路径保护
- **排除路径**: 静态资源、API 路由等不需要认证
- **保护路径**: 指定需要认证的路径
- **智能重定向**: 可配置自动重定向到登录页

### 📊 详细的日志记录
- **开发环境**: 自动启用详细日志
- **生产环境**: 可配置日志级别
- **结构化日志**: 包含时间戳和上下文信息

### ⚙️ 可配置选项
- 支持环境变量配置
- 运行时动态调整
- 类型安全的配置接口

## 配置选项

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `MIDDLEWARE_LOG_LEVEL` | `"info"` | 日志级别 (debug/info/warn/error) |
| `MIDDLEWARE_REDIRECT_TO_LOGIN` | `"false"` | 是否自动重定向到登录页 |
| `MIDDLEWARE_LOGIN_PATH` | `"/login"` | 登录页面路径 |
| `SESSION_COOKIE_NAME` | `"session"` | 会话 cookie 名称 |
| `MIDDLEWARE_ENABLE_CACHE` | `"false"` | 是否启用缓存 |
| `MIDDLEWARE_CACHE_TIMEOUT` | `"300000"` | 缓存超时时间（毫秒） |

### 默认排除路径

以下路径默认不经过中间件处理：

- `/api` - API 路由
- `/static` - 静态资源
- `/favicon.ico` - 网站图标
- `/_next` - Next.js 内部文件
- `/_vercel` - Vercel 部署相关
- `/robots.txt` - 搜索引擎爬虫文件
- `/sitemap.xml` - 网站地图
- `/health` - 健康检查
- `/ping` - 连通性检查

### 默认保护路径

以下路径默认需要认证：

- `/dashboard` - 仪表板
- `/admin` - 管理页面
- `/profile` - 用户资料

## 使用方法

### 1. 基本使用

中间件会自动处理认证，无需额外配置：

```typescript
// 页面组件中获取用户信息
import { headers } from 'next/headers'

export default function Dashboard() {
  const headersList = headers()
  const userId = headersList.get('x-user-id')
  const isAuthenticated = headersList.get('x-authenticated')
  
  if (!isAuthenticated) {
    return <div>请先登录</div>
  }
  
  return <div>欢迎，用户 {userId}</div>
}
```

### 2. 自定义配置

```typescript
// lib/middleware-config.ts
import { getMiddlewareConfig } from './middleware-config'

// 获取自定义配置
const customConfig = getMiddlewareConfig({
  enableLogging: true,
  redirectToLogin: true,
  protectedPaths: ['/dashboard', '/admin', '/profile', '/settings'],
  excludedPaths: ['/api', '/static', '/public']
})
```

### 3. API 路由中使用

```typescript
// app/api/protected/route.ts
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const headersList = headers()
  const userId = headersList.get('x-user-id')
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return NextResponse.json({ 
    message: 'Protected data',
    userId 
  })
}
```

## 认证流程

1. **请求到达**: 中间件拦截所有匹配的请求
2. **提取令牌**: 从 cookie 或 header 中提取认证令牌
3. **验证令牌**: 使用 Redis 验证令牌有效性
4. **注入信息**: 将用户信息注入到请求头
5. **继续处理**: 请求继续到页面组件或 API 路由

## 错误处理

### Redis 连接错误
- 中间件会记录错误但不中断请求
- 生产环境建议确保 Redis 可用性
- 可配置降级策略

### 令牌验证失败
- 记录警告日志
- 可选择重定向到登录页
- 继续请求让页面组件处理

## 性能优化

### 缓存策略
- 可启用令牌缓存减少 Redis 查询
- 配置缓存超时时间
- 支持缓存失效策略

### 路径匹配优化
- 使用正则表达式高效匹配
- 排除不需要认证的路径
- 减少不必要的处理

## 开发调试

### 启用调试日志

```bash
# 设置环境变量
export MIDDLEWARE_LOG_LEVEL="debug"
export NODE_ENV="development"
```

### 查看日志输出

```bash
# 开发环境
npm run dev

# 查看中间件日志
[Middleware:INFO] 2024-01-01T12:00:00.000Z - Processing request - {"method":"GET","pathname":"/dashboard","url":"http://localhost:3000/dashboard"}
[Middleware:INFO] 2024-01-01T12:00:00.001Z - User authenticated - {"userId":"user123","pathname":"/dashboard"}
```

## 部署注意事项

### Docker 环境
- 确保 Redis 服务可用
- 配置正确的网络连接
- 设置适当的环境变量

### 生产环境
- 禁用详细日志
- 配置错误监控
- 设置健康检查

## 故障排除

### 常见问题

1. **Redis 连接失败**
   - 检查 Redis 服务状态
   - 验证连接字符串
   - 确认网络连通性

2. **令牌验证失败**
   - 检查令牌格式
   - 验证 Redis 中的令牌
   - 确认 JWT 密钥配置

3. **重定向循环**
   - 检查登录页面路径
   - 确认排除路径配置
   - 验证认证逻辑

### 调试技巧

1. 启用详细日志
2. 检查网络请求
3. 验证环境变量
4. 测试 Redis 连接

## 更新日志

### v2.0.0
- 重构配置系统
- 增强错误处理
- 改进日志记录
- 添加类型安全

### v1.0.0
- 基础认证功能
- Cookie 和 Header 支持
- 路径保护机制 