# 移动端问卷页面 SSR 架构设计

## 📋 概述

本页面采用 Next.js 15 的 SSR（服务端渲染）架构，将数据获取和UI渲染分离，提高性能和SEO效果。

## 🏗️ 架构设计

### 文件结构
```
app/(mobile)/m/[id]/
├── page.tsx           # 服务端组件 (SSR)
├── survey-client.tsx  # 客户端组件 (CSR)
└── README.md          # 架构说明文档
```

### 组件职责分离

#### 1. 服务端组件 (`page.tsx`)
- **职责**: 数据获取、SEO优化、初始渲染
- **特点**: 
  - 在服务端执行
  - 可以直接访问数据库
  - 支持 `notFound()` 等 Next.js 功能
  - 无客户端交互逻辑

#### 2. 客户端组件 (`survey-client.tsx`)
- **职责**: 用户交互、状态管理、动态更新
- **特点**:
  - 使用 `'use client'` 指令
  - 包含所有 React hooks 和事件处理
  - 处理表单验证和提交逻辑
  - 管理本地状态

## 🔄 数据流

```
数据库 → 服务端组件 → 客户端组件 → 用户界面
   ↓           ↓           ↓         ↓
Prisma →   page.tsx → survey-client → UI渲染
```

### 数据传递过程

1. **服务端数据获取**: `page.tsx` 使用 Prisma 从数据库获取问卷数据
2. **类型转换**: 将 Prisma 的 `JsonValue` 转换为 TypeScript 类型
3. **Props 传递**: 通过 props 将数据传递给客户端组件
4. **客户端渲染**: 客户端组件接收数据并渲染交互界面

## ⚡ 性能优势

### 1. **首屏加载优化**
- 服务端预渲染，减少客户端 JavaScript 执行时间
- 数据在服务端获取，减少客户端网络请求

### 2. **SEO 友好**
- 搜索引擎可以直接抓取完整的HTML内容
- 支持动态路由的 `notFound()` 处理

### 3. **缓存策略**
- 服务端组件可以被 Next.js 缓存
- 减少重复的数据获取

### 4. **代码分割**
- 客户端组件按需加载
- 减少初始包大小

## 🛡️ 错误处理

### 服务端错误处理
```typescript
try {
    const survey = await prisma.survey.findUnique({...})
    if (!survey) {
        notFound() // 返回 404 页面
    }
} catch (error) {
    console.error('获取问卷失败:', error)
    notFound() // 数据库错误时也返回 404
}
```

### 客户端错误处理
- 表单验证错误
- 网络请求错误
- 用户输入错误

## 🔧 开发注意事项

### 1. **类型安全**
- 使用 TypeScript 确保类型安全
- 正确处理 Prisma 的 `JsonValue` 类型转换

### 2. **状态管理**
- 客户端状态使用 React hooks
- 避免在服务端组件中使用客户端状态

### 3. **数据获取**
- 服务端数据获取使用 Prisma
- 客户端数据提交使用 API 路由

### 4. **组件边界**
- 明确区分服务端和客户端组件
- 使用 `'use client'` 指令标记客户端组件

## 📱 移动端优化

### 1. **响应式设计**
- 使用 Tailwind CSS 的移动优先设计
- 适配不同屏幕尺寸

### 2. **触摸交互**
- 优化按钮大小和间距
- 支持触摸手势

### 3. **性能优化**
- 懒加载非关键组件
- 优化图片和资源加载

## 🚀 未来扩展

### 1. **缓存策略**
- 实现 Redis 缓存
- 添加 CDN 支持

### 2. **实时更新**
- WebSocket 支持
- 实时协作功能

### 3. **离线支持**
- Service Worker
- PWA 功能

### 4. **国际化**
- 多语言支持
- RTL 布局支持

## 📚 相关文档

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/react/use-server)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

*本文档描述了移动端问卷页面的SSR架构设计，如有疑问请参考相关文档或联系开发团队。*
