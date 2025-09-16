import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/messages/:chatId
 * @desc    Get all messages of a chat
 */
router.get("/:chatId", async (req, res) => {
    const { chatId } = req.params;
    try {
        const messages = await prisma.message.findMany({
            where: { chatId: parseInt(chatId, 10) },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        profilePicture: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        res.json(messages);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

/**
 * @route   POST /api/messages
 * @desc    Send a message in a chat
 */
router.post("/", async (req, res) => {
    const { chatId, senderId, content, type } = req.body;

    if (!chatId || !senderId || !content) {
        return res.status(400).json({
            error: "chatId, senderId and content are required",
        });
    }

    try {
        const newMessage = await prisma.message.create({
            data: {
                chatId: parseInt(chatId, 10),
                senderId: parseInt(senderId, 10),
                content,
                type: type || "text", // 👈 عشان يدعم text, sticker, audio
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        profilePicture: true,
                    },
                },
            },
        });

        // 🔥 هنضيف بعدين socket.io هنا عشان يبعته للـ frontend
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("❌ Error sending message:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
});

export default router;
