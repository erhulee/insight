import { Button } from "@/components/ui/button";
import { Input } from "antd";
import { cloneDeep } from "lodash-es";
import { Plus, X } from "lucide-react";
import { useState } from "react";

type Props = Partial<{
    id: string,
    value: string[],
    onChange: (value: string[]) => void
}>
export function OptionSetter(props: Props) {
    const { id, value = [], onChange } = props
    const [additionContent, setAdditionContent] = useState<string>("")
    return <div id={id}>
        <div className="flex flex-col gap-1 items-center w-full" >
            {value.map((item: string, index: number) => (<div key={item + index} className=" w-full flex flex-row" >
                <Input value={value[index]} className=" flex-1 focus-visible:shadow-none mr-2" onChange={(e) => {
                    const newContent = e.target.value;
                    const newValues = cloneDeep(value);
                    newValues[index] = newContent;
                    onChange!(newValues)
                }} />
                <Button size="icon" variant="ghost" className=" w-8 h-8" onClick={() => {
                    let newValues = cloneDeep(value);
                    newValues.splice(index, 1)
                    onChange!(newValues)
                }} >
                    <X className=" w-4 h-4" ></X>
                </Button></div>))}
            <div className=" w-full flex flex-row" >
                <Input value={additionContent} onChange={(e) => {
                    setAdditionContent(e.target.value)
                }} placeholder="输入选项后，点击 + 号保存" className=" flex-1 focus-visible:shadow-none mr-2" />
                <Button size="icon" variant="ghost" className=" w-8 h-8" disabled={additionContent == "" || value.includes(additionContent)} onClick={() => {
                    if (additionContent !== "") {
                        onChange!([...value, additionContent])
                        setAdditionContent("")
                    }
                }} >
                    <Plus className=" w-4 h-4" ></Plus>
                </Button>
            </div>

        </div>
    </div>
}