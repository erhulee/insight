'use client'
import type React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
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
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import { signInSchema } from '@/auth'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import { getCallbackUrl, buildCallbackUrl } from '@/lib/auth-utils'

function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  // 获取回调URL，如果没有则默认跳转到仪表板
  const callbackUrl = getCallbackUrl(searchParams)

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      account: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    const { account, password } = values
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        account,
        password,
        redirect: false, // 不自动重定向，手动处理
      })

      if (result?.error) {
        toast.error('登录失败，请检查账号密码')
      } else if (result?.ok) {
        toast.success('登录成功')
        // 登录成功后跳转到回调URL
        router.push(callbackUrl)
      }
    } catch (error) {
      toast.error('登录过程中发生错误')
      console.error('Login error:', error)
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
              <CardTitle className="text-2xl font-bold">登录账号</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-4">
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center gap-1">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          登录中 ...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          立即登录
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
                没有账号?{' '}
                <Link href={buildCallbackUrl('/register', callbackUrl)} className="text-primary hover:underline">
                  立即注册
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
export default function Index() {
  return (
    // You could have a loading skeleton as the `fallback` too
    <Suspense>
      <LoginPage />
    </Suspense>
  )
}
