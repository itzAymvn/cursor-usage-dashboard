import { CursorAPIResponse, APIConfig, CursorUsageEvent } from "./types"

/**
 * Default API configuration
 */
const DEFAULT_CONFIG: Partial<APIConfig> = {
	baseUrl: "https://cursor.com",
	timeout: 30000, // 30 seconds
}

/**
 * Gets API configuration
 */
function getAPIConfig(token?: string): APIConfig {
	// Use provided token, or fallback to env (for backward compatibility)
	const apiToken = token || process.env.CURSOR_API_TOKEN

	const baseUrl = DEFAULT_CONFIG.baseUrl || "https://cursor.com"

	if (!apiToken) {
		throw new Error("Cursor API token is required. Please set it in settings.")
	}

	return {
		baseUrl,
		token: apiToken,
		timeout: DEFAULT_CONFIG.timeout!,
	}
}

/**
 * Makes authenticated request to Cursor API
 */
async function makeCursorAPIRequest(token: string, options: RequestInit = {}): Promise<Response> {
	const config = getAPIConfig(token)

	const url = `${config.baseUrl}/api/dashboard/get-filtered-usage-events`

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Cookie: `generaltranslation.locale-routing-enabled=true; NEXT_LOCALE=en-US; WorkosCursorSessionToken=${encodeURIComponent(
				config.token
			)}`,
			"Content-Type": "application/json",
			Origin: "https://cursor.com",
			...options.headers,
		},
		body: JSON.stringify({
			pageSize: 10000,
			startDate: 0,
		}),
		signal: AbortSignal.timeout(config.timeout),
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`Cursor API request failed: ${response.status} ${response.statusText}\n${errorText}`)
	}

	return response
}

/**
 * Fetches usage events from Cursor API
 */
export async function fetchUsageEvents(token: string): Promise<CursorAPIResponse> {
	const response = await makeCursorAPIRequest(token)
	const data: CursorAPIResponse = await response.json()

	return data
}

/**
 * Fetches all usage events
 */
export async function fetchAllUsageEvents(token: string): Promise<CursorUsageEvent[]> {
	const response = await fetchUsageEvents(token)

	// Try different possible field names for the events array
	const events = response.usageEventsDisplay || []

	return events
}

/**
 * Validates environment configuration
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
	const errors: string[] = []
	const token = process.env.CURSOR_API_TOKEN

	if (!token) {
		errors.push("CURSOR_API_TOKEN environment variable is required")
	}

	return {
		valid: errors.length === 0,
		errors,
	}
}
