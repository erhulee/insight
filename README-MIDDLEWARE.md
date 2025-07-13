# 中间件优化说明

## 主要改进

### 1. 代码结构优化
- **模块化设计**: 将配置逻辑分离到独立文件
- **类型安全**: 添加完整的 TypeScript 类型定义
- **函数分离**: 将复杂逻辑拆分为独立函数

### 2. 兼容性增强
- **多认证方式**: 支持 Cookie、Authorization Header、自定义 Header
- **灵活配置**: 支持环境变量覆盖默认配置
- **路径保护**: 可配置排除路径和保护路径

### 3. 错误处理改进
- **优雅降级**: Redis 连接失败时不影响正常请求
- **详细日志**: 结构化日志记录，便于调试
- **类型安全**: 正确处理 error 类型

### 4. 性能优化
- **早期返回**: 无 token 时直接返回，减少处理
- **配置缓存**: 避免重复创建配置对象
- **路径匹配**: 优化路径匹配逻辑

## 配置选项

### 环境变量
```bash
# 日志配置
MIDDLEWARE_LOG_LEVEL="info"
NODE_ENV="development"

# 认证配置
MIDDLEWARE_REDIRECT_TO_LOGIN="false"
MIDDLEWARE_LOGIN_PATH="/login"
SESSION_COOKIE_NAME="session"

# 性能配置
MIDDLEWARE_ENABLE_CACHE="false"
MIDDLEWARE_CACHE_TIMEOUT="300000"
```

### 默认行为
- **开发环境**: 启用详细日志
- **生产环境**: 禁用详细日志
- **路径保护**: 仅保护指定路径
- **错误处理**: 记录错误但不中断请求

## 使用示例

### 获取用户信息
```typescript
import { headers } from 'next/headers'

export default function Page() {
  const headersList = headers()
  const userId = headersList.get('x-user-id')
  const isAuthenticated = headersList.get('x-authenticated')
  
  return <div>用户ID: {userId}</div>
}
```

### API 路由认证
```typescript
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const headersList = headers()
  const userId = headersList.get('x-user-id')
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return NextResponse.json({ userId })
}
```

## 主要特性

1. **多认证方式支持**
2. **灵活的路径配置**
3. **详细的日志记录**
4. **优雅的错误处理**
5. **类型安全的配置**
6. **性能优化**

## 部署要求

- Redis 服务可用
- 正确的环境变量配置
- 网络连接正常 