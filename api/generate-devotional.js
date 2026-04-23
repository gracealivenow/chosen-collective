import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}

export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Write a daily devotional for Christian teens (ages 13-18) at a youth group called The CHOSEN Collective at Grace Alive Youth Ministry in Richmond, VA.

Return ONLY valid JSON — no markdown, no backticks, no extra text:
{
  "title": "short inspiring title (5 words max)",
  "verse": "full verse text — Book Chapter:Verse CSB",
  "body": "3 short paragraphs. Warm, honest, and relatable to teen life. Speak directly to them.",
  "reflection": "one thoughtful reflection question for teens",
  "color": "#E8302A"
}

Use the Christian Standard Bible (CSB) only. Color must be exactly one of: #E8302A, #29ABE2, or #F5A623. Make it fresh and not generic.`,
          },
        ],
      }),
    });

    const aiData = await response.json();
    const devotional = JSON.parse(aiData.content[0].text.trim());

    const today = new Date();
    const dateKey = today.toISOString().split("T")[0];
    devotional.date = today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    devotional.id = Date.now();

    const db = getDb();
    await db.collection("devotionals").doc(dateKey).set(devotional);

    return res.status(200).json({ success: true, devotional });
  } catch (error) {
    console.error("Error generating devotional:", error);
    return res.status(500).json({ error: error.message });
  }
}