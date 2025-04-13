"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor, Smartphone, Tablet } from "lucide-react"
import { cn } from "@/lib/utils"

interface DevicePreviewProps {
  children: React.ReactNode
  className?: string
}

export function DevicePreview({ children, className }: DevicePreviewProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-medium">预览</h3>
        <Tabs defaultValue={device} value={device} onValueChange={(value) => setDevice(value as any)}>
          <TabsList className="grid w-[180px] grid-cols-3">
            <TabsTrigger value="desktop" className="flex items-center justify-center p-1">
              <Monitor className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="tablet" className="flex items-center justify-center p-1">
              <Tablet className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center justify-center p-1">
              <Smartphone className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 border rounded-lg overflow-hidden bg-background flex items-center justify-center">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out h-full overflow-auto",
            device === "desktop" && "w-full",
            device === "tablet" && "w-[768px] max-w-full border-x shadow-sm",
            device === "mobile" && "w-[375px] max-w-full border-x shadow-sm",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
