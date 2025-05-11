import { Question } from '@/lib/types';
import Editor, { loader } from '@monaco-editor/react';
import { useMemo } from 'react';

loader.config({
    paths: {
        vs: 'https://www.unpkg.com/monaco-editor/min/vs',
    }
});

export function JsonEditor(props: {
    questions: Readonly<Question>[]
}) {
    const { questions } = props;
    const question_str = useMemo(() => {
        return JSON.stringify(questions, null, 2)
    }, [questions])
    return (
        <Editor height="80vh" defaultLanguage="javascript" defaultValue={question_str} />
    )
}