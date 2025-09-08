'use client'

import type { ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { ConfigProvider, theme as antdTheme } from 'antd'

interface AntdThemeProviderProps {
	children: ReactNode
}

export default function AntdThemeProvider({
	children,
}: AntdThemeProviderProps) {
	const { resolvedTheme } = useTheme()
	const isDark = resolvedTheme === 'dark'

	return (
		<ConfigProvider
			theme={{
				algorithm: isDark
					? antdTheme.darkAlgorithm
					: antdTheme.defaultAlgorithm,
				components: {
					Form: {
						itemMarginBottom: 12,
					},
				},
			}}
		>
			{children}
		</ConfigProvider>
	)
}
