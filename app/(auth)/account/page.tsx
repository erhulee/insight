'use client'
import type React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { InsightBrand } from '@/components/common/insight-brand'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { trpc } from '@/app/_trpc/client'

const profileSchema = z.object({
  name: z.string().min(2, { message: '姓名至少需要2个字符' }),
})
const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, { message: '当前密码至少需要6个字符' }),
    newPassword: z.string().min(6, { message: '新密码至少需要6个字符' }),
    confirmPassword: z.string().min(6, { message: '确认密码至少需要6个字符' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export default function AccountPage() {
  const { data: profileData } = trpc.GetUserInfo.useQuery()
  useEffect(() => {
    profileForm.setValue('name', profileData?.username || '')
  }, [profileData])
  // Profile settings
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profileData?.username || '',
    },
  })

  // Password settings
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const userInfoMutation = trpc.UpdateUserInfo.useMutation({
    onSuccess: () => {
      toast.success('更新成功')
    },
    onError: (error) => {
      toast.error('更新失败')
    },
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4">
          <InsightBrand></InsightBrand>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground">
              我的问卷
            </Link>
            <Link href="/templates" className="text-sm font-medium text-muted-foreground">
              模板中心
            </Link>
            <Link href="/account" className="text-sm font-medium ">
              账户设置
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content area */}
      <main className="container px-4 py-6 mx-auto">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold">账户设置</h1>
        </div>
        <div className="space-y-6 ">
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit((data) => {
                userInfoMutation.mutate({
                  name: data.name,
                })
              })}
            >
              <Card>
                <CardHeader>
                  <CardTitle>个人信息</CardTitle>
                  <CardDescription>更新你的个人详细信息和公开资料</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>用户名称</FormLabel>
                        <FormControl>
                          <Input placeholder="shadcn" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit">确认</Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(async (data) => {
                await userInfoMutation.mutateAsync({
                  password: data.newPassword,
                  current_password: data.currentPassword,
                })
              })}
            >
              <Card>
                <CardHeader>
                  <CardTitle>修改密码</CardTitle>
                  <CardDescription>更新你的密码以确保你的账户安全</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>当前密码</FormLabel>
                          <FormControl>
                            <Input placeholder="shadcn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>新密码</FormLabel>
                          <FormControl>
                            <Input placeholder="shadcn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>二次确认</FormLabel>
                          <FormControl>
                            <Input placeholder="shadcn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit">
                    {/* {isPasswordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} */}
                    更新密码
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>

          {/* <Card>
                        <CardHeader>
                            <CardTitle>Danger Zone</CardTitle>
                            <CardDescription>Irreversible account actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert className="border-destructive">
                                <Trash2 className="h-4 w-4" />
                                <AlertDescription className="mt-0">
                                    Deleting your account will permanently remove all your surveys, data, and personal
                                    information. This action cannot be undone.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                        <CardFooter>
                            <Button variant="destructive">Delete Account</Button>
                        </CardFooter>
                    </Card> */}
        </div>
      </main>
    </div>
  )
}
