'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthLayout } from '@/components/auth/auth-layout'
import {
	LayoutGrid,
	KeyRound,
	Webhook,
	BookOpenText,
	Settings,
	Code,
} from 'lucide-react'
import { InsightBrand } from '@/components/common/insight-brand'
import {
	SidebarProvider,
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarInset,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
} from '@/components/ui/sidebar'

function SidebarNav() {
	const pathname = usePathname()
	const items = [
		{ href: '/dashboard', label: '我的问卷', icon: LayoutGrid },
		{ href: '/templates', label: '模板中心', icon: BookOpenText },
		{ href: '/developer', label: '开发者中心', icon: Code },
		{ href: '/dashboard/ai-settings', label: 'AI设置', icon: Settings },
		{ href: '/developer/api-keys', label: 'API密钥', icon: KeyRound },
		{ href: '/developer/webhooks', label: 'Webhook', icon: Webhook },
	]

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<InsightBrand />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{items.map((item) => {
							const Icon = item.icon
							const isActive = pathname === item.href
							return (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild isActive={isActive}>
										<a href={item.href}>
											<Icon className="h-4 w-4" />
											<span>{item.label}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							)
						})}
					</SidebarMenu>
				</SidebarGroup>
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
