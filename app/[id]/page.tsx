"use client";
import { QuestionType } from "@/components/survey-editor/buildin/form-item";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, Checkbox, Form, Input, Radio } from "antd";
import { Question } from "@/lib/types";
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();
const FormItem = Form.Item

export default async function SurveyPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const survey = await prisma.survey.findFirst({
        where: {
            id: params.id
        }
    })
    const questionList = JSON.parse(survey?.questions || "[]") as Question[]
    console.log("questionList:", questionList)
    if (!survey) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Survey not found</CardTitle>
                        <CardDescription>The survey you're looking for doesn't exist or has been deleted</CardDescription>
                    </CardHeader>

                    <CardFooter>
                        {/* <Button onClick={() => router.push("/")} className="w-full">
                                Return to Home
                            </Button> */}
                    </CardFooter>
                </Card>
            </div>
        )
    } else {
        return <div className=" bg-white" >
            <Form>
                {questionList.map(q => {
                    const attr = q.attr || []
                    return <FormItem key={q.field} label={attr.title} name={q.field}>
                        {q.type == QuestionType.Text && <Input placeholder={attr.placeholder} ></Input>}
                        {q.type == QuestionType.Radio && <Radio.Group options={attr.options}></Radio.Group>}
                        {q.type == QuestionType.Checkbox && <Checkbox.Group options={attr.options}></Checkbox.Group>}
                    </FormItem>
                })}
                <FormItem>
                    <Button type="primary" htmlType="submit">Submit</Button>
                </FormItem>
            </Form>
        </div >
    }
}


