"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const features = [
  { id: "rest", name: "标准化 REST API", active: false },
  { id: "trpc", name: "tRPC 端到端类型安全", active: false },
  { id: "webhooks", name: "事件推送 Webhooks", active: false },
  { id: "openapi", name: "OpenAPI 规范与自渲染", active: false },
  { id: "sdk", name: "前后端 SDK 与示例", active: true },
]

export function PromotionalFeatures() {
  const [activeFeature, setActiveFeature] = useState("sdk")

  return (
    <section id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={cn(
                  "px-6 py-3 rounded-md text-sm font-medium transition-all",
                  activeFeature === feature.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {feature.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
