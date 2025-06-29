import {
  MultipleQuestionSchemaType,
  QuestionSchemaType,
  SingleQuestionSchemaType,
} from '@/lib/dsl'
import { Input } from 'antd'
import { MultipleQuestion } from './multiple'
import { SingleQuestion } from '../form-item/single/render'

export function QuestionRender(props: { question: QuestionSchemaType, updateQuestion: (question: QuestionSchemaType) => void }) {
  const { question, updateQuestion } = props
  switch (question.type) {
    case 'input':
      return <Input
        placeholder={question.props['placeholder'] || ''}
        maxLength={question.props.maxlength}
        showCount={question.props.showCount}
      ></Input>
    case 'textarea':
      return (
        <Input.TextArea
          showCount
          maxLength={question.props['maxlength']}
          placeholder={question.props['placeholder'] || ''}
        ></Input.TextArea>
      )
    case 'multiple':
      return <MultipleQuestion dsl={question as MultipleQuestionSchemaType}></MultipleQuestion>
    case 'single':
      return <SingleQuestion dsl={question as SingleQuestionSchemaType} ></SingleQuestion>
    // case QuestionType.Radio:
    //   return (
    //     <Radio.Group
    //       disabled
    //       options={question.attr['options'].map((i: string) => ({
    //         label: i,
    //         value: i,
    //       }))}
    //     ></Radio.Group>
    //   )

    // case "dropdown":
    //     return (
    //         <div className="space-y-2">
    //             {question.required && <span className="text-destructive text-sm">*</span>}
    //             {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
    //             <select className="w-full px-3 py-2 border rounded-md bg-background" disabled={isPreview}>
    //                 <option value="">请选择...</option>
    //                 {question.options?.map((option, index) => (
    //                     <option key={index} value={option.value || option.text}>
    //                         {option.text}
    //                     </option>
    //                 ))}
    //             </select>
    //         </div>
    //     )
    // case "rating":
    //     return (
    //         <div className="space-y-2">
    //             {question.required && <span className="text-destructive text-sm">*</span>}
    //             {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
    //             <div className="flex space-x-2">
    //                 {Array.from({ length: question.maxRating || 5 }).map((_, index) => (
    //                     <button
    //                         key={index}
    //                         className={cn(
    //                             "w-8 h-8 rounded-md flex items-center justify-center",
    //                             "border border-primary/20 hover:bg-primary/10",
    //                             "focus:outline-none focus:ring-2 focus:ring-primary/20",
    //                         )}
    //                         disabled={isPreview}
    //                     >
    //                         {index + 1}
    //                     </button>
    //                 ))}
    //             </div>
    //         </div>
    //     )
    // case "date":
    //     return (
    //         <div className="space-y-2">
    //             {question.required && <span className="text-destructive text-sm">*</span>}
    //             {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
    //             <input type="date" className="w-full px-3 py-2 border rounded-md bg-background" disabled={isPreview} />
    //         </div>
    //     )
    // case "file":
    //     return (
    //         <div className="space-y-2">
    //             {question.required && <span className="text-destructive text-sm">*</span>}
    //             {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
    //             <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-4 text-center">
    //                 <p className="text-sm text-muted-foreground">点击或拖拽文件到此处上传</p>
    //                 <input type="file" className="hidden" id={`file-${question.id}`} disabled={isPreview} />
    //                 <label
    //                     htmlFor={`file-${question.id}`}
    //                     className="mt-2 inline-block px-4 py-2 bg-primary/10 text-primary rounded-md text-sm cursor-pointer"
    //                 >
    //                     选择文件
    //                 </label>
    //             </div>
    //         </div>
    //     )
    // case "section":
    //     return (
    //         <div className="space-y-2">
    //             {question.description && <p className="text-sm text-muted-foreground">{question.description}</p>}
    //         </div>
    //     )
    // default:
    //     return (
    //         <div className="space-y-2">
    //             {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
    //         </div>
    //     )
  }
}
