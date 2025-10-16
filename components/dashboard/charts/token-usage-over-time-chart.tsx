"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltipProps } from "@/lib/chart-types"
import { CursorUsageEvent } from "@/lib/types"
import { memo, useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type TimePeriod = "hourly" | "daily" | "weekly" | "monthly"

interface TokenUsageOverTimeChartProps {
	events: CursorUsageEvent[]
	isLoading?: boolean
}

export const TokenUsageOverTimeChart = memo(function TokenUsageOverTimeChart({
	events,
	isLoading = false,
}: TokenUsageOverTimeChartProps) {
	const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("daily")

	const chartData = useMemo(() => {
		if (!events.length) return []

		// Group events by time period
		const grouped = new Map<
			string,
			{ totalTokens: number; inputTokens: number; outputTokens: number; count: number }
		>()

		events.forEach((event) => {
			if (!event.tokenUsage) return

			const date = new Date(parseInt(event.timestamp))
			let key: string

			switch (selectedPeriod) {
				case "hourly":
					key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
						date.getDate()
					).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:00`
					break
				case "daily":
					key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
						date.getDate()
					).padStart(2, "0")}`
					break
				case "weekly":
					const weekStart = new Date(date)
					weekStart.setDate(date.getDate() - date.getDay())
					key = `${weekStart.getFullYear()}-W${String(
						Math.ceil((weekStart.getDate() - weekStart.getDay() + 1) / 7)
					).padStart(2, "0")}`
					break
				case "monthly":
					key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
					break
			}

			const tokens =
				(event.tokenUsage.inputTokens || 0) +
				(event.tokenUsage.outputTokens || 0) +
				(event.tokenUsage.cacheReadTokens || 0)

			if (!grouped.has(key)) {
				grouped.set(key, {
					totalTokens: 0,
					inputTokens: 0,
					outputTokens: 0,
					count: 0,
				})
			}

			const group = grouped.get(key)!
			group.totalTokens += tokens
			group.inputTokens += event.tokenUsage.inputTokens || 0
			group.outputTokens += event.tokenUsage.outputTokens || 0
			group.count += 1
		})

		// Convert to array and sort by date
		const data = Array.from(grouped.entries())
			.map(([timeKey, values]) => ({
				time: timeKey,
				totalTokens: values.totalTokens / 1000000, // Convert to millions
				inputTokens: values.inputTokens / 1000000,
				outputTokens: values.outputTokens / 1000000,
				requests: values.count,
				rawTotalTokens: values.totalTokens,
			}))
			.sort((a, b) => a.time.localeCompare(b.time))

		return data
	}, [events, selectedPeriod])

	const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload as Record<string, string | number>
			return (
				<div className="bg-background border border-border rounded-lg p-3 shadow-md">
					<p className="font-medium">{String(data.time)}</p>
					<p className="text-sm text-muted-foreground">
						Total: {Number(data.rawTotalTokens || 0).toLocaleString()} tokens (
						{Number(data.totalTokens)?.toFixed(2)}M)
					</p>
					<p className="text-sm text-muted-foreground">Requests: {Number(data.requests)}</p>
				</div>
			)
		}
		return null
	}

	const formatXAxisLabel = (tickItem: string) => {
		if (selectedPeriod === "hourly") {
			return tickItem.split(" ")[1] // Show just the hour
		} else if (selectedPeriod === "daily") {
			const date = new Date(tickItem)
			return `${date.getMonth() + 1}/${date.getDate()}`
		} else if (selectedPeriod === "weekly") {
			return tickItem.split("-W")[1] // Show week number
		} else if (selectedPeriod === "monthly") {
			const [year, month] = tickItem.split("-")
			return `${month}/${year.slice(2)}`
		}
		return tickItem
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Token Usage Over Time</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80 flex items-center justify-center">
						<div className="space-y-4 w-full">
							<div className="flex justify-center gap-2">
								{["hourly", "daily", "weekly", "monthly"].map((period) => (
									<div key={period} className="h-8 bg-muted rounded animate-pulse w-16" />
								))}
							</div>
							<div className="h-64 bg-muted rounded animate-pulse" />
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle className="text-lg sm:text-xl">Token Usage Over Time</CardTitle>
						<p className="text-sm text-muted-foreground">Track token consumption patterns over time</p>
					</div>
					<div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
						{[
							{ key: "hourly", label: "Hourly", short: "1H" },
							{ key: "daily", label: "Daily", short: "1D" },
							{ key: "weekly", label: "Weekly", short: "1W" },
							{ key: "monthly", label: "Monthly", short: "1M" },
						].map(({ key, label, short }) => (
							<Button
								key={key}
								variant={selectedPeriod === key ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedPeriod(key as TimePeriod)}
								className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
							>
								<span className="hidden xs:inline">{label}</span>
								<span className="xs:hidden">{short}</span>
							</Button>
						))}
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
							<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
							<XAxis dataKey="time" tickFormatter={formatXAxisLabel} fontSize={12} />
							<YAxis fontSize={12} tickFormatter={(value: number) => `${value.toFixed(1)}M`} />
							<Tooltip content={<CustomTooltip />} />
							{/* <Legend /> */}
							<Line
								type="monotone"
								dataKey="totalTokens"
								stroke="#8884d8"
								name="Total Tokens (M)"
								strokeWidth={2}
								dot={{ r: 3 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	)
})
