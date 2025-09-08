import { useState, useEffect } from 'react'
import { trpc } from '@/app/_trpc/client'

export interface Survey {
	id: string
	name: string
	description: string
	createdAt: string
	published: boolean
	responseCount: number
}

export interface OverviewStats {
	totalResponses: number
	completionRate: number
	averageTime: number
	responseGrowth: number
}

export interface ResponseData {
	date: string
	responses: number
	completions: number
}

export interface QuestionAnalysis {
	questionId: string
	questionTitle: string
	questionType: string
	totalResponses: number
	completionRate: number
	analysis: any
}

export interface TrendData {
	date: string
	responses: number
	completions: number
	completionRate: number
}

export function useInsights(selectedSurvey: string, dateRange: string) {
	const [surveys, setSurveys] = useState<Survey[]>([])
	const [selectedSurveyData, setSelectedSurveyData] = useState<Survey | null>(
		null,
	)
	const [stats, setStats] = useState<OverviewStats | null>(null)
	const [responseData, setResponseData] = useState<ResponseData[]>([])
	const [questionAnalysis, setQuestionAnalysis] = useState<QuestionAnalysis[]>(
		[],
	)
	const [trends, setTrends] = useState<TrendData[]>([])
	const [isLoading, setIsLoading] = useState(false)

	// 获取问卷列表
	const {
		data: surveysData,
		refetch: refetchSurveys,
		isLoading: isLoadingSurveys,
	} = trpc.survey.getUserSurveys.useQuery()

	// 获取问卷统计数据
	const {
		data: statsData,
		refetch: refetchStats,
		isLoading: isLoadingStats,
	} = trpc.survey.getSurveyStats.useQuery(
		{ surveyId: selectedSurvey, dateRange },
		{ enabled: !!selectedSurvey },
	)

	// 获取响应数据
	const {
		data: responseDataResult,
		refetch: refetchResponseData,
		isLoading: isLoadingResponseData,
	} = trpc.survey.getResponseData.useQuery(
		{ surveyId: selectedSurvey, dateRange },
		{ enabled: !!selectedSurvey },
	)

	// 获取题目分析
	const {
		data: questionAnalysisData,
		refetch: refetchQuestionAnalysis,
		isLoading: isLoadingQuestionAnalysis,
	} = trpc.survey.getQuestionAnalysis.useQuery(
		{ surveyId: selectedSurvey },
		{ enabled: !!selectedSurvey },
	)

	// 获取趋势数据
	const {
		data: trendsData,
		refetch: refetchTrends,
		isLoading: isLoadingTrends,
	} = trpc.survey.getTrendData.useQuery(
		{ surveyId: selectedSurvey, dateRange },
		{ enabled: !!selectedSurvey },
	)

	// 更新问卷列表
	useEffect(() => {
		if (surveysData) {
			const formattedSurveys = surveysData.map((survey: any) => ({
				id: survey.id,
				name: survey.name || '未命名问卷',
				description: survey.description || '',
				createdAt: survey.createdAt,
				published: survey.published,
				responseCount: survey.responseCount || 0,
			}))
			setSurveys(formattedSurveys)
		}
	}, [surveysData])

	// 更新选中的问卷数据
	useEffect(() => {
		if (selectedSurvey && surveys.length > 0) {
			const survey = surveys.find((s) => s.id === selectedSurvey)
			setSelectedSurveyData(survey || null)
		} else {
			setSelectedSurveyData(null)
		}
	}, [selectedSurvey, surveys])

	// 更新统计数据
	useEffect(() => {
		if (statsData) {
			setStats({
				totalResponses: statsData.totalResponses || 0,
				completionRate: statsData.completionRate || 0,
				averageTime: statsData.averageTime || 0,
				responseGrowth: statsData.responseGrowth || 0,
			})
		}
	}, [statsData])

	// 更新响应数据
	useEffect(() => {
		if (responseDataResult) {
			setResponseData(responseDataResult)
		}
	}, [responseDataResult])

	// 更新题目分析
	useEffect(() => {
		if (questionAnalysisData) {
			setQuestionAnalysis(questionAnalysisData)
		}
	}, [questionAnalysisData])

	// 更新趋势数据
	useEffect(() => {
		if (trendsData) {
			setTrends(trendsData)
		}
	}, [trendsData])

	// 更新加载状态
	useEffect(() => {
		setIsLoading(
			isLoadingSurveys ||
				isLoadingStats ||
				isLoadingResponseData ||
				isLoadingQuestionAnalysis ||
				isLoadingTrends,
		)
	}, [
		isLoadingSurveys,
		isLoadingStats,
		isLoadingResponseData,
		isLoadingQuestionAnalysis,
		isLoadingTrends,
	])

	// 刷新所有数据
	const refetch = () => {
		refetchSurveys()
		if (selectedSurvey) {
			refetchStats()
			refetchResponseData()
			refetchQuestionAnalysis()
			refetchTrends()
		}
	}

	return {
		surveys,
		selectedSurveyData,
		stats,
		responseData,
		questionAnalysis,
		trends,
		isLoading,
		refetch,
	}
}
