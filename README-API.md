# 用户自渲染 RESTful API 系统

## 项目概述

本项目实现了一套完整的用户自渲染 RESTful API 系统，支持动态模板渲染和数据收集功能。系统基于 Next.js 15、TypeScript、Prisma 和 MySQL 构建。

## 核心功能

### 1. 模板渲染 API
- **GET** `/api/render` - 动态渲染模板
- 支持公开和私有模板访问
- 支持 JSON 和 HTML 格式输出
- 支持参数传递和配置自定义

### 2. 数据收集 API
- **POST** `/api/render` - 提交表单数据
- 自动生成会话ID
- 安全的数据存储
- 支持元数据记录

### 3. 模板信息 API
- **GET** `/api/templates/{id}` - 获取模板详细信息
- 支持访问权限控制
- 返回模板配置和元数据

## 技术架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端界面       │    │   API 路由层     │    │   数据库层       │
│  (React/Next.js) │◄──►│  (Next.js API)  │◄──►│  (Prisma/MySQL) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   测试页面       │    │   验证中间件     │    │   数据模型       │
│  (/api-test)    │    │  (API Key Auth) │    │  (Prisma Schema)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 数据库设计

### 核心表结构

1. **RenderTemplate** - 渲染模板表
   - 存储模板内容和配置
   - 支持版本控制和分类
   - 公开/私有访问控制

2. **ApiKey** - API密钥表
   - 管理访问权限
   - 支持过期时间设置
   - 模板级别的权限控制

3. **DataCollection** - 数据收集表
   - 存储提交的表单数据
   - 会话管理和元数据记录

4. **RenderLog** - 渲染日志表
   - API调用记录
   - 性能监控和审计

## 快速开始

### 1. 环境准备

```bash
# 安装依赖
npm install

# 配置数据库
cp .env.example .env
# 编辑 .env 文件，配置数据库连接

# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问测试页面

打开浏览器访问：`http://localhost:3000/api-test`

## API 使用示例

### 渲染模板

```javascript
// 公开模板渲染
const response = await fetch('/api/render?templateId=abc123&name=张三&age=25')
const data = await response.json()

// 私有模板渲染
const response = await fetch('/api/render?templateId=def456&name=李四', {
  headers: {
    'x-api-key': 'your-api-key-here'
  }
})
const data = await response.json()
```

### 提交数据

```javascript
const response = await fetch('/api/render', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key-here' // 可选
  },
  body: JSON.stringify({
    templateId: 'abc123',
    data: {
      name: '张三',
      email: 'zhangsan@example.com',
      message: '测试消息'
    }
  })
})
const result = await response.json()
```

### 获取模板信息

```javascript
const response = await fetch('/api/templates/abc123', {
  headers: {
    'x-api-key': 'your-api-key-here' // 私有模板需要
  }
})
const templateInfo = await response.json()
```

## 安全特性

1. **API密钥认证**
   - 私有模板需要有效的API密钥
   - 支持密钥过期时间设置
   - 模板级别的权限控制

2. **数据验证**
   - 使用 Zod 进行请求数据验证
   - 防止恶意数据注入
   - 类型安全的参数处理

3. **访问控制**
   - 公开/私有模板访问控制
   - 基于API密钥的权限验证
   - 请求日志记录和审计

4. **错误处理**
   - 统一的错误响应格式
   - 详细的错误信息记录
   - 安全的错误信息暴露

## 性能优化

1. **数据库优化**
   - 使用 Prisma 连接池
   - 索引优化查询性能
   - 异步数据处理

2. **API 优化**
   - 响应缓存机制
   - 请求参数验证
   - 错误处理优化

3. **监控和日志**
   - 渲染性能监控
   - API调用日志记录
   - 错误追踪和分析

## 部署说明

### 生产环境部署

1. **环境变量配置**
   ```bash
   DATABASE_URL="mysql://user:password@host:port/database"
   NEXTAUTH_SECRET="your-secret-key"
   ```

2. **数据库迁移**
   ```bash
   npx prisma migrate deploy
   ```

3. **构建和启动**
   ```bash
   npm run build
   npm start
   ```

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 开发指南

### 添加新的 API 端点

1. 在 `app/api/` 目录下创建新的路由文件
2. 实现 GET/POST/PUT/DELETE 方法
3. 添加数据验证和错误处理
4. 更新 API 文档

### 扩展数据库模型

1. 修改 `prisma/schema.prisma` 文件
2. 运行 `npx prisma generate` 生成客户端
3. 运行 `npx prisma db push` 更新数据库

### 测试 API

1. 使用内置的测试页面：`/api-test`
2. 使用 Postman 或其他 API 测试工具
3. 编写自动化测试用例

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码更改
4. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。 