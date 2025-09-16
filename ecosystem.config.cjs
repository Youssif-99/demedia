module.exports = {
	apps: [
		{
			name: "backend",
			script: "backend/server.js",
			cwd: ".",
			env: {
				NODE_ENV: "production",
				PORT: "5000",
				HOST: "0.0.0.0",
			},
			exp_backoff_restart_delay: 100,
		},
		{
			name: "frontend",
			script: "node",
			args: ["demedia/server.js"],
			cwd: ".",
			env: {
				NODE_ENV: "production",
				PORT: "3000",
				HOSTNAME: "0.0.0.0",
				NEXT_PUBLIC_API_URL: "http://localhost:5000",
			},
			exp_backoff_restart_delay: 100,
		},
	],
};


