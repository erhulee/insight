"use client"
import { useDroppable } from "@dnd-kit/core"
import { Placeholder } from "./placeholder";

export function DroppableItem(props: { children: React.ReactNode, id: string }) {
    const { isOver, setNodeRef, active } = useDroppable({
        id: props.id,
    });
    const style = {
        color: isOver ? 'green' : undefined,
    };
    return (
        <>
            {isOver && active?.id !== props.id && <Placeholder></Placeholder>}
            <div ref={setNodeRef} style={style}>
                {props.children}
            </div>
        </>

    );
}

