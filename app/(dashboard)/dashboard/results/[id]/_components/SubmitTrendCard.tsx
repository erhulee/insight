import { trpc } from '@/app/_trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig
export function SubmitTrendCard(props: { id: string }) {
  const { data, isLoading, isError } = trpc.GetSurveyResult.useQuery({
    id: props.id,
  })
  const chartData = data?.trendList ?? []
  return (
    <Card>
      <CardHeader>
        <CardTitle>回复趋势</CardTitle>
        <CardDescription>过去30天的回复数量</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className=" h-80 w-full ">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Line
              dataKey="count"
              type="linear"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
