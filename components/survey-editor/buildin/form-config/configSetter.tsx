import { FormItemConfigSetter, FormItemConfigSetterType } from '../form-item/core/IFormItemConfig'
import { Input, Select } from 'antd'
import { OptionSetter } from './optionSetter'
import { RangeSetter } from './rangeSetter'

export function ConfigSetter(props: { configSetter: FormItemConfigSetter }) {
  const { configSetter } = props
  const { type } = configSetter
  console.log('configSetter:', configSetter)
  switch (type) {
    case FormItemConfigSetterType.Input:
      return <Input className=" w-full" placeholder={configSetter.placeholder}></Input>
    case FormItemConfigSetterType.Textarea:
      return <Input.TextArea className=" w-full"></Input.TextArea>
    case FormItemConfigSetterType.Select:
      const options = configSetter.options
      return <Select options={options}> </Select>
    case FormItemConfigSetterType.Range:
      return <RangeSetter></RangeSetter>
    case FormItemConfigSetterType.Option:
      return <OptionSetter></OptionSetter>
    default:
      return null
  }
}
