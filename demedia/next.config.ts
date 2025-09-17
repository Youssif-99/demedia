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
		const isProd = process.env.NODE_ENV === "production";
		const backendUrl = isProd
			? (process.env.BACKEND_URL || "")
			: (process.env.BACKEND_URL || "http://localhost:5000");
		return [
			{
				source: "/api/:path*",
				// Preserve /api prefix because backend mounts routes under /api/*
				destination: `${backendUrl}/api/:path*`,
			},
			// Proxy Socket.IO as well (same-origin ws)
			{
				source: "/socket.io/:path*",
				destination: `${backendUrl}/socket.io/:path*`,
			},
		];
	},
};

export default nextConfig;
