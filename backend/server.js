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
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
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
    cors: { origin: FRONTEND_ORIGIN, methods: ["GET", "POST"], credentials: true },
});
initChat(io);

server.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on http://0.0.0.0:${PORT}`));
