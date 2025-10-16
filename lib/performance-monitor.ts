/**
 * Performance monitoring utilities for Next.js application
 * Tracks Web Vitals, custom metrics, and performance events
 */

interface PerformanceMetric {
	name: string
	value: number
	id: string
	timestamp: number
	navigationType?: string
}

/**
 * Logs a performance metric to console in development
 */
export function logPerformanceMetric(metric: PerformanceMetric) {
	if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
		console.log(`📊 ${metric.name}: ${metric.value.toFixed(2)}ms`, `(ID: ${metric.id.slice(0, 8)})`)
	}

	// In production, you can send this to an analytics service
	// Example: sendToAnalytics(metric)
}

/**
 * Measures the time taken for a specific operation
 */
export function measurePerformance(operationName: string, fn: () => void): number {
	const start = performance.now()
	try {
		fn()
	} finally {
		const duration = performance.now() - start
		if (process.env.NODE_ENV === "development") {
			console.log(`⏱️  ${operationName} took ${duration.toFixed(2)}ms`)
		}
		return duration
	}
}

/**
 * Measures the time taken for an async operation
 */
export async function measureAsyncPerformance<T>(
	operationName: string,
	fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
	const start = performance.now()
	try {
		const result = await fn()
		const duration = performance.now() - start
		if (process.env.NODE_ENV === "development") {
			console.log(`⏱️  ${operationName} took ${duration.toFixed(2)}ms`)
		}
		return { result, duration }
	} catch (error) {
		const duration = performance.now() - start
		console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms`, error)
		throw error
	}
}

/**
 * Marks the start of a performance measurement
 */
export function markStart(markName: string) {
	if (typeof performance !== "undefined" && performance.mark) {
		performance.mark(`${markName}-start`)
	}
}

/**
 * Marks the end of a performance measurement and measures the duration
 */
export function markEnd(markName: string): number | null {
	if (typeof performance !== "undefined" && performance.mark && performance.measure) {
		performance.mark(`${markName}-end`)
		try {
			performance.measure(markName, `${markName}-start`, `${markName}-end`)
			const measure = performance.getEntriesByName(markName)[0]
			return measure ? measure.duration : null
		} catch {
			return null
		}
	}
	return null
}

/**
 * Gets current memory usage (browser only)
 */
export function getMemoryUsage(): {
	usedJSHeapSize: number
	totalJSHeapSize: number
	jsHeapSizeLimit: number
} | null {
	if (typeof performance !== "undefined" && (performance as unknown as Record<string, unknown>).memory) {
		return (performance as unknown as Record<string, unknown>).memory as {
			usedJSHeapSize: number
			totalJSHeapSize: number
			jsHeapSizeLimit: number
		}
	}
	return null
}

/**
 * Logs current memory usage (development only)
 */
export function logMemoryUsage() {
	if (process.env.NODE_ENV === "development") {
		const memory = getMemoryUsage()
		if (memory) {
			const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
			const limitMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
			console.log(`💾 Memory: ${usedMB}MB / ${limitMB}MB`)
		}
	}
}

/**
 * Debounced function for performance logging
 */
export function createPerformanceLogger(interval: number = 5000) {
	let lastLog = 0

	return () => {
		const now = Date.now()
		if (now - lastLog >= interval) {
			logMemoryUsage()
			lastLog = now
		}
	}
}

/**
 * Tracks component render count for debugging (development only)
 */
const renderCounts = new Map<string, number>()

export function trackComponentRender(componentName: string) {
	if (process.env.NODE_ENV === "development") {
		const count = (renderCounts.get(componentName) || 0) + 1
		renderCounts.set(componentName, count)
		if (count > 1 && count % 10 === 0) {
			console.warn(`⚠️  ${componentName} rendered ${count} times`)
		}
	}
}

/**
 * Gets render count for a component
 */
export function getRenderCount(componentName: string): number {
	return renderCounts.get(componentName) || 0
}

/**
 * Resets render counts (useful between tests)
 */
export function resetRenderCounts() {
	renderCounts.clear()
}

/**
 * Utility to format milliseconds to human-readable time
 */
export function formatDuration(ms: number): string {
	if (ms < 1000) {
		return `${ms.toFixed(0)}ms`
	}
	return `${(ms / 1000).toFixed(2)}s`
}

/**
 * Creates a simple performance observer for monitoring specific entries
 */
export function observePerformance(
	entryTypes: string[],
	callback: (entries: PerformanceEntry[]) => void
): PerformanceObserver | null {
	if (typeof PerformanceObserver === "undefined") {
		return null
	}

	try {
		const observer = new PerformanceObserver((list) => {
			callback(list.getEntries())
		})
		observer.observe({ entryTypes })
		return observer
	} catch {
		console.error("PerformanceObserver not supported")
		return null
	}
}

/**
 * Logs all performance metrics (useful for debugging)
 */
export function dumpPerformanceMetrics() {
	if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
		const entries = performance.getEntries()
		console.log("📈 Performance Entries:")
		entries.forEach((entry) => {
			const entryWithDuration = entry as PerformanceEntry & { duration?: number }
			console.log(`  ${entry.name}: ${entryWithDuration.duration?.toFixed(2) || "N/A"}ms`)
		})
	}
}
