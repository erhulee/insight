import { Input } from "@/components/ui/input"
import { rename } from "../service"

export function RenameInput(props: {
    title: string,
    id: string
}) {
    return (<Input
        defaultValue={props.title}
        onInput={(value: any) => {
            console.log("rename", value.target.value)
            rename(props.id, value.target.value)
        }}
        className="max-w-[300px] font-medium"
        placeholder="问卷标题"
    />)
}