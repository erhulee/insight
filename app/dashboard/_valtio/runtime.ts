import { QuestionSchemaType } from '@/lib/dsl'
import { cloneDeep } from 'lodash-es'
import { proxy } from 'valtio'
type Question = QuestionSchemaType
export type RuntimeState = {
  surveyId: string
  questions: Question[]
  selectedQuestionID: Question['id'] | null
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
  runtimeStore.currentQuestion = runtimeStore.questions
  // .filter(
  //   (q) => q.ownerPage == runtimeStore.currentPage,
  // )
  if (
    runtimeStore.currentQuestion.findIndex((q) => q.id === runtimeStore.selectedQuestionID) == -1
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

export const selectQuestion = (question: QuestionSchemaType) => {
  runtimeStore.selectedQuestionID = question.id
  updateCurrentQuestion()
}
export const addQuestion = (question: QuestionSchemaType) => {
  runtimeStore.questions.push(question)
  updateCurrentQuestion()
}

export const deleteQuestion = (id: QuestionSchemaType['id']) => {
  runtimeStore.questions = runtimeStore.questions.filter((q) => q.id !== id)
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

export const updateRuntimeQuestion = (question: QuestionSchemaType[]) => {
  runtimeStore.questions = question
  updateCurrentQuestion()
}

export const RuntimeDSLAction = {
  updateQuestion: (
    action: 'props' | 'form-basic',
    params: {
      props?: Record<string, any>
      attr?: Partial<{
        title: string
        description: string
        required: boolean
      }>
    },
  ) => {
    const idx = runtimeStore.questions.findIndex((q) => q.id === runtimeStore.selectedQuestionID)
    const oldQuestion = cloneDeep(runtimeStore.questions[idx])
    if (action == 'props') {
      const oldQuestionProps = oldQuestion?.props || {}
      Object.assign(oldQuestionProps, params.props)
      oldQuestion.props = oldQuestionProps
    } else if (action == 'form-basic') {
      Object.assign(oldQuestion, params.attr)
    }
    runtimeStore.questions = [
      ...runtimeStore.questions.slice(0, idx),
      oldQuestion,
      ...runtimeStore.questions.slice(idx + 1),
    ]
  },
}
