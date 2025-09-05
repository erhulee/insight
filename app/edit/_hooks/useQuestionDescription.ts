import { useState, useRef, useCallback, useEffect } from 'react'
import { RuntimeDSLAction } from '@/app/(dashboard)/dashboard/_valtio/runtime'

interface UseQuestionDescriptionReturn {
    description: string
    isEditing: boolean
    descriptionRef: React.RefObject<HTMLDivElement | null>
    handleFocus: (e: React.FocusEvent) => void
    handleBlur: (e: React.FocusEvent) => void
    handleInput: (e: React.FormEvent) => void
}

export function useQuestionDescription(
    questionId: string,
    initialDescription: string = ''
): UseQuestionDescriptionReturn {
    const [isEditing, setIsEditing] = useState(false)
    const [description, setDescription] = useState(initialDescription)
    const descriptionRef = useRef<HTMLDivElement>(null)

    // 处理描述编辑开始
    const handleFocus = useCallback((e: React.FocusEvent) => {
        e.stopPropagation()
        setIsEditing(true)
        // 让浏览器自然处理光标位置，不做任何干预
        // 这样可以确保光标在用户点击的位置
    }, [])

    // 处理描述编辑结束
    const handleBlur = useCallback((e: React.FocusEvent) => {
        e.stopPropagation()
        setIsEditing(false)

        const newDescription = descriptionRef.current?.textContent || ''
        setDescription(newDescription)

        // 更新数据
        RuntimeDSLAction.updateQuestion('form-basic', {
            attr: {
                description: newDescription,
            },
        })
    }, [])

    // 处理描述内容变化
    const handleInput = useCallback((e: React.FormEvent) => {
        const target = e.target as HTMLDivElement
        const newDescription = target.textContent || ''
        setDescription(newDescription)
    }, [])


    return {
        description,
        isEditing,
        descriptionRef,
        handleFocus,
        handleBlur,
        handleInput,
    }
} 