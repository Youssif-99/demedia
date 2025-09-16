import express from "express";
import { prisma } from "../../lib/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const stories = await prisma.story.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { id: true, name: true, profilePicture: true },
                },
            },
            take: 50,
        });

        // إذا حابب تحول شكل الاستجابة لتكون متوافقة مع الفرونت
        const formatted = stories.map((s) => ({
            id: s.id,
            content: s.content,
            createdAt: s.createdAt,
            user: { id: s.user?.id ?? null, name: s.user?.name ?? "Unknown", profilePicture: s.user?.profilePicture ?? null },
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Error fetching stories:", err);
        res.status(500).json({ error: "Failed to fetch stories" });
    }
});

// POST /api/stories - Create a new story (JSON only for now)
router.post("/", async (req, res) => {
    try {
        const { userId, content, durationHours } = req.body || {};

        const userIdInt = parseInt(userId);
        if (!userIdInt || !content || typeof content !== "string" || content.trim() === "") {
            return res.status(400).json({ error: "userId and non-empty content are required" });
        }

        // Verify user exists
        const user = await prisma.user.findUnique({ where: { id: userIdInt }, select: { id: true } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const createdAt = new Date();
        const hours = Number.isFinite(durationHours) ? Number(durationHours) : 24;
        const expiresAt = new Date(createdAt.getTime() + hours * 60 * 60 * 1000);

        const story = await prisma.story.create({
            data: {
                userId: userIdInt,
                content: content.trim(),
                createdAt,
                expiresAt,
            },
            include: {
                user: { select: { id: true, name: true, profilePicture: true } },
            },
        });

        return res.status(201).json({
            id: story.id,
            content: story.content,
            createdAt: story.createdAt,
            user: story.user,
            expiresAt: story.expiresAt,
        });
    } catch (err) {
        console.error("Error creating story:", err);
        res.status(500).json({ error: "Failed to create story" });
    }
});

export default router;

// Personalized stories (basic implementation)
router.post("/personalized", async (req, res) => {
    try {
        // const { interests } = req.body; // Not used yet; return latest stories for now
        const stories = await prisma.story.findMany({
            orderBy: { createdAt: "desc" },
            include: { user: { select: { id: true, name: true, profilePicture: true } } },
            take: 50,
        });

        const formatted = stories.map((s) => ({
            id: s.id,
            content: s.content,
            createdAt: s.createdAt,
            user: { id: s.user?.id ?? null, name: s.user?.name ?? "Unknown", profilePicture: s.user?.profilePicture ?? null },
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Error fetching personalized stories:", err);
        res.status(500).json({ error: "Failed to fetch personalized stories" });
    }
});