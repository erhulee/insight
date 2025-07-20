import React from 'react'
import { Form, Input, InputNumber, Select, Switch } from 'antd'
import { ratingTypes } from './index'

export function RatingConfig() {
    return (
        <div className="space-y-4">
            <div className="text-foreground mb-2 text-base">评分设置</div>

            <Form.Item name={['props', 'ratingType']} label="评分类型">
                <Select
                    options={ratingTypes.map(type => ({
                        label: type.label,
                        value: type.value,
                    }))}
                    placeholder="选择评分类型"
                />
            </Form.Item>

            <Form.Item name={['props', 'maxRating']} label="最高分值">
                <InputNumber
                    min={1}
                    max={10}
                    placeholder="5"
                    style={{ width: '100%' }}
                />
            </Form.Item>

            <Form.Item name={['props', 'minLabel']} label="最低分标签">
                <Input placeholder="非常不认同" />
            </Form.Item>

            <Form.Item name={['props', 'maxLabel']} label="最高分标签">
                <Input placeholder="非常认同" />
            </Form.Item>

            <Form.Item name={['props', 'showLabels']} label="显示标签" valuePropName="checked">
                <Switch />
            </Form.Item>

            <Form.Item name={['props', 'description']} label="评分说明">
                <Input.TextArea
                    placeholder="例如：5分表示非常满意，1分表示非常不满意，分值越低表示满意度越低"
                    rows={3}
                />
            </Form.Item>
        </div>
    )
} 