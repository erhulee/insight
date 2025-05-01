"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { FileText, CheckCircle } from "lucide-react"
import type { Question } from "@/lib/types"
import { trpc } from "../_trpc/client"
import { use } from 'react'
import { FormRender } from "@/render/main"
export default function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
    const _params = use(params)
    const { data: survey, isLoading } = trpc.GetSurvey.useQuery({
        id: _params.id
    })
    console.log("survey:", survey)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [currentStep, setCurrentStep] = useState(0)
    const [progress, setProgress] = useState(0)
    const [showThankYou, setShowThankYou] = useState(false)



    // Update progress bar
    const updateProgress = (currentStep: number, totalQuestions: number) => {
        const progressValue = totalQuestions > 0 ? (currentStep / totalQuestions) * 100 : 0
        setProgress(progressValue)
    }

    // Handle answer changes
    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }))

        // Clear error
        if (errors[questionId]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[questionId]
                return newErrors
            })
        }
    }

    // Handle radio change
    const handleRadioChange = (questionId: string, value: string) => {
        handleAnswerChange(questionId, value)
    }

    // Handle checkbox change
    const handleCheckboxChange = (questionId: string, value: string, checked: boolean) => {
        setAnswers((prev) => {
            const currentValues = [...(prev[questionId] || [])]

            if (checked) {
                if (!currentValues.includes(value)) {
                    currentValues.push(value)
                }
            } else {
                const index = currentValues.indexOf(value)
                if (index !== -1) {
                    currentValues.splice(index, 1)
                }
            }

            return {
                ...prev,
                [questionId]: currentValues,
            }
        })

        // Clear error
        if (errors[questionId]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[questionId]
                return newErrors
            })
        }
    }



    // Render question
    const renderQuestion = (question: Question) => {
        switch (question.type) {
            case "text":
                return (
                    <div className="space-y-2">
                        {question.multiline ? (
                            <Textarea
                                id={question.id}
                                value={answers[question.id] || ""}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                placeholder={question.placeholder}
                                rows={5}
                                className={errors[question.id] ? "border-destructive" : ""}
                            />
                        ) : (
                            <Input
                                id={question.id}
                                type="text"
                                value={answers[question.id] || ""}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                placeholder={question.placeholder}
                                className={errors[question.id] ? "border-destructive" : ""}
                            />
                        )}
                    </div>
                )
            case "radio":
                return (
                    <div className="space-y-2">
                        {question.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id={`${question.id}-${index}`}
                                    name={question.id}
                                    value={option.value || option.text}
                                    checked={answers[question.id] === (option.value || option.text)}
                                    onChange={() => handleRadioChange(question.id, option.value || option.text)}
                                    className="h-4 w-4 text-primary"
                                />
                                <label htmlFor={`${question.id}-${index}`} className="text-sm cursor-pointer">
                                    {option.text}
                                </label>
                            </div>
                        ))}
                    </div>
                )
            case "checkbox":
                return (
                    <div className="space-y-2">
                        {question.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`${question.id}-${index}`}
                                    value={option.value || option.text}
                                    checked={(answers[question.id] || []).includes(option.value || option.text)}
                                    onChange={(e) => handleCheckboxChange(question.id, option.value || option.text, e.target.checked)}
                                    className="h-4 w-4 text-primary rounded"
                                />
                                <label htmlFor={`${question.id}-${index}`} className="text-sm cursor-pointer">
                                    {option.text}
                                </label>
                            </div>
                        ))}
                    </div>
                )
            case "dropdown":
                return (
                    <div className="space-y-2">
                        <select
                            id={question.id}
                            value={answers[question.id] || ""}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md ${errors[question.id] ? "border-destructive" : "border-input"
                                }`}
                        >
                            <option value="">Please select...</option>
                            {question.options?.map((option, index) => (
                                <option key={index} value={option.value || option.text}>
                                    {option.text}
                                </option>
                            ))}
                        </select>
                    </div>
                )
            case "rating":
                return (
                    <div className="space-y-2">
                        <div className="flex space-x-2">
                            {Array.from({ length: question.maxRating || 5 }).map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleAnswerChange(question.id, index + 1)}
                                    className={`w-10 h-10 rounded-md flex items-center justify-center border ${answers[question.id] === index + 1
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-background hover:bg-muted"
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )
            case "date":
                return (
                    <div className="space-y-2">
                        <Input
                            id={question.id}
                            type="date"
                            value={answers[question.id] || ""}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            min={question.minDate}
                            max={question.maxDate}
                            className={errors[question.id] ? "border-destructive" : ""}
                        />
                    </div>
                )
            case "file":
                return (
                    <div className="space-y-2">
                        <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-4 text-center">
                            <p className="text-sm text-muted-foreground">Click or drag files to upload</p>
                            <input
                                type="file"
                                id={question.id}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        handleAnswerChange(question.id, e.target.files[0].name)
                                    }
                                }}
                                accept={question.fileTypes}
                                multiple={question.maxFiles && question.maxFiles > 1}
                                className="hidden"
                            />
                            <label
                                htmlFor={question.id}
                                className="mt-2 inline-block px-4 py-2 bg-primary/10 text-primary rounded-md text-sm cursor-pointer"
                            >
                                Select file
                            </label>
                            {answers[question.id] && <p className="mt-2 text-sm">{answers[question.id]}</p>}
                        </div>
                    </div>
                )
            case "section":
                return null
            default:
                return <div className="text-sm text-muted-foreground">Unsupported question type: {question.type}</div>
        }
    }

    // Render thank you screen
    const renderThankYouScreen = () => {
        // const title = survey?.settings?.thankYouScreen?.title || "Thank you for your response!"
        // const description = survey?.settings?.thankYouScreen?.description || "Your feedback is valuable to us."
        // const redirectUrl = survey?.settings?.thankYouScreen?.redirectUrl
        // const redirectDelay = survey?.settings?.thankYouScreen?.redirectDelay || 5

        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Your response has been successfully submitted.</p>
                        {redirectUrl && (
                            <p className="text-sm text-muted-foreground mt-4">Redirecting in {redirectDelay} seconds...</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button asChild>
                            <Link href="/" className="gap-1">
                                Return to Home
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading survey...</p>
                </div>
            </div>
        )
    }

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
    }

    if (showThankYou) {
        return (
            <div className="min-h-screen bg-background">
                <header className="border-b">
                    <div className="container flex h-16 items-center px-4">
                        <div className="flex items-center gap-2 font-bold text-xl text-primary">
                            <FileText className="h-6 w-6" />
                            <span>EchoInsight</span>
                        </div>
                    </div>
                </header>

                <main className="container px-4 py-8 max-w-3xl mx-auto">{renderThankYouScreen()}</main>
            </div>
        )
    }

    // Filter questions to show only non-section questions for step navigation
    const visibleQuestions = survey.questions.filter((q) => q.type !== "section")
    const currentQuestion = visibleQuestions[currentStep]
    const isLastStep = currentStep === visibleQuestions.length - 1

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container flex h-16 items-center px-4">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <FileText className="h-6 w-6" />
                        <span>EchoInsight</span>
                    </div>
                </div>
            </header>

            <main className="container px-4 py-8 max-w-3xl mx-auto">
                {/* Progress bar */}
                {/* {survey.settings?.showProgressBar && (
                    <div className="mb-6">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-right mt-1 text-muted-foreground">
                            Question {currentStep + 1} of {visibleQuestions.length}
                        </p>
                    </div>
                )} */}

                {/* Survey title */}
                {/* <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>{survey.title}</CardTitle>
                        {survey.description && <CardDescription>{survey.description}</CardDescription>}
                    </CardHeader>
                </Card> */}

                <FormRender questions={survey.questions}></FormRender>
                {/* Current question */}
                {/* {currentQuestion && (
                    <Card
                        key={currentQuestion.id}
                        id={currentQuestion.id}
                        className={errors[currentQuestion.id] ? "border-destructive" : ""}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-start gap-1">
                                <CardTitle className="text-base">
                                    {survey.settings?.showQuestionNumbers && `${currentStep + 1}. `}
                                    {currentQuestion.title}
                                    {currentQuestion.required && <span className="text-destructive ml-1">*</span>}
                                </CardTitle>
                            </div>
                            {currentQuestion.description && <CardDescription>{currentQuestion.description}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                            {renderQuestion(currentQuestion)}
                            {errors[currentQuestion.id] && (
                                <p className="text-destructive text-sm mt-2">{errors[currentQuestion.id]}</p>
                            )}
                        </CardContent>
                    </Card>
                )} */}
            </main>
        </div>
    )
}
