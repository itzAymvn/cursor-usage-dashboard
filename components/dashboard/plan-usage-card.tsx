"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AnalyticsSummary } from "@/lib/types"
import { formatCurrency } from "@/lib/analytics"
import { TrendingUp, Calendar, Clock } from "lucide-react"

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
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						<div className="h-4 bg-muted rounded animate-pulse w-24" />
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="h-6 bg-muted rounded animate-pulse" />
						<div className="h-2 bg-muted rounded animate-pulse" />
						<div className="h-4 bg-muted rounded animate-pulse w-20" />
					</div>
				</CardContent>
			</Card>
		)
	}

	const { totalUsage, limit, percentage, remaining, daysRemaining, daysUntilLimit } = usageData

	return (
		<>
			{/* Plan Usage Progress */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Plan Usage</CardTitle>
					<Badge variant="secondary" className="text-xs">
						{plan.toUpperCase()}
					</Badge>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{formatCurrency(totalUsage)} / {formatCurrency(limit)}
					</div>
					<Progress value={Math.min(percentage, 100)} className="mt-2" />
					<p className="text-xs text-muted-foreground mt-1">
						{percentage.toFixed(1)}% used • {formatCurrency(remaining)} remaining
					</p>
				</CardContent>
			</Card>

			{/* Days Until Limit */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Days Until Limit</CardTitle>
					<Clock className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{daysUntilLimit}</div>
					<p className="text-xs text-muted-foreground">at current usage rate</p>
				</CardContent>
			</Card>

			{/* Billing Cycle */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Billing Cycle</CardTitle>
					<Calendar className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{daysRemaining}</div>
					<p className="text-xs text-muted-foreground">days until reset</p>
				</CardContent>
			</Card>

			{/* Daily Usage */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{formatCurrency(summary.dailyAverage)}</div>
					<p className="text-xs text-muted-foreground">average per day</p>
				</CardContent>
			</Card>
		</>
	)
}
