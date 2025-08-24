'use client'
import type React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { InsightBrand } from '@/components/common/insight-brand'
import { trpc } from '../_trpc/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { getCallbackUrl, buildCallbackUrl, handleAuthSuccess } from '@/lib/auth-utils'

const formSchema = z
  .object({
    username: z.string().min(2).max(50),
    account: z.string().min(8).max(12),
    password: z.string().min(6).max(20),
    confirmPassword: z.string().min(6).max(20),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  // 获取回调URL，如果没有则默认跳转到仪表板
  const callbackUrl = getCallbackUrl(searchParams)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account: '',
      password: '',
      confirmPassword: '',
      username: '',
    },
  })

  const registerMutation = trpc.Register.useMutation()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { account, password, username } = values
    setIsLoading(true)

    try {
      // 注册用户
      const result = await registerMutation.mutateAsync({
        account,
        password,
        username,
      })

      if (result) {
        toast.success('注册成功，正在自动登录...')

        // 注册成功后自动登录
        const loginResult = await signIn("credentials", {
          account,
          password,
          redirect: false,
        })

        if (loginResult?.error) {
          toast.error('自动登录失败，请手动登录')
          router.push(buildCallbackUrl('/login', callbackUrl))
        } else if (loginResult?.ok) {
          toast.success('登录成功')
          // 登录成功后跳转到回调URL
          handleAuthSuccess(router, callbackUrl)
        }
      } else {
        toast.error('注册失败，请重试')
      }
    } catch (error) {
      toast.error('注册过程中发生错误')
      console.error('Register error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <InsightBrand></InsightBrand>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">创建账号</CardTitle>
              <CardDescription>输入你的信息来创建一个账户。</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>用户名称</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="account"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>账号</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>密码</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>确认密码</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center gap-1">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          创建账号...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          创建账号
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                已有账号?{' '}
                <Link href={buildCallbackUrl('/login', callbackUrl)} className="text-primary hover:underline">
                  立即登陆
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
