"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

interface RedirectHandlerProps {
  redirectPath?: string
  redirectCondition?: boolean
  timeout?: number
}

export function RedirectHandler({ redirectPath, redirectCondition = true, timeout = 0 }: RedirectHandlerProps) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!redirectPath || !redirectCondition || redirectPath === pathname) return

    const timer = setTimeout(() => {
      router.push(redirectPath)
    }, timeout)

    return () => clearTimeout(timer)
  }, [redirectPath, redirectCondition, timeout, router, pathname])

  return null
}
