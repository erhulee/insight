import { Question } from "@/lib/types";
import { QuestionType } from "../form-item";
import { Checkbox, Input, Radio } from "antd";

export function QuestionRender(props: {
    question: Question
}) {
    const { question } = props
    switch (question.type) {
        case QuestionType.Text:
            return (
                <Input placeholder={question.attr['placeholder'] || ""}  ></Input>
            )
        case QuestionType.TextArea:
            return (<Input.TextArea placeholder={question.attr['placeholder'] || ""}></Input.TextArea>)
        case QuestionType.Radio:
            return <Radio.Group disabled options={question.attr['options'].map((i: string) => ({
                label: i,
                value: i
            }))} ></Radio.Group>
        case QuestionType.Checkbox:
            return <Checkbox.Group disabled options={question.attr['options'].map((i: string) => ({
                label: i,
                value: i
            }))} ></Checkbox.Group>
        // case "checkbox":
        //     return (
        //         <div className="space-y-2">
        //             {question.required && <span className="text-destructive text-sm">*</span>}
        //             {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
        //             <div className="space-y-1">
        //                 {question.options?.map((option, index) => (
        //                     <div key={index} className="flex items-center space-x-2">
        //                         <input type="checkbox" id={`option-${question.id}-${index}`} disabled={isPreview} />
        //                         <label htmlFor={`option-${question.id}-${index}`} className="text-sm">
        //                             {option.text}
        //                         </label>
        //                     </div>
        //                 ))}
        //             </div>
        //         </div>
        //     )
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