import {
	CursorUsageEvent,
	ModelMetrics,
	AnalyticsSummary,
	UsageAnalytics,
	MODEL_FAMILIES,
	MODEL_BADGES,
	ModelFamily,
	ModelBadge,
} from "./types"

/**
 * Determines the model family based on model name
 */
export function getModelFamily(model: string): ModelFamily {
	const modelLower = model.toLowerCase()

	if (modelLower.includes("claude")) {
		return MODEL_FAMILIES.CLAUDE
	}
	if (modelLower.includes("cursor") || modelLower.includes("gpt-4o-mini")) {
		return MODEL_FAMILIES.CURSOR_MODELS
	}
	if (modelLower.includes("grok")) {
		return MODEL_FAMILIES.GROK
	}
	if (modelLower.includes("gpt")) {
		return MODEL_FAMILIES.GPT
	}

	return MODEL_FAMILIES.CURSOR_MODELS // default fallback
}

/**
 * Determines badges for a model based on usage patterns
 */
export function getModelBadges(model: string, modelTokens: number, realApiCost: number): ModelBadge[] {
	const badges: ModelBadge[] = []

	// FREE badge if tokens > 1 and api cost is 0
	if (modelTokens > 1 && realApiCost === 0) {
		badges.push(MODEL_BADGES.FREE)
	}

	// MIXED badge for models that appear in multiple contexts
	if (model.toLowerCase().includes("gpt") && model.toLowerCase().includes("4o")) {
		badges.push(MODEL_BADGES.MIXED)
	}

	return badges
}

/**
 * Formats large numbers with appropriate suffixes (M, K)
 */
export function formatNumber(num: number, decimals: number = 1): string {
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(decimals)}M`
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(decimals)}K`
	}
	return num.toFixed(decimals)
}

/**
 * Converts cents to dollars
 */
export function centsToDollars(cents: number): number {
	return cents / 100
}

/**
 * Processes raw usage events into model metrics
 */
export function processModelMetrics(events: CursorUsageEvent[]): ModelMetrics[] {
	const modelMap = new Map<
		string,
		{
			calls: number
			tokens: number
			realApiCostCents: number
			cursorChargesCents: number
			events: CursorUsageEvent[]
		}
	>()

	// Single pass through events to accumulate all metrics
	for (const event of events) {
		const existing = modelMap.get(event.model) || {
			calls: 0,
			tokens: 0,
			realApiCostCents: 0,
			cursorChargesCents: 0,
			events: [],
		}

		existing.calls++
		existing.events.push(event)

		if (event.tokenUsage) {
			// Include all token types: input, output, cache read, cache write
			const inputTokens = event.tokenUsage.inputTokens || 0
			const outputTokens = event.tokenUsage.outputTokens || 0
			const cacheReadTokens = event.tokenUsage.cacheReadTokens || 0
			existing.tokens += inputTokens + outputTokens + cacheReadTokens

			if (event.tokenUsage.totalCents) {
				existing.realApiCostCents += event.tokenUsage.totalCents
			}
		}

		// Cursor charges include token fees and request costs
		const tokenFee = event.cursorTokenFee || 0
		const requestCost = event.requestsCosts || 0
		existing.cursorChargesCents += tokenFee + requestCost

		modelMap.set(event.model, existing)
	}

	// Convert to ModelMetrics array
	const models: ModelMetrics[] = []

	for (const [modelName, metrics] of modelMap.entries()) {
		const calls = metrics.calls
		const paidCalls = calls // All calls are paid in Cursor's system
		const freeCalls = 0
		const tokens = metrics.tokens
		const realApiCost = centsToDollars(metrics.realApiCostCents)
		const cursorCharges = centsToDollars(metrics.cursorChargesCents)
		const yourCost = cursorCharges

		const savings = realApiCost - cursorCharges
		const savingsPercentage = realApiCost > 0 && !isNaN(realApiCost) ? (savings / realApiCost) * 100 : 0

		const family = getModelFamily(modelName)
		const badges = getModelBadges(modelName, tokens, realApiCost)

		models.push({
			model: modelName,
			family,
			calls,
			paidCalls,
			freeCalls,
			tokens,
			realApiCost,
			cursorCharges,
			yourCost,
			savings,
			savingsPercentage,
			badges,
		})
	}

	// Sort by tokens descending (default)
	return models.sort((a, b) => b.tokens - a.tokens)
}

/**
 * Calculates summary analytics from usage events
 */
export function calculateSummary(events: CursorUsageEvent[]): AnalyticsSummary {
	let totalTokens = 0
	let realApiCostCents = 0
	let cursorChargesCents = 0
	let anomalies = 0
	const timestamps: number[] = []

	// Single pass through events to calculate all metrics
	for (const event of events) {
		const timestamp = parseInt(event.timestamp)
		if (!isNaN(timestamp)) {
			timestamps.push(timestamp)
		}

		if (event.tokenUsage) {
			const inputTokens = event.tokenUsage.inputTokens || 0
			const outputTokens = event.tokenUsage.outputTokens || 0
			const cacheReadTokens = event.tokenUsage.cacheReadTokens || 0
			totalTokens += inputTokens + outputTokens + cacheReadTokens

			if (event.tokenUsage.totalCents) {
				realApiCostCents += event.tokenUsage.totalCents
			}

			// Anomalies detection (high usage models)
			if (inputTokens + outputTokens > 10000) {
				anomalies++
			}
		}

		// Cursor charges include token fees and request costs
		const tokenFee = event.cursorTokenFee || 0
		const requestCost = event.requestsCosts || 0
		cursorChargesCents += tokenFee + requestCost
	}

	const totalCalls = events.length
	const realApiCost = centsToDollars(realApiCostCents)
	const cursorCharges = centsToDollars(cursorChargesCents)
	const yourCost = cursorCharges
	const savings = realApiCost - cursorCharges
	const savingsPercentage = realApiCost > 0 && !isNaN(realApiCost) ? (savings / realApiCost) * 100 : 0

	// Calculate date range for daily averages
	const minDate = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : new Date()
	const maxDate = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : new Date()
	const daysDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)))

	const dailyAverage = daysDiff > 0 && !isNaN(yourCost) ? yourCost / daysDiff : 0
	const projectedMonthly = !isNaN(dailyAverage) ? dailyAverage * 30 : 0

	// Simple trend calculation (placeholder - would need historical data)
	const trend = 0 // percentage change

	return {
		totalTokens,
		totalCalls,
		realApiCost,
		cursorCharges,
		yourCost,
		savings,
		savingsPercentage,
		dailyAverage,
		projectedMonthly,
		trend,
		anomalies,
	}
}

/**
 * Processes raw Cursor API events into complete analytics data
 */
export function processUsageAnalytics(events: CursorUsageEvent[]): UsageAnalytics {
	const models = processModelMetrics(events)
	const summary = calculateSummary(events)

	// Calculate date range (timestamps are already in milliseconds)
	const timestamps = events.map((e) => parseInt(e.timestamp))
	const start = new Date(Math.min(...timestamps)).toISOString()
	const end = new Date(Math.max(...timestamps)).toISOString()

	return {
		summary,
		models,
		requests: events,
		lastUpdated: new Date().toISOString(),
		dateRange: {
			start,
			end,
		},
	}
}

/**
 * Formats currency values with proper dollar signs
 */
export function formatCurrency(amount: number | null | undefined): string {
	if (amount == null || isNaN(amount)) {
		return "$0.00"
	}
	return `$${amount.toFixed(2)}`
}

/**
 * Formats percentage values
 */
export function formatPercentage(value: number | null | undefined): string {
	if (value == null || isNaN(value)) {
		return "0.0%"
	}
	return `${value.toFixed(1)}%`
}
