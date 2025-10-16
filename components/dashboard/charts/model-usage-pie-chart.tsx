"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModelMetrics } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { memo, useMemo } from "react"

interface ModelUsagePieChartProps {
	models: ModelMetrics[]
	isLoading?: boolean
}

const COLORS = [
	"#0088FE",
	"#00C49F",
	"#FFBB28",
	"#FF8042",
	"#8884D8",
	"#82CA9D",
	"#FFC658",
	"#FF7C7C",
	"#8DD1E1",
	"#D084D0",
]

export const ModelUsagePieChart = memo(function ModelUsagePieChart({
	models,
	isLoading = false,
}: ModelUsagePieChartProps) {
	const chartData = useMemo(() => {
		if (!models.length) return []

		// Sort by token usage and take top 8, group the rest as "Others"
		const sortedModels = [...models].sort((a, b) => b.tokens - a.tokens)
		const topModels = sortedModels.slice(0, 8)
		const otherModels = sortedModels.slice(8)

		const data = topModels.map((model, index) => ({
			name: model.model,
			value: model.tokens,
			calls: model.calls,
			cost: model.yourCost,
			color: COLORS[index % COLORS.length],
		}))

		// Add "Others" if there are more models
		if (otherModels.length > 0) {
			const othersTokens = otherModels.reduce((sum, model) => sum + model.tokens, 0)
			const othersCalls = otherModels.reduce((sum, model) => sum + model.calls, 0)
			const othersCost = otherModels.reduce((sum, model) => sum + model.yourCost, 0)

			data.push({
				name: "Others",
				value: othersTokens,
				calls: othersCalls,
				cost: othersCost,
				color: COLORS[8 % COLORS.length],
			})
		}

		return data
	}, [models])

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload
			return (
				<div className="bg-background border border-border rounded-lg p-3 shadow-md">
					<p className="font-medium">{data.name}</p>
					<p className="text-sm text-muted-foreground">Tokens: {(data.value / 1000000).toFixed(2)}M</p>
					<p className="text-sm text-muted-foreground">Calls: {data.calls.toLocaleString()}</p>
					<p className="text-sm text-muted-foreground">Cost: ${data.cost.toFixed(2)}</p>
				</div>
			)
		}
		return null
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Model Usage Distribution</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80 flex items-center justify-center">
						<div className="h-32 w-32 bg-muted rounded-full animate-pulse" />
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Model Usage Distribution</CardTitle>
				<p className="text-sm text-muted-foreground">Token usage breakdown by AI model</p>
			</CardHeader>
			<CardContent>
				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={chartData}
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={120}
								paddingAngle={2}
								dataKey="value"
							>
								{chartData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<Tooltip content={<CustomTooltip />} />
							<Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
						</PieChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	)
})
