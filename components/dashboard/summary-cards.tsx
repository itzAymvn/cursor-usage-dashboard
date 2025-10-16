import { MetricCard } from "./metric-card"
import { AnalyticsSummary } from "@/lib/types"
import { DollarSign, Activity, PiggyBank, BarChart3, Calendar } from "lucide-react"
import { memo, useMemo } from "react"

interface SummaryCardsProps {
	summary: AnalyticsSummary
	isLoading?: boolean
	isRefreshing?: boolean
}

export const SummaryCards = memo(function SummaryCards({
	summary,
	isLoading = false,
	isRefreshing = false,
}: SummaryCardsProps) {
	// Memoize the savings badge to prevent re-renders
	const savingsBadge = useMemo(
		() => ({
			text: "SAVED",
			variant: "default" as const,
		}),
		[]
	)

	// Memoize the subtitle for savings to prevent recalculation
	const savingsSubtitle = useMemo(
		() => `${summary.savingsPercentage.toFixed(1)}% vs direct API`,
		[summary.savingsPercentage]
	)

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
			{/* Total M Tokens */}
			<MetricCard
				title="Total M Tokens"
				value={summary.totalTokens / 1000000}
				subtitle="Million tokens used"
				icon={BarChart3}
				format="number"
				isLoading={isLoading}
				isRefreshing={isRefreshing}
				className="col-span-1"
			/>

			{/* Real API Cost */}
			<MetricCard
				title="Real API Cost"
				value={summary.realApiCost}
				subtitle="Direct provider rates"
				icon={DollarSign}
				format="currency"
				isLoading={isLoading}
				isRefreshing={isRefreshing}
				className="col-span-1"
			/>

			{/* Your Cost */}
			<MetricCard
				title="Your Cost"
				value={summary.yourCost}
				subtitle="What you pay to Cursor"
				icon={Activity}
				format="currency"
				isLoading={isLoading}
				isRefreshing={isRefreshing}
				className="col-span-1"
			/>

			{/* Projected Monthly */}
			<MetricCard
				title="Projected Monthly"
				value={summary.projectedMonthly}
				subtitle="30-day estimate"
				icon={Calendar}
				format="currency"
				isLoading={isLoading}
				isRefreshing={isRefreshing}
				className="col-span-1"
			/>

			{/* Savings */}
			<MetricCard
				title="Savings"
				value={summary.savings}
				subtitle={savingsSubtitle}
				icon={PiggyBank}
				format="currency"
				badge={savingsBadge}
				isLoading={isLoading}
				isRefreshing={isRefreshing}
				className="col-span-1"
			/>
		</div>
	)
})

interface SecondaryMetricsProps {
	summary: AnalyticsSummary
	isLoading?: boolean
	isRefreshing?: boolean
}

export const SecondaryMetrics = memo(function SecondaryMetrics({
	summary,
	isLoading = false,
	isRefreshing = false,
}: SecondaryMetricsProps) {
	// Memoize trend objects to prevent re-renders
	const dailyAverageTrend = useMemo(
		() => ({
			value: summary.trend,
			label: "from last week",
		}),
		[summary.trend]
	)

	const trendValue = useMemo(() => `${summary.trend >= 0 ? "+" : ""}${summary.trend.toFixed(1)}%`, [summary.trend])

	const trendTrend = useMemo(
		() => ({
			value: summary.trend,
			label: "vs previous period",
		}),
		[summary.trend]
	)

	// Memoize anomalies badge to prevent re-renders
	const anomaliesBadge = useMemo(
		() => ({
			text: summary.anomalies > 0 ? "FLAG" : "CLEAR",
			variant: summary.anomalies > 0 ? ("destructive" as const) : ("secondary" as const),
		}),
		[summary.anomalies]
	)

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{/* Daily Average */}
			<MetricCard
				title="Daily Average"
				value={summary.dailyAverage}
				subtitle="Cost per day"
				format="currency"
				trend={dailyAverageTrend}
				isLoading={isLoading}
				isRefreshing={isRefreshing}
			/>

			{/* Trend */}
			<MetricCard
				title="Trend"
				value={trendValue}
				subtitle="Usage change"
				trend={trendTrend}
				isLoading={isLoading}
				isRefreshing={isRefreshing}
			/>

			{/* Anomalies */}
			<MetricCard
				title="Anomalies"
				value={summary.anomalies}
				subtitle="High-usage models"
				badge={anomaliesBadge}
				isLoading={isLoading}
				isRefreshing={isRefreshing}
			/>
		</div>
	)
})
