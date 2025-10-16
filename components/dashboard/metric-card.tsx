import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { LucideIcon } from "lucide-react"
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { memo, useMemo, useCallback } from "react"

interface MetricCardProps {
	title: string
	value: string | number
	subtitle?: string
	icon?: LucideIcon
	trend?: {
		value: number
		label: string
	}
	badge?: {
		text: string
		variant: "default" | "secondary" | "destructive" | "outline"
	}
	className?: string
	isLoading?: boolean
	isRefreshing?: boolean
	format?: "currency" | "number" | "percentage" | "raw"
}

export const MetricCard = memo(function MetricCard({
	title,
	value,
	subtitle,
	icon: Icon,
	trend,
	badge,
	className,
	isLoading = false,
	isRefreshing = false,
	format = "raw",
}: MetricCardProps) {
	const formatValue = useCallback(
		(val: string | number) => {
			if (typeof val === "string") return val

			switch (format) {
				case "currency":
					return formatCurrency(val)
				case "number":
					return formatNumber(val)
				case "percentage":
					return formatPercentage(val)
				default:
					return val.toString()
			}
		},
		[format]
	)

	const getTrendColor = useCallback((trendValue: number) => {
		if (trendValue > 0) return "text-green-600"
		if (trendValue < 0) return "text-red-600"
		return "text-muted-foreground"
	}, [])

	const getTrendIcon = useCallback((trendValue: number) => {
		if (trendValue > 0) return "↗"
		if (trendValue < 0) return "↘"
		return "→"
	}, [])

	// Memoize trend display elements
	const trendDisplay = useMemo(() => {
		if (!trend) return null
		return (
			<div className={cn("flex items-center text-xs mt-2", getTrendColor(trend.value))}>
				<span className="mr-1">{getTrendIcon(trend.value)}</span>
				<span>{formatPercentage(Math.abs(trend.value))}</span>
				<span className="ml-1 text-muted-foreground">{trend.label}</span>
			</div>
		)
	}, [trend, getTrendColor, getTrendIcon])

	if (isLoading && !isRefreshing) {
		return (
			<Card className={cn("relative", className)}>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						<Skeleton className="h-4 w-24" />
					</CardTitle>
					{Icon && <Skeleton className="h-4 w-4" />}
				</CardHeader>
				<CardContent>
					<Skeleton className="h-8 w-32 mb-1" />
					{subtitle && <Skeleton className="h-3 w-20" />}
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className={cn("relative", className)}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<div className="flex items-center gap-2">
					{badge && (
						<Badge variant={badge.variant} className="text-xs">
							{badge.text}
						</Badge>
					)}
					{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
				</div>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{formatValue(value)}</div>
				{subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
				{trendDisplay}
			</CardContent>
		</Card>
	)
})
