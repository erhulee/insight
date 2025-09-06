'use client'
import { QuestionSchemaType } from '@/lib/dsl'
import { cloneDeep } from 'lodash-es'
import { DisplayLogicConfig } from '@/lib/custom-display-logic'
import { BehaviorSubject } from 'rxjs'
import { useEffect, useState } from 'react'

export type QuestionLogic = {
	condition: {
		questionId: string
		answer?: {
			equal?: string | string[]
			notEqual?: string | string[]
			contains?: string
			empty?: boolean
		}
	}
	action: {
		type: 'hide' | 'show' | 'jumpTo'
		targetQuestionId?: string
	}
}

export type Question = {
	id: string
	type: QuestionSchemaType['type']
	title: string
	description?: string
	required?: boolean
	props: Record<string, any>
	pageSize: number
	ownerPage: number
	logic?: QuestionLogic[]
}

export type RuntimeState = {
	surveyId: string
	questions: Question[]
	selectedQuestionID: Question['id'] | null
	currentPage: number
	currentQuestion: Question[]
	pageCount: number
	displayLogic: DisplayLogicConfig
}

const initialRuntimeState: RuntimeState = {
	surveyId: '',
	questions: [] as Question[],
	selectedQuestionID: null,
	pageCount: 1,
	currentPage: 1,
	currentQuestion: [] as Question[],
	displayLogic: {
		rules: [],
		enabled: false,
	},
}

export const runtimeState$ = new BehaviorSubject<RuntimeState>(
	initialRuntimeState,
)

function getState() {
	return runtimeState$.getValue()
}

function setState(updater: (prev: RuntimeState) => RuntimeState) {
	const next = updater(getState())
	runtimeState$.next(next)
}

function normalizeQuestion(
	q: QuestionSchemaType,
	ownerPageDefault: number,
): Question {
	const base: Question = {
		id: q.id,
		type: q.type,
		title: q.title,
		props: q.props || {},
		pageSize: (q as any).pageSize || 1,
		ownerPage: ownerPageDefault,
	}
	if (typeof q.description !== 'undefined') base.description = q.description
	if (typeof q.required !== 'undefined') base.required = q.required
	if (typeof q.logic !== 'undefined') base.logic = q.logic as any
	return base
}

//保证 currentQuestion、selectedQuestionID 与 questions 同步
function deriveAllQuestions(questions: Question[], selectedId: string | null) {
	const nextSelected =
		questions.findIndex((q) => q.id === selectedId) == -1 ? null : selectedId
	return { currentQuestion: questions, selectedQuestionID: nextSelected }
}
export const initRuntimeStore = (params: RuntimeState) => {
	const ownerPageDefault = params.currentPage || 1
	const normalizedQuestions = params.questions.map((q: any) =>
		typeof (q as Question).ownerPage === 'number'
			? (q as Question)
			: normalizeQuestion(q as QuestionSchemaType, ownerPageDefault),
	)
	const next: RuntimeState = {
		surveyId: params.surveyId,
		questions: normalizedQuestions,
		pageCount: params.pageCount,
		currentPage: params.currentPage,
		currentQuestion:
			params.currentQuestion && params.currentQuestion.length
				? (params.currentQuestion as Question[])
				: normalizedQuestions,
		selectedQuestionID: params.selectedQuestionID,
		displayLogic: params.displayLogic,
	}
	runtimeState$.next(next)
}

export const selectQuestion = (question: QuestionSchemaType) => {
	setState((prev) => {
		const { currentQuestion, selectedQuestionID } = deriveAllQuestions(
			prev.questions,
			question.id,
		)
		return { ...prev, currentQuestion, selectedQuestionID }
	})
}
export const addQuestion = (question: QuestionSchemaType) => {
	setState((prev) => {
		const newQuestion = normalizeQuestion(question, prev.currentPage)
		console.log('addQuestion setState', prev, question, newQuestion)

		const questions = [...prev.questions, newQuestion]
		const { currentQuestion, selectedQuestionID } = deriveAllQuestions(
			questions,
			prev.selectedQuestionID,
		)
		return { ...prev, questions, currentQuestion, selectedQuestionID }
	})
}

export const deleteQuestion = (id: QuestionSchemaType['id']) => {
	setState((prev) => {
		const questions = prev.questions.filter((q) => q.id !== id)
		const { currentQuestion, selectedQuestionID } = deriveAllQuestions(
			questions,
			prev.selectedQuestionID,
		)
		return { ...prev, questions, currentQuestion, selectedQuestionID }
	})
}

export const setCurrentPage = (page: number) => {
	setState((prev) => {
		const filtered = prev.questions.filter((q) => q.ownerPage == page)
		const nextSelected =
			filtered.findIndex((q) => q.id === prev.selectedQuestionID) == -1
				? null
				: prev.selectedQuestionID
		return {
			...prev,
			currentPage: page,
			currentQuestion: filtered,
			selectedQuestionID: nextSelected,
		}
	})
}

export const insertPage = (pageCount: number) => {
	setState((prev) => ({ ...prev, pageCount }))
	setCurrentPage(pageCount)
}

