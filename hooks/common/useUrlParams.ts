import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

interface UrlParamsConfig<T> {
    defaults: T
    parse?: Partial<Record<keyof T, (value: string) => any>>
}

export function useUrlParams<T extends Record<string, any>>(
    config: UrlParamsConfig<T>
) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // 解析URL参数
    const params = useMemo(() => {
        const result = { ...config.defaults }

        for (const [key, defaultValue] of Object.entries(config.defaults)) {
            const urlValue = searchParams.get(key)
            if (urlValue !== null) {
                const parser = config.parse?.[key as keyof T] || defaultParser;
                (result as Record<string, any>)[key] = parser(urlValue)
            } else {
                (result as Record<string, any>)[key] = defaultValue
            }
        }

        return result
    }, [searchParams, config])

    // 更新URL参数
    const updateParams = useCallback((updates: Partial<T>) => {
        const newSearchParams = new URLSearchParams(searchParams)

        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                newSearchParams.delete(key)
            } else {
                newSearchParams.set(key, String(value))
            }
        })

        router.push(`${pathname}?${newSearchParams.toString()}`)
    }, [router, pathname, searchParams])

    // 重置参数
    const resetParams = useCallback(() => {
        router.push(pathname)
    }, [router, pathname])

    return {
        params,
        updateParams,
        resetParams,
        router,
        pathname,
        searchParams
    }
}

// 默认解析器
const defaultParser = (value: string) => {
    const num = parseInt(value)
    return isNaN(num) ? value : num
}