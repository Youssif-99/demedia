import express from "express";
import { prisma } from "../../lib/prisma.js";

const router = express.Router();

// GET /api/user/:userId/profile
router.get("/:userId/profile", async (req, res) => {
    try {
        const { userId } = req.params;

        // نجيب بيانات المستخدم الأساسية
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                bio: true,
                profilePicture: true,
                coverPhoto: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // نجيب عدد الـ followers
        const followersCount = await prisma.follow.count({
            where: { followingId: parseInt(userId) },
        });

        // نجيب عدد الـ following
        const followingCount = await prisma.follow.count({
            where: { followerId: parseInt(userId) },
        });

        // نجيب عدد الـ likes (من الـ posts)
        const likesCount = await prisma.like.count({
            where: {
                post: {
                    authorId: parseInt(userId)
                }
            }
        });

        // نجيب آخر 10 ستوريات
        const stories = await prisma.story.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { id: true, content: true, createdAt: true },
        });

        res.json({
            ...user,
            followersCount,
            followingCount,
            likesCount,
            stories,
        });
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});

// POST /api/user/:userId/follow
router.post("/:userId/follow", async (req, res) => {
    try {
        const { userId } = req.params;
        const { followerId } = req.body; // This should come from authentication in a real app

        if (!followerId) {
            return res.status(400).json({ error: "Follower ID is required" });
        }

        if (parseInt(userId) === parseInt(followerId)) {
            return res.status(400).json({ error: "Cannot follow yourself" });
        }

        // Check if already following
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: parseInt(followerId),
                    followingId: parseInt(userId)
                }
            }
        });

        if (existingFollow) {
            return res.status(400).json({ error: "Already following this user" });
        }

        // Create follow relationship
        await prisma.follow.create({
            data: {
                followerId: parseInt(followerId),
                followingId: parseInt(userId)
            }
        });

        // Get updated followers count
        const followersCount = await prisma.follow.count({
            where: { followingId: parseInt(userId) }
        });

        res.json({
            success: true,
            isFollowing: true,
            followersCount
        });
    } catch (err) {
        console.error("Error following user:", err);
        res.status(500).json({ error: "Failed to follow user" });
    }
});

// POST /api/user/:userId/unfollow
router.post("/:userId/unfollow", async (req, res) => {
    try {
        const { userId } = req.params;
        const { followerId } = req.body; // This should come from authentication in a real app

        if (!followerId) {
            return res.status(400).json({ error: "Follower ID is required" });
        }

        // Check if following
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: parseInt(followerId),
                    followingId: parseInt(userId)
                }
            }
        });

        if (!existingFollow) {
            return res.status(400).json({ error: "Not following this user" });
        }

        // Remove follow relationship
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: parseInt(followerId),
                    followingId: parseInt(userId)
                }
            }
        });

        // Get updated followers count
        const followersCount = await prisma.follow.count({
            where: { followingId: parseInt(userId) }
        });

        res.json({
            success: true,
            isFollowing: false,
            followersCount
        });
    } catch (err) {
        console.error("Error unfollowing user:", err);
        res.status(500).json({ error: "Failed to unfollow user" });
    }
});

export default router;