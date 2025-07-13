# 认证验证API使用说明

## 概述

`/api/auth/validate` 是一个专门为中间件设计的token验证接口，用于验证用户身份并返回用户信息。

## API 端点

### POST /api/auth/validate

验证token并返回用户信息。

#### 请求格式
```json
{
  "token": "your-jwt-token"
}
```

#### 响应格式

**成功响应 (200)**:
```json
{
  "success": true,
  "user": {
    "userId": "user123",
    "account": "user@example.com",
    "username": "用户名"
  }
}
```

**错误响应**:
```json
{
  "error": "错误信息"
}
```

#### 状态码

- `200`: 验证成功
- `400`: Token缺失
- `401`: Token无效
- `404`: 用户不存在
- `500`: 服务器内部错误

### GET /api/auth/validate

健康检查接口。

#### 响应格式
```json
{
  "status": "ok",
  "service": "auth-validation",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 中间件集成

中间件通过调用此API来验证用户身份：

```typescript
// middleware.ts
import { validateTokenAPI } from '@/lib/auth-api'

export async function middleware(request: NextRequest) {
  const token = extractToken(request)
  
  if (token) {
    const userPayload = await validateTokenAPI(token, baseUrl)
    
    if (userPayload) {
      // 注入用户信息到请求头
      return createAuthenticatedRequest(request, userPayload.userId)
    }
  }
  
  return NextResponse.next()
}
```

## 使用示例

### 1. 直接调用API

```bash
# 验证token
curl -X POST http://localhost:3000/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{"token":"your-jwt-token"}'

# 健康检查
curl http://localhost:3000/api/auth/validate
```

### 2. JavaScript调用

```javascript
// 验证token
const response = await fetch('/api/auth/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ token: 'your-jwt-token' }),
})

const data = await response.json()
if (data.success) {
  console.log('用户信息:', data.user)
}
```

### 3. 测试脚本

```bash
# 运行测试
node scripts/test-auth-validate.js

# 指定基础URL
BASE_URL=http://localhost:3000 node scripts/test-auth-validate.js
```

## 安全特性

1. **Token验证**: 使用JWT和Redis双重验证
2. **错误处理**: 详细的错误信息和状态码
3. **用户信息过滤**: 只返回必要的用户信息
4. **健康检查**: 提供健康检查接口

## 错误处理

### 常见错误

1. **Token缺失**
   - 状态码: 400
   - 错误信息: "Token is required"

2. **Token无效**
   - 状态码: 401
   - 错误信息: "Invalid token"

3. **用户不存在**
   - 状态码: 404
   - 错误信息: "User not found"

4. **服务器错误**
   - 状态码: 500
   - 错误信息: "Internal server error"

### 调试技巧

1. 检查token格式是否正确
2. 确认Redis服务是否正常运行
3. 验证用户是否存在于数据库中
4. 查看服务器日志获取详细错误信息

## 性能优化

1. **缓存策略**: 可考虑添加token缓存
2. **连接池**: 优化数据库连接
3. **错误重试**: 实现重试机制
4. **监控**: 添加性能监控

## 部署注意事项

1. **环境变量**: 确保Redis连接配置正确
2. **网络**: 确保中间件可以访问API
3. **安全**: 在生产环境中使用HTTPS
4. **监控**: 设置健康检查监控

## 故障排除

### 常见问题

1. **API调用失败**
   - 检查网络连接
   - 验证API端点
   - 确认服务状态

2. **Token验证失败**
   - 检查Redis连接
   - 验证JWT密钥
   - 确认token格式

3. **中间件集成问题**
   - 检查API响应格式
   - 验证请求头注入
   - 确认错误处理

### 调试步骤

1. 启用详细日志
2. 检查网络请求
3. 验证环境变量
4. 测试API端点
5. 检查中间件配置 