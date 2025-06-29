# 单选题组件 (Single Question Component)

本模块提供了一个基于 `@dnd-kit` 的可排序单选题组件，支持拖拽排序功能。

## 目录结构

```
single/
├── index.ts              # 主导出文件
├── render.tsx            # 主组件实现
├── types.ts              # TypeScript 接口定义
├── hooks/
│   ├── useSortableOptions.ts  # 拖拽排序逻辑的自定义 Hook
│   └── useCardSelection.ts    # 卡片选择逻辑的自定义 Hook
├── utils/
│   └── idGenerator.ts    # ID 生成工具函数
├── schema.tsx            # 组件模式定义
└── README.md             # 说明文档
```

## 功能特性

- ✅ **拖拽排序** - 支持选项的拖拽重新排序
- ✅ **实时编辑** - 选项标签的实时编辑功能
- ✅ **添加选项** - 动态添加新选项，自动生成唯一 ID
- ✅ **平滑动画** - 流畅的拖拽动画和视觉反馈
- ✅ **键盘支持** - 完整的键盘可访问性支持
- ✅ **触摸设备** - 支持触摸设备的拖拽操作
- ✅ **全局卡片选择** - 点击卡片任意位置选择问题
- ✅ **智能事件处理** - 点击交互元素时不触发选择

## 使用方法

```tsx
import { SingleQuestion } from './components/survey-editor/buildin/form-item/single'

function MyComponent() {
  const dsl = {
    // 你的问题 DSL 数据
  }
  
  return <SingleQuestion dsl={dsl} />
}
```

## 自定义 Hook

### useSortableOptions

封装了所有拖拽排序逻辑：

```tsx
import { useSortableOptions } from './hooks/useSortableOptions'

const {
  sortableItems,        // 可排序的选项列表
  sensors,              // 拖拽传感器配置
  handleDragStart,      // 拖拽开始事件处理器
  handleDragEnd,        // 拖拽结束事件处理器
  addOption,            // 添加新选项
  updateOption,         // 更新选项标签
  deleteOption,         // 删除选项
  activeItem,           // 当前激活的拖拽项
} = useSortableOptions(dsl)
```

### useCardSelection

管理卡片选择逻辑，包含智能事件处理：

```tsx
import { useCardSelection } from './hooks/useCardSelection'

const {
  isDragging,           // 是否正在拖拽
  handleCardClick,      // 卡片点击事件处理器
  handleDragStart,      // 拖拽开始事件处理器
  handleDragEnd,        // 拖拽结束事件处理器
} = useCardSelection(questionId)
```

## 卡片选择行为

组件会自动处理卡片任意位置的点击选择，但会排除以下交互元素：

- **输入字段** - 文本输入框、文本域
- **按钮元素** - 包括"添加选项"按钮
- **单选按钮** - Radio 组件
- **拖拽元素** - 拖拽手柄和可拖拽元素
- **ARIA 角色元素** - 具有特定 ARIA 角色的元素

这确保了：
- 用户可以点击卡片任意位置来选择问题
- 交互元素按预期工作，不会意外触发选择
- 拖拽功能不受干扰

## ID 生成机制

每个选项在创建时都会获得一个唯一 ID：

```typescript
// 格式：opt_时间戳_随机字符串
const newOption = {
  label: '新选项',
  value: generateUniqueId(),  // 例如：opt_1703123456789_abc123
  id: generateUniqueId(),     // 例如：opt_1703123456789_def456
}
```

## 工具函数

### ID 生成器 (idGenerator.ts)

提供多种 ID 生成方法：

- `generateUniqueId()` - 生成标准格式的唯一 ID
- `generateUniqueIdWithPrefix(prefix)` - 生成带前缀的唯一 ID
- `isValidOptionId(id)` - 验证 ID 是否有效
- `generateFallbackId(value, index)` - 生成向后兼容的备用 ID

## 依赖项

- `@dnd-kit/core` - 核心拖拽功能
- `@dnd-kit/sortable` - 可排序列表功能
- `@dnd-kit/utilities` - 工具函数
- `antd` - Radio 单选组件
- `lucide-react` - 图标库
- `lodash-es` - 深拷贝等工具函数

## 开发说明

### 组件设计原则

1. **模块化** - 将复杂逻辑拆分为独立的 Hook 和工具函数
2. **可复用性** - Hook 可以在其他组件中复用
3. **类型安全** - 完整的 TypeScript 类型定义
4. **性能优化** - 使用 `useCallback` 和 `useMemo` 优化性能
5. **用户体验** - 流畅的动画和直观的交互反馈

### 扩展建议

- 可以添加更多选项类型（图片、音频等）
- 支持选项的批量操作
- 添加选项的复制功能
- 支持选项的导入导出 