'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusCircle, LayoutTemplateIcon as Template, ArrowLeft, Sparkles } from 'lucide-react'
import { InsightBrand } from '@/components/common/insight-brand'
import { TemplateList } from './_components/TemplateList'
import { TemplateForm } from './_components/TemplateForm'
import { AISurveyGenerator } from './_components/AISurveyGenerator'
import AISurveyGeneratorStream from './_components/AISurveyGeneratorStream'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function CreateSurveyPage() {
  const [activeTab, setActiveTab] = useState('blank')

  return (
    <AuthLayout>
      <div className="min-h-screen bg-background ">
        {/* 顶部导航栏 */}
        <header className=" max-w-[1500px] mx-auto mt-5">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  返回
                </Link>
              </Button>
              <h1 className="text-lg font-medium ml-2">创建问卷</h1>
            </div>


          </div>
        </header>

        {/* 主要内容区域 */}
        <main className="container mx-auto px-4 py-8">
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={setActiveTab}
            className=" mx-auto"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="blank" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                空白问卷
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI 生成
              </TabsTrigger>
              <TabsTrigger value="ai-stream" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI 流式生成
              </TabsTrigger>
              <TabsTrigger value="template" className="gap-2">
                <Template className="h-4 w-4" />
                使用模板
              </TabsTrigger>
            </TabsList>

            {/* 空白问卷选项 */}
            <TabsContent value="blank" className="mt-6">
              <TemplateForm></TemplateForm>
            </TabsContent>
            {/* AI生成选项 */}
            <TabsContent value="ai" className="mt-6">
              <AISurveyGenerator></AISurveyGenerator>
            </TabsContent>
            {/* AI流式生成选项 */}
            <TabsContent value="ai-stream" className="mt-6">
              <AISurveyGeneratorStream></AISurveyGeneratorStream>
            </TabsContent>
            {/* 模板选项 */}
            <TabsContent value="template" className="mt-6">
              <TemplateList></TemplateList>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthLayout>
  )
}
