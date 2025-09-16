import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get all messages for a specific chat
 */
export const getChatMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        const messages = await prisma.message.findMany({
            where: {
                chatId: parseInt(chatId),
            },
            include: {
                sender: {
                    select: { id: true, username: true, name: true, profilePicture: true },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

/**
 * Create a new message in a chat
 */
export const createMessage = async (req, res) => {
    const { chatId, senderId, content } = req.body;

    if (!chatId || !senderId || !content) {
        return res.status(400).json({ error: "chatId, senderId, and content are required" });
    }

    try {
        const newMessage = await prisma.message.create({
            data: {
                content,
                chat: { connect: { id: parseInt(chatId) } },
                sender: { connect: { id: parseInt(senderId) } },
            },
            include: {
                sender: {
                    select: { id: true, username: true, name: true, profilePicture: true },
                },
            },
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create message" });
    }
};
