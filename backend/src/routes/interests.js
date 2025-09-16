import express from "express";
import { prisma } from "../../lib/prisma.js";

const router = express.Router();

// GET /api/interests - Get all available interests
router.get("/", async (req, res) => {
    try {
        const interests = await prisma.interest.findMany({
            orderBy: { name: "asc" }
        });

        res.json(interests);
    } catch (err) {
        console.error("Error fetching interests:", err);
        res.status(500).json({ error: "Failed to fetch interests" });
    }
});


export default router;
