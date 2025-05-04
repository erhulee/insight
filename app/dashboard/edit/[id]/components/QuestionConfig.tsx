"use client"
import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useMemo } from "react"
import { Separator } from "@/components/ui/separator"
import { Form } from "antd"
import { preset } from "@/components/survey-editor/buildin/form-item"
import { ConfigSetter } from "@/components/survey-editor/buildin/form-config/configSetter"
import { useSnapshot } from "valtio"
import { runtimeStore } from "@/app/dashboard/_valtio/runtime"

interface QuestionConfigProps {
    onUpdate: (newAttr: Record<string, any>) => void
}

export function QuestionConfig({ onUpdate }: QuestionConfigProps) {
    const runtimeState = useSnapshot(runtimeStore);
    const selectQuestion = runtimeState.currentQuestion.find((item) => item.field == runtimeState.selectedQuestionID)!;
    const questionInfo = useMemo(() => preset.find((item) => item.type === selectQuestion.type)!, [selectQuestion.type])
    const [formClient] = Form.useForm()
    // 渲染基本配置选项
    const configList = questionInfo.config || []
    useEffect(() => {
        formClient.setFieldsValue(selectQuestion.attr)
    }, [selectQuestion.field])
    return (
        <div className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="basic">基本设置</TabsTrigger>
                    <TabsTrigger value="options" disabled={!["radio", "checkbox", "dropdown"].includes(selectQuestion.type)}>
                        选项
                    </TabsTrigger>
                    <TabsTrigger value="advanced">高级</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 pt-4">
                    <Form
                        form={formClient}
                        layout="vertical"
                        onValuesChange={(_, value) => {
                            onUpdate(value)
                        }}>
                        {
                            configList.map((config) => {
                                const { name, title, type } = config;
                                const attr = selectQuestion.attr;
                                console.log(" attr[name]:", selectQuestion, attr, name, attr[name])
                                return (
                                    <Form.Item
                                        rootClassName=""
                                        label={title}
                                        key={name}
                                        name={name}
                                        style={{
                                            marginBottom: "12px",
                                        }}>
                                        {ConfigSetter({
                                            configSetter: config,
                                        })}
                                    </Form.Item>
                                )
                            })
                        }
                        <Separator className=" my-4"></Separator >
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
