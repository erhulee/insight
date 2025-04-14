import { Input } from "@/components/ui/input"
import { rename } from "../service"

export function RenameInput(props: {
    title: string,
    id: string
}) {
    const handleTitleChange = (value) => {
        console.log("rename", value)
        // rename(props.id, props.title)
    }
    return (<Input
        value={props.title}
        onChange={handleTitleChange}
        className="max-w-[300px] font-medium"
        placeholder="问卷标题"
    />)
}