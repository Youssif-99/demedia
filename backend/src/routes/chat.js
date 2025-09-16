import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Get all chats for a user
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const chats = await prisma.chat.findMany({
            where: {
                participants: {
                    some: { id: parseInt(userId, 10) },
                },
            },
            include: {
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1, // آخر رسالة بس
                },
            },
        });

        const formatted = chats.map(chat => ({
            id: chat.id,
            chatName: chat.name || "Unnamed Chat",
            lastMessage: chat.messages[0]?.content || "",
            time: chat.messages[0]?.createdAt || null,
        }));

        res.json(formatted);
    } catch (error) {
        console.error("❌ Error fetching chats:", error);
        res.status(500).json({ error: "Failed to fetch chats" });
    }
});

export default router;
