'use client'
import type React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { InsightBrand } from '@/components/common/insight-brand'
import { trpc } from '../_trpc/client'
import { redirect } from 'next/navigation'
import { useLocalStorage } from 'react-use'
import { toast } from 'sonner'

export default function LoginPage() {
  const [localValue, updateLocalValue, remove] = useLocalStorage<{
    account: string
    password: string
  }>('rememberMe')
  console.log("localValue:", localValue)

  useEffect(() => {
    if (localValue?.account && localValue?.password) {
      setFormData({
        email: localValue.account,
        password: localValue.password,
        rememberMe: true,
      })
      // 显示自动填充提示
      toast.success('已自动填充保存的登录信息')
    }
  }, [localValue])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      rememberMe: checked,
    }))

    // 如果取消勾选，清除已保存的密码
    if (!checked && localValue) {
      remove()
      toast.info('已清除保存的登录信息')
    }
  }
  const submitMutation = trpc.Login.useMutation()
  const handleSubmit = async () => {
    try {
      const res = await submitMutation.mutateAsync({
        account: formData.email,
        password: formData.password,
      })

      if (res) {
        // 处理记住密码
        if (formData.rememberMe) {
          updateLocalValue({
            account: formData.email,
            password: formData.password,
          })
          toast.success('登录成功！已保存登录信息')
        } else {
          remove()
          toast.success('登录成功！')
        }

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          redirect('/dashboard')
        }, 1000)
      }
    } catch (error) {
      // 登录失败时不清除已保存的密码
      console.error('Login failed:', error)
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
              <CardTitle className="2xl:text-2xl text-base font-bold">登录</CardTitle>
              <CardDescription>输入您的账号和密码以访问您的账户</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">账号</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">密码</Label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      忘记密码?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      className="pl-10"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={formData.rememberMe}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="remember-me" className="text-sm">
                      记住我
                    </Label>
                  </div>
                  {localValue && (
                    <div
                      onClick={() => {
                        remove()
                        setFormData(prev => ({ ...prev, rememberMe: false }))
                        toast.info('已清除保存的登录信息')
                      }}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      清除保存的密码
                    </div>
                  )}
                </div>
                {formData.rememberMe && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                    💡 提示：密码将保存在本地浏览器中，仅在当前设备上可用
                  </div>
                )}
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => {
                  handleSubmit()
                }}
                disabled={submitMutation.isPending}
              >
                <span className="flex items-center gap-1">
                  {submitMutation.isPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      登录中...
                    </>
                  ) : (
                    <>
                      登录
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </span>
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                还没有账号?{' '}
                <Link href="/register" className="text-primary hover:underline">
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
