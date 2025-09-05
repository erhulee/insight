"use client"

import { AuthLayout } from '@/components/auth/auth-layout'


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex">
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}