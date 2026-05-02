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

// Topics to rotate through so no two devotionals feel the same
const TOPICS = [
  "identity in Christ and knowing your worth",
  "dealing with anxiety and trusting God with your fears",
  "friendship, loyalty, and choosing the right people",
  "forgiveness - both receiving it and giving it to others",
  "standing firm in your faith when no one is watching",
  "social media, comparison, and finding contentment",
  "purpose - why God made you and what He's calling you to",
  "courage to speak up for what's right even when it's hard",
  "family - loving people who are difficult to love",
  "grief and loss - God's presence in painful seasons",
  "distractions and staying focused on what matters",
  "serving others and living beyond yourself",
  "worship as a lifestyle not just a Sunday experience",
  "dealing with failure and getting back up",
  "prayer - talking to God like He's actually listening",
  "jealousy and celebrating others without comparison",
  "integrity - being the same person in public and private",
  "loneliness and finding belonging in God",
  "anger - processing emotions in a healthy godly way",
  "dreams and trusting God with your future",
  "peer pressure and standing your ground",
  "gratitude - seeing God's goodness in everyday life",
  "humility and putting others before yourself",
  "rest - why God designed us to slow down",
  "the power of words - what you say about yourself and others",
  "doubt - it's okay to ask hard questions about faith",
  "mental health - God cares about your whole person",
  "racism injustice and being a peacemaker",
  "dating relationships and honoring God with your heart",
  "academic pressure and finding your value beyond grades",
];

export default async function handler(req, res) {
  try {
    const db = getDb();

    // Get last 7 devotionals to avoid repeating topics
    const recent = await db
      .collection("devotionals")
      .orderBy("id", "desc")
      .limit(7)
      .get();

    const recentTitles = recent.docs.map(d => d.data().title || "").join(", ");

    // Pick a topic based on day of year so it rotates predictably
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const topic = TOPICS[dayOfYear % TOPICS.length];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [
          {
            role: "user",
            content: `You are writing a daily devotional for The CHOSEN Collective - the youth group at Grace Alive Youth Ministry in Richmond, VA. The teens are ages 13-18.

TODAY'S TOPIC: ${topic}

RECENT DEVOTIONAL TITLES TO AVOID REPEATING: ${recentTitles || "none yet"}

CRITICAL REQUIREMENTS:
- Use ONLY the Christian Standard Bible (CSB) translation
- Write directly TO the teen - use "you" not "teens" or "young people"
- Be honest, warm, and real - not preachy or churchy-sounding
- The body should feel like a trusted older sibling talking to them, not a sermon
- The reflection question should be personal and specific, not generic
- Make it feel FRESH and different from typical devotionals
- Do NOT use phrases like "In today's world" or "As Christians" or "The Bible tells us"

Return ONLY valid JSON with no markdown, no backticks, no extra text:
{
  "title": "5 words max - compelling and specific to the topic",
  "verse": "Full verse text with reference — Book Chapter:Verse CSB",
  "body": "Three short paragraphs. First hooks them with a relatable real-life scenario. Second unpacks the verse honestly. Third brings it home with hope and challenge.",
  "reflection": "One specific personal question that actually makes them think",
  "color": "#E8302A"
}

Color must be exactly one of: #E8302A, #29ABE2, or #F5A623. Rotate through them.`,
          },
        ],
      }),
    });

    const aiData = await response.json();
    const raw = aiData.content[0].text.trim();
    const devotional = JSON.parse(raw);

    const today = new Date();
    const dateKey = today.toISOString().split("T")[0];
    devotional.date = today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    devotional.id = Date.now();

    await db.collection("devotionals").doc(dateKey).set(devotional);

    return res.status(200).json({ success: true, devotional });
  } catch (error) {
    console.error("Error generating devotional:", error);
    return res.status(500).json({ error: error.message });
  }
}