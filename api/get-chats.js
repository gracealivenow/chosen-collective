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
    const db = getDb();
    const snapshot = await db.collection("chats").orderBy("id", "asc").limitToLast(50).get();
    const chats = [];
    snapshot.forEach(doc => chats.push(doc.data()));
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ chats });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}