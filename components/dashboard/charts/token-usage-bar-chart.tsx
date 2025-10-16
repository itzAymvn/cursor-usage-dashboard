"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModelMetrics } from "@/lib/types"
import { ChartTooltipProps } from "@/lib/chart-types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { memo, useMemo } from "react"

interface TokenUsageBarChartProps {
	models: ModelMetrics[]
	isLoading?: boolean
}

export const TokenUsageBarChart = memo(function TokenUsageBarChart({
	models,
	isLoading = false,
}: TokenUsageBarChartProps) {
	const chartData = useMemo(() => {
		if (!models.length) return []

		// Sort by token usage and take top 10
		const sortedModels = [...models].sort((a, b) => b.tokens - a.tokens).slice(0, 10)

		return sortedModels.map((model) => ({
			model: model.model.length > 20 ? model.model.substring(0, 20) + "..." : model.model,
			fullModel: model.model,
			tokens: model.tokens / 1000000, // Convert to millions
			rawTokens: model.tokens,
			calls: model.calls,
			cost: model.yourCost,
		}))
	}, [models])

	const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload as Record<string, string | number>
			return (
				<div className="bg-background border border-border rounded-lg p-3 shadow-md">
					<p className="font-medium">{String(data.fullModel)}</p>
					<p className="text-sm text-muted-foreground">
						Tokens: {Number(data.rawTokens).toLocaleString()} ({Number(data.tokens).toFixed(2)}M)
					</p>
					<p className="text-sm text-muted-foreground">Calls: {Number(data.calls).toLocaleString()}</p>
					<p className="text-sm text-muted-foreground">Cost: ${Number(data.cost).toFixed(2)}</p>
				</div>
			)
		}
		return null
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Token Usage by Model</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80 flex items-center justify-center">
						<div className="space-y-3">
							{Array.from({ length: 8 }).map((_, i) => (
								<div key={i} className="flex items-center gap-2">
									<div className="h-4 bg-muted rounded animate-pulse w-16" />
									<div className="h-6 bg-muted rounded animate-pulse flex-1" />
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Token Usage by Model</CardTitle>
				<p className="text-sm text-muted-foreground">Top 10 models by token consumption</p>
			</CardHeader>
			<CardContent>
				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={chartData}
							margin={{
								top: 20,
								right: 30,
								left: 20,
								bottom: 80,
							}}
						>
							<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
							<XAxis
								dataKey="model"
								angle={-45}
								textAnchor="end"
								height={80}
								fontSize={12}
								interval={0}
							/>
							<YAxis fontSize={12} tickFormatter={(value: number) => `${value.toFixed(1)}M`} />
							<Tooltip content={<CustomTooltip />} />
							<Bar dataKey="tokens" fill="#00C49F" name="Tokens (M)" radius={[2, 2, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	)
})
