# 表单编辑器代码架构设计

## 📋 项目概述

本文档描述了一个专业的表单编辑器系统的代码架构设计。该系统采用现代前端技术栈，支持拖拽式表单设计、实时预览、多页面管理等功能。

## 🏗️ 整体架构

### 架构层次
```
┌─────────────────────────────────────────────────────────────┐
│                    用户界面层 (UI Layer)                      │
├─────────────────────────────────────────────────────────────┤
│                  业务逻辑层 (Business Layer)                  │
├─────────────────────────────────────────────────────────────┤
│                  状态管理层 (State Layer)                     │
├─────────────────────────────────────────────────────────────┤
│                  数据访问层 (Data Layer)                     │
├─────────────────────────────────────────────────────────────┤
│                  基础设施层 (Infrastructure Layer)            │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈
- **前端框架**: React 19 + TypeScript
- **状态管理**: Valtio (响应式状态管理)
- **UI组件库**: Shadcn UI + Radix UI
- **拖拽功能**: 自定义拖拽系统
- **数据获取**: tRPC + React Query
- **样式系统**: Tailwind CSS
- **构建工具**: Next.js 15 (App Router)

## 🎯 核心功能模块

### 1. 表单设计器 (Form Designer)
- 拖拽式组件添加
- 组件属性配置
- 实时预览
- 多页面管理
- 响应式布局

### 2. 组件库 (Widget Library)
- 基础输入组件
- 高级表单组件
- 布局组件
- 自定义组件扩展

### 3. 配置面板 (Configuration Panel)
- 组件属性编辑
- 页面设置
- 表单验证规则
- 逻辑跳转配置

### 4. 预览系统 (Preview System)
- 实时预览
- 移动端预览
- 响应式预览
- 预览数据模拟

## 📁 目录结构

```
app/(dashboard)/dashboard/edit/
├── [id]/
│   └── page.tsx                    # 主编辑页面
├── _components/                     # 编辑器组件
│   ├── EditHeader.tsx              # 顶部导航栏
│   ├── EditHeaderSkeleton.tsx      # 导航栏骨架屏
│   ├── WidgetPanel.tsx             # 左侧组件面板
│   ├── EditCanvas.tsx              # 中间画布区域
│   ├── EditQuestionConfig.tsx      # 右侧问题配置
│   ├── SuveryPageConfig.tsx        # 页面配置面板
│   ├── SurveyPagiNation.tsx        # 分页导航
│   ├── RenameInput.tsx             # 重命名输入框
│   ├── JsonEditor.tsx              # JSON编辑器
│   ├── shareConfig.tsx             # 分享配置
│   ├── preview.tsx                 # 预览组件
│   ├── EditQuestionItem.tsx        # 问题项编辑
│   ├── QuestionConfig/             # 问题配置子组件
│   │   ├── BasicConfig.tsx         # 基础配置
│   │   ├── ValidationConfig.tsx    # 验证配置
│   │   ├── LogicConfig.tsx         # 逻辑配置
│   │   └── StyleConfig.tsx         # 样式配置
│   └── drag/                       # 拖拽相关组件
│       ├── DragDropContext.tsx     # 拖拽上下文
│       ├── DraggableItem.tsx       # 可拖拽项
│       ├── DroppableZone.tsx       # 可放置区域
│       └── DragPreview.tsx         # 拖拽预览
├── _hooks/                         # 自定义钩子
│   ├── useFormEditor.ts            # 表单编辑器主钩子
│   ├── useDragDrop.ts              # 拖拽钩子
│   ├── useComponentConfig.ts       # 组件配置钩子
│   ├── useFormValidation.ts        # 表单验证钩子
│   └── useFormPreview.ts           # 表单预览钩子
├── _services/                      # 业务服务
│   ├── formService.ts              # 表单服务
│   ├── componentService.ts         # 组件服务
│   ├── validationService.ts        # 验证服务
│   └── exportService.ts            # 导出服务
├── _types/                         # 类型定义
│   ├── form.ts                     # 表单相关类型
│   ├── component.ts                # 组件相关类型
│   ├── validation.ts               # 验证相关类型
│   └── editor.ts                   # 编辑器相关类型
└── _utils/                         # 工具函数
    ├── componentUtils.ts            # 组件工具
    ├── validationUtils.ts          # 验证工具
    ├── exportUtils.ts              # 导出工具
    └── formUtils.ts                # 表单工具
