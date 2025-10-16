"use client"

import { useState, useEffect } from "react"
import { SummaryCards, SecondaryMetrics } from "@/components/dashboard/summary-cards"
import { ModelTable } from "@/components/dashboard/model-table"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UsageAnalytics } from "@/lib/types"
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react"

export default function Dashboard() {
	const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

	const fetchAnalytics = async () => {
		try {
			setIsLoading(true)
			setError(null)

			const response = await fetch("/api/usage")
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.message || data.error || "Failed to fetch analytics")
			}

			setAnalytics(data)
			setLastRefresh(new Date())
		} catch (err) {
			console.error("Dashboard fetch error:", err)
			setError(err instanceof Error ? err.message : "Failed to fetch analytics")
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchAnalytics()
	}, [])

	const formatLastRefresh = (date: Date) => {
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		})
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b bg-card">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Cursor Usage Analytics</h1>
							<p className="text-muted-foreground mt-2">
								Real-time usage metrics, costs, and insights across AI models
							</p>
						</div>
						<div className="flex items-center gap-4">
							{lastRefresh && (
								<div className="text-sm text-muted-foreground">
									Last updated: {formatLastRefresh(lastRefresh)}
								</div>
							)}
							<Button onClick={fetchAnalytics} disabled={isLoading} variant="outline" size="sm">
								<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
								Refresh
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-8 space-y-8">
				{/* Error Alert */}
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Success Alert */}
				{!error && analytics && !isLoading && (
					<Alert>
						<CheckCircle className="h-4 w-4" />
						<AlertDescription>
							Successfully loaded analytics for {analytics.models.length} models from{" "}
							{new Date(analytics.dateRange.start).toLocaleDateString()} to{" "}
							{new Date(analytics.dateRange.end).toLocaleDateString()}
						</AlertDescription>
					</Alert>
				)}

				{/* Summary Cards */}
				{analytics && <SummaryCards summary={analytics.summary} isLoading={isLoading} />}

				{/* Secondary Metrics */}
				{analytics && <SecondaryMetrics summary={analytics.summary} isLoading={isLoading} />}

				{/* Model Breakdown Table */}
				<div className="space-y-4">
					<div>
						<h2 className="text-2xl font-semibold tracking-tight">Model Breakdown</h2>
						<p className="text-muted-foreground">Detailed usage statistics by AI model family</p>
					</div>

					{analytics && <ModelTable models={analytics.models} isLoading={isLoading} />}
				</div>
			</main>
		</div>
	)
}
