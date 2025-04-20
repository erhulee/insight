import { FileDigit } from "lucide-react";
import { EditorFormSchma } from "./core";

export const NumberInputSchema: EditorFormSchma = {
    name: '数字输入',
    icon: FileDigit,
    key: 'numberInput',
    componentProps: {
        placeholder: {
            name: "占位提示",
            propsType: "string",
            defaultValue: "",
            exampleValue: "placeholder",
        },
        max: {
            name: "最大值",
            propsType: "number",
            defaultValue: undefined,
            exampleValue: 100,
        },
        min: {
            name: "最小值",
            propsType: "number",
            defaultValue: undefined,
            exampleValue: 0,
        }
    },
    formProps: {
        field: {
            propsType: "string",
            name: "字段标识"
        },
        label: {
            propsType: "string",
            name: "字段名称"
        },
        validator: {
            propsType: "enum",
            name: "校验规则",
            options: [
                "money",
                "number"
            ]
        }
    },

}