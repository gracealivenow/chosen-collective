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
        subject: `🎶 New Song Suggestion — The CHOSEN Collective`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #F5A623; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <h1 style="color: white; margin: 0; font-size: 20px;">The CHOSEN Collective</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">New Song Suggestion from Your Youth</p>
            </div>
            <div style="background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #F5A623;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #999; width: 80px;">Song</td>
                  <td style="padding: 8px 0; font-size: 15px; font-weight: bold; color: #1a1a1a;">${entry.title}</td>
                </tr>
                ${entry.artist ? `<tr><td style="padding: 8px 0; font-size: 13px; color: #999;">Artist</td><td style="padding: 8px 0; font-size: 14px; color: #333;">${entry.artist}</td></tr>` : ""}
                ${entry.key ? `<tr><td style="padding: 8px 0; font-size: 13px; color: #999;">Key</td><td style="padding: 8px 0; font-size: 14px; color: #333;">${entry.key}</td></tr>` : ""}
                ${entry.notes ? `<tr><td style="padding: 8px 0; font-size: 13px; color: #999; vertical-align: top;">Notes</td><td style="padding: 8px 0; font-size: 14px; color: #555; font-style: italic;">"${entry.notes}"</td></tr>` : ""}
              </table>
            </div>
            <p style="font-size: 12px; color: #bbb; text-align: center; margin-top: 24px;">
              Submitted ${new Date(entry.time).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · The CHOSEN Collective App
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