```

## 🔄 状态管理架构

### 核心状态结构

```typescript
// 运行时状态
interface RuntimeState {
  // 基础信息
  surveyId: string
  surveyName: string
  surveyDescription?: string
  
  // 页面管理
  pageCount: number
  currentPage: number
  pages: Page[]
  
  // 组件管理
  questions: Question[]
  selectedQuestionID: string | null
  currentQuestion: Question[]
  
  // 编辑器状态
  isEditing: boolean
  isPreviewing: boolean
  activeTab: 'design' | 'json' | 'preview'
  
  // 拖拽状态
  dragState: DragState
  
  // 历史记录
  history: HistoryState
}

// 问题组件结构
interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  ownerPage: number
  order: number
  
  // 组件属性
  props: ComponentProps
  
  // 验证规则
  validation: ValidationRule[]
  
  // 逻辑配置
  logic: LogicConfig[]
  
  // 样式配置
  style: StyleConfig
  
  // 元数据
  componentMeta: ComponentMeta
}
```

### 状态管理策略

1. **响应式状态**: 使用 Valtio 实现响应式状态管理
2. **状态分离**: 按功能模块分离状态
3. **状态持久化**: 自动保存到本地存储和服务器
4. **状态回滚**: 支持撤销/重做操作
5. **状态同步**: 多用户协作时的状态同步

## 🧩 组件架构设计

### 组件分类

#### 1. 基础组件 (Basic Components)
```typescript
interface BasicComponent {
  type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'url'
  props: BasicComponentProps
}
```

#### 2. 选择组件 (Choice Components)
```typescript
interface ChoiceComponent {
  type: 'radio' | 'checkbox' | 'select' | 'rating'
  props: ChoiceComponentProps
  options: Option[]
}
```

#### 3. 日期时间组件 (DateTime Components)
```typescript
interface DateTimeComponent {
  type: 'date' | 'time' | 'datetime' | 'daterange'
  props: DateTimeComponentProps
}
```

#### 4. 文件组件 (File Components)
```typescript
interface FileComponent {
  type: 'file' | 'image' | 'video' | 'audio'
  props: FileComponentProps
}
```

#### 5. 布局组件 (Layout Components)
```typescript
interface LayoutComponent {
  type: 'section' | 'row' | 'column' | 'divider' | 'spacer'
  props: LayoutComponentProps
}
```

## 🎨 拖拽系统架构

### 拖拽流程

```typescript
interface DragDropSystem {
  // 拖拽开始
  onDragStart: (component: Component, source: DragSource) => void
  
  // 拖拽中
  onDragOver: (target: DropTarget, position: DropPosition) => void
  
  // 拖拽结束
  onDrop: (component: Component, target: DropTarget, position: DropPosition) => void
  
  // 拖拽取消
  onDragCancel: () => void
}
```

### 拖拽区域管理

```typescript
interface DropZone {
  id: string
  type: 'page' | 'section' | 'row' | 'column'
  accept: ComponentType[]
  position: DropPosition
  children: string[] // 子组件ID列表
}
```

## ⚙️ 配置系统架构

### 配置面板结构

```typescript
interface ConfigPanel {
  // 基础配置
  basic: BasicConfig
  
  // 验证配置
  validation: ValidationConfig
  
  // 逻辑配置
  logic: LogicConfig
  
  // 样式配置
  style: StyleConfig
  
  // 高级配置
  advanced: AdvancedConfig
}
```

### 配置项类型

```typescript
interface ConfigItem {
  key: string
  label: string
  type: 'input' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'color' | 'number'
  value: any
  defaultValue: any
  required: boolean
  validation?: ValidationRule
  options?: Option[]
  description?: string
}
```

## 🔍 验证系统架构

### 验证规则结构

```typescript
interface ValidationRule {
  type: ValidationType
  value: any
  message: string
  enabled: boolean
  
