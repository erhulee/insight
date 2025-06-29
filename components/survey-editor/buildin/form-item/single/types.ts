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
  onLabelChange: (label: string) => void
  id: string
}

export interface SingleQuestionProps {
  dsl: any // SingleQuestionSchemaType
} 