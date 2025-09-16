import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

// تسجيل مستخدم جديد
router.post("/sign-up", async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Check if username is already taken (keeping username unique)
        const existingUsername = await prisma.user.findUnique({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ error: "Username already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, username, email, password: hashedPassword },
        });

        const token = jwt.sign(
            { sub: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET || "dev-secret",
            { expiresIn: "7d" }
        );

        const { password: _pw, ...userWithoutPassword } = user;
        res.status(201).json({ message: "User created", user: userWithoutPassword, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// تسجيل دخول
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { sub: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET || "dev-secret",
            { expiresIn: "7d" }
        );

        const { password: _pw, ...userWithoutPassword } = user;
        res.json({ message: "Login successful", user: userWithoutPassword, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// الحصول على بيانات المستخدم الحالي
router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.substring(7);
        let userId = req.headers['user-id'] || req.query.userId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
            if (!userId && decoded && typeof decoded === 'object' && 'sub' in decoded) {
                userId = decoded.sub;
            }
        } catch (e) {
            return res.status(401).json({ error: "Invalid token" });
        }

        if (!userId) {
            return res.status(401).json({ error: "User ID not provided" });
        }

        const user = await prisma.user.findUnique({ 
            where: { id: parseInt(userId) },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                profilePicture: true,
                language: true,
                isSetupComplete: true,
                dob: true,
                phone: true,
                interests: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

export default router;
