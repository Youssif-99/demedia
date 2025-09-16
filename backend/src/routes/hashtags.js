import express from "express";
import { prisma } from "../../lib/prisma.js";

const router = express.Router();

// GET /api/hashtags - Get trending hashtags
router.get("/", async (req, res) => {
    try {
        const hashtags = await prisma.hashtag.findMany({
            include: {
                _count: {
                    select: { posts: true }
                }
            },
            orderBy: {
                posts: {
                    _count: "desc"
                }
            },
            take: 20
        });

        const formattedHashtags = hashtags.map(hashtag => ({
            id: hashtag.id,
            tag: hashtag.tag,
            count: hashtag._count.posts
        }));

        res.json(formattedHashtags);
    } catch (err) {
        console.error("Error fetching hashtags:", err);
        res.status(500).json({ error: "Failed to fetch hashtags" });
    }
});

export default router;
