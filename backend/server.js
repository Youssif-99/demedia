import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import authRoutes from "./src/routes/auth.js";
import messageRoutes from "./src/routes/message.js";
import chatRoutes from "./src/routes/chat.js";
import userRoutes from "./src/routes/user.js";
import usersRoutes from "./src/routes/users.js";
import storiesRoutes from "./src/routes/stories.js";
import postsRoutes from "./src/routes/posts.js";
import hashtagsRoutes from "./src/routes/hashtags.js";
import trendingRoutes from "./src/routes/trending.js";
import suggestionsRoutes from "./src/routes/suggestions.js";
import interestsRoutes from "./src/routes/interests.js";
import initChat from "./src/socket/chat.js";

const app = express();
const server = http.createServer(app);

// Environment-driven config for deployments (e.g., Railway)
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.set("trust proxy", 1);

const allowedOrigins = [
	"http://localhost:3000",
	FRONTEND_ORIGIN,
];

app.use(
	cors({
		origin(origin, callback) {
			if (!origin) return callback(null, true);
			if (
				allowedOrigins.includes(origin) ||
				/\.railway\.app$/.test(origin)
			) {
				return callback(null, true);
			}
			return callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		optionsSuccessStatus: 200,
	})

);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/hashtags", hashtagsRoutes);
app.use("/api/suggestions", suggestionsRoutes);
app.use("/api/interests", interestsRoutes);
app.use("/api/trending", trendingRoutes);

app.get("/", (req, res) => res.send("Backend with Chat is running 🚀"));

const io = new Server(server, {
	cors: {
		origin(origin, callback) {
			if (!origin) return callback(null, true);
			if (
				allowedOrigins.includes(origin) ||
				/\.railway\.app$/.test(origin)
			) {
				return callback(null, true);
			}
			return callback(new Error("Not allowed by CORS"));
		},
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
	},
});
initChat(io);

server.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on http://0.0.0.0:${PORT}`));

// CORS preflight support for all routes
app.options("*", cors());

// API 404 handler
app.use((req, res, next) => {
	if (req.path.startsWith("/api")) {
		return res.status(404).json({ error: "Not Found" });
	}
	return next();
});

// Centralized JSON error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error("Unhandled error:", err);
	if (res.headersSent) {
		return;
	}
	const status = err.status || err.statusCode || 500;
	const message = status === 500 ? "Internal Server Error" : (err.message || "Error");
	res.status(status).json({ error: message });
});
