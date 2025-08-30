import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { cloneDeep } from 'lodash-es'
import { useSnapshot } from 'valtio'
import { DragEndEvent } from '@dnd-kit/core'
import { scrollToElement } from '@/lib/utils'
import { preset, QuestionType } from '@/components/survey-editor/buildin/form-item'
import {
  runtimeStore,
  addQuestion,
  deleteQuestion,
  selectQuestion,
  updateRuntimeQuestion,
  RuntimeDSLAction,
  Question,
} from '@/app/dashboard/_valtio/runtime'
import { QuestionSchemaType } from '@/lib/dsl'

/**
 * Hook for managing survey question actions (CRUD operations)
 */
export const useAction = () => {
  const runtimeState = useSnapshot(runtimeStore)
  const questions = runtimeState.questions
  const selectedQuestionId = runtimeState.selectedQuestionID

  /**
   * Select a question
   */
  const handleSelectQuestion = useCallback((question: Question) => {
    selectQuestion(question as QuestionSchemaType)
  }, [])

  /**
   * Add a new question
   */
  const handleAddQuestion = useCallback((type: QuestionType) => {
    const meta = preset.find((item) => item.type === type)
    if (!meta) return
    const id = uuidv4()
    const newQuestion: QuestionSchemaType = meta.schema.parse({
      id: id,
      type: type as QuestionSchemaType['type'],
      title: meta.title,
      props: {},
    })
    addQuestion(newQuestion)
  }, [])

  /**
   * Delete a question
   */
  const handleDeleteQuestion = useCallback((id: string) => {
    deleteQuestion(id)
  }, [])

  /**
   * Duplicate a question and insert it after the original
   */
  const handleDuplicateQuestion = useCallback((id: string) => {
    const questionToDuplicate = questions.find((q) => q.id === id)
    if (!questionToDuplicate) return

    const duplicatedQuestion = {
      ...cloneDeep(questionToDuplicate),
      id: uuidv4(),
    }

    const index = questions.findIndex((q) => q.id === id)
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index + 1, 0, duplicatedQuestion)

    // Scroll to the duplicated question
    setTimeout(() => {
      scrollToElement(duplicatedQuestion.id, 100)
    }, 100)
  }, [questions])

  /**
   * Update question properties
   */
  const handleUpdateQuestionProps = useCallback((
    action: 'props' | 'form-basic',
    params: {
      props?: Record<string, any>
      attr?: Partial<{
        title: string
        description: string
        required: boolean
      }>
    }
  ) => {
    RuntimeDSLAction.updateQuestion(action, params)
  }, [])

  /**
   * Handle drag and drop reordering
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const fromQuestionId = event.active.id
    const targetQuestionId = event.over?.id

    if (targetQuestionId == null) return

    const fromQuestionIndex = questions.findIndex((q) => q.id === fromQuestionId)
    const targetQuestionIndex = questions.findIndex((q) => q.id === targetQuestionId)

    if (fromQuestionIndex !== -1 && targetQuestionIndex !== -1) {
      const updatedQuestions = cloneDeep([...questions])
      const [movedQuestion] = updatedQuestions.splice(fromQuestionIndex, 1)
      updatedQuestions.splice(targetQuestionIndex, 0, movedQuestion)
      runtimeStore.questions = updatedQuestions as Question[]
    }
  }, [questions])

  /**
   * Get question by ID
   */
  const getQuestionById = useCallback((id: string) => {
    return questions.find(q => q.id === id)
  }, [questions])

  /**
   * Check if a question is selected
   */
  const isQuestionSelected = useCallback((questionId: string) => {
    return selectedQuestionId === questionId
  }, [selectedQuestionId])

  /**
   * Get the currently selected question
   */
  const getSelectedQuestion = useCallback(() => {
    return questions.find(q => q.id === selectedQuestionId)
  }, [questions, selectedQuestionId])

  /**
   * Clear question selection
   */
  const clearSelection = useCallback(() => {
    runtimeStore.selectedQuestionID = null
  }, [])

  /**
   * Batch update questions
   */
  const batchUpdateQuestions = useCallback((updates: Array<{ id: string; updates: Partial<Question> }>) => {
    const updatedQuestions = questions.map(question => {
      const update = updates.find(u => u.id === question.id)
      return update ? { ...question, ...update.updates } : question
    })
    updateRuntimeQuestion(updatedQuestions as QuestionSchemaType[])
  }, [questions])

  return {
    // State
    questions,
    selectedQuestionId,
    selectedQuestion: getSelectedQuestion(),

    // CRUD Operations
    addQuestion: handleAddQuestion,
    deleteQuestion: handleDeleteQuestion,
    duplicateQuestion: handleDuplicateQuestion,
    selectQuestion: handleSelectQuestion,
    clearSelection,

    // Update Operations
    updateQuestionProps: handleUpdateQuestionProps,
    batchUpdateQuestions,

    // Drag and Drop
    handleDragEnd,

    // Utility Functions
    getQuestionById,
    isQuestionSelected,
  }
}
