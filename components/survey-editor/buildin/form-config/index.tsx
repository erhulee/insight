"use client"
import type React from "react"
import type { Question } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { preset } from "../form-item"
import { useEffect, useMemo } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Separator } from "@/components/ui/separator"
import { ConfigItem } from "./configItem"
import { IFormItemAttr } from "../form-item/core/type"
import { Form } from "antd"

interface QuestionConfigProps {
  question: Question
  onUpdate: (updatedQuestion: Question) => void
}

function generateZodSchema(config: IFormItemAttr[]) {
  const content: Record<string, any> = {}
  config.forEach((item) => {
    switch (item.propType) {
      case "String":
        content[item.name] = z.string().optional()
        break
      case "Number":
        content[item.name] = z.number().optional()
        break
      case "Boolean":
        content[item.name] = z.boolean().optional()
        break
      case "Array":
        content[item.name] = z.array(z.any()).optional()
        break
      case "Object":
        content[item.name] = z.record(z.any()).optional()
        break
      default:
        content[item.name] = z.any().optional()
    }
  })
  return z.object(content)
}

function generateZodSchemaDefaultValue(config: IFormItemAttr[]) {
  const defaultValue: Record<string, any> = {}
  config.forEach((item) => {
    switch (item.propType) {
      case "String":
        defaultValue[item.name] = item.defaultValue || ""
        break
      case "Number":
        defaultValue[item.name] = item.defaultValue || 0
        break
      case "Boolean":
        defaultValue[item.name] = item.defaultValue || false
        break
      case "Array":
        defaultValue[item.name] = item.defaultValue || []
        break
      case "Object":
        defaultValue[item.name] = item.defaultValue || {}
        break
      default:
        defaultValue[item.name] = item.defaultValue || null
    }
  })
  console.log("defaultValue:", defaultValue)
  return defaultValue
}
export function QuestionConfig({ question, onUpdate }: QuestionConfigProps) {
  const questionInfo = useMemo(() => preset.find((item) => item.type === question.type)!, [question.type])
  const [formClient] = Form.useForm()
  useEffect(() => {
    console.log("getFieldsValue:", formClient.getFieldsValue())
  }, [formClient.getFieldsValue()])
  // 渲染基本配置选项
  const renderBasicConfig = () => {
    const configList = questionInfo.config || []
    return <>{
      configList.map((config) => {
        const { name, title, type } = config
        return (
          <Form.Item label={title} key={name} className=" flex flex-col items-start mb-8" >
            <ConfigItem configSetter={config} ></ConfigItem>
          </Form.Item>
        )
      })
    }
      <Separator className=" my-4"></Separator >
    </>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="basic">基本设置</TabsTrigger>
          <TabsTrigger value="options" disabled={!["radio", "checkbox", "dropdown"].includes(question.type)}>
            选项
          </TabsTrigger>
          <TabsTrigger value="advanced">高级</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <Form form={formClient}>
            {renderBasicConfig()}
          </Form>
        </TabsContent>

        <TabsContent value="options" className="space-y-4 pt-4">
          {/* {renderOptionsConfig()} */}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 pt-4">
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-md p-3">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <span className="bg-primary/10 text-primary p-1 rounded mr-2 text-xs">验证</span>
                数据验证规则
              </h4>
            </div>
            <div className="bg-muted/50 rounded-md p-3">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <span className="bg-primary/10 text-primary p-1 rounded mr-2 text-xs">逻辑</span>
                条件逻辑
              </h4>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
