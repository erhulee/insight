import { Form, Input, InputNumber, Select, Switch } from 'antd'
export function InputConfig() {
    return (
        <div>
            <div className=" text-foreground mb-2 text-base">格式设置</div>
            <Form.Item name={['props', 'format']} label="文本格式">
                <Select
                    options={[
                        {
                            label: '不限格式',
                            value: 'any',
                        },
                        {
                            label: '数字',
                            value: 'digit',
                        },
                        {
                            label: '日期',
                            value: 'date',
                        },
                        {
                            label: '电子邮件',
                            value: 'email',
                        },
                        {
                            label: '手机号（中国大陆）',
                            value: 'phone',
                        },
                        {
                            label: "身份证（中国大陆）",
                            value: 'idCard',
                        }
                    ]}
                ></Select>
            </Form.Item>
            <Form.Item name={['props', 'showCount']} label="展示字数">
                <Switch ></Switch>
            </Form.Item>
            <Form.Item name={['props', 'maxlength']} label="最多填写">
                <InputNumber
                    placeholder="不限"
                    style={{
                        width: '100%',
                    }}
                ></InputNumber>
            </Form.Item>
            <Form.Item name={['props', 'placeholder']} label="提示文案">
                <Input placeholder="请输入"></Input>
            </Form.Item>
        </div>
    )
}

