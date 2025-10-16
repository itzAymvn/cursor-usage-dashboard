import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	// Enable compression for responses
	compress: true,

	// Generate ETags for caching
	generateEtags: true,

	// Image optimization (disabled since we don't use images yet)
	images: {
		unoptimized: true,
	},

	// Add cache and security headers
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
					},
					{
						key: "CDN-Cache-Control",
						value: "max-age=60",
					},
				],
			},
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
				],
			},
		]
	},
}

export default nextConfig
