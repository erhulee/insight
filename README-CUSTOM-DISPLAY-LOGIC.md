# 自定义展示逻辑系统

参考腾讯问卷的自定义展示逻辑功能，实现基于用户答案的条件显示/隐藏问题。

## 功能特性

### 🎯 核心功能
- **条件显示**: 根据用户答案显示特定问题
- **条件隐藏**: 根据用户答案隐藏特定问题
- **复杂逻辑**: 支持AND/OR逻辑组合
- **实时预览**: 配置后立即看到效果
- **调试模式**: 查看逻辑执行状态

### 🔧 支持的操作符
- `equals` - 等于
- `not_equals` - 不等于
- `contains` - 包含
- `not_contains` - 不包含
- `greater_than` - 大于
- `less_than` - 小于
- `is_empty` - 为空
- `is_not_empty` - 不为空

### 📋 支持的问题类型
- 单选题 (radio)
- 多选题 (checkbox)
- 文本输入 (text)
- 文本域 (textarea)
- 下拉选择 (dropdown)
- 评分 (rating)
- 日期选择 (date)

## 快速开始

### 1. 访问演示页面

```bash
# 启动开发服务器
npm run dev

# 访问演示页面
http://localhost:3000/demo/display-logic
```

### 2. 基本使用

```tsx
import { SurveyRendererWithLogic } from '@/components/survey/SurveyRendererWithLogic'
import { DisplayLogicConfig } from '@/lib/custom-display-logic'

const questions = [
  {
    id: 'q1',
    type: 'radio',
    title: '您的性别是？',
    options: [
      { text: '男性', value: 'male' },
      { text: '女性', value: 'female' }
    ]
  },
  {
    id: 'q2',
    type: 'text',
    title: '请描述您的需求',
    required: false
  }
]

const logicConfig: DisplayLogicConfig = {
  enabled: true,
  rules: [
    {
      id: 'rule_1',
      conditions: [
        {
          questionId: 'q1',
          operator: 'equals',
          value: 'male'
        }
      ],
      operator: 'AND',
      action: 'show',
      targetQuestionId: 'q2'
    }
  ]
}

function MySurvey() {
  return (
    <SurveyRendererWithLogic
      questions={questions}
      logicConfig={logicConfig}
      onSubmit={(answers) => console.log(answers)}
    />
  )
}
```

## 技术架构

### 核心文件结构

```
lib/
├── custom-display-logic.ts          # 核心逻辑引擎
├── api-types.ts                     # 类型定义

components/
├── survey-editor/
│   └── display-logic/
│       └── DisplayLogicConfigurator.tsx  # 逻辑配置器
├── survey/
│   └── SurveyRendererWithLogic.tsx       # 增强的问卷渲染器

hooks/
└── use-display-logic.ts             # 逻辑状态管理Hook

app/
└── demo/
    └── display-logic/
        └── page.tsx                 # 演示页面
```

### 核心组件

#### 1. DisplayLogicEvaluator (逻辑评估引擎)

```typescript
class DisplayLogicEvaluator {
  // 评估单个条件
  private evaluateCondition(condition: DisplayLogicCondition): boolean
  
  // 评估规则
  private evaluateRule(rule: DisplayLogicRule): boolean
  
  // 评估问题是否应该显示
  evaluateQuestionVisibility(questionId: string, logicConfig: DisplayLogicConfig): boolean
  
  // 获取所有应该隐藏的问题ID
  getHiddenQuestionIds(logicConfig: DisplayLogicConfig): string[]
}
```

#### 2. useDisplayLogic Hook

```typescript
const {
  // 状态
  logicConfig,
  answers,
  
  // 评估方法
  isQuestionVisible,
  getVisibleQuestions,
  
  // 配置管理
  updateLogicConfig,
  addRule,
  removeRule,
  
  // 答案管理
  updateAnswers,
  resetAnswers
} = useDisplayLogic(questions)
```

#### 3. DisplayLogicConfigurator (配置器)

提供可视化的逻辑配置界面，支持：
- 添加/删除规则
- 配置条件
- 选择操作符
- 应用预设模板

#### 4. SurveyRendererWithLogic (渲染器)

增强的问卷渲染器，支持：
- 条件显示/隐藏问题
- 实时逻辑评估
- 调试信息显示
- 进度跟踪

## 配置示例

### 基础配置

```typescript
const logicConfig: DisplayLogicConfig = {
  enabled: true,
  rules: [
    {
      id: 'rule_1',
      conditions: [
        {
          questionId: 'gender',
          operator: 'equals',
          value: 'male'
        }
      ],
      operator: 'AND',
      action: 'show',
      targetQuestionId: 'male_specific_question'
    }
  ]
}
```

