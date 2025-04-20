
export interface EditorFormFieldItem {
    name: string
    propsType: "string" | "number" | "boolean" | "object" | "array" | "enum",
    defaultValue: any,
    exampleValue: any
}

export interface EditorFormFieldItemWithOptions extends EditorFormFieldItem {
    options: string[],
    propsType: "enum",
}
export interface EditorFormSchma {
    name: string,
    icon: React.PropsWithChildren<React.FC<{ className: string }>>
    key: string,
    componentProps: {
        [key: string]: EditorFormFieldItem
    },
    formProps: {
        [key: string]: EditorFormFieldItem | (EditorFormFieldItem & { options: string[], propsType: "enum", })
    }
}