"use client"

import { useState, useEffect, useCallback } from "react"
import { OnboardingModal } from "@/components/dashboard/onboarding-modal"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { ModelTable } from "@/components/dashboard/model-table"
import { SettingsModal } from "@/components/dashboard/settings-modal"
import { PlanUsageCard } from "@/components/dashboard/plan-usage-card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UsageAnalytics } from "@/lib/types"
import { RefreshCw, AlertCircle, CheckCircle, RotateCcw } from "lucide-react"

export default function Dashboard() {
	const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
	const [apiToken, setApiToken] = useState<string>("")
	const [plan, setPlan] = useState<string>("pro")
	const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(false)
	const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(300) // Default 5 minutes in seconds
	const [countdown, setCountdown] = useState<number | null>(null)

	// Load settings from localStorage on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const storedToken = localStorage.getItem("cursor-api-token") || ""
			const storedPlan = localStorage.getItem("cursor-plan") || "pro"
			const storedAutoRefresh = localStorage.getItem("cursor-auto-refresh") === "true"
			const storedInterval = parseInt(localStorage.getItem("cursor-auto-refresh-interval") || "300")
			setApiToken(storedToken)
			setPlan(storedPlan)
			setAutoRefreshEnabled(storedAutoRefresh)
			setAutoRefreshInterval(storedInterval)
		}
	}, [])

	// Show onboarding modal if no token is set
	const [showOnboarding, setShowOnboarding] = useState(false)

	useEffect(() => {
		if (!apiToken && !isLoading) {
			setShowOnboarding(true)
		}
	}, [apiToken, isLoading])

	// Handle token changes
	const handleTokenChange = (newToken: string) => {
		setApiToken(newToken)
		setShowOnboarding(false)
		if (typeof window !== "undefined") {
			localStorage.setItem("cursor-api-token", newToken)
		}
	}

	const handlePlanChange = (newPlan: string) => {
		setPlan(newPlan)
		if (typeof window !== "undefined") {
			localStorage.setItem("cursor-plan", newPlan)
		}
	}

	const handleAutoRefreshChange = (enabled: boolean) => {
		setAutoRefreshEnabled(enabled)
		if (typeof window !== "undefined") {
			localStorage.setItem("cursor-auto-refresh", enabled.toString())
		}
		if (!enabled) {
			setCountdown(null)
		} else {
			setCountdown(autoRefreshInterval)
		}
	}

	const handleAutoRefreshIntervalChange = (interval: number) => {
		setAutoRefreshInterval(interval)
		if (typeof window !== "undefined") {
			localStorage.setItem("cursor-auto-refresh-interval", interval.toString())
		}
		if (autoRefreshEnabled) {
			setCountdown(interval)
		}
	}

	const handleOpenSettings = () => {
		setShowOnboarding(false)
		// Settings modal will be opened by the SettingsModal component
	}

	const fetchAnalytics = useCallback(async () => {
		if (!apiToken) {
			setError("Please set your Cursor API token in settings first.")
			setIsLoading(false)
			return
		}

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
	}, [apiToken])

	useEffect(() => {
		if (apiToken) {
			fetchAnalytics()
		} else {
			setIsLoading(false)
		}
	}, [apiToken, fetchAnalytics])

	// Auto-refresh effect
	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null
		let countdownId: NodeJS.Timeout | null = null

		if (autoRefreshEnabled && apiToken) {
			// Set initial countdown
			setCountdown(autoRefreshInterval)

			// Countdown timer (updates every second)
			countdownId = setInterval(() => {
				setCountdown((prev) => {
					if (prev === null || prev <= 1) {
						return autoRefreshInterval
					}
					return prev - 1
				})
			}, 1000)

			// Refresh interval (uses configurable interval in seconds)
			intervalId = setInterval(() => {
				fetchAnalytics()
				setCountdown(autoRefreshInterval) // Reset countdown after refresh
			}, autoRefreshInterval * 1000)
		} else {
			setCountdown(null)
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId)
			}
			if (countdownId) {
				clearInterval(countdownId)
			}
		}
	}, [autoRefreshEnabled, apiToken, autoRefreshInterval, fetchAnalytics])

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
								<div className="flex flex-col gap-1">
									<div className="text-sm text-muted-foreground">
										Last updated: {formatLastRefresh(lastRefresh)}
									</div>
									{autoRefreshEnabled && countdown !== null && (
										<div className="flex items-center gap-1 text-green-600 dark:text-green-400">
											<RotateCcw className="h-4 w-4 animate-spin" />
											<span className="text-sm font-medium">
												Next refresh in: {countdown > 0 ? `${countdown}s` : "Refreshing..."}
											</span>
										</div>
									)}
								</div>
							)}
							<SettingsModal
								token={apiToken}
								plan={plan}
								billingStartDate=""
								autoRefreshEnabled={autoRefreshEnabled}
								autoRefreshInterval={autoRefreshInterval}
								onTokenChange={handleTokenChange}
								onPlanChange={handlePlanChange}
								onBillingStartDateChange={() => {}}
								onAutoRefreshChange={handleAutoRefreshChange}
								onAutoRefreshIntervalChange={handleAutoRefreshIntervalChange}
							/>
							<div className="flex items-center gap-2">
								<Button
									onClick={fetchAnalytics}
									disabled={isLoading || !apiToken}
									variant="outline"
									size="sm"
								>
									<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
									Refresh
								</Button>
								<Button
									onClick={() => handleAutoRefreshChange(!autoRefreshEnabled)}
									disabled={!apiToken}
									variant={autoRefreshEnabled ? "default" : "outline"}
									size="sm"
									className={autoRefreshEnabled ? "bg-green-600 hover:bg-green-700" : ""}
								>
									<RotateCcw className={`h-4 w-4 mr-2 ${autoRefreshEnabled ? "animate-spin" : ""}`} />
									Auto
								</Button>
							</div>
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

				{/* Plan Usage */}
				{analytics && (
					<div className="space-y-4">
						<div>
							<h2 className="text-2xl font-semibold tracking-tight">Plan Usage</h2>
							<p className="text-muted-foreground">Track your current usage against plan limits</p>
						</div>
						<div className="max-w-md">
							<PlanUsageCard
								summary={analytics.summary}
								plan={plan}
								dateRangeStart={analytics.dateRange.start}
								isLoading={isLoading}
							/>
						</div>
					</div>
				)}

				{/* Model Breakdown Table */}
				<div className="space-y-4">
					<div>
						<h2 className="text-2xl font-semibold tracking-tight">Model Breakdown</h2>
						<p className="text-muted-foreground">Detailed usage statistics by AI model family</p>
					</div>

					{analytics && <ModelTable models={analytics.models} isLoading={isLoading} />}
				</div>
			</main>

			{/* Onboarding Modal */}
			<OnboardingModal
				isOpen={showOnboarding}
				onTokenSubmit={handleTokenChange}
				onOpenSettings={handleOpenSettings}
			/>
		</div>
	)
}
