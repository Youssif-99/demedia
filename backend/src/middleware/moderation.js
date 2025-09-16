import OpenAI from "openai";

// Optional image moderation helper (Google Vision) if present
let visionImageCheck = null;
try {
	const mod = await import("../moderation/noNSFW.js");
	visionImageCheck = mod?.isImageClean || null;
} catch (e) {
	visionImageCheck = null;
}

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

// Basic strong fallback filters (expand for suggestive/racy content)
const PROHIBITED_PATTERNS = [
	/\b(?:(?:p|\u0440)[\W_]*?(?:o|0)[\W_]*?(?:r|\u0440)[\W_]*?(?:n|\u043d))\b/i, // porn (handles leets/simple unicode)
	/\bsex(?:ual)?\b/i,
	/\bnude?s?\b/i,
	/\bxxx\b/i,
	/\bviolence\b/i,
	/\bgore\b/i,
	/\brape\b/i,
	/\bkill(?:ing)?\b/i,
	/\bsuicide\b/i,
	/\bself\W*harm\b/i,
	/\bbikini\b/i,
	/\blingerie\b/i,
	/\bstrip(?:ping|per)?\b/i,
	/\btwerk(?:ing)?\b/i,
	/\b(?:lap)\s*dance\b/i,
	/\berotic\b/i,
	/\bsuggestive\b/i,
	/\brevealing\s*(?:clothes|outfit|body)\b/i,
	/\b(?:slur1|slur2|slur3)\b/i, // placeholder: add project-specific disallowed slurs
];

const PROHIBITED_DOMAINS = [
	/\b(xvideos|pornhub|onlyfans|xhamster|redtube|xnxx)\.\w{2,}\b/i,
];

function hasProhibitedText(text) {
	if (!text) return false;
	for (const pattern of PROHIBITED_PATTERNS) {
		if (pattern.test(text)) return true;
	}
	for (const d of PROHIBITED_DOMAINS) {
		if (d.test(text)) return true;
	}
	// Excessive profanity-like patterns or spammy repetition
	if (/(.)\1{5,}/.test(text)) return true;
	return false;
}

export async function moderateText(req, res, next) {
	try {
		const title = typeof req.body?.title === "string" ? req.body.title : "";
		const content = typeof req.body?.content === "string" ? req.body.content : "";
		const caption = typeof req.body?.caption === "string" ? req.body.caption : "";
		const hashtags = Array.isArray(req.body?.hashtags) ? req.body.hashtags.join(" ") : "";
		const combined = `${title}\n${content}`.trim();
		const extended = `${combined}\n${caption}\n${hashtags}`.trim();

		if (!extended) return next();

		// Prefer OpenAI moderation if configured
		if (openai) {
			try {
				const result = await openai.moderations.create({
					model: "omni-moderation-latest",
					input: extended,
				});
				const flagged = result?.results?.[0]?.flagged === true;
				if (flagged) {
					return res.status(400).json({ error: "Content violates safety policy" });
				}
			} catch (err) {
				// If remote moderation fails, fall back to local checks
			}
		}

		if (hasProhibitedText(extended)) {
			return res.status(400).json({ error: "Content not allowed" });
		}

		return next();
	} catch (err) {
		return res.status(500).json({ error: "Moderation service error" });
	}
}

export async function moderateImage(req, res, next) {
	try {
		const imageUrl = typeof req.body?.imageUrl === "string" ? req.body.imageUrl : null;
		const videoUrl = typeof req.body?.videoUrl === "string" ? req.body.videoUrl : null;
		if (!imageUrl) return next();
		if (visionImageCheck) {
			try {
				const clean = await visionImageCheck(imageUrl);
				if (!clean) {
					return res.status(400).json({ error: "Image content not allowed" });
				}
			} catch (e) {
				// If Vision fails, do a simple filename heuristic fallback
				if (/\b(nude|nsfw|xxx|porn|bikini|lingerie|twerk|lap\s*dance)\b/i.test(imageUrl)) {
					return res.status(400).json({ error: "Image content likely unsafe" });
				}
			}
		} else {
			// No vision available; basic heuristic
			if (/\b(nude|nsfw|xxx|porn|bikini|lingerie|twerk|lap\s*dance)\b/i.test(imageUrl)) {
				return res.status(400).json({ error: "Image content likely unsafe" });
			}
		}
		// For video URLs, apply similar heuristic keywords in filename/path
		if (videoUrl && /\b(nude|nsfw|xxx|porn|bikini|lingerie|twerk|lap\s*dance|strip)\b/i.test(videoUrl)) {
			return res.status(400).json({ error: "Video content likely unsafe" });
		}
		return next();
	} catch (err) {
		return res.status(500).json({ error: "Image moderation service error" });
	}
}


