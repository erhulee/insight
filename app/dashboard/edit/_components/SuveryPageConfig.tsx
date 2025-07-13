import { ScrollArea } from '@/components/ui/scroll-area'
import { useSnapshot } from 'valtio'
import { runtimeStore } from '@/app/dashboard/_valtio/runtime'
import { Form, Input, Switch, Upload } from 'antd'


export function SuveryPageConfig() {
    const runtimeState = useSnapshot(runtimeStore)
    const [formClient] = Form.useForm<{
        display_no: boolean
        order_random: boolean
        surver_name: string
        surver_description: string
        surver_cover: string
    }>()
    return (
        <div className="w-80 border-l bg-muted/30 overflow-hidden hidden md:block fixed top-[64px] right-0 h-screen">
            <div className="border-b p-4">
                <h3 className="font-medium">页面配置</h3>
                <p className="text-xs text-muted-foreground mt-1">
                    编辑问卷的属性和选项
                </p>
            </div>
            <ScrollArea>
                <div className="space-y-4 pt-4 px-4">
                    <Form form={formClient}  >
                        <Form.Item name="display_no" label="显示编号">
                            <Switch></Switch>
                        </Form.Item>
                        <Form.Item name="order_random" label="随机排序">
                            <Switch></Switch>
                        </Form.Item>
                        <Form.Item name="surver_name" label="问卷名称">
                            <Input></Input>
                        </Form.Item>
                        <Form.Item name="surver_description" label="问卷描述">
                            <Input.TextArea></Input.TextArea>
                        </Form.Item>
                        <Form.Item name="surver_cover" label="问卷封面">
                            <Upload></Upload>
                        </Form.Item>
                    </Form>
                </div>
            </ScrollArea>
        </div>
    )
}
