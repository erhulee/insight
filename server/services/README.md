# 服务层架构说明

## 概述

本项目采用分层架构设计，将业务逻辑从 tRPC 路由中提取到专门的服务层（Service Layer），实现了关注点分离和代码复用。

## 架构设计原则

1. **单一职责原则**: 每个服务类只负责一个业务领域
2. **依赖注入**: 服务层通过依赖注入使用外部资源
3. **错误处理**: 统一的错误处理和异常转换
4. **类型安全**: 完整的 TypeScript 类型定义
5. **可测试性**: 服务层易于单元测试

## 服务层结构

```
server/services/
├── index.ts              # 统一导出文件
├── user-service.ts       # 用户管理服务
├── survey-service.ts     # 问卷管理服务
├── template-service.ts   # 模板管理服务
├── api-key-service.ts    # API密钥管理服务
├── ai-config-service.ts  # AI配置管理服务
└── ollama-service.ts     # Ollama服务管理
```

## 各服务说明

### 1. UserService (用户服务)

**职责**: 用户注册、登录、信息管理等

**主要方法**:
- `register()` - 用户注册
- `createUser()` - 创建用户并自动登录
- `logout()` - 用户登出
- `getUserInfo()` - 获取用户信息
- `validateToken()` - 验证token
- `updateUserInfo()` - 更新用户信息

### 2. SurveyService (问卷服务)

**职责**: 问卷的增删改查、回复管理等

**主要方法**:
- `createSurvey()` - 创建问卷
- `getSurvey()` - 获取问卷详情
- `getSurveyList()` - 获取问卷列表
- `updateSurvey()` - 更新问卷
- `deleteSurvey()` - 删除问卷（软删除）
- `publishSurvey()` - 发布/取消发布问卷
- `submitSurveyResponse()` - 提交问卷回复
- `getSurveyResponses()` - 获取问卷回复列表

### 3. TemplateService (模板服务)

**职责**: 问卷模板的管理

**主要方法**:
- `saveQuestionsToTemplate()` - 保存问卷为模板
- `getTemplateList()` - 获取模板列表
- `createSurveyByTemplate()` - 根据模板创建问卷
- `getTemplate()` - 获取模板详情
- `updateTemplate()` - 更新模板
- `deleteTemplate()` - 删除模板

### 4. ApiKeyService (API密钥服务)

**职责**: API密钥的生成、验证、管理等

**主要方法**:
- `createApiKey()` - 创建API密钥
- `getApiKeys()` - 获取API密钥列表
- `deleteApiKey()` - 删除API密钥（软删除）
- `validateApiKey()` - 验证API密钥
- `getApiKeyDetail()` - 获取API密钥详情
- `updateApiKey()` - 更新API密钥

### 5. AIConfigService (AI配置服务)

**职责**: AI服务的配置测试、状态获取、问卷生成等

**主要方法**:
- `testConnection()` - 测试AI服务连接
- `getServiceStatus()` - 获取AI服务状态
- `generateSurvey()` - 使用指定配置生成问卷
- `generateSurveyStream()` - 流式生成问卷

### 6. OllamaService (Ollama服务)

**职责**: Ollama本地AI服务的管理

**主要方法**:
- `isAvailable()` - 检查服务是否可用
- `generate()` - 生成文本内容
- `generateStream()` - 流式生成文本
- `getModels()` - 获取可用模型列表
- `getModelInfo()` - 获取模型信息
- `pullModel()` - 拉取模型
- `deleteModel()` - 删除模型

## 使用方式

### 在 tRPC 路由中使用

```typescript
import { userService, surveyService } from './services'

export const appRouter = router({
  Register: procedure
    .input(z.object({
      account: z.string(),
      password: z.string(),
      username: z.string(),
    }))
    .mutation(async (opt) => {
      try {
        return await userService.register(opt.input)
      } catch (e) {
        // 错误处理
      }
    }),
})
```

### 错误处理

服务层统一使用 `TRPCError` 抛出业务错误：

```typescript
throw new TRPCError({
  message: '用户不存在',
  code: 'NOT_FOUND',
})
```

### 类型安全

所有服务都有完整的 TypeScript 接口定义：

```typescript
export interface CreateUserInput {
  account: string
  password: string
  username: string
}

export interface UserInfo {
  id: string
  account: string
  username: string
  createdAt: Date
  updatedAt: Date
}
```

## 优势

1. **代码复用**: 业务逻辑可以在多个路由中复用
2. **易于测试**: 服务层可以独立进行单元测试
3. **维护性**: 业务逻辑集中管理，易于维护和修改
4. **可扩展性**: 新增功能只需添加新的服务方法
5. **类型安全**: 完整的 TypeScript 类型支持

## 注意事项

1. 服务层不直接处理 HTTP 请求，只负责业务逻辑
2. 所有数据库操作都在服务层进行
3. 错误处理统一使用 TRPCError
4. 服务方法应该是幂等的和可重试的
5. 敏感操作（如密码验证）在服务层进行
