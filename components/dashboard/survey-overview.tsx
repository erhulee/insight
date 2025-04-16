import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, BarChart3, Clock, DeleteIcon, Trash2Icon } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"
// 格式化日期
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}
export function SurveyOverview(props: {
    survey: {
        id: string;
        description: string;
        name: string;
        updatedAt: string
        questions: any[]
        published: boolean
    }
    handleDelete: (id: string) => Promise<void>
}) {
    const { survey } = props

    return (
        <Card key={survey.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">{survey.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>更新于 {formatDate(survey.updatedAt)}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {survey.description || `包含 ${survey.questions?.length} 个问题`}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-xs px-2 py-1 rounded-full ${survey.published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                            }`}
                    >
                        {survey.published ? "已发布" : "草稿"}
                    </span>
                    <span className="text-xs text-muted-foreground">{survey.questions?.length} 个问题</span>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/edit/${survey.id}`}>
                            <FileText className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                        props.handleDelete(survey.id)
                    }}  >
                        <Trash2Icon className="h-4 w-4"></Trash2Icon>
                    </Button>
                    {survey.published && (
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/results/${survey.id}`}>
                                <BarChart3 className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}