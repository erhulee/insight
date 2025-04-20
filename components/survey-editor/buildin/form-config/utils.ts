import { z } from "zod";
import { EditorFormSchma } from "../form-item/core";

export function createZodSchema(schema: EditorFormSchma) {
    const input = {} as Record<string, z.ZodType>;
    Object.entries(schema.formProps).forEach(([key, value]) => {
        //@ts-ignore
        input[key] = z[value.propsType]
    })
    return z.object(input)
}

export function createDefaultValue(schema: EditorFormSchma) {
    function fillDefaultValue(type: EditorFormSchma['componentProps'][0]['propsType']) {
        switch (type) {
            case 'string':
                return ''
            case 'number':
                return 0
            case 'boolean':
                return false
            case 'array':
                return []
            case 'object':
                return {}
            default:
                return ''
        }
    }
    function collectDefaultValue([key, value]: [string, {
        name: string;
        propsType: "string" | "number" | "boolean" | "object" | "array" | "enum";
        defaultValue: any;
        exampleValue: any;
    }], result: Record<string, any> = {}) {
        //@ts-ignore
        if (value.defaultValue) {
            result[key] = value.defaultValue
        } else {
            result[key] = fillDefaultValue(value.propsType)
        }
    }
    const input = {} as Record<string, any>;
    Object.entries(schema.componentProps).forEach((entry) => {
        collectDefaultValue(entry, input)
    })
    Object.entries(schema.formProps).forEach((entry) => {
        // @ts-ignore
        collectDefaultValue(entry, input)
    })
    return input
}