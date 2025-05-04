import { TextCursorInput } from "lucide-react"
import { FormItemConfigSetterType } from "../core/IFormItemConfig"
import { IFormItemMeta } from "../core/type"
import { QuestionType } from "../core/QuestionType"

export const meta: IFormItemMeta = {
    icon: TextCursorInput,
    title: '单行输入框',
    type: QuestionType.Text,
    attrs: [
        {
            name: 'field',
            propType: 'String',
            description: '这是用于描述题目id',
            defaultValue: ''
        },
        {
            name: 'title',
            propType: 'String',
            description: '这是用于描述题目标题',
            defaultValue: '标题一'
        },
        {
            name: 'type',
            propType: 'String',
            description: '这是用于描述题目类型',
            defaultValue: 'text'
        },
        {
            name: 'isRequired',
            propType: "Boolean",
            description: '是否必填',
            defaultValue: true
        },
        {
            name: 'showIndex',
            propType: "Boolean",
            description: '显示序号',
            defaultValue: true
        },
        {
            name: 'showType',
            propType: "Boolean",
            description: '显示类型',
            defaultValue: true
        },
        {
            name: 'showSpliter',
            propType: "Boolean",
            description: '显示分割线',
            defaultValue: true
        },
        {
            name: 'placeholder',
            propType: "String",
            description: '这是用于描述引导提示文案',
            defaultValue: ''
        },
        {
            name: 'valid',
            propType: "String",
            description: '这是用于描述内容限制格式',
            defaultValue: ''
        },
        {
            name: 'textRange',
            propType: "Object",
            description: '这是用于字数限制',
            defaultValue: {
                max: {
                    placeholder: '500',
                    value: 500
                },
                min: {
                    placeholder: '0',
                    value: 0
                }
            }
        }
    ],
    config: [
        {
            name: "title",
            title: "问题名称",
            type: FormItemConfigSetterType.Input,
        },
        {
            name: "field",
            title: "表单字段",
            type: FormItemConfigSetterType.Input,
            placeholder: "可以直接使用随机ID"
        },
        {
            name: 'valid',
            title: '内容限制格式',
            type: FormItemConfigSetterType.Select,
            options: [
                {
                    label: '手机号',
                    value: 'm'
                },
                {
                    label: '身份证',
                    value: 'idcard'
                },
                {
                    label: '数字',
                    value: 'n'
                },
                {
                    label: '邮箱',
                    value: 'e'
                },
                {
                    label: '车牌号',
                    value: 'licensePlate'
                }
            ]
        },
        {
            name: 'textRange',
            title: '字数限制',
            type: FormItemConfigSetterType.Range,
        },
        {
            name: 'placeholder',
            title: '引导提示文案',
            type: FormItemConfigSetterType.Textarea,
            placeholder: '限制20字',
        }
    ]
}

