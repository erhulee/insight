import { Form, Input, InputNumber, Select, Switch } from 'antd'
import React, { useMemo } from 'react'

interface RatingLabel {
    score: number
    label: string
}

interface RatingLabelInputProps {
    value?: RatingLabel[]
    onChange?: (value: RatingLabel[]) => void
    maxRating?: number
}

function RatingLabelInput({ value = [], onChange, maxRating = 5 }: RatingLabelInputProps) {
    console.log("re-render:", maxRating)
    const scores = useMemo(() => {
        return Array.from({ length: maxRating }, (_, i) => i * 2 + 1)
    }, [maxRating])

    // 确保value数组长度与scores一致
    const normalizedValue = useMemo(() => {
        const result: RatingLabel[] = []
        scores.forEach((score, index) => {
            result[index] = value[index] || { score, label: '' }
        })
        return result
    }, [value, scores])

    const handleLabelChange = (index: number, label: string) => {
        const newValue = [...normalizedValue]
        newValue[index] = { ...newValue[index], label }
        onChange?.(newValue)
    }

    return (
        <div className="space-y-3">
            {scores.map((score, index) => (
                <div key={score} className="flex items-center gap-3">
                    <InputNumber
                        value={score}
                        disabled
                        style={{ width: 60 }}
                        className="bg-gray-50"
                    />
                    <div className="text-sm flex-shrink-0 text-gray-600">分文案</div>
                    <Input
                        value={normalizedValue[index]?.label || ''}
                        onChange={(e) => handleLabelChange(index, e.target.value)}
                        placeholder={`分数${score}的文案`}
                        style={{ width: 200 }}
                    />
                </div>
            ))}
        </div>
    )
}

export function RatingConfig() {
    const form = Form.useFormInstance(); // 获取当前表单实例

    // 获取 maxRating，默认值为 5
    const maxRating = form.getFieldValue(['props', 'maxRating']) || 5;
    return (
        <div>
            <div className="text-foreground mb-2 text-base">评分设置</div>
            <Form.Item name={['props', 'ratingType']} label="评分类型">
                <Select
                    options={[
                        { label: '星级评分', value: 'star' },
                        { label: '数字评分', value: 'number' },
                        { label: '爱心评分', value: 'heart' },
                    ]}
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
            <Form.Item name={['props', 'showLabels']} label="显示标签" valuePropName="checked">
                <Switch />
            </Form.Item>
            <Form.Item
                name={['props', 'labels']}
                label="分数文案"
            >
                <RatingLabelInput maxRating={maxRating} />
            </Form.Item>
            <Form.Item name={['props', 'description']} label="评分说明">
                <Input.TextArea
                    placeholder="例如：5分表示非常满意，1分表示非常不满意，分值越低表示满意度越低"
                    rows={3}
                />
            </Form.Item>
            <Form.Item name={['props', 'displayRelation']} label="关联选项">

            </Form.Item>
        </div>
    )
}

