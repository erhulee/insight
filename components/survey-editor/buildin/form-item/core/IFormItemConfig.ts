export enum FormItemConfigSetterType {
    Select = "Select",
    Range = "Range",
    Input = "Input",
}
interface IFormItemConfig {
    /**
     * 对应 IFormItemAttr 的 name
     */
    name: string,
    /**
     * 外显给用户的名称（label）
     */
    title: string,
    /**
     * 配置项渲染器
     */
    type: FormItemConfigSetterType
}

type SelectSetter = IFormItemConfig & {
    type: FormItemConfigSetterType.Select,
    options: Array<{
        label: string,
        value: string
    }>
}

type RangeSetter = IFormItemConfig & {
    type: FormItemConfigSetterType.Range,
}

type InputSetter = IFormItemConfig & {
    type: FormItemConfigSetterType.Input,
    placeholder: string,
}

export type FormItemConfigSetter = SelectSetter | RangeSetter | InputSetter
