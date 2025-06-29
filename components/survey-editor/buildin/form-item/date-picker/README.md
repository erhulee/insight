# 日期选择器组件 (Date Picker Component)

本模块提供了一个功能完整的日期选择器组件，基于 Ant Design 的 DatePicker 和 TimePicker 组件，支持日期选择、时间选择、日期验证等功能。

## 目录结构

```
date-picker/
├── index.ts              # 主导出文件
├── render.tsx            # 主组件实现（使用 Ant Design）
├── types.ts              # TypeScript 接口定义
├── schema.tsx            # 组件模式定义
├── hooks/
│   └── useDatePicker.ts  # 日期选择器状态管理 Hook
├── utils/
│   └── dateUtils.ts      # 日期处理工具函数
└── README.md             # 说明文档
```

## 功能特性

- ✅ **日期选择** - 基于 Ant Design DatePicker 的日历式日期选择
- ✅ **时间选择** - 基于 Ant Design TimePicker 的时间选择功能
- ✅ **日期验证** - 完整的日期格式和范围验证
- ✅ **自定义格式** - 支持多种日期格式
- ✅ **日期范围限制** - 支持最小/最大日期限制
- ✅ **实时验证** - 输入时实时验证日期有效性
- ✅ **清除功能** - 一键清除已选择的日期
- ✅ **键盘支持** - 支持键盘输入和导航
- ✅ **响应式设计** - 适配不同屏幕尺寸
- ✅ **无障碍支持** - 完整的 ARIA 支持
- ✅ **Ant Design 集成** - 与现有 Ant Design 组件库完美集成

## 使用方法

```tsx
import { DatePicker } from './components/survey-editor/buildin/form-item/date-picker'

function MyComponent() {
  const dsl = {
    id: 'date-question-1',
    type: 'date',
    title: '请选择您的生日',
    props: {
      config: {
        required: true,
        format: 'YYYY-MM-DD',
        showTime: false,
        minDate: '1900-01-01',
        maxDate: '2024-12-31',
        placeholder: '请选择生日',
      },
      value: '',
    },
  }
  
  return <DatePicker dsl={dsl} />
}
```

## 自定义 Hook

### useDatePicker

管理日期选择器的状态和逻辑：

```tsx
import { useDatePicker } from './hooks/useDatePicker'

const {
  value,              // 当前选中的日期值
  handleDateChange,   // 日期变化处理函数
  handleClear,        // 清除日期处理函数
  placeholder,        // 占位符文本
  format,             // 日期格式
  showTime,           // 是否显示时间选择
  minDate,            // 最小日期
  maxDate,            // 最大日期
  disabled,           // 是否禁用
  required,           // 是否必填
  error,              // 验证错误信息
  validateDate,       // 验证日期是否有效
} = useDatePicker(questionId, initialValue, config)
```

## 配置选项

### DatePickerConfig

```typescript
interface DatePickerConfig {
  /** 是否必填 */
  required?: boolean
  /** 日期格式 */
  format?: string
  /** 最小日期 */
  minDate?: string
  /** 最大日期 */
  maxDate?: string
  /** 占位符文本 */
  placeholder?: string
  /** 是否显示时间选择 */
  showTime?: boolean
  /** 是否禁用 */
  disabled?: boolean
}
```

## 日期格式

支持多种日期格式：

- `YYYY-MM-DD` - 标准日期格式（默认）
- `YYYY-MM-DD HH:mm:ss` - 日期时间格式
- `YYYY年MM月DD日` - 中文日期格式
- `MM/DD/YYYY` - 美式日期格式
- 自定义格式

## 工具函数

### 日期处理工具 (dateUtils.ts)

提供多种日期处理功能：

- `formatDate(date, format)` - 格式化日期
- `parseDate(dateString, format)` - 解析日期字符串
- `isValidDateRange(date, minDate, maxDate)` - 验证日期范围
- `getCurrentDate(format)` - 获取当前日期
- `getPlaceholderText(showTime, format)` - 获取占位符文本
- `isValidDate(dateString)` - 验证日期有效性

## 验证功能

### 日期验证规则

1. **必填验证** - 如果设置为必填，空值将被拒绝
2. **格式验证** - 验证日期格式是否符合要求
3. **范围验证** - 验证日期是否在指定范围内
4. **有效性验证** - 验证日期是否为有效日期

### 错误信息

- "请选择日期" - 必填字段为空
- "日期格式不正确" - 日期格式错误
- "日期必须在 X 到 Y 之间" - 超出日期范围
- "日期不能早于 X" - 早于最小日期
- "日期不能晚于 Y" - 晚于最大日期

## 依赖项

- `antd` - Ant Design 组件库
- `lucide-react` - 图标库
- `@/components/ui/button` - 按钮组件
- `@/components/ui/input` - 输入框组件
- `@/lib/utils` - 工具函数

## 开发说明

### 组件设计原则

1. **模块化** - 将复杂逻辑拆分为独立的 Hook 和工具函数
2. **可复用性** - Hook 可以在其他组件中复用
3. **类型安全** - 完整的 TypeScript 类型定义
4. **性能优化** - 使用 `useCallback` 和 `useMemo` 优化性能
5. **用户体验** - 流畅的交互和直观的反馈
6. **Ant Design 集成** - 充分利用 Ant Design 组件的功能

### 扩展建议

- 支持多日期选择
- 添加日期范围选择
- 支持时区选择
- 添加日期预设选项
- 支持自定义日历主题
- 添加日期格式化模板
- 集成更多 Ant Design 组件

## 示例

### 基础日期选择

```tsx
const config = {
  required: false,
  format: 'YYYY-MM-DD',
  placeholder: '请选择日期',
}
```

### 带时间选择的日期选择器

```tsx
const config = {
  required: true,
  format: 'YYYY-MM-DD HH:mm:ss',
  showTime: true,
  placeholder: '请选择日期和时间',
}
```

### 带范围限制的日期选择器

```tsx
const config = {
  required: true,
  format: 'YYYY-MM-DD',
  minDate: '2024-01-01',
  maxDate: '2024-12-31',
  placeholder: '请选择 2024 年的日期',
}
```

## Ant Design 集成说明

本组件基于 Ant Design 的以下组件构建：

- **DatePicker** - 主要的日期选择功能
- **TimePicker** - 时间选择功能
- **Input** - 自定义输入框（用于手动输入）
- **Button** - 清除按钮

组件充分利用了 Ant Design 的内置功能：
- 日期范围限制
- 格式验证
- 键盘导航
- 无障碍支持
- 国际化支持 