'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, PieChart, ListFilter } from 'lucide-react'
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Brand } from '@/components/common/brand'
import { trpc } from '@/app/_trpc/client'
import { SubmitTrendCard } from './_components/SubmitTrendCard'

export default function SurveyResults() {
	const { id } = useParams()
	const [activeTab, setActiveTab] = useState('summary')
	const { data, isLoading, isError } = trpc.GetSurveyResult.useQuery({
		id: id as string,
	})
	if (isLoading) {
		return <div>loading</div>
	}
	const survey = data?.survey!
	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-10 border-b bg-background">
				<div className="flex h-16 items-center justify-between px-4">
					<div className="flex items-center gap-4">
						<Brand></Brand>
						<h1 className="text-lg font-medium">{survey.name} - 数据分析</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" className="gap-1">
							<Download className="h-4 w-4" />
							导出数据
						</Button>
						<Link href={`/dashboard/edit/${id}`}>
							<Button variant="outline" size="sm">
								返回编辑
							</Button>
						</Link>
					</div>
				</div>
			</header>
			<main className="flex-1 py-6">
				<div className="container mx-auto px-4">
					<div className="grid gap-6">
						<div className="grid gap-4 md:grid-cols-3">
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">
										总回复数
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{survey.responses}</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">完成率</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">98%</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">
										平均完成时间
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">3分42秒</div>
								</CardContent>
							</Card>
						</div>

						<Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
							<TabsList>
								<TabsTrigger value="summary">数据概览</TabsTrigger>
								<TabsTrigger value="questions">问题分析</TabsTrigger>
								<TabsTrigger value="respondents">回复列表</TabsTrigger>
							</TabsList>

							<TabsContent value="summary" className="mt-4">
								<SubmitTrendCard id={id as string}></SubmitTrendCard>
							</TabsContent>

							<TabsContent value="questions" className="mt-4 space-y-6">
								{survey.questions.map((question) => (
									<Card key={question.id}>
										<CardHeader>
											<CardTitle>{question.title}</CardTitle>
											<CardDescription>
												{question.type === 'radio'
													? '单选题'
													: question.type === 'checkbox'
														? '多选题'
														: '文本题'}
											</CardDescription>
										</CardHeader>
										<CardContent>
											{(question.type === 'radio' ||
												question.type === 'checkbox') && (
												<div className="space-y-4">
													<div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
														<div className="text-center">
															<PieChart className="mx-auto h-12 w-12 text-gray-400" />
															<p className="mt-2 text-sm text-gray-500">
																这里将显示选项分布图表
															</p>
														</div>
													</div>
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>选项</TableHead>
																<TableHead className="text-right">
																	回复数
																</TableHead>
																<TableHead className="text-right">
																	百分比
																</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{/* {question.stats.map((stat, index) => (
                                <TableRow key={index}>
                                  <TableCell>{stat.option}</TableCell>
                                  <TableCell className="text-right">{stat.count}</TableCell>
                                  <TableCell className="text-right">{stat.percentage}%</TableCell>
                                </TableRow>
                              ))} */}
														</TableBody>
													</Table>
												</div>
											)}

											{question.type === 'text' && (
												<div className="space-y-4">
													<div className="flex justify-end">
														<Button
															variant="outline"
															size="sm"
															className="gap-1"
														>
															<ListFilter className="h-4 w-4" />
															筛选
														</Button>
													</div>
													<div className="space-y-2">
														{/* {question.responses.map((response, index) => (
                              <div key={index} className="rounded-md border p-3">
                                {response}
                              </div>
                            ))} */}
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								))}
							</TabsContent>

							<TabsContent value="respondents" className="mt-4">
								<Card>
									<CardHeader>
										<CardTitle>回复列表</CardTitle>
										<CardDescription>所有提交的回复</CardDescription>
									</CardHeader>
									<CardContent>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>提交时间</TableHead>
													<TableHead>邮箱</TableHead>
													<TableHead className="text-right">操作</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{/* {survey.respondents.map((respondent) => (
                          <TableRow key={respondent.id}>
                            <TableCell>{respondent.submittedAt}</TableCell>
                            <TableCell>{respondent.email}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                查看详情
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))} */}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</main>
		</div>
	)
}
