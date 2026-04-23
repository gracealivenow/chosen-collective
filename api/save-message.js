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
    const { name, email, body } = req.body;
    if (!body?.trim()) return res.status(400).json({ error: "Missing message body" });

    // Save to Firebase
    const db = getDb();
    const entry = {
      id: Date.now(),
      name: name?.trim() || "Anonymous",
      email: email?.trim() || "",
      body: body.trim(),
      time: new Date().toISOString(),
      read: false
    };
    await db.collection("messages").doc(String(entry.id)).set(entry);

    // Send email via EmailJS REST API
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          subject: `💌 Confidential Message from ${entry.name} — The CHOSEN Collective`,
          message: `FROM: ${entry.name}
${entry.email ? `REPLY TO: ${entry.email}` : "No reply email provided"}

MESSAGE:
${entry.body}

---
Received: ${new Date(entry.time).toLocaleString("en-US", { timeZone: "America/New_York" })}
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