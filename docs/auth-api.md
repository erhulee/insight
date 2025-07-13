# 认证API架构说明

## 概述

由于 Next.js 中间件运行在 Edge Runtime 环境中，无法直接访问 Redis 和 jsonwebtoken 等 Node.js 模块，因此我们采用了 API 分离的架构：

- **中间件**: 运行在 Edge Runtime，负责路由拦截和请求头注入
- **认证API**: 运行在 Node.js 环境，负责 token 验证和 Redis 操作

## 架构图

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   客户端请求     │───▶│   Next.js 中间件  │───▶│   认证API       │
│                │    │  (Edge Runtime)   │    │  (Node.js)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   注入用户信息    │    │   Redis + JWT   │
                       │   到请求头       │    │   验证          │
                       └──────────────────┘    └─────────────────┘
```

## API 端点

### 1. 认证验证 API
- **路径**: `/api/auth/validate`
- **方法**: `POST`
- **功能**: 验证 token 并返回用户信息

#### 请求格式
```json
{
  "token": "your-jwt-token"
}
```

#### 响应格式
```json
{
  "success": true,
  "user": {
    "userId": "user123"
  }
}
```

### 2. 健康检查 API
- **路径**: `/api/health`
- **方法**: `GET`
- **功能**: 检查系统各组件状态

#### 响应格式
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "services": {
    "auth": {
      "status": "healthy",
      "endpoint": "http://localhost:3000/api/auth/validate"
    }
  },
  "environment": {
    "nodeEnv": "production",
    "redisUrl": "configured"
  }
}
```

## 中间件工作流程

1. **请求拦截**: 中间件拦截所有匹配的请求
2. **Token 提取**: 从 cookie 或 header 中提取 token
3. **API 调用**: 调用 `/api/auth/validate` 验证 token
4. **用户信息注入**: 将用户信息注入到请求头
5. **请求继续**: 请求继续到页面组件或 API 路由

## 配置选项

### 环境变量
```bash
# Redis 配置
REDIS_URL="redis://redis:6379"

# 中间件配置
MIDDLEWARE_LOG_LEVEL="info"
MIDDLEWARE_REDIRECT_TO_LOGIN="false"
MIDDLEWARE_LOGIN_PATH="/login"
SESSION_COOKIE_NAME="session"

# 应用配置
NODE_ENV="production"
```

### 中间件配置
```typescript
// lib/middleware-config.ts
const config = {
  enableLogging: process.env.NODE_ENV === 'development',
  redirectToLogin: false,
  loginPath: '/login',
  sessionCookieName: 'session',
  authHeaders: {
    userId: 'x-user-id',
    authenticated: 'x-authenticated',
    token: 'x-auth-token'
  }
}
```

## 错误处理

### API 错误
- **400**: Token 缺失
- **401**: Token 无效
- **500**: 服务器内部错误

### 中间件错误处理
- API 调用失败时记录错误但不中断请求
- 支持优雅降级
- 详细的错误日志记录

## 性能优化

### 缓存策略
- 可配置 token 缓存
- 减少重复的 API 调用
- 支持缓存失效策略

### 连接优化
- 使用 keep-alive 连接
- 配置连接池
- 超时处理

## 监控和调试

### 日志记录
```typescript
// 开发环境启用详细日志
MIDDLEWARE_LOG_LEVEL="debug"
NODE_ENV="development"
```

### 健康检查
```bash
# 检查认证API状态
curl http://localhost:3000/api/health

# 检查认证验证
curl -X POST http://localhost:3000/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token"}'
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

1. **API 调用失败**
   - 检查网络连接
   - 验证 API 端点
   - 确认服务状态

2. **Token 验证失败**
   - 检查 Redis 连接
   - 验证 JWT 密钥
   - 确认 token 格式

3. **性能问题**
   - 启用缓存
   - 优化网络请求
   - 监控响应时间

### 调试技巧

1. 启用详细日志
2. 检查网络请求
3. 验证环境变量
4. 测试 API 端点

## 安全考虑

1. **Token 安全**
   - 使用 HTTPS
   - 设置适当的过期时间
   - 定期轮换密钥

2. **API 安全**
   - 限制请求频率
   - 验证请求来源
   - 监控异常访问

3. **数据保护**
   - 加密敏感数据
   - 限制访问权限
   - 审计日志记录 