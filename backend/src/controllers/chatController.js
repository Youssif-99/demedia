import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get all chats for a specific user
 */
export const getUserChats = async (req, res) => {
    const { userId } = req.params;

    try {
        const chats = await prisma.chat.findMany({
            where: {
                members: {
                    some: {
                        id: parseInt(userId),
                    },
                },
            },
            include: {
                members: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        profilePicture: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: "asc" },
                    take: 1, // آخر رسالة
                    include: {
                        sender: {
                            select: { id: true, username: true, name: true, profilePicture: true },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch chats" });
    }
};

/**
 * Create a new chat
 */
export const createChat = async (req, res) => {
    const { chatName, memberIds, isGroup } = req.body;

    if (!memberIds || memberIds.length < 2) {
        return res.status(400).json({ error: "At least 2 members are required" });
    }

    try {
        const newChat = await prisma.chat.create({
            data: {
                chatName: chatName || null,
                isGroup: isGroup || false,
                members: {
                    connect: memberIds.map((id) => ({ id: parseInt(id) })),
                },
            },
            include: {
                members: {
                    select: { id: true, username: true, name: true, profilePicture: true },
                },
            },
        });

        res.status(201).json(newChat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create chat" });
    }
};
