import { AuthLayout } from '@/components/auth/auth-layout'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <AuthLayout>{children}</AuthLayout>
}