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
	const modelMap = new Map<string, CursorUsageEvent[]>()

	// Group events by model
	events.forEach((event) => {
		const modelEvents = modelMap.get(event.model) || []
		modelEvents.push(event)
		modelMap.set(event.model, modelEvents)
	})

	// Convert to ModelMetrics array
	const models: ModelMetrics[] = []

	for (const [modelName, modelEvents] of modelMap.entries()) {
		const calls = modelEvents.length

		// All calls are paid in Cursor's system
		const paidCalls = calls
		const freeCalls = 0

		const tokens = modelEvents.reduce((sum, event) => {
			if (event.tokenUsage) {
				// Include all token types: input, output, cache read, cache write
				const inputTokens = event.tokenUsage.inputTokens || 0
				const outputTokens = event.tokenUsage.outputTokens || 0
				const cacheReadTokens = event.tokenUsage.cacheReadTokens || 0
				return sum + inputTokens + outputTokens + cacheReadTokens
			}
			return sum
		}, 0)

		// Real API cost is the token usage cost
		const realApiCost = centsToDollars(
			modelEvents.reduce((sum, event) => {
				if (event.tokenUsage && event.tokenUsage.totalCents) {
					return sum + event.tokenUsage.totalCents
				}
				return sum
			}, 0)
		)

		// Cursor charges include token fees and request costs
		const cursorCharges = centsToDollars(
			modelEvents.reduce((sum, event) => {
				const tokenFee = event.cursorTokenFee || 0
				const requestCost = event.requestsCosts || 0
				return sum + tokenFee + requestCost
			}, 0)
		)

		// Your cost is what you pay to Cursor
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
	const totalTokens = events.reduce((sum, event) => {
		if (event.tokenUsage) {
			const inputTokens = event.tokenUsage.inputTokens || 0
			const outputTokens = event.tokenUsage.outputTokens || 0
			const cacheReadTokens = event.tokenUsage.cacheReadTokens || 0
			return sum + inputTokens + outputTokens + cacheReadTokens
		}
		return sum
	}, 0)
	const totalCalls = events.length

	const realApiCost = centsToDollars(
		events.reduce((sum, event) => {
			if (event.tokenUsage && event.tokenUsage.totalCents) {
				return sum + event.tokenUsage.totalCents
			}
			return sum
		}, 0)
	)

	const cursorCharges = centsToDollars(
		events.reduce((sum, event) => {
			const tokenFee = event.cursorTokenFee || 0
			const requestCost = event.requestsCosts || 0
			return sum + tokenFee + requestCost
		}, 0)
	)

	const yourCost = cursorCharges

	const savings = realApiCost - cursorCharges
	const savingsPercentage = realApiCost > 0 && !isNaN(realApiCost) ? (savings / realApiCost) * 100 : 0

	// Calculate date range for daily averages (timestamp is milliseconds string)
	const timestamps = events.map((e) => parseInt(e.timestamp)).filter((t) => !isNaN(t))
	const minDate = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : new Date()
	const maxDate = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : new Date()
	const daysDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)))

	const dailyAverage = daysDiff > 0 && !isNaN(yourCost) ? yourCost / daysDiff : 0
	const projectedMonthly = !isNaN(dailyAverage) ? dailyAverage * 30 : 0

	// Simple trend calculation (placeholder - would need historical data)
	const trend = 0 // percentage change

	// Anomalies detection (high usage models)
	const anomalies = events.filter((event) => {
		if (event.tokenUsage) {
			return event.tokenUsage.inputTokens + event.tokenUsage.outputTokens > 10000
		}
		return false
	}).length

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
