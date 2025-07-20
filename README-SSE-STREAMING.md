# SSE 流式生成功能说明

## 🎯 功能概述

已为问卷平台添加了基于SSE（Server-Sent Events）的流式AI问卷生成功能，用户可以实时看到AI生成内容的过程，提供更好的用户体验。

## ✨ 主要特性

### 1. 实时流式输出
- **实时显示**: 用户可以看到AI逐字生成内容
- **取消功能**: 支持中途取消生成过程
- **进度反馈**: 实时显示生成状态

### 2. 用户体验优化
- **视觉反馈**: 流式内容实时显示在界面上
- **取消按钮**: 生成过程中可以取消操作
- **错误处理**: 完善的错误处理和用户提示

### 3. 技术实现
- **SSE协议**: 使用Server-Sent Events实现流式传输
- **AbortController**: 支持请求取消
- **JSON解析**: 自动处理markdown代码块格式

## 🏗️ 技术架构

### 后端组件

#### 1. SSE API端点 (`app/api/ai/generate-stream/route.ts`)
```typescript
export async function POST(request: NextRequest) {
  // 设置SSE响应头
  const stream = new ReadableStream({
    async start(controller) {
      // 流式生成逻辑
      await ollamaClient.generateStream(prompt, model, (chunk) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
      })
    }
  })
}
```

#### 2. 流式生成方法 (`server/ollama-client.ts`)
```typescript
async generateStream(prompt: string, model?: string, onChunk?: (chunk: string) => void): Promise<void> {
  const response = await ollama.chat({
    // ... 配置
    stream: true
  })
  
  for await (const part of response) {
    if (part.message.content && onChunk) {
      onChunk(part.message.content)
    }
  }
}
```

### 前端组件

#### 1. 流式生成器 (`app/dashboard/create/_components/AISurveyGeneratorStream.tsx`)
- 实时显示生成内容
- 支持取消操作
- 自动解析JSON结果
- 预览和创建功能

## 📁 文件结构

```
survey-platform/
├── app/
│   ├── api/ai/generate-stream/
│   │   └── route.ts                    # SSE API端点
│   └── dashboard/create/_components/
│       └── AISurveyGeneratorStream.tsx # 流式生成器组件
├── server/
│   ├── ollama-client.ts                # 流式生成方法
│   └── ai-service.ts                   # 提示词构建
└── README-SSE-STREAMING.md             # 本文档
```

## 🚀 使用方法

### 1. 访问流式生成功能

1. 登录系统
2. 点击"创建问卷"
3. 选择"AI 流式生成"标签页
4. 输入问卷描述
5. 点击"生成问卷"

### 2. 生成过程

1. **开始生成**: 点击生成按钮后，会显示"正在生成..."状态
2. **实时显示**: 生成的内容会实时显示在界面上
3. **取消操作**: 可以随时点击"取消"按钮停止生成
4. **完成生成**: 生成完成后自动解析并显示预览

### 3. 结果处理

1. **预览内容**: 点击"显示预览"查看生成的问卷
2. **创建问卷**: 点击"创建问卷"将结果保存到系统
3. **编辑问卷**: 创建后自动跳转到编辑页面

## 🔧 技术细节

### SSE协议实现

```typescript
// 前端接收SSE数据
const response = await fetch('/api/ai/generate-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt })
})

const reader = response.body?.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const chunk = new TextDecoder().decode(value)
  const lines = chunk.split('\n')
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6)
      // 处理数据
    }
  }
}
```

### 取消机制

```typescript
// 使用AbortController实现取消
const abortController = new AbortController()

const response = await fetch('/api/ai/generate-stream', {
  signal: abortController.signal
})

// 取消请求
abortController.abort()
```

### JSON解析优化

