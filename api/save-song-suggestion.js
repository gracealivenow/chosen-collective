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

    // Save to Firebase
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

    // Send email via EmailJS REST API
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          subject: `🎶 New Song Suggestion — The CHOSEN Collective`,
          message: `SONG TITLE: ${entry.title}
${entry.artist ? `ARTIST: ${entry.artist}` : ""}
${entry.key ? `KEY: ${entry.key}` : ""}
${entry.notes ? `\nNOTES FROM TEEN:\n"${entry.notes}"` : ""}

---
Submitted: ${new Date(entry.time).toLocaleString("en-US", { timeZone: "America/New_York" })}
Sent via The CHOSEN Collective App`
        }
      })
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}