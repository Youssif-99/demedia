import express from "express";
import { prisma } from "../../lib/prisma.js";

const router = express.Router();

// Simple trending = most liked posts in last 7 days
router.get("/", async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const posts = await prisma.post.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { likes: { _count: "desc" } },
      include: {
        author: { select: { id: true, name: true, username: true, profilePicture: true } },
        _count: { select: { likes: true, comments: true } },
      },
      take: 20,
    });

    const formatted = posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      likes: p._count.likes,
      comments: p._count.comments,
      user: { name: p.author.name, username: p.author.username, profilePicture: p.author.profilePicture },
      createdAt: p.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching trending:", err);
    res.status(500).json({ error: "Failed to fetch trending" });
  }
});

// Placeholder personalized trending
router.post("/personalized", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, username: true, profilePicture: true } },
        _count: { select: { likes: true, comments: true } },
      },
      take: 20,
    });

    const formatted = posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      likes: p._count.likes,
      comments: p._count.comments,
      user: { name: p.author.name, username: p.author.username, profilePicture: p.author.profilePicture },
      createdAt: p.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching personalized trending:", err);
    res.status(500).json({ error: "Failed to fetch personalized trending" });
  }
});

export default router;


