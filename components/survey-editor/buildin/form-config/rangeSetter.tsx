import { InputNumber } from "antd"
import { useState } from "react"

type RangeValue = Partial<{
    max: string,
    min: string
}>
export function RangeSetter(props: Partial<{
    id: string
    value: RangeValue,
    onChange: (value: RangeValue) => void
}>) {
    // console.log("props:", props)
    const { id, value, onChange } = props
    // const [range, setRange] = useState<RangeValue>(value || { min: undefined, max: undefined })
    return <div className="flex flex-row gap-1 items-center" id={id} >
        <span className="text-xs text-gray-700 opacity-80">最小值:</span>
        <InputNumber value={value?.min}
            onInput={e => {
                onChange!({
                    ...value || {},
                    min: e
                })
            }}
            onChange={e => {
                if (e) {
                    onChange!({
                        ...value || {},
                        min: e
                    })
                }
            }}
            className=" flex-1  h-8 focus-visible:shadow-none mr-2" type="number" />
        <span className="text-xs text-gray-700 opacity-80">最大值:</span>
        <InputNumber value={value?.max}
            onInput={e => {
                onChange!({
                    ...value || {},
                    max: e
                })
            }}
            onChange={e => {
                if (e) {
                    onChange!({
                        ...value || {},
                        max: e
                    })
                }
            }}
            className=" flex-1 h-8 focus-visible:shadow-none" type="number" />
    </div>

}