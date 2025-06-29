/**
 * 单选题选项的基础接口
 */
export interface Option {
    /** 选项显示文本 */
    label: string
    /** 选项值 */
    value: string
    /** 选项唯一标识符（可选） */
    id?: string
}

/**
 * 可排序选项接口
 * 继承自 Option，但 id 字段为必需
 */
export interface SortableOption extends Option {
    /** 选项唯一标识符（必需） */
    id: string
}

/**
 * 可排序单选题选项组件的属性接口
 */
export interface SingleQuestionItemProps {
    /** 选项显示文本 */
    label: string
    /** 选项在列表中的索引 */
    index: number
    /** 选项唯一标识符 */
    id: string
    /** 标签变化回调函数 */
    onLabelChange: (label: string) => void
    /** 删除选项回调函数 */
    onDelete: (id: string) => void
}

/**
 * 单选题主组件的属性接口
 */
export interface SingleQuestionProps {
    /** DSL 数据结构，包含单选题的完整配置 */
    dsl: any // TODO: 应该使用 SingleQuestionSchemaType 类型
} 