import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, FileText, User, Code, Puzzle, Zap } from "lucide-react"
import { FeatureCard } from "@/components/feature-card"
import { LayoutHeader } from "@/components/layout-header"
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <LayoutHeader></LayoutHeader>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100">
          <div className="container px-4 mx-auto md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  创建专业问卷，收集有价值的数据
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  简单易用的问卷设计工具，强大的数据分析功能，帮助您获取洞察，做出更好的决策。
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard/create">
                    <Button size="lg" className="gap-1">
                      创建问卷
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="gap-1">
                      我的问卷
                    </Button>
                  </Link>
                  <Link href="/templates">
                    <Button size="lg" variant="outline">
                      浏览模板
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-10 md:py-24 lg:py-32">
          <div className="container  mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 relative">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">一站式问卷解决方案</h2>
                <div className="inline-block rounded-lg bg-green-100 text-green-900 px-3 py-1 text-sm absolute top-0 right-0 translate-x-1/2 -translate-y-full">核心功能</div>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                  我们提供从问卷设计、发布、数据收集到分析的全流程支持
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard title="可视化编辑" description="拖拽式编辑器，支持多种题型，轻松创建专业问卷" icon={<FileText className="h-4 w-4" />}></FeatureCard>
              <FeatureCard title="问卷管理" description="集中管理所有问卷，控制发布状态，设置访问权限" icon={<User className="h-4 w-4" />}></FeatureCard>
              <FeatureCard title="数据分析" description="实时数据统计，多维度分析，图表可视化展示结果" icon={<BarChart3 className="h-4 w-4" />}></FeatureCard>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 relative flex flex-row w-full justify-center">
                <div className=" relative" > <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">强大的开放平台</h2>
                  <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary absolute top-0 right-0 translate-x-1/2 -translate-y-full ">开发者工具</div>
                  <p className="max-w-[900px] mt-4 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    将问卷功能集成到您的应用程序中，或构建自定义解决方案
                  </p></div>
                <Button variant="link" className=" absolute right-0">
                  <Link href="/developer">{`探索开发者中心 >`} </Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <FeatureCard title="RESTful API" description="全面的API，支持问卷创建、管理和数据收集" icon={<Code className="h-4 w-4" />}></FeatureCard>
              <FeatureCard title="自渲染工具" description="使用OpenAPI规范自动生成问卷界面" icon={<Puzzle className="h-4 w-4" />}></FeatureCard>
              <FeatureCard title="Webhooks" description="实时事件通知，支持自动化工作流" icon={<Zap className="h-4 w-4" />}></FeatureCard>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto flex flex-col gap-4 py-10 md:flex-row md:gap-8 px-4 sm:px-6 lg:px-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 font-bold text-lg text-primary">
              <FileText className="h-5 w-5" />
              <span>问卷星</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">专业的在线问卷调查平台</p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">产品</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    功能介绍
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    模板中心
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    价格方案
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">支持</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    帮助中心
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    使用教程
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    联系我们
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">关于</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    公司介绍
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    隐私政策
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    服务条款
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container py-4 text-center text-sm text-gray-500 px-4 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} 问卷星. 保留所有权利.
        </div>
      </footer>
    </div>
  )
}
