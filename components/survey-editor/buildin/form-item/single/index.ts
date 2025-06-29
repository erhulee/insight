/**
 * 单选题组件模块
 * 提供单选题的渲染、拖拽排序、选项管理等功能
 */

// 主组件导出
export { SingleQuestion } from './render'

// 自定义 Hook 导出
export { useSortableOptions } from './hooks/useSortableOptions'
export { useCardSelection } from './hooks/useCardSelection'

// 类型定义导出
export type {
  Option,
  SortableOption,
  SingleQuestionItemProps,
  SingleQuestionProps,
} from './types'

// 工具函数导出
export {
  generateUniqueId,
  generateUniqueIdWithPrefix,
  isValidOptionId,
  generateFallbackId,
} from './utils/idGenerator' 