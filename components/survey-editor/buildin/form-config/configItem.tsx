import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormItemConfigSetter, FormItemConfigSetterType } from "../form-item/core/IFormItemConfig";
import { Separator } from "@/components/ui/separator";
import { Input } from "antd";

export function ConfigItem(props: {
    configSetter: FormItemConfigSetter,
}) {
    const { configSetter } = props
    const { type } = configSetter;
    switch (type) {
        case FormItemConfigSetterType.Input:
            return <Input></Input>
        case FormItemConfigSetterType.Select:
            const options = configSetter.options;
            return <Select >
                <SelectTrigger className=" h-8" >
                    <SelectValue className=" h-8" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map(opt => (<SelectItem value={opt.value} key={opt.value} >{opt.label}</SelectItem>))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        case FormItemConfigSetterType.Range:
            return <div className="flex flex-row gap-1 items-center" >
                <span className="text-sm" >最小值:</span>
                <Input placeholder="" className=" flex-1  h-8 focus-visible:shadow-none" type="number" />
                <Separator orientation="vertical" className=" mx-3" ></Separator>
                <span className="text-sm">最大值:</span>
                <Input placeholder="" className=" flex-1 h-8 focus-visible:shadow-none" type="number" />
            </div>
        default:
            return null
    }
}