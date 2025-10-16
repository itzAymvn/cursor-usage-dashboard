import { processUsageAnalytics } from "@/lib/analytics"
import { fetchAllUsageEvents } from "@/lib/api-client"
import { UsageAnalytics } from "@/lib/types"
import { NextResponse } from "next/server"

/**
 * GET /api/usage
 * Fetches and processes Cursor usage analytics
 */
export async function GET(request: Request) {
	try {
		// Get token from Authorization header
		const authHeader = request.headers.get("Authorization")
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json(
				{
					error: "Authentication Error",
					message: "API token is required",
				},
				{ status: 401 }
			)
		}

		const token = authHeader.substring(7) // Remove "Bearer " prefix

		// Fetch all usage events from Cursor API
		const events = await fetchAllUsageEvents(token)

		if (events.length === 0) {
			return NextResponse.json(
				{
					error: "No Data",
					message: "No usage events found",
				},
				{ status: 404 }
			)
		}

		// Process events into analytics data
		const analytics: UsageAnalytics = processUsageAnalytics(events)

		// Return processed analytics
		return NextResponse.json(analytics)
	} catch (error) {
		console.error("API route error:", error)

		// Handle different types of errors
		if (error instanceof Error) {
			// API authentication or network errors
			if (error.message.includes("401") || error.message.includes("403")) {
				return NextResponse.json(
					{
						error: "Authentication Error",
						message: "Invalid or expired API token",
					},
					{ status: 401 }
				)
			}

			// Rate limiting
			if (error.message.includes("429")) {
				return NextResponse.json(
					{
						error: "Rate Limited",
						message: "Too many requests to Cursor API",
					},
					{ status: 429 }
				)
			}

			// Generic API error
			return NextResponse.json(
				{
					error: "API Error",
					message: error.message,
				},
				{ status: 500 }
			)
		}

		// Unknown error
		return NextResponse.json(
			{
				error: "Internal Server Error",
				message: "An unexpected error occurred",
			},
			{ status: 500 }
		)
	}
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
	return new NextResponse(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	})
}
