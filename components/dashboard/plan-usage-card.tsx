"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/analytics"
import { AnalyticsSummary } from "@/lib/types"
import { Calendar, Clock } from "lucide-react"
import { useMemo } from "react"

interface PlanUsageCardProps {
	summary: AnalyticsSummary
	plan: string
	dateRangeStart: string
	isLoading?: boolean
}

const PLAN_LIMITS = {
	pro: { paid: 20, included: 20 },
	"pro-plus": { paid: 60, included: 70 },
	ultra: { paid: 200, included: 400 },
} as const

export function PlanUsageCard({ summary, plan, dateRangeStart, isLoading = false }: PlanUsageCardProps) {
	const planLimits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.pro

	const usageData = useMemo(() => {
		const totalUsage = summary.yourCost
		const limit = planLimits.included
		const percentage = limit > 0 ? (totalUsage / limit) * 100 : 0
		const remaining = Math.max(0, limit - totalUsage)

		// Calculate days until billing cycle ends using dateRangeStart
		let daysRemaining = 30 // default
		if (dateRangeStart) {
			try {
				const startDate = new Date(dateRangeStart)
				const billingDay = startDate.getDate() // Extract day from the start date
				const now = new Date()
				const currentYear = now.getFullYear()
				const currentMonth = now.getMonth()

				// Create date for this month's billing day
				let nextBillingDate = new Date(currentYear, currentMonth, billingDay)

				// If we've passed this month's billing day, go to next month
				if (now > nextBillingDate) {
					nextBillingDate = new Date(currentYear, currentMonth + 1, billingDay)
				}

				const timeDiff = nextBillingDate.getTime() - now.getTime()
				daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)))
			} catch (error) {
				console.warn("Failed to parse dateRangeStart:", dateRangeStart, error)
			}
		}

		// Estimate days until limit is reached
		const dailyUsage = summary.dailyAverage
		const daysUntilLimit = dailyUsage > 0 ? Math.ceil(remaining / dailyUsage) : 30

		return {
			totalUsage,
			limit,
			percentage,
			remaining,
			daysRemaining,
			daysUntilLimit,
			dailyUsage,
		}
	}, [summary, planLimits.included, dateRangeStart])

	if (isLoading) {
		return (
			<div className="bg-card rounded-lg border p-6">
				<div className="flex flex-row items-center justify-between space-y-0 pb-2">
					<div className="text-sm font-medium">
						<div className="h-4 bg-muted rounded animate-pulse w-24" />
					</div>
				</div>
				<div className="space-y-4">
					<div className="h-6 bg-muted rounded animate-pulse" />
					<div className="h-2 bg-muted rounded animate-pulse" />
					<div className="h-4 bg-muted rounded animate-pulse w-20" />
				</div>
			</div>
		)
	}

	const { totalUsage, limit, percentage, remaining, daysRemaining, daysUntilLimit } = usageData

	return (
		<div className="bg-card rounded-lg border p-6">
			<div className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="text-sm font-medium">Plan Usage</div>
				<Badge variant="secondary" className="text-xs">
					{plan.toUpperCase()}
				</Badge>
			</div>
			<div className="space-y-4">
				{/* Main Usage Progress */}
				<div>
					<div className="text-2xl font-bold">
						{formatCurrency(totalUsage)} / {formatCurrency(limit)}
					</div>
					<Progress value={Math.min(percentage, 100)} className="mt-2" />
					<p className="text-xs text-muted-foreground mt-1">
						{percentage.toFixed(1)}% used • {formatCurrency(remaining)} remaining
					</p>
				</div>

				{/* Additional Metrics Grid */}
				<div className="grid grid-cols-2 gap-4 pt-2 border-t">
					<div className="flex items-center space-x-2">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<div>
							<div className="text-sm font-medium">{daysUntilLimit} days</div>
							<div className="text-xs text-muted-foreground">until limit</div>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<div>
							<div className="text-sm font-medium">{daysRemaining} days</div>
							<div className="text-xs text-muted-foreground">until reset</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
