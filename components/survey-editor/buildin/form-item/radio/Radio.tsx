import { CircleDot } from "lucide-react";
import { IFormItemMeta } from "../core/type";
import { QuestionType } from "../core/QuestionType";
import { FormItemConfigSetterType } from "../core/IFormItemConfig";

export const meta: IFormItemMeta = {
    icon: CircleDot,
    title: "单选框",
    type: QuestionType.Radio,
    attrs: [
        {
            name: "options",
            propType: "Array",
            description: '',
            defaultValue: []
        }
    ],
    config: [{
        name: "options",
        title: "选项配置",
        type: FormItemConfigSetterType.Option,
    }]
}