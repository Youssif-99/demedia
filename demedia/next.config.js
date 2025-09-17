/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
		return [
			{
				source: '/api/:path*',
				destination: `${backendUrl}/:path*`,
			},
		];
	},
	// Better Docker support
	output: 'standalone',
};

module.exports = nextConfig;


