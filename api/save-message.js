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

    // Send email notification to both leaders
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "The CHOSEN Collective <onboarding@resend.dev>",
        to: ["kindal.w.white@gmail.com", "geowhi2105@yahoo.com"],
        subject: `💌 New Confidential Message — The CHOSEN Collective`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #E8302A; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <h1 style="color: white; margin: 0; font-size: 20px;">The CHOSEN Collective</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">New Confidential Message</p>
            </div>
            <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 0.1em;">From</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1a1a1a;">${entry.name}</p>
              ${entry.email ? `<p style="margin: 4px 0 0; font-size: 13px; color: #777;">${entry.email}</p>` : ""}
            </div>
            <div style="background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #E8302A;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 0.1em;">Message</p>
              <p style="margin: 0; font-size: 15px; color: #333; line-height: 1.7;">${entry.body}</p>
            </div>
            <p style="font-size: 12px; color: #bbb; text-align: center; margin-top: 24px;">
              Received ${new Date(entry.time).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · The CHOSEN Collective App
            </p>
          </div>
        `
      })
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}