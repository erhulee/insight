import { DescriptionSchemaType } from "./schema"

export function DescriptionRender(props: {
    dsl: DescriptionSchemaType
}) {
    const { content } = props.dsl.props
    return <p>{content}</p>
}