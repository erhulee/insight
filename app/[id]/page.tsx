import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Question } from "@/lib/types";
import { PrismaClient } from "@prisma/client"
import { SurveyForm } from "./Form";
import { submit } from "./action";
const prisma = new PrismaClient();

export default async function SurveyPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const survey = await prisma.survey.findFirst({
        where: {
            id: params.id
        }
    })
    const handleSubmit = async (values: Record<string, any>) => {
        "use server"
        console.log("values:", values)
        const response = await submit(params.id, values)
        console.log("response:", response)
    }
    const questionList = JSON.parse(survey?.questions || "[]") as Question[]
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
        return <SurveyForm question={questionList} handleSubmit={handleSubmit}></SurveyForm>
    }
}


