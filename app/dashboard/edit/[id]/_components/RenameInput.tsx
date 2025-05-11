import { Input } from "@/components/ui/input"
import { rename } from "../service"
import { RefObject, useState } from "react"
import { useEffect, useRef } from 'react';
import { useHover } from 'react-use';
import { Pencil } from "lucide-react";
// 自定义 useClickOutside hook
const useClickOutside = (ref: RefObject<HTMLDivElement | null>, callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [callback]);

    return ref;
};
export function RenameInput(props: {
    title: string,
    id: string,
    onUpdate?: (title: string) => void
}) {
    const { title, id } = props
    const [isEditing, setIsEditing] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null);
    const rawTitleRef = useRef<HTMLDivElement | null>(null)
    useClickOutside(ref, () => {
        setIsEditing(false)
    }); // 调用 useClickOutsid
    const [hoverable, hovered] = useHover(() => {
        return <div
            ref={rawTitleRef}
            className=" font-medium text-sm h-9 p-2"
            onDoubleClick={() => {
                setIsEditing(true)
            }}
        >
            {title}
        </div>
    })
    return <div ref={ref} className=" flex flex-row items-center" >
        {
            isEditing ? <Input
                defaultValue={props.title}
                onInput={(value: any) => {
                    props.onUpdate?.(value.target.value)
                }}
                className="max-w-[300px] font-medium h-9"
                placeholder="问卷标题"
            /> : hoverable
        }
        {hovered && !isEditing ? <Pencil className=" w-3 h-3 text-gray-500" ></Pencil> : null}
    </div>
}