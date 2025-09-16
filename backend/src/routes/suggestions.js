import express from "express";
import { prisma } from "../../lib/prisma.js";

const router = express.Router();

// Simple suggestions: latest users
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, username: true, profilePicture: true },
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// Placeholder personalized suggestions
router.post("/personalized", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, username: true, profilePicture: true },
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching personalized suggestions:", err);
    res.status(500).json({ error: "Failed to fetch personalized suggestions" });
  }
});



// GET /api/suggestions - Get user suggestions
router.get("/", async (req, res) => {
    try {
        // Get random users for suggestions (in a real app, this would be more sophisticated)
        const suggestions = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                username: true,
                profilePicture: true
            },
            take: 10,
            orderBy: {
                createdAt: "desc"
            }
        });

        const formattedSuggestions = suggestions.map(user => ({
            id: user.id,
            user: {
                name: user.name,
                username: user.username,
                profilePicture: user.profilePicture
            }
        }));

        res.json(formattedSuggestions);
    } catch (err) {
        console.error("Error fetching suggestions:", err);
        res.status(500).json({ error: "Failed to fetch suggestions" });
    }
});

export default router;
