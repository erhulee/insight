import { Prisma } from "@prisma/client"

export function jsonValueParse(value: string | number | true | Prisma.JsonObject | Prisma.JsonArray | Prisma.JsonValue) {
    if (typeof value === 'string') {
        return JSON.parse(value)
    }
    if (typeof value === 'number') {
        return value
    }
    if (typeof value === 'boolean') {
        return value
    }
    if (Array.isArray(value)) {
        return value
    }
    if (typeof value === 'object') {
        return value
    }
    return value
}