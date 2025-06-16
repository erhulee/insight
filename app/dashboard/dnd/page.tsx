"use client"
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core"
import { Card } from "antd";

function Droppable(props: { children: React.ReactNode, id: string }) {
    const { isOver, setNodeRef } = useDroppable({
        id: props.id,
    });
    const style = {
        color: isOver ? 'green' : undefined,
    };
    return (
        <div ref={setNodeRef} style={style}>
            {props.children}
        </div>
    );
}

function DragItem(props: { children: React.ReactNode, id: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.id,
    });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;


    return (
        <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {props.children}
        </button>
    );
}


export default function DndPage() {
    const list = [1, 2, 3, 4, 5]
    return (<DndContext>
        {list.map((item) => (
            <Droppable key={item} id={item.toString()}>
                <DragItem key={item} id={item.toString()}>
                    <Card>{item}</Card>
                </DragItem>
            </Droppable>
        ))
        }
    </DndContext >)
}