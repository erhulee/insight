'use client'
import { QuestionSchemaType } from '@/lib/dsl'
import { cloneDeep } from 'lodash-es'
import { DisplayLogicConfig } from '@/lib/logic/dsl'
import { evaluateAll } from '@/lib/logic/engine'
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
	answers?: Record<string, unknown>
	visibleMap?: Record<string, boolean>
}

const initialRuntimeState: RuntimeState = {
	surveyId: '',
	questions: [] as Question[],
	selectedQuestionID: null,
	pageCount: 1,
	currentPage: 1,
	currentQuestion: [] as Question[],
	displayLogic: { rules: [], enabled: false, version: 1 },
	answers: {},
	visibleMap: {},
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
	const initialAnswers = (params as any).answers || {}
	const initialVisible = evaluateAll(
		initialAnswers,
		params.displayLogic,
		normalizedQuestions,
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
		answers: initialAnswers,
		visibleMap: Object.fromEntries(initialVisible),
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
		// Backward compatibility: convert to patchQuestion
		RuntimeDSLAction.patchQuestion((prevQ) => {
			const next = cloneDeep(prevQ)
			if (action === 'props') {
				next.props = { ...(next.props || {}), ...(params.props || {}) }
			} else if (action === 'form-basic') {
				if (typeof params.attr?.title !== 'undefined')
					next.title = params.attr.title!
				if (typeof params.attr?.description !== 'undefined') {
					if (params.attr.description === undefined)
						delete (next as any).description
					else next.description = params.attr.description
				}
				if (typeof params.attr?.required !== 'undefined') {
					if (params.attr.required === undefined) delete (next as any).required
					else next.required = params.attr.required
				}
			}
			return next
		})
	},
	updateDisplayLogic: (config: DisplayLogicConfig) => {
		setState((prev) => {
			const nextVisible = evaluateAll(
				prev.answers || {},
				config,
				prev.questions,
			)
			return {
				...prev,
				displayLogic: config,
				visibleMap: Object.fromEntries(nextVisible),
			}
		})
	},

	updateAnswer: (questionId: string, value: unknown) => {
		setState((prev) => {
			const nextAnswers = { ...(prev.answers || {}), [questionId]: value }
			const nextVisible = evaluateAll(
				nextAnswers,
				prev.displayLogic,
				prev.questions,
			)
			// 当题目变为不可见时清空答案
			const visibleMap = Object.fromEntries(nextVisible)
			const clearedAnswers = { ...nextAnswers }
			for (const q of prev.questions) {
				if (visibleMap[q.id] === false && q.id in clearedAnswers) {
					delete (clearedAnswers as any)[q.id]
				}
			}
			return { ...prev, answers: clearedAnswers, visibleMap }
		})
	},
	patchQuestion: (
		patch: Partial<Question> | ((prev: Question) => Question),
	) => {
		setState((prev) => {
			const idx = prev.questions.findIndex(
				(q) => q.id === prev.selectedQuestionID,
			)
			if (idx === -1) return prev
			const current = cloneDeep(prev.questions[idx])
			if (!current) return prev
			const next =
				typeof patch === 'function'
					? patch(current)
					: applyPatch(current, patch)
			const questions = [
				...prev.questions.slice(0, idx),
				next,
				...prev.questions.slice(idx + 1),
			]
			return { ...prev, questions }
		})
	},
}

function applyPatch(base: Question, patch: Partial<Question>): Question {
	const next: Question = { ...base }
	if ('title' in patch) next.title = patch.title as string
	if ('description' in patch) {
		if (patch.description === undefined) delete (next as any).description
		else next.description = patch.description
	}
	if ('required' in patch) {
		if (patch.required === undefined) delete (next as any).required
		else next.required = patch.required
	}
	if ('logic' in patch) {
		if (patch.logic === undefined) delete (next as any).logic
		else next.logic = patch.logic
	}
	if (patch.props)
		next.props = { ...(next.props || {}), ...(patch.props || {}) }
	return next
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

	patchQuestion(patch: Partial<Question> | ((prev: Question) => Question)) {
		RuntimeDSLAction.patchQuestion(patch)
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
