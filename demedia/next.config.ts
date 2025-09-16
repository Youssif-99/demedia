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
};

export default nextConfig;
