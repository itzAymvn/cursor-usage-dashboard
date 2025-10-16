"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModelMetrics } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { memo, useMemo } from "react"

interface CostBreakdownBarChartProps {
	models: ModelMetrics[]
	isLoading?: boolean
}

export const CostBreakdownBarChart = memo(function CostBreakdownBarChart({
	models,
	isLoading = false,
}: CostBreakdownBarChartProps) {
	const chartData = useMemo(() => {
		if (!models.length) return []

		// Sort by your cost (what you pay to Cursor) and take top 10
		const sortedModels = [...models].sort((a, b) => b.yourCost - a.yourCost).slice(0, 10)

		return sortedModels.map((model) => ({
			model: model.model.length > 15 ? model.model.substring(0, 15) + "..." : model.model,
			fullModel: model.model,
			yourCost: model.yourCost,
			realApiCost: model.realApiCost,
			savings: model.savings,
		}))
	}, [models])

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload
			return (
				<div className="bg-background border border-border rounded-lg p-3 shadow-md">
					<p className="font-medium">{data.fullModel}</p>
					<p className="text-sm text-muted-foreground">Your Cost: ${data.yourCost.toFixed(2)}</p>
					<p className="text-sm text-muted-foreground">Real API Cost: ${data.realApiCost.toFixed(2)}</p>
					<p className="text-sm text-green-600">Savings: ${data.savings.toFixed(2)}</p>
				</div>
			)
		}
		return null
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Cost Breakdown by Model</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80 flex items-center justify-center">
						<div className="space-y-2">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="h-6 bg-muted rounded animate-pulse w-full" />
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
				<CardTitle>Cost Breakdown by Model</CardTitle>
				<p className="text-sm text-muted-foreground">Top 10 models by cost (what you pay to Cursor)</p>
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
								bottom: 60,
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
							<YAxis fontSize={12} tickFormatter={(value) => `$${value.toFixed(0)}`} />
							<Tooltip content={<CustomTooltip />} />
							<Bar dataKey="yourCost" fill="#0088FE" name="Your Cost" radius={[2, 2, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	)
})
