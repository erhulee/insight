import { InputQuestion } from '../schema/type'
import { Form, Input } from 'antd'
export function AntdRender(props: { questions: Array<InputQuestion> }) {
  const { questions } = props
  return (
    <Form>
      {questions.map((question, index) => {
        const { name, id, required } = question
        switch (question.type) {
          case 'text':
            return (
              <Form.Item label={name} name={id} rules={[{ required: required }]}>
                <Input key={question.id} />
              </Form.Item>
            )
          default:
            return <div></div>
        }
      })}
    </Form>
  )
}
