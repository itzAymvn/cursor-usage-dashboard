// Cursor API Response Types (based on actual API)
export interface CursorUsageEvent {
	timestamp: string
	model: string
	kind: string
	requestsCosts: number
	usageBasedCosts: string
	isTokenBasedCall: boolean
	tokenUsage?: {
		inputTokens: number
		outputTokens: number
		cacheReadTokens: number
		totalCents: number
	}
	owningUser: string
	cursorTokenFee: number
}

export interface CursorAPIResponse {
	totalUsageEventsCount: number
	usageEventsDisplay: CursorUsageEvent[]
}

// Analytics Data Types
export interface ModelMetrics {
	model: string
	family: string
	calls: number
	paidCalls: number
	freeCalls: number
	tokens: number
	realApiCost: number
	cursorCharges: number
	yourCost: number
	savings: number
	savingsPercentage: number
	badges: string[]
}

export interface AnalyticsSummary {
	totalTokens: number
	totalCalls: number
	realApiCost: number
	cursorCharges: number
	yourCost: number
	savings: number
	savingsPercentage: number
	dailyAverage: number
	projectedMonthly: number
	trend: number
	anomalies: number
}

export interface UsageAnalytics {
	summary: AnalyticsSummary
	models: ModelMetrics[]
	requests: CursorUsageEvent[]
	lastUpdated: string
	dateRange: {
		start: string
		end: string
	}
}

// Model Families and Badges
export const MODEL_FAMILIES = {
	CLAUDE: "Claude",
	CURSOR_MODELS: "Cursor Models",
	GROK: "Grok",
	GPT: "GPT",
} as const

export const MODEL_BADGES = {
	MIXED: "MIXED",
	MAX: "MAX",
	HIGH: "HIGH",
	FREE: "FREE",
} as const

// Utility Types
export type ModelFamily = (typeof MODEL_FAMILIES)[keyof typeof MODEL_FAMILIES]
export type ModelBadge = (typeof MODEL_BADGES)[keyof typeof MODEL_BADGES]

// API Configuration
export interface APIConfig {
	baseUrl: string
	token: string
	timeout: number
}

// Environment Variables
export interface EnvConfig {
	CURSOR_API_TOKEN: string
	CURSOR_API_BASE_URL?: string
}