export const deletePage = (pageIndex: number) => {
	setState((prev) => {
		const nextPageCount = prev.pageCount - 1
		const nextCurrentPage =
			pageIndex == prev.currentPage ? pageIndex - 1 : prev.currentPage
		const remapped = prev.questions
			.filter((q) => q.ownerPage !== pageIndex)
			.map((q) => ({
				...q,
				ownerPage: q.ownerPage > pageIndex ? q.ownerPage - 1 : q.ownerPage,
			}))
		const { currentQuestion, selectedQuestionID } = deriveAllQuestions(
			remapped,
			prev.selectedQuestionID,
		)
		return {
			...prev,
			pageCount: nextPageCount,
			currentPage: nextCurrentPage,
			questions: remapped,
			currentQuestion,
			selectedQuestionID,
		}
	})
}

export const updateRuntimeQuestion = (question: QuestionSchemaType[]) => {
	setState((prev) => {
		const normalized = question.map((q) =>
			normalizeQuestion(q, prev.currentPage),
		)
		const { currentQuestion, selectedQuestionID } = deriveAllQuestions(
			normalized,
			prev.selectedQuestionID,
		)
		return {
			...prev,
			questions: normalized,
			currentQuestion,
			selectedQuestionID,
		}
	})
}

export const RuntimeDSLAction = {
	selectQuestion: (questionId: string) => {
		setState((prev) => {
			const { currentQuestion, selectedQuestionID } = deriveAllQuestions(
				prev.questions,
				questionId,
			)
			return { ...prev, currentQuestion, selectedQuestionID }
		})
	},
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
		setState((prev) => {
			const idx = prev.questions.findIndex(
				(q) => q.id === prev.selectedQuestionID,
			)
			if (idx === -1) return prev
			const oldQuestion = cloneDeep(prev.questions[idx])
			if (!oldQuestion) return prev
			if (action == 'props') {
				const mergedProps = {
					...(oldQuestion.props || {}),
					...(params.props || {}),
				}
				oldQuestion.props = mergedProps
			} else if (action == 'form-basic') {
				if (typeof params.attr?.title !== 'undefined') {
					oldQuestion.title = params.attr.title
				}
				if (typeof params.attr?.description !== 'undefined') {
					if (params.attr.description === undefined) {
						delete (oldQuestion as any).description
					} else {
						oldQuestion.description = params.attr.description
					}
				}
				if (typeof params.attr?.required !== 'undefined') {
					if (params.attr.required === undefined) {
						delete (oldQuestion as any).required
					} else {
						oldQuestion.required = params.attr.required
					}
				}
			}
			const questions = [
				...prev.questions.slice(0, idx),
				oldQuestion,
				...prev.questions.slice(idx + 1),
			]
			return { ...prev, questions }
		})
	},
	updateDisplayLogic: (config: DisplayLogicConfig) => {
		setState((prev) => ({ ...prev, displayLogic: config }))
	},
}

export class CoreRuntime {
	readonly runtimeState$ = runtimeState$

	init(params: RuntimeState) {
		initRuntimeStore(params)
	}

	getState() {
		return this.runtimeState$.getValue()
	}

	subscribe(listener: (state: RuntimeState) => void) {
		return this.runtimeState$.subscribe(listener)
	}

	selectQuestion(question: QuestionSchemaType) {
		selectQuestion(question)
	}

	selectQuestionById(questionId: string) {
		RuntimeDSLAction.selectQuestion(questionId)
	}

	addQuestion(question: QuestionSchemaType) {
		addQuestion(question)
	}

	deleteQuestion(id: string) {
		deleteQuestion(id)
	}

	setCurrentPage(page: number) {
		setCurrentPage(page)
	}

	insertPage(pageCount: number) {
		insertPage(pageCount)
	}

	deletePage(pageIndex: number) {
		deletePage(pageIndex)
	}

	updateRuntimeQuestion(questions: QuestionSchemaType[]) {
		updateRuntimeQuestion(questions)
	}

	updateQuestion(
		action: 'props' | 'form-basic',
		params: {
			props?: Record<string, any>
			attr?: Partial<{
				title: string
				description: string
				required: boolean
			}>
		},
	) {
		RuntimeDSLAction.updateQuestion(action, params)
	}

	updateDisplayLogic(config: DisplayLogicConfig) {
		RuntimeDSLAction.updateDisplayLogic(config)
	}

	replaceQuestions(questions: Question[]) {
		replaceQuestions(questions)
	}

	clearSelection() {
		clearSelection()
	}
}

export const coreRuntime = new CoreRuntime()

export function useRuntimeState<T = RuntimeState>(
	selector?: (state: RuntimeState) => T,
): T {
	const getSelectedState = () => {
		const s = runtimeState$.getValue()
		return selector ? selector(s) : (s as unknown as T)
	}
	const [snapshot, setSnapshot] = useState<T>(getSelectedState)
	useEffect(() => {
		const sub = runtimeState$.subscribe((state) => {
			setSnapshot(selector ? selector(state) : (state as unknown as T))
		})
		return () => sub.unsubscribe()
	}, [selector])
	return snapshot
}

export function clearSelection() {
	setState((prev) => ({ ...prev, selectedQuestionID: null }))
}

export function replaceQuestions(questions: Question[]) {
	setState((prev) => {
		const { currentQuestion, selectedQuestionID } = deriveAllQuestions(
			questions,
			prev.selectedQuestionID,
		)
		return { ...prev, questions, currentQuestion, selectedQuestionID }
	})
}
