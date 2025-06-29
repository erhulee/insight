export interface Option {
    label: string
    value: string
    id?: string
}

export interface SortableOption extends Option {
    id: string
}

export interface SingleQuestionItemProps {
    label: string
    index: number
    id: string
    onLabelChange: (label: string) => void
    onDelete: (id: string) => void
}

export interface SingleQuestionProps {
    dsl: any // SingleQuestionSchemaType
} 