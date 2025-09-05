import { Divider, Form, Input, Switch } from 'antd'

export function BasicConfig() {
    return (
        <div>
            <Form.Item name="title" label="题干">
                <Input></Input>
            </Form.Item>
            <Form.Item name="required" label="必答题">
                <Switch></Switch>
            </Form.Item>
            <Divider></Divider>
        </div>
    )
}

