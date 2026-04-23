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
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { name, request, color } = req.body;
    if (!request?.trim()) return res.status(400).json({ error: "Missing request" });
    const db = getDb();
    const entry = {
      id: Date.now(),
      name: name?.trim() || "Anonymous",
      request: request.trim(),
      color: color || "#E8302A",
      time: new Date().toISOString(),
      likes: 0,
      liked: false
    };
    await db.collection("prayers").doc(String(entry.id)).set(entry);
    return res.status(200).json({ success: true, entry });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}