import { Button } from "@/components/ui/button"
import Image from "next/image"

export function PromotionalHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight text-balance">问卷开放平台</h1>
              <p className="text-lg text-gray-600 leading-relaxed text-pretty">
                标准化 REST / tRPC 能力，覆盖问卷创建、配置、发布、数据获取、回调事件与导出。
                一键获取 OpenAPI，快速对接，多端自渲染与移动端 SDK 助力集成提效。
              </p>
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base">
                立即接入
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-base">
                查看文档
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tROuNZG8NQ0ELSbgqMOnl2TiQFGa1b.png"
                alt="Survey Open Platform illustration"
                width={600}
                height={400}
                className="w-full h-auto"
                priority
              />
            </div>
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
