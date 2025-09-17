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
		const backendUrl = process.env.BACKEND_URL;

		// In production, only add proxy rewrites if BACKEND_URL is provided.
		// If it's not set, we assume the platform routes /api and /socket.io directly on the same domain.
		if (isProd) {
			if (!backendUrl) {
				return [];
			}
			return [
				{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
				{ source: "/socket.io/:path*", destination: `${backendUrl}/socket.io/:path*` },
			];
		}

		// Development defaults to localhost:5000 if not provided
		const devBackend = backendUrl || "http://localhost:5000";
		return [
			{ source: "/api/:path*", destination: `${devBackend}/api/:path*` },
			{ source: "/socket.io/:path*", destination: `${devBackend}/socket.io/:path*` },
		];
	},
};

export default nextConfig;