### 复杂逻辑配置

```typescript
const complexLogicConfig: DisplayLogicConfig = {
  enabled: true,
  rules: [
    {
      id: 'rule_1',
      conditions: [
        {
          questionId: 'age',
          operator: 'greater_than',
          value: 18
        },
        {
          questionId: 'location',
          operator: 'contains',
          value: '北京'
        }
      ],
      operator: 'AND',
      action: 'show',
      targetQuestionId: 'adult_beijing_question'
    },
    {
      id: 'rule_2',
      conditions: [
        {
          questionId: 'satisfaction',
          operator: 'equals',
          value: 'dissatisfied'
        },
        {
          questionId: 'satisfaction',
          operator: 'equals',
          value: 'very_dissatisfied'
        }
      ],
      operator: 'OR',
      action: 'show',
      targetQuestionId: 'feedback_question'
    }
  ]
}
```

## 预设模板

系统提供了常用的逻辑模板：

### 1. 性别相关逻辑

```typescript
const genderLogic = LOGIC_TEMPLATES.genderBased.template(
  'gender_question_id',
  'male_specific_question_id',
  'female_specific_question_id'
)
```

### 2. 年龄相关逻辑

```typescript
const ageLogic = LOGIC_TEMPLATES.ageBased.template(
  'age_question_id',
  'young_question_id',
  'adult_question_id'
)
```

### 3. 满意度相关逻辑

```typescript
const satisfactionLogic = LOGIC_TEMPLATES.satisfactionBased.template(
  'satisfaction_question_id',
  'follow_up_question_id'
)
```

## API 参考

### DisplayLogicConfig

```typescript
interface DisplayLogicConfig {
  rules: DisplayLogicRule[]
  enabled: boolean
}
```

### DisplayLogicRule

```typescript
interface DisplayLogicRule {
  id: string
  conditions: DisplayLogicCondition[]
  operator: 'AND' | 'OR'
  action: 'show' | 'hide'
  targetQuestionId: string
}
```

### DisplayLogicCondition

```typescript
interface DisplayLogicCondition {
  questionId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value?: string | number | string[]
  valueType?: 'string' | 'number' | 'array'
}
```

## 最佳实践

### 1. 逻辑设计原则

- **简洁性**: 避免过于复杂的逻辑规则
- **可读性**: 使用清晰的规则名称和描述
- **测试性**: 充分测试各种答案组合

### 2. 性能优化

- 使用 `useCallback` 和 `useMemo` 优化渲染性能
- 避免在逻辑评估中进行复杂计算
- 合理使用调试模式

### 3. 用户体验

- 提供清晰的逻辑状态指示
- 支持实时预览和调试
- 提供预设模板简化配置

## 扩展开发

### 添加新的操作符

1. 在 `DisplayLogicCondition` 接口中添加新的操作符类型
2. 在 `DisplayLogicEvaluator.evaluateCondition` 方法中实现逻辑
3. 在 `LOGIC_OPERATORS` 常量中添加中文映射

### 添加新的问题类型支持

1. 在 `SurveyRendererWithLogic` 组件的 `renderInput` 方法中添加新的 case
2. 确保新类型的问题能够正确获取答案值
3. 更新相关的类型定义

### 自定义逻辑模板

```typescript
const customTemplate = {
  name: '自定义模板',
  description: '自定义逻辑模板描述',
  template: (param1: string, param2: string): DisplayLogicConfig => ({
    rules: [
      // 自定义规则
    ],
    enabled: true
  })
}
```

## 故障排除

### 常见问题

1. **问题不显示/隐藏**
   - 检查逻辑配置是否正确
   - 确认目标问题ID存在
   - 验证条件值格式

2. **逻辑评估错误**
   - 启用调试模式查看详细信息
   - 检查操作符和值类型匹配
   - 验证问题答案格式

3. **性能问题**
   - 减少不必要的重新渲染
   - 优化逻辑规则复杂度
   - 使用 React DevTools 分析性能

### 调试技巧

1. 启用调试模式查看逻辑执行状态
2. 使用浏览器控制台查看详细日志
3. 检查网络请求和状态更新

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个功能！

### 开发环境设置

```bash
# 克隆项目
git clone <repository-url>

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test
```

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 React Hooks 最佳实践
- 保持组件职责单一
- 编写清晰的文档和注释

## 许可证

MIT License 