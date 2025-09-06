'use client'
import { useRuntimeState } from '@/app/(dashboard)/dashboard/_valtio/runtime'
import Editor, { loader } from '@monaco-editor/react'
import { useMemo } from 'react'

loader.config({
	paths: {
		vs: 'https://www.unpkg.com/monaco-editor/min/vs',
	},
})

export function JsonEditor() {
	const runtimeState = useRuntimeState()
	const question_str = useMemo(() => {
		return JSON.stringify(runtimeState.questions, null, 2)
	}, [runtimeState.questions])
	return (
		<Editor
			loading="Loading..."
			height="80vh"
			defaultLanguage="javascript"
			defaultValue={question_str}
		/>
	)
}
