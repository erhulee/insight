import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PrismaClient } from '@prisma/client/edge'
import { SurveyForm } from './Form'
import { Question } from '@/lib/api-types'
const prisma = new PrismaClient()

export default async function SurveyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const survey = await prisma.survey.findFirst({
    where: {
      id: params.id,
    },
  })
  console.log("survey:", survey)
  const questionList = survey?.questions
  if (!survey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Survey not found</CardTitle>
            <CardDescription>
              The survey you're looking for doesn't exist or has been deleted
            </CardDescription>
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
    return <SurveyForm question={questionList} surveyId={params.id}></SurveyForm>
  }
}
