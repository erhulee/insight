# 用户自渲染 RESTful API 文档

## 概述

本系统提供了一套完整的用户自渲染 API，支持动态模板渲染和数据收集功能。

## API 端点

### 1. 渲染模板

**GET** `/api/render`

渲染指定的模板并返回结果。

#### 请求参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| templateId | string | 是 | 模板ID |
| format | string | 否 | 返回格式 (json/html)，默认 json |
| [其他参数] | any | 否 | 传递给模板的数据参数 |

#### 请求头

| 头部 | 类型 | 必需 | 描述 |
|------|------|------|------|
| x-api-key | string | 否 | API密钥（私有模板必需） |

#### 示例请求

```bash
# 公开模板
GET /api/render?templateId=abc123&name=张三&age=25

# 私有模板
GET /api/render?templateId=def456&name=李四&age=30
Headers: x-api-key: your-api-key-here

# 返回HTML格式
GET /api/render?templateId=abc123&format=html&name=王五
```

#### 响应示例

**JSON 格式响应:**
```json
{
  "success": true,
  "data": {
    "template": { /* 模板内容 */ },
    "data": { "name": "张三", "age": "25" },
    "config": { /* 渲染配置 */ },
    "renderedAt": "2024-01-01T12:00:00.000Z",
    "html": "<div class=\"rendered-template\">Template: 用户信息</div>",
    "json": {
      "templateId": "abc123",
      "templateName": "用户信息",
      "data": { "name": "张三", "age": "25" },
      "config": { /* 配置 */ }
    }
  },
  "template": {
    "id": "abc123",
    "name": "用户信息",
    "version": "1.0.0"
  }
}
```

**HTML 格式响应:**
```html
<div class="rendered-template">Template: 用户信息</div>
```

### 2. 提交数据

**POST** `/api/render`

向指定模板提交数据。

#### 请求体

```json
{
  "templateId": "string",
  "data": {
    "field1": "value1",
    "field2": "value2"
  },
  "sessionId": "string (可选)"
}
```

#### 请求头

| 头部 | 类型 | 必需 | 描述 |
|------|------|------|------|
| x-api-key | string | 否 | API密钥（私有模板必需） |
| Content-Type | string | 是 | application/json |

#### 示例请求

```bash
POST /api/render
Headers: 
  Content-Type: application/json
  x-api-key: your-api-key-here

Body:
{
  "templateId": "abc123",
  "data": {
    "name": "张三",
    "email": "zhangsan@example.com",
    "message": "这是一条测试消息"
  }
}
```

#### 响应示例

```json
{
  "success": true,
  "sessionId": "session-12345",
  "collectionId": "collection-67890",
  "message": "Data collected successfully"
}
```

### 3. 获取模板信息

**GET** `/api/templates/{id}`

获取指定模板的详细信息。

#### 路径参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| id | string | 是 | 模板ID |

#### 请求头

| 头部 | 类型 | 必需 | 描述 |
|------|------|------|------|
| x-api-key | string | 否 | API密钥（私有模板必需） |

#### 示例请求

```bash
# 公开模板
GET /api/templates/abc123

# 私有模板
GET /api/templates/def456
Headers: x-api-key: your-api-key-here
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "name": "用户信息表单",
    "description": "用于收集用户基本信息的表单模板",
    "version": "1.0.0",
    "category": "form",
    "tags": "用户,信息,表单",
    "isPublic": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "creator": {
      "id": "user-123",
      "username": "admin"
    },
    "defaultConfig": {
      "theme": "light",
      "layout": "vertical"
    }
  }
}
```

## 错误处理

### 错误响应格式

```json
{
  "error": "错误描述",
  "details": "详细错误信息（可选）"
}
```

### 常见错误码

| 状态码 | 描述 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权（需要API密钥） |
| 403 | 访问被拒绝 |
| 404 | 模板不存在 |
| 500 | 服务器内部错误 |

## 使用示例

### JavaScript/Node.js

```javascript
// 渲染模板
async function renderTemplate(templateId, data, apiKey = null) {
  const params = new URLSearchParams({
    templateId,
    ...data
  });
  
  const headers = {};
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  const response = await fetch(`/api/render?${params}`, {
    headers
  });
  
  return await response.json();
}

// 提交数据
async function submitData(templateId, data, apiKey = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  const response = await fetch('/api/render', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      templateId,
      data
    })
  });
  
  return await response.json();
}

// 获取模板信息
async function getTemplateInfo(templateId, apiKey = null) {
  const headers = {};
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  const response = await fetch(`/api/templates/${templateId}`, {
    headers
  });
  
  return await response.json();
}
```

### cURL

```bash
# 渲染模板
curl "http://localhost:3000/api/render?templateId=abc123&name=张三&age=25"

# 提交数据
curl -X POST "http://localhost:3000/api/render" \
  -H "Content-Type: application/json" \
  -d '{"templateId":"abc123","data":{"name":"张三","age":25}}'

# 获取模板信息
curl "http://localhost:3000/api/templates/abc123"
```

## 安全说明

1. **API密钥管理**: 私有模板需要有效的API密钥才能访问
2. **数据验证**: 所有输入数据都会进行验证
3. **访问控制**: 支持公开和私有模板的访问控制
4. **日志记录**: 所有API调用都会被记录用于审计

## 性能优化

1. **缓存**: 模板信息会被缓存以提高响应速度
2. **异步处理**: 数据提交采用异步处理
3. **连接池**: 数据库连接使用连接池优化性能 