import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

const newsItems = [
  {
    id: 1,
    title: "开放平台 PRD 与 OpenAPI 更新",
    content: "新增 responses.export、webhooks.retry 接口，提升导出与重试能力",
    date: "2025-09-01",
    isNew: true,
  },
  {
    id: 2,
    title: "tRPC Beta 公测预约开启",
    content: "端到端类型安全，提供 React Query 集成与代码生成",
    date: "2025-08-25",
    isNew: true,
  },
]

export function PromotionalNews() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-4">
            {newsItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <Badge variant="destructive" className="bg-red-500">
                  NEW
                </Badge>
                <span className="text-gray-900 font-medium">{item.title}</span>
                {item.content && (
                  <>
                    <span className="text-gray-600">{item.content}</span>
                    <span className="text-gray-400 text-sm">{item.date}</span>
                  </>
                )}
                {!item.content && <span className="text-gray-400 text-sm">{item.date}</span>}
              </div>
            ))}
          </div>

          <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
            查看更多
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  )
}
