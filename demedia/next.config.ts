// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	eslint: {
		// Allow production builds to succeed even if ESLint finds errors
		ignoreDuringBuilds: true,
	},
	// Enable standalone build output
	output: "standalone",
	async rewrites() {
		const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
		return [
			{
				source: "/api/:path*",
				// Preserve /api prefix because backend mounts routes under /api/*
				destination: `${backendUrl}/api/:path*`,
			},
		];
	},
};

export default nextConfig;
