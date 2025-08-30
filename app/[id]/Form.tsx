'use client'
import { QuestionType } from '@/components/survey-editor/buildin/form-item'
import { Checkbox, Form, Input, Radio } from 'antd'
import { Button } from '@/components/ui/button'

import { trpc } from '@/app/_trpc/client'
import { Question } from '@/lib/api-types'

const FormItem = Form.Item
const { TextArea } = Input
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
export function SurveyForm(props: { surveyId: string; question: Question[] }) {
  const [form] = Form.useForm()
  const submitMutation = trpc.SubmitSurvey.useMutation({})
  const handleSubmit = () => {
    const values = form.getFieldsValue()
    submitMutation.mutateAsync({
      surveyId: props.surveyId,
      values,
    })
  }
  return (
    <div>hello</div>
    // <div className=" bg-white">
    //   <Form layout="vertical" form={form}>
    //     {props.question.map((q, index) => {
    //       return (
    //         <FormItem key={q.field} label={`${index + 1}.${q.attr.title}`} name={q.field}>
    //           {q.type == QuestionType.TextArea && (
    //             <TextArea placeholder={q.attr.placeholder}></TextArea>
    //           )}
    //           {q.type == QuestionType.Text && <Input placeholder={q.attr.placeholder}></Input>}
    //           {q.type == QuestionType.Radio && <RadioGroup options={q.attr.options}></RadioGroup>}
    //           {q.type == QuestionType.Checkbox && (
    //             <CheckboxGroup options={q.attr.options}></CheckboxGroup>
    //           )}
    //         </FormItem>
    //       )
    //     })}
    //     <div className=" w-52 mx-auto">
    //       <Button
    //         variant="default"
    //         onClick={() => {
    //           handleSubmit()
    //         }}
    //         className=" w-52 mx-auto"
    //       >
    //         提交
    //       </Button>
    //     </div>
    //   </Form>
    // </div>
  )
}
