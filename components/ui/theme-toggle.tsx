'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => setMounted(true), [])

	if (!mounted) return null

	const isDark = resolvedTheme === 'dark'

	return (
		<Button
			variant="outline"
			size="icon"
			aria-label="切换颜色模式"
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			className="h-9 w-9 text-foreground"
		>
			<Sun
				className={`h-[1.1rem] w-[1.1rem] transition-transform ${isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`}
			/>
			<Moon
				className={`absolute h-[1.1rem] w-[1.1rem] transition-transform ${isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`}
			/>
			<span className="sr-only">切换主题</span>
		</Button>
	)
}
