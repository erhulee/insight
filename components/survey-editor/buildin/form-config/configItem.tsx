import { ControllerRenderProps } from "react-hook-form";
import { EditorFormFieldItem, EditorFormFieldItemWithOptions } from "../form-item/core";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ConfigItem(props: {
    config: EditorFormFieldItem,
    field: ControllerRenderProps<{
        [x: string]: any;
    }, string>
}) {
    const { config, field } = props;
    switch (config.propsType) {
        case "number":
            return <Input type="number" placeholder="" className=" h-8 focus-visible:shadow-none" {...field} />
        case "string":
            return <Input placeholder="" className=" h-8 focus-visible:shadow-none" {...field} />
        case "enum":
            return <Select >
                <SelectTrigger className=" h-8" >
                    <SelectValue className=" h-8" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {(config as EditorFormFieldItemWithOptions).options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectGroup>
                </SelectContent>
            </Select>
        default:
            return null
    }
}