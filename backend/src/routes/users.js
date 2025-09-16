import express from "express";
import { prisma } from "../../lib/prisma.js";

const router = express.Router();

// PUT /api/users/:userId/profile - Update basic profile info
router.put("/:userId/profile", async (req, res) => {
    try {
        const { userId } = req.params;
        const { dob, language, phone } = req.body || {};

        const userIdInt = parseInt(userId);
        if (Number.isNaN(userIdInt)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const updateData = {};
        if (dob) {
            const parsed = new Date(dob);
            if (isNaN(parsed.getTime())) {
                return res.status(400).json({ error: "Invalid dob format (expected ISO date)" });
            }
            updateData.dateOfBirth = parsed;
        }
        if (typeof language === "string" && language.trim() !== "") {
            updateData.preferredLang = language.trim();
        }
        if (typeof phone === "string" && phone.trim() !== "") {
            updateData.phone = phone.trim();
        }

        const updated = await prisma.user.update({
            where: { id: userIdInt },
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                phone: true,
                profilePicture: true,
                coverPhoto: true,
                dateOfBirth: true,
                preferredLang: true,
                createdAt: true,
            },
        });

        return res.json({
            message: "Profile updated successfully",
            user: updated,
        });
    } catch (err) {
        console.error("Error updating user profile:", err);
        if (err.code === "P2025") {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(500).json({ error: "Failed to update profile" });
    }
});

// POST /api/users/:userId/interests - Save user interests (accepts names or IDs)
router.post("/:userId/interests", async (req, res) => {
    try {
        const { userId } = req.params;
        const { interests } = req.body;

        if (!interests || !Array.isArray(interests)) {
            return res.status(400).json({ error: "Interests array is required" });
        }

        const userIdInt = parseInt(userId);
        if (Number.isNaN(userIdInt)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        // Ensure user exists
        const userExists = await prisma.user.findUnique({ where: { id: userIdInt }, select: { id: true } });
        if (!userExists) {
            return res.status(404).json({ error: "User not found. Please sign in again." });
        }

        // Normalize: split provided interests into numeric IDs and names
        const numericIds = [];
        const nameValues = [];
        for (const item of interests) {
            if (typeof item === "number") {
                numericIds.push(item);
            } else if (typeof item === "string") {
                const maybeNum = Number(item);
                if (!Number.isNaN(maybeNum) && item.trim() !== "") {
                    numericIds.push(maybeNum);
                } else if (item.trim() !== "") {
                    nameValues.push(item.trim());
                }
            }
        }

        // Resolve names to IDs, creating interests if necessary
        let createdOrFound = [];
        if (nameValues.length > 0) {
            // Upsert each name to ensure it exists and get its id
            createdOrFound = await Promise.all(
                nameValues.map((name) =>
                    prisma.interest.upsert({
                        where: { name },
                        update: {},
                        create: { name },
                        select: { id: true },
                    })
                )
            );
        }

        const allInterestIds = [
            ...numericIds.filter((id) => Number.isInteger(id)),
            ...createdOrFound.map((i) => i.id),
        ];

        // Deduplicate ids
        const uniqueInterestIds = Array.from(new Set(allInterestIds));

        if (uniqueInterestIds.length === 0) {
            return res.status(400).json({ error: "No valid interests provided" });
        }

        // Clear existing selections for this user
        await prisma.userInterest.deleteMany({ where: { userId: userIdInt } });

        // Create new selections
        const userInterests = uniqueInterestIds.map((interestId) => ({
            userId: userIdInt,
            interestId: Number(interestId),
        }));
        await prisma.userInterest.createMany({ data: userInterests });

        res.json({ message: "Interests saved successfully", interestIds: uniqueInterestIds });
    } catch (err) {
        console.error("Error saving interests:", err);
        res.status(500).json({ error: "Failed to save interests" });
    }
});

export default router;
