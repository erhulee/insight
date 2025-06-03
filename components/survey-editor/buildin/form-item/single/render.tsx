import { RuntimeDSLAction } from '@/app/dashboard/_valtio/runtime'
import { Button } from '@/components/ui/button'
import { SingleQuestionSchemaType } from '@/lib/dsl'
import { Radio } from 'antd'
import { PlusCircle } from 'lucide-react'
import { useRef, useState } from 'react'
function SingleQuestionItem(props: { label: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [value, setValue] = useState('点击我编辑')
  return (
    <div className=" bg-slate-100 p-2 rounded-md flex">
      <Radio></Radio>
      <input
        ref={inputRef}
        className=" bg-transparent outline-none w-full"
        defaultValue={props.label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
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
  //TODO: 支持拖拽
  return (
    <div className=" flex flex-col gap-1">
      {options.map((opt) => (
        <SingleQuestionItem label={opt.label}></SingleQuestionItem>
      ))}
      <div>
        <Button variant="ghost" size="sm" onClick={handleAddOption}>
          <PlusCircle></PlusCircle>
          添加选项
        </Button>
      </div>
    </div>
  )
}
