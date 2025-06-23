'use client'
import type React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useMemo } from 'react'
import { Form } from 'antd'
import { useSnapshot } from 'valtio'
import { RuntimeDSLAction, runtimeStore } from '@/app/dashboard/_valtio/runtime'
import { BasicConfig } from './basic'
import { InputConfig } from './input'

export function QuestionConfig() {
  const runtimeState = useSnapshot(runtimeStore)
  const [formClient] = Form.useForm()
  useEffect(() => {
    const id = runtimeState.selectedQuestionID
    const selectedQuestion = runtimeState.questions.find((q) => q.id === id)!
    formClient.resetFields()
    formClient.setFieldsValue(selectedQuestion)
  }, [runtimeState.selectedQuestionID])

  const selectedQuestion = useMemo(() => {
    if (runtimeState.selectedQuestionID) {
      return runtimeState.questions.find((q) => q.id === runtimeState.selectedQuestionID)
    } else {
      return null
    }
  }, [runtimeState.selectedQuestionID])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="basic">基本设置</TabsTrigger>
          <TabsTrigger value="options">选项</TabsTrigger>
          <TabsTrigger value="advanced">高级</TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="space-y-4 pt-4">
          <Form
            form={formClient}
            layout="vertical"
            onValuesChange={(_, value) => {
              console.log("value change:", value)
              RuntimeDSLAction.updateQuestion('form-basic', {
                attr: value,
              })
            }}
          >
            <BasicConfig></BasicConfig>
            {(selectedQuestion?.type == 'input' || selectedQuestion?.type == 'textarea') && (
              <InputConfig></InputConfig>
            )}
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
