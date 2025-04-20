export function JsonEditor(props: {
    questions: any
}) {
    const { questions } = props;
    return (
        <div>
            {JSON.stringify(questions, null, 2)}
        </div>
    )
}