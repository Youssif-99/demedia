import OpenAI from "openai";
import express from "express";

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function isTextClean(text) {
    const res = await openai.moderations.create({
        model: "omni-moderation-latest",
        input: text,
    });
    return !res.results[0].flagged;
}

app.post("/api/posts", async (req, res) => {
    const { content } = req.body;

    const clean = await isTextClean(content);
    if (!clean) {
        return res.status(400).json({ error: "🚫 CONTENT NOT ALLOWED" });
    }

    // هنا تقدر تخزن البوست
    res.json({ success: true, message: "POST PUBLISHED SUCCESSFULLY" });
});
