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
    const { title, artist, key, notes } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Missing song title" });
    const db = getDb();
    const entry = {
      id: Date.now(),
      title: title.trim(),
      artist: artist?.trim() || "",
      key: key?.trim() || "",
      notes: notes?.trim() || "",
      time: new Date().toISOString(),
      reviewed: false
    };
    await db.collection("song_suggestions").doc(String(entry.id)).set(entry);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}