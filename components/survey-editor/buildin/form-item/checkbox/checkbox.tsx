import { CircleCheckBig } from "lucide-react";
import { IFormItemMeta } from "../core/type";
import { QuestionType } from "../core/QuestionType";
import { FormItemConfigSetterType } from "../core/IFormItemConfig";

export const meta: IFormItemMeta = {
    icon: CircleCheckBig,
    title: "多选题",
    type: QuestionType.Checkbox,
    attrs: [
        {
            name: "options",
            propType: "Array",
            description: '',
            defaultValue: ["选项1", "选项2", "选项3"]
        }
    ],
    config: [{
        name: "options",
        title: "选项配置",
        type: FormItemConfigSetterType.Option,
    }]
}