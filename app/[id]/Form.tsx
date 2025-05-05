"use client";
import { QuestionType } from "@/components/survey-editor/buildin/form-item";
import { Form, Input } from "antd";
import { Button } from "@/components/ui/button";
import TextArea from "antd/es/input/TextArea";
import FormItem from "antd/es/form/FormItem";
import CheckboxGroup from "antd/es/checkbox/Group";
import RadioGroup from "antd/es/radio/Group";
import { Question } from "@/lib/types";

export function SurveyForm(props: {
    question: Question[],
    handleSubmit: (values: Record<string, any>) => void
}) {
    const [form] = Form.useForm();
    return <div className=" bg-white" >
        <Form layout="vertical" form={form} >
            {props.question.map((q, index) => {
                return <FormItem key={q.field} label={`${(index + 1)}.${q.attr.title}`} name={q.field}>
                    {q.type == QuestionType.TextArea && <TextArea placeholder={q.attr.placeholder} ></TextArea>}
                    {q.type == QuestionType.Text && <Input placeholder={q.attr.placeholder} ></Input>}
                    {q.type == QuestionType.Radio && <RadioGroup options={q.attr.options}></RadioGroup>}
                    {q.type == QuestionType.Checkbox && <CheckboxGroup options={q.attr.options}></CheckboxGroup>}
                </FormItem>
            })}
            <div className=" w-52 mx-auto">
                <Button variant="default" onClick={() => {
                    props.handleSubmit(form.getFieldsValue())
                }} className=" w-52 mx-auto" >提交</Button>
            </div>
        </Form>
    </div >
}