import { Form, Switch } from "antd";

export function DateConfig() {
    return <div>
        <Form.Item name={['props', 'range']} label="是否为范围选择">
            <Switch></Switch>
        </Form.Item>
    </div>
}

