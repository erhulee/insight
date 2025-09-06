import { Form, Input, InputNumber, Select, Switch } from 'antd'
export function SingleConfig() {
	return (
		<div>
			<Form.Item
				layout="horizontal"
				name={['props', 'random']}
				label="选项顺序随机"
			>
				<Switch></Switch>
			</Form.Item>
		</div>
	)
}
