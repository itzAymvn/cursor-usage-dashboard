import { CursorAPIResponse, APIConfig, CursorUsageEvent } from "./types"

/**
 * Default API configuration
 */
const DEFAULT_CONFIG: Partial<APIConfig> = {
	baseUrl: "https://cursor.com",
	timeout: 30000, // 30 seconds
}

/**
 * Gets API configuration from local storage
 */
function getAPIConfig(): APIConfig {
	// Check if we're on the client side
	const isClient = typeof window !== "undefined"

	// Get token from localStorage if on client, otherwise from env as fallback
	let token = process.env.CURSOR_API_TOKEN
	if (isClient) {
		token = localStorage.getItem("cursor-api-token") || process.env.CURSOR_API_TOKEN
	}

	const baseUrl = DEFAULT_CONFIG.baseUrl || "https://cursor.com"

	if (!token) {
		throw new Error("Cursor API token is required. Please set it in settings.")
	}

	return {
		baseUrl,
		token,
		timeout: DEFAULT_CONFIG.timeout!,
	}
}

/**
 * Makes authenticated request to Cursor API
 */
async function makeCursorAPIRequest(options: RequestInit = {}): Promise<Response> {
	const config = getAPIConfig()

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
export async function fetchUsageEvents(): Promise<CursorAPIResponse> {
	const response = await makeCursorAPIRequest()
	const data: CursorAPIResponse = await response.json()

	return data
}

/**
 * Fetches all usage events
 */
export async function fetchAllUsageEvents(): Promise<CursorUsageEvent[]> {
	const response = await fetchUsageEvents()
	console.log("Full API Response:", JSON.stringify(response, null, 2))

	// Try different possible field names for the events array
	const events = response.usageEventsDisplay || []

	console.log(`Found ${events.length} events`)
	if (events.length > 0) {
		console.log("First event structure:", JSON.stringify(events[0], null, 2))
	}

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
