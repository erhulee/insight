"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, LayoutTemplateIcon as Template, ArrowLeft } from "lucide-react"
import { InsightBrand } from "@/components/common/insight-brand"
import { TemplateList } from "./_components/TemplateList"
import { TemplateForm } from "./_components/TemplateForm"

export default function CreateSurveyPage() {
  const [activeTab, setActiveTab] = useState("blank")
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <InsightBrand></InsightBrand>
            <h1 className="text-lg font-medium">创建问卷</h1>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Link>
          </Button>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blank" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              空白问卷
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
          {/* 模板选项 */}
          <TabsContent value="template" className="mt-6">
            <TemplateList></TemplateList>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
