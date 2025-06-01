import { Question } from '@/lib/types'
import { proxy } from 'valtio'

export type RuntimeState = {
  surveyId: string
  questions: Question[]
  selectedQuestionID: Question['field'] | null
  currentPage: number
  currentQuestion: Question[]
  pageCount: number
}
export const runtimeStore = proxy<RuntimeState>({
  surveyId: '',
  questions: [] as Question[],
  selectedQuestionID: null,
  pageCount: 1,
  currentPage: 1,
  currentQuestion: [] as Question[],
})

function updateCurrentQuestion() {
  runtimeStore.currentQuestion = runtimeStore.questions.filter(
    (q) => q.ownerPage == runtimeStore.currentPage,
  )
  if (
    runtimeStore.currentQuestion.findIndex((q) => q.field === runtimeStore.selectedQuestionID) == -1
  ) {
    runtimeStore.selectedQuestionID = null
  }
}
export const initRuntimeStore = (params: RuntimeState) => {
  runtimeStore.surveyId = params.surveyId
  runtimeStore.questions = params.questions
  runtimeStore.pageCount = params.pageCount
  runtimeStore.currentPage = params.currentPage
  runtimeStore.currentQuestion = params.currentQuestion
}

export const selectQuestion = (question: Question) => {
  runtimeStore.selectedQuestionID = question.field
  updateCurrentQuestion()
}
export const addQuestion = (question: Question) => {
  runtimeStore.questions.push(question)
  updateCurrentQuestion()
}

export const deleteQuestion = (field: Question['field']) => {
  runtimeStore.questions = runtimeStore.questions.filter((q) => q.field !== field)
  updateCurrentQuestion()
}

export const setCurrentPage = (page: number) => {
  runtimeStore.currentPage = page
  runtimeStore.currentQuestion = runtimeStore.questions.filter((q) => q.ownerPage == page)
}

export const insertPage = (pageCount: number) => {
  runtimeStore.pageCount = pageCount
  setCurrentPage(pageCount)
}

export const deletePage = (pageIndex: number) => {
  runtimeStore.pageCount -= 1
  if (pageIndex == runtimeStore.currentPage) {
    setCurrentPage(pageIndex - 1)
  }
  runtimeStore.questions = runtimeStore.questions
    .filter((q) => q.ownerPage !== pageIndex)
    .map((q) => {
      return {
        ...q,
        ownerPage: q.ownerPage > pageIndex ? q.ownerPage - 1 : q.ownerPage,
      }
    })
  updateCurrentQuestion()
}

export const updateRuntimeQuestion = (question: Question[]) => {
  runtimeStore.questions = question
  updateCurrentQuestion()
}
