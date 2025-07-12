'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { trpc } from '@/app/_trpc/client'
import { useRouter } from 'next/navigation'
import { clearAuthToken } from '@/lib/auth'
import { toast } from 'sonner'

interface LogoutButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    className?: string
    children?: React.ReactNode
}

export function LogoutButton({
    variant = 'outline',
    size = 'default',
    className = '',
    children
}: LogoutButtonProps) {
    const router = useRouter()
    const logoutMutation = trpc.Logout.useMutation()

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync()

            // 清除本地存储的 token
            clearAuthToken()

            toast.success('已成功登出')

            // 跳转到登录页面
            router.push('/login')
        } catch (error) {
            console.error('登出失败:', error)
            toast.error('登出失败，请重试')

            // 即使服务器登出失败，也清除本地 token 并跳转
            clearAuthToken()
            router.push('/login')
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
        >
            {logoutMutation.isPending ? (
                <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    登出中...
                </>
            ) : (
                <>
                    <LogOut className="h-4 w-4 mr-2" />
                    {children || '登出'}
                </>
            )}
        </Button>
    )
} 