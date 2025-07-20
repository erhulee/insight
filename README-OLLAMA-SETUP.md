# Ollama 集成设置指南

## 概述

本项目已集成Ollama本地大模型服务，用于AI问卷生成功能。Ollama是一个开源的本地大模型运行框架，支持多种开源模型。

## 安装步骤

### 1. 安装Ollama

访问 [ollama.ai](https://ollama.ai) 下载并安装Ollama：

**macOS:**
```bash
# 使用Homebrew安装
brew install ollama

# 或者下载安装包
# 访问 https://ollama.ai/download
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
- 下载Windows安装包并运行

### 2. 启动Ollama服务

安装完成后，启动Ollama服务：

```bash
ollama serve
```

服务将在 `http://localhost:11434` 启动。

### 3. 下载模型

推荐下载以下模型之一：

```bash
# 推荐模型：Qwen2.5 7B（中文支持好，速度快）
ollama pull qwen2.5:7b

# 或者使用Llama3.1 8B
ollama pull llama3.1:8b

# 或者使用Mistral 7B
ollama pull mistral:7b
```

### 4. 验证安装

测试Ollama是否正常工作：

```bash
# 测试模型
ollama run qwen2.5:7b "你好，请介绍一下自己"
```

## 项目配置

### 1. 环境变量设置

在项目根目录创建 `.env.local` 文件：

```env
# Ollama配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

### 2. 启动项目

```bash
npm run dev
```

### 3. 配置AI设置

1. 访问 `http://localhost:3000/dashboard/ai-settings`
2. 检查连接状态
3. 测试连接
4. 调整参数设置

## 使用方法

### 1. 创建AI问卷

1. 登录系统
2. 点击"创建问卷"
3. 选择"AI 生成"标签页
4. 输入问卷描述，例如：
   - "创建一个客户满意度调查问卷"
   - "设计一个员工工作环境调查"
   - "制作一个市场调研问卷"
5. 点击"生成问卷"
6. 预览生成的问卷
7. 点击"创建问卷"完成创建

### 2. 示例提示词

**客户满意度调查：**
```
创建一个客户满意度调查问卷，包含产品体验、服务质量和改进建议
```

**员工调查：**
```
设计一个员工工作环境调查，了解工作满意度、团队协作和职业发展需求
```

**市场调研：**
```
制作一个市场调研问卷，调查用户对新产品的需求和购买意愿
```

**活动反馈：**
```
创建一个活动反馈问卷，收集参与者对活动组织和内容的评价
```

## 技术架构

### 后端组件

- **`server/ollama-client.ts`**: Ollama API客户端
- **`server/ai-service.ts`**: AI问卷生成服务
- **`lib/ollama-config.ts`**: 配置管理

### 前端组件

- **`app/dashboard/create/_components/AISurveyGenerator.tsx`**: AI生成器UI
- **`app/dashboard/ai-settings/page.tsx`**: AI设置页面

### API接口

- **`GenerateAISurvey`**: 生成问卷
- **`TestOllamaConnection`**: 测试连接
- **`GetOllamaStatus`**: 获取状态

## 故障排除

### 常见问题

1. **Ollama服务未启动**
   ```bash
   # 启动服务
   ollama serve
   ```

2. **模型未下载**
   ```bash
   # 下载模型
   ollama pull qwen2.5:7b
   ```

3. **端口被占用**
   ```bash
   # 检查端口
   lsof -i :11434
   
   # 修改端口（需要更新配置）
   ollama serve -p 11435
   ```

4. **内存不足**
   - 使用更小的模型：`ollama pull qwen2.5:3b`
   - 增加系统内存
   - 关闭其他应用

5. **生成失败**
   - 检查网络连接
   - 验证模型是否正确下载
   - 查看控制台错误信息

### 性能优化

1. **选择合适的模型**
   - 7B模型：平衡性能和效果
   - 3B模型：更快但效果稍差
   - 13B+模型：更好效果但需要更多资源

2. **调整参数**
   - Temperature: 0.7（推荐）
   - Top P: 0.9（推荐）
   - 重复惩罚: 1.1（推荐）

3. **硬件要求**
   - 内存: 至少8GB RAM
   - 存储: 至少10GB可用空间
   - GPU: 可选，但会显著提升速度

## 高级配置

### 自定义模型

1. 创建Modelfile：
```modelfile
FROM qwen2.5:7b
SYSTEM 你是一个专业的问卷设计专家
```

2. 构建模型：
```bash
ollama create my-survey-model -f Modelfile
```

3. 使用自定义模型：
```env
OLLAMA_MODEL=my-survey-model
```

### 多模型支持

可以在设置页面切换不同的模型：

1. 下载多个模型
2. 在AI设置页面选择模型
3. 测试不同模型的效果

### 网络配置

如果Ollama运行在远程服务器：

```env
OLLAMA_BASE_URL=http://your-server:11434
```

## 开发说明

### 添加新模型支持

1. 在 `ollama-client.ts` 中添加模型配置
2. 更新提示词模板
3. 测试生成效果

### 自定义提示词

修改 `ai-service.ts` 中的 `buildSurveyPrompt` 函数：

```typescript
function buildSurveyPrompt(userPrompt: string): string {
  return `你的自定义提示词模板...
  
  用户需求：${userPrompt}
  
  ...`
}
```

### 扩展问题类型

1. 在DSL中添加新类型
2. 更新AI提示词
3. 添加渲染组件

## 许可证

本项目使用MIT许可证。Ollama使用Apache 2.0许可证。

## 支持

如有问题，请：

1. 查看故障排除部分
2. 检查Ollama官方文档
3. 提交Issue到项目仓库
4. 联系开发团队 