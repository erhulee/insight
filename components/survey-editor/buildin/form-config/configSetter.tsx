import { FormItemConfigSetter, FormItemConfigSetterType } from "../form-item/core/IFormItemConfig";
import { Input, Select } from "antd";
import { OptionSetter } from "./optionSetter";

export function ConfigSetter(props: {
    configSetter: FormItemConfigSetter,
}) {
    const { configSetter } = props
    const { type } = configSetter;
    console.log("configSetter:", configSetter)
    switch (type) {
        case FormItemConfigSetterType.Input:
            return <Input className=" w-full" placeholder={configSetter.placeholder} ></Input>
        case FormItemConfigSetterType.Textarea:
            return <Input.TextArea className=" w-full" ></Input.TextArea>
        case FormItemConfigSetterType.Select:
            const options = configSetter.options;
            return <Select options={options} > </Select>
        case FormItemConfigSetterType.Range:
            return <div className="flex flex-row gap-1 items-center" >
                <span className="text-xs text-gray-700 opacity-80">最小值:</span>
                <Input placeholder="" className=" flex-1  h-8 focus-visible:shadow-none mr-2" type="number" />
                <span className="text-xs text-gray-700 opacity-80">最大值:</span>
                <Input placeholder="" className=" flex-1 h-8 focus-visible:shadow-none" type="number" />
            </div>
        case FormItemConfigSetterType.Option:
            return <OptionSetter></OptionSetter>
        default:
            return null
    }
}