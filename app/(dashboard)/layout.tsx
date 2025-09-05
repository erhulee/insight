"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthLayout } from '@/components/auth/auth-layout'
import { LayoutGrid, KeyRound, Webhook, BookOpenText, Settings, Code } from 'lucide-react'
import { LayoutHeader } from '@/components/layout-header'
import { InsightBrand } from '@/components/common/insight-brand'

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
        <aside className="w-60 border-r bg-white">
            <div className="h-16 flex items-center px-4 border-b font-semibold">
                <InsightBrand />
            </div>
            <nav className="p-3 space-y-1">
                {items.map(item => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ` +
                                (isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted')
                            }
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}

export default function DashboardGroupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthLayout>
            <div className="min-h-screen bg-background flex">
                <SidebarNav />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </AuthLayout>
    )
}