```typescript
// 处理markdown代码块格式
let jsonStr = aiResponse
jsonStr = jsonStr.replace(/```json\s*\n?/g, '')
jsonStr = jsonStr.replace(/```\s*$/g, '')
jsonStr = jsonStr.trim()

const parsed = JSON.parse(jsonStr)
```

## 📊 功能对比

| 特性 | 普通生成 | 流式生成 |
|------|----------|----------|
| 响应速度 | 等待完整生成 | 实时显示 |
| 用户体验 | 静态等待 | 动态反馈 |
| 取消支持 | 不支持 | 支持 |
| 错误处理 | 简单 | 完善 |
| 技术复杂度 | 低 | 中等 |

## 🔍 故障排除

### 常见问题

1. **流式生成失败**
   - 检查Ollama服务是否正常运行
   - 确认模型是否正确下载
   - 查看浏览器控制台错误信息

2. **SSE连接断开**
   - 检查网络连接
   - 确认API端点可访问
   - 查看服务器日志

3. **JSON解析失败**
   - 检查AI返回的内容格式
   - 确认markdown代码块处理正确
   - 查看解析错误日志

### 调试方法

1. **浏览器开发者工具**
   - 查看Network标签页的SSE连接
   - 检查Console标签页的错误信息
   - 使用Sources标签页调试代码

2. **服务器日志**
   - 查看API端点的错误日志
   - 检查Ollama客户端的连接状态
   - 监控流式生成过程

## 🎨 界面展示

### 生成过程界面
```
┌─────────────────────────────────────┐
│ AI 问卷生成                         │
├─────────────────────────────────────┤
│ 描述您想要的问卷                     │
│ [输入框]                            │
│                                     │
│ 示例提示词: [标签1] [标签2] [标签3]  │
│                                     │
│ [生成问卷] [取消]                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 正在生成...                         │
├─────────────────────────────────────┤
│ {                                  │
│   "title": "客户满意度调查",         │
│   "description": "了解客户...",      │
│   "questions": [                   │
│     {                              │
│       "id": "q_1",                │
│       "type": "single",           │
│       "title": "您对我们的产品...", │
│       ...                         │
│     }                             │
│   ]                               │
│ }                                 │
└─────────────────────────────────────┘
```

### 结果预览界面
```
┌─────────────────────────────────────┐
│ 生成结果预览 [显示预览] [创建问卷]   │
├─────────────────────────────────────┤
│ 问卷标题: 客户满意度调查             │
│ 问卷描述: 了解客户对我们产品...      │
│ 问题列表 (4 个问题):                │
│                                     │
│ [1] 您对我们的产品总体满意度如何？   │
│     类型: single • 必填             │
│                                     │
│ [2] 您最喜欢我们产品的哪些方面？     │
│     类型: multiple                  │
└─────────────────────────────────────┘
```

## 🔮 未来扩展

### 计划功能
1. **进度条显示**: 显示生成进度百分比
2. **多语言支持**: 支持不同语言的流式生成
3. **模板选择**: 在生成过程中选择不同的问卷模板
4. **实时编辑**: 在生成过程中实时编辑内容

### 技术改进
1. **WebSocket支持**: 添加WebSocket作为备选方案
2. **缓存机制**: 缓存常用的生成结果
3. **批量生成**: 支持同时生成多个问卷
4. **性能优化**: 优化流式传输的性能

## 📚 相关文档

- [Ollama设置指南](README-OLLAMA-SETUP.md)
- [AI问卷生成功能说明](README-AI-SURVEY.md)
- [AI功能实现总结](README-AI-IMPLEMENTATION.md)

## 🎉 总结

SSE流式生成功能为用户提供了更好的AI问卷生成体验：

✅ **实时反馈**: 用户可以实时看到生成过程
✅ **可取消操作**: 支持中途取消生成
✅ **错误处理**: 完善的错误处理和用户提示
✅ **技术先进**: 使用现代Web技术实现
✅ **用户体验**: 显著提升用户交互体验

这个功能让AI问卷生成变得更加直观和用户友好！ 