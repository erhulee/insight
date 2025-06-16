import { RuntimeDSLAction } from '@/app/dashboard/_valtio/runtime'
import { Button } from '@/components/ui/button'
import { SingleQuestionSchemaType } from '@/lib/dsl'
import { Radio } from 'antd'
import { PlusCircle } from 'lucide-react'
import { useRef, useState } from 'react'
// 引入 react-beautiful-dnd
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

function SingleQuestionItem(props: { label: string; index: number }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [value, setValue] = useState('点击我编辑')
  return (
    <Draggable draggableId={String(props.index)} index={props.index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className=" bg-slate-100 p-2 rounded-md flex"
        >
          <Radio></Radio>
          <input
            ref={inputRef}
            className=" bg-transparent outline-none w-full"
            defaultValue={props.label}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      )}
    </Draggable>
  )
}
const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}
export function SingleQuestion({ dsl }: { dsl: SingleQuestionSchemaType }) {
  const { props } = dsl
  const { options } = props!
  const handleAddOption = () => {
    RuntimeDSLAction.updateQuestion('props', {
      props: {
        ...props,
        options: [...options, { label: '新选项', value: 'opt' }],
      },
    })
  }
  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return
    }

    const items = reorder(options, result.source.index, result.destination.index)

    RuntimeDSLAction.updateQuestion('props', {
      props: {
        ...props,
        options: items,
      },
    })
  }
  //TODO: 支持拖拽
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="options">
        {(provided) => (
          <div
            ref={provided.innerRef}
            className=" flex flex-col gap-1"
            {...provided.droppableProps}
          >
            {options.map((opt, index) => (
              <SingleQuestionItem key={index} label={opt.label} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div>
        <Button variant="ghost" size="sm" onClick={handleAddOption}>
          <PlusCircle></PlusCircle>
          添加选项
        </Button>
      </div>
    </DragDropContext>
  )
}
