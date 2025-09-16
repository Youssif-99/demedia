import express from "express";
import { prisma } from "../../lib/prisma.js";

const router = express.Router();

// GET /api/posts - Get all posts
router.get("/", async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    select: { id: true, name: true, username: true, profilePicture: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            },
            take: 50
        });

        const formattedPosts = posts.map(post => ({
            id: post.id,
            content: post.content,
            title: post.title,
            likes: post._count.likes,
            comments: post._count.comments,
            user: {
                name: post.author.name,
                username: post.author.username,
                profilePicture: post.author.profilePicture
            },
            createdAt: post.createdAt
        }));

        res.json(formattedPosts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

// POST /api/posts - Create a new post
router.post("/", async (req, res) => {
    try {
        const { title, content, authorId } = req.body;

        if (!title || !authorId) {
            return res.status(400).json({ error: "Title and authorId are required" });
        }

        const post = await prisma.post.create({
            data: {
                title,
                content: content || "",
                authorId: parseInt(authorId)
            },
            include: {
                author: {
                    select: { id: true, name: true, username: true, profilePicture: true }
                }
            }
        });

        res.status(201).json({
            id: post.id,
            content: post.content,
            title: post.title,
            likes: 0,
            comments: 0,
            user: {
                name: post.author.name,
                username: post.author.username,
                profilePicture: post.author.profilePicture
            },
            createdAt: post.createdAt
        });
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ error: "Failed to create post" });
    }
});

export default router;

// Personalized posts (basic implementation)
router.post("/personalized", async (req, res) => {
    try {
        // const { interests } = req.body; // Not used yet; return latest posts for now
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                author: { select: { id: true, name: true, username: true, profilePicture: true } },
                _count: { select: { likes: true, comments: true } },
            },
            take: 50,
        });

        const formatted = posts.map((post) => ({
            id: post.id,
            content: post.content,
            title: post.title,
            likes: post._count.likes,
            comments: post._count.comments,
            user: {
                name: post.author.name,
                username: post.author.username,
                profilePicture: post.author.profilePicture,
            },
            createdAt: post.createdAt,
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Error fetching personalized posts:", err);
        res.status(500).json({ error: "Failed to fetch personalized posts" });
    }
});