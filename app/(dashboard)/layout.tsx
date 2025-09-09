'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import {
	LayoutGrid,
	KeyRound,
	Webhook,
	BookOpenText,
	Settings,
	Code,
	ChevronRight,
	type LucideIcon,
} from 'lucide-react'
import { InsightBrand } from '@/components/common/insight-brand'
import {
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
	SidebarGroup,
	SidebarProvider,
} from '@/components/ui/sidebar'
import { AuthLayout } from '@/components/auth/auth-layout'

interface NavItem {
	label: string
	href?: string
	icon?: LucideIcon
	badge?: string | number
	children?: NavItem[]
}

function SidebarNav() {
	const pathname = usePathname()
	const items: NavItem[] = [
		{ href: '/dashboard', label: '我的问卷', icon: LayoutGrid },
		{
			label: '模板中心',
			icon: BookOpenText,
		},
		{
			label: '开发者中心',
			icon: Code,
			children: [
				{ href: '/developer/api-keys', label: 'API密钥', icon: KeyRound },
				{ href: '/developer/webhooks', label: 'Webhook', icon: Webhook },
			],
		},
		{ href: '/dashboard/ai-settings', label: 'AI 设置', icon: Settings },
	]

	const isActive = (href?: string) => {
		if (!href) return false
		return pathname === href
	}

	const hasActiveInTree = (node: NavItem): boolean => {
		if (isActive(node.href)) return true
		if (!node.children) return false
		return node.children.some(hasActiveInTree)
	}

	const [openKeys, setOpenKeys] = React.useState<Set<string>>(new Set())

	const toggle = (key: string) => {
		setOpenKeys((prev) => {
			const next = new Set(prev)
			if (next.has(key)) next.delete(key)
			else next.add(key)
			return next
		})
	}

	const renderTree = (nodes: NavItem[], depth = 0, parentKey = '') => {
		const ListComp = depth === 0 ? SidebarMenu : SidebarMenuSub
		return (
			<ListComp>
				{nodes.map((item, idx) => {
					const key = `${parentKey}/${item.href || item.label}-${idx}`
					const Icon = item.icon
					const opened =
						openKeys.has(key) || (!!item.children && hasActiveInTree(item))
					const hasChildren = !!item.children?.length

					if (!hasChildren) {
						if (depth === 0) {
							return (
								<SidebarMenuItem key={key}>
									<SidebarMenuButton asChild isActive={isActive(item.href)}>
										<Link href={item.href || '#'} prefetch={false}>
											{Icon ? <Icon className="h-4 w-4" /> : null}
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							)
						}

						return (
							<SidebarMenuSubItem key={key}>
								<SidebarMenuSubButton asChild isActive={isActive(item.href)}>
									<Link href={item.href || '#'} prefetch={false}>
										{Icon ? <Icon className="h-4 w-4" /> : null}
										<span>{item.label}</span>
									</Link>
								</SidebarMenuSubButton>
							</SidebarMenuSubItem>
						)
					}

					// 有子节点：渲染可展开的组
					const Chevron = (
						<ChevronRight
							className={
								'ml-auto h-4 w-4 transition-transform ' +
								(opened ? 'rotate-90' : '')
							}
						/>
					)

					if (depth === 0) {
						return (
							<SidebarMenuItem key={key}>
								<SidebarMenuButton
									isActive={opened}
									onClick={() => toggle(key)}
									className="justify-between"
									aria-expanded={opened}
								>
									<span className="inline-flex items-center gap-2">
										{Icon ? <Icon className="h-4 w-4" /> : null}
										<span>{item.label}</span>
									</span>
									{Chevron}
								</SidebarMenuButton>
								{opened ? renderTree(item.children!, depth + 1, key) : null}
							</SidebarMenuItem>
						)
					}

					return (
						<SidebarMenuSubItem key={key}>
							<SidebarMenuSubButton
								asChild
								isActive={opened}
								aria-expanded={opened}
								className="justify-between"
								onClick={() => toggle(key)}
							>
								<button type="button">
									<span className="inline-flex items-center gap-2">
										{Icon ? <Icon className="h-4 w-4" /> : null}
										<span>{item.label}</span>
									</span>
									{Chevron}
								</button>
							</SidebarMenuSubButton>
							{opened ? renderTree(item.children!, depth + 1, key) : null}
						</SidebarMenuSubItem>
					)
				})}
			</ListComp>
		)
	}

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<InsightBrand />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>{renderTree(items)}</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	)
}

export default function DashboardGroupLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<AuthLayout>
			<SidebarProvider>
				<SidebarNav />
				<main className="flex-1">{children}</main>
			</SidebarProvider>
		</AuthLayout>
	)
}
