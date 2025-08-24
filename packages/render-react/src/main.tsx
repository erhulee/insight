import { AntdRender } from './antd/render'
import { InputQuestion } from './schema/type'

export function FormRender(props: { questions: Array<InputQuestion> }) {
  return <AntdRender questions={props.questions}></AntdRender>
}