  // 自定义验证函数
  validator?: (value: any, rule: ValidationRule) => boolean | string
}

type ValidationType = 
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'min'
  | 'max'
  | 'email'
  | 'url'
  | 'phone'
  | 'custom'
```

### 验证流程

```typescript
interface ValidationFlow {
  // 实时验证
  validateOnChange: (value: any, rules: ValidationRule[]) => ValidationResult[]
  
  // 失焦验证
  validateOnBlur: (value: any, rules: ValidationRule[]) => ValidationResult[]
  
  // 提交验证
  validateOnSubmit: (formData: FormData) => ValidationResult[]
  
  // 字段验证
  validateField: (fieldId: string, value: any) => ValidationResult[]
}
```

## 🚀 性能优化策略

### 1. 组件懒加载
```typescript
// 动态导入组件
const LazyComponent = lazy(() => import('./Component'))

// 按需加载配置面板
const ConfigPanel = lazy(() => import('./ConfigPanel'))
```

### 2. 虚拟滚动
```typescript
// 长列表虚拟化
interface VirtualScroll {
  itemHeight: number
  visibleCount: number
  totalCount: number
  scrollTop: number
}
```

### 3. 状态优化
```typescript
// 状态分片
interface StateSlice {
  questions: Question[]
  selectedQuestion: Question | null
  dragState: DragState
}

// 状态订阅优化
const useOptimizedState = (selector: (state: RuntimeState) => any) => {
  return useSnapshot(runtimeStore, selector)
}
```

### 4. 渲染优化
```typescript
// React.memo 优化
const OptimizedComponent = memo(Component, (prevProps, nextProps) => {
  return isEqual(prevProps, nextProps)
})

// useCallback 优化
const handleUpdate = useCallback((id: string, value: any) => {
  updateQuestion(id, value)
}, [])
```

## 🔧 扩展性设计

### 插件系统

```typescript
interface PluginSystem {
  // 插件注册
  registerPlugin: (plugin: Plugin) => void
  
  // 插件卸载
  unregisterPlugin: (pluginId: string) => void
  
  // 插件配置
  configurePlugin: (pluginId: string, config: any) => void
  
  // 插件生命周期
  lifecycle: PluginLifecycle
}

interface Plugin {
  id: string
  name: string
  version: string
  description: string
  
  // 组件扩展
  components?: ComponentDefinition[]
  
  // 配置扩展
  configs?: ConfigDefinition[]
  
  // 验证扩展
  validators?: ValidatorDefinition[]
  
  // 导出扩展
  exporters?: ExporterDefinition[]
}
```

## 🧪 测试策略

### 测试层次

```typescript
// 单元测试
describe('Component', () => {
  test('should render correctly', () => {
    // 组件渲染测试
  })
  
  test('should handle props changes', () => {
    // 属性变化测试
  })
})

// 集成测试
describe('Form Editor Integration', () => {
  test('should handle drag and drop', () => {
    // 拖拽功能测试
  })
  
  test('should save form data', () => {
    // 数据保存测试
  })
})
```

### 测试工具

- **单元测试**: Jest + React Testing Library
- **集成测试**: Playwright
- **E2E测试**: Cypress
- **性能测试**: Lighthouse CI
- **类型测试**: TypeScript Compiler API

## 📈 未来规划

### 短期目标 (1-3个月)
- [ ] 完善拖拽系统
- [ ] 优化性能
- [ ] 增加更多组件类型
- [ ] 完善验证系统

### 中期目标 (3-6个月)
- [ ] 实现插件系统
- [ ] 添加协作功能
- [ ] 支持移动端编辑
- [ ] 增加模板系统

### 长期目标 (6-12个月)
- [ ] AI辅助设计
- [ ] 多语言支持
- [ ] 企业级功能
- [ ] 生态系统建设

## 📚 参考资料

- [React 官方文档](https://react.dev/)
- [Next.js 官方文档](https://nextjs.org/docs)
- [Valtio 状态管理](https://github.com/pmndrs/valtio)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Radix UI 组件库](https://www.radix-ui.com/)
- [tRPC 官方文档](https://trpc.io/)

---

*本文档持续更新中，如有疑问或建议，请联系开发团队。*
