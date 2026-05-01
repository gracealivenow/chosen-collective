import { useState, useEffect, useRef } from "react";

// Brand colors pulled directly from The CHOSEN Collective logo dots
const RED = "#E8302A";
const BLUE = "#29ABE2";
const YELLOW = "#F5A623";
const CREAM = "#FDFCF8";
const WARM_WHITE = "#FFFFFF";
const DARK = "#1A1A1A";
const SOFT_GRAY = "#F2F0EB";

// ─── ADMIN CONFIG ────────────────────────────────────────────────
// Change this to your own password before deploying!
const ADMIN_PASSWORD = "gracealivenow2026";
// ─────────────────────────────────────────────────────────────────

const DEVOTIONALS = [
  {
    id: 1,
    date: "",
    title: "Coming Soon",
    verse: "\"Your word is a lamp for my feet and a light on my path.\" — Psalm 119:105 CSB",
    body: "Your first devotional will appear here. Check back soon!",
    reflection: "What is God speaking to you today?",
    color: RED
  }
];

const ANNOUNCEMENTS = [];

const INITIAL_PRAYERS = [];

const EVENTS = [];

const SETLIST = [];

const SERVE_DATE = "Date coming soon";

const INITIAL_CHATS = [];

const QUICK_REACTIONS = ["🔥", "🙏", "❤️", "🙌", "😭", "✅"];

// The CHOSEN Collective logo recreated in CSS — Friends-style lettering with colored dots
const ChosenLogo = ({ size = "full" }) => {
  const dots = [RED, BLUE, YELLOW, RED, BLUE];
  const letters = ["C", "H", "O", "S", "E", "N"];
  const isSmall = size === "small";
  return (
    <div style={{ textAlign: "center", lineHeight: 1 }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', 'Georgia', serif",
        fontSize: isSmall ? 11 : 14,
        fontWeight: 500,
        letterSpacing: "0.3em",
        color: DARK,
        textTransform: "uppercase",
        marginBottom: isSmall ? 2 : 3
      }}>THE</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: isSmall ? 1 : 2 }}>
        {letters.map((letter, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: isSmall ? 1 : 2 }}>
            <span style={{
              fontFamily: "'Caveat', 'Dancing Script', cursive",
              fontSize: isSmall ? 18 : 28,
              fontWeight: 700,
              color: DARK,
              lineHeight: 1
            }}>{letter}</span>
            {i < letters.length - 1 && (
              <span style={{
                width: isSmall ? 5 : 7, height: isSmall ? 5 : 7,
                borderRadius: "50%",
                background: dots[i],
                display: "inline-block",
                flexShrink: 0
              }} />
            )}
          </span>
        ))}
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', 'Georgia', serif",
        fontSize: isSmall ? 10 : 13,
        fontWeight: 500,
        letterSpacing: "0.25em",
        color: DARK,
        textTransform: "uppercase",
        marginTop: isSmall ? 2 : 3
      }}>COLLECTIVE</div>
    </div>
  );
};

// Colored dot row decorative element from logo
const DotRow = ({ gap = 10 }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap }}>
    {[RED, BLUE, YELLOW, RED, BLUE].map((c, i) => (
      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c, opacity: 0.7 }} />
    ))}
  </div>
);

export default function ChosenCollectiveApp() {
  const [tab, setTab] = useState("home");
  const [prayers, setPrayers] = useState(INITIAL_PRAYERS);
  const [newPrayer, setNewPrayer] = useState("");
  const [prayerName, setPrayerName] = useState("");
  const [isAnon, setIsAnon] = useState(false);
  const [devIndex, setDevIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [expandedPrayer, setExpandedPrayer] = useState(null);

  // Worship state
  const [songSub, setSongSub] = useState({ title: "", artist: "", key: "", notes: "" });
  const [songSubmitted, setSongSubmitted] = useState(false);

  // Admin state
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState(false);
  const [adminTab, setAdminTab] = useState("announcements");
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef(null);

  // Admin content state — mirrors the app data
  const [adminAnnouncements, setAdminAnnouncements] = useState(ANNOUNCEMENTS);
  const [adminEvents, setAdminEvents] = useState(EVENTS);
  const [adminSetlist, setAdminSetlist] = useState(SETLIST);
  const [adminServeDate, setAdminServeDate] = useState(SERVE_DATE);
  const [adminDevotionals, setAdminDevotionals] = useState(DEVOTIONALS);

  // Admin form state
  const [newAnn, setNewAnn] = useState({ emoji: "📣", title: "", detail: "", date: "", color: RED });
  const [newEvent, setNewEvent] = useState({ month: "", day: "", title: "", time: "", location: "", color: RED });
  const [newSong, setNewSong] = useState({ title: "", artist: "", key: "", tempo: "Medium" });
  const [newDevo, setNewDevo] = useState({ date: "", title: "", verse: "", body: "", reflection: "", color: RED });
  const [adminSaved, setAdminSaved] = useState(false);

  const handleLogoTap = () => {
    logoTapCount.current += 1;
    clearTimeout(logoTapTimer.current);
    if (logoTapCount.current >= 5) {
      logoTapCount.current = 0;
      setShowAdmin(true);
    } else {
      logoTapTimer.current = setTimeout(() => { logoTapCount.current = 0; }, 2000);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      setAdminPasswordError(false);
      setAdminPassword("");
    } else {
      setAdminPasswordError(true);
    }
  };

  const saveAndFlash = () => {
    setAdminSaved(true);
    setTimeout(() => setAdminSaved(false), 2000);
  };

  const addAnnouncement = () => {
    if (!newAnn.title.trim()) return;
    setAdminAnnouncements([{ ...newAnn, id: Date.now() }, ...adminAnnouncements]);
    setNewAnn({ emoji: "📣", title: "", detail: "", date: "", color: RED });
    saveAndFlash();
  };

  const removeAnnouncement = (id) => setAdminAnnouncements(adminAnnouncements.filter(a => a.id !== id));

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    setAdminEvents([...adminEvents, { ...newEvent, id: Date.now() }]);
    setNewEvent({ month: "", day: "", title: "", time: "", location: "", color: RED });
    saveAndFlash();
  };

  const removeEvent = (id) => setAdminEvents(adminEvents.filter(e => e.id !== id));

  const addSong = () => {
    if (!newSong.title.trim()) return;
    setAdminSetlist([...adminSetlist, { ...newSong, id: Date.now() }]);
    setNewSong({ title: "", artist: "", key: "", tempo: "Medium" });
    saveAndFlash();
  };

  const removeSong = (id) => setAdminSetlist(adminSetlist.filter(s => s.id !== id));

  const saveDevo = () => {
    if (!newDevo.title.trim()) return;
    setAdminDevotionals([{ ...newDevo, id: Date.now() }, ...adminDevotionals]);
    setNewDevo({ date: "", title: "", verse: "", body: "", reflection: "", color: RED });
    saveAndFlash();
  };


  const [chats, setChats] = useState(INITIAL_CHATS);
  const [chatName, setChatName] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const [chatNameSaved, setChatNameSaved] = useState(false);
  const [message, setMessage] = useState({ name: "", email: "", body: "" });
  const [msgSubmitted, setMsgSubmitted] = useState(false);

  const handlePrayerSubmit = () => {
    if (!newPrayer.trim()) return;
    const colors = [RED, BLUE, YELLOW];
    const entry = {
      id: Date.now(),
      name: isAnon ? "Anonymous" : (prayerName.trim() || "Anonymous"),
      request: newPrayer.trim(),
      time: "just now",
      liked: false,
      likes: 0,
      color: colors[Math.floor(Math.random() * 3)]
    };
    setPrayers([entry, ...prayers]);
    setNewPrayer("");
    setPrayerName("");
    setIsAnon(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const toggleLike = (id) => {
    setPrayers(prayers.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const handleSongSubmit = () => {
    if (!songSub.title.trim()) return;
    setSongSubmitted(true);
    setSongSub({ title: "", artist: "", key: "", notes: "" });
    setTimeout(() => setSongSubmitted(false), 3500);
  };

  const handleChatPost = () => {
    if (!chatMsg.trim() || !chatName.trim()) return;
    const initials = chatName.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const avatarColors = [RED, BLUE, YELLOW];
    const entry = {
      id: Date.now(),
      name: chatName.trim(),
      avatar: initials,
      color: avatarColors[chats.length % 3],
      message: chatMsg.trim(),
      time: "just now",
      reactions: [],
      reacted: []
    };
    setChats([...chats, entry]);
    setChatMsg("");
    setChatNameSaved(true);
  };

  const handleReact = (chatId, emoji) => {
    setChats(chats.map(c => {
      if (c.id !== chatId) return c;
      const alreadyReacted = c.reacted.includes(emoji);
      const updatedReactions = alreadyReacted
        ? c.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count - 1 } : r).filter(r => r.count > 0)
        : c.reactions.find(r => r.emoji === emoji)
          ? c.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r)
          : [...c.reactions, { emoji, count: 1 }];
      const updatedReacted = alreadyReacted
        ? c.reacted.filter(e => e !== emoji)
        : [...c.reacted, emoji];
      return { ...c, reactions: updatedReactions, reacted: updatedReacted };
    }));
  };

  const handleMsgSubmit = () => {
    if (!message.body.trim()) return;
    setMsgSubmitted(true);
    setMessage({ name: "", email: "", body: "" });
    setTimeout(() => setMsgSubmitted(false), 4000);
  };

  const dev = (adminDevotionals.length > 0 ? adminDevotionals : DEVOTIONALS)[devIndex] || DEVOTIONALS[0];

  return (
    <div style={{
      fontFamily: "'Nunito', 'Quicksand', sans-serif",
      background: CREAM,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Caveat:wght@600;700&family=Cormorant+Garamond:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; }
        .tab-btn { background: none; border: none; cursor: pointer; padding: 0; }
        .pill-btn { border: none; cursor: pointer; border-radius: 100px; }
        .fade-in { animation: fadeIn 0.35s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .pop-in { animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        textarea:focus, input:focus { outline: none; }
        .hover-lift:hover { transform: translateY(-2px); transition: transform 0.2s; }
      `}</style>

      {/* Header */}
      <div style={{
        background: WARM_WHITE,
        padding: "18px 24px 16px",
        borderBottom: `3px solid ${SOFT_GRAY}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50
      }}>
        <div style={{ cursor: "default" }}>
          <ChosenLogo size="full" />
        </div>
        <div onClick={() => setShowAdmin(true)} style={{
          width: 40, height: 40, borderRadius: "50%",
          background: `linear-gradient(135deg, ${RED}, ${YELLOW})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, cursor: "pointer",
          boxShadow: `0 4px 14px ${RED}40`
        }}>✨</div>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }}>

        {/* HOME */}
        {tab === "home" && (
          <div className="fade-in">

            {/* Hero Verse Card */}
            <div style={{ padding: "20px 18px 0" }}>
              <div style={{
                borderRadius: 24,
                background: `linear-gradient(135deg, ${RED} 0%, #F05A27 100%)`,
                padding: "26px 22px",
                position: "relative",
                overflow: "hidden",
                boxShadow: `0 8px 32px ${RED}40`
              }}>
                <div style={{
                  position: "absolute", top: -20, right: -20,
                  width: 100, height: 100, borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)"
                }} />
                <div style={{
                  position: "absolute", bottom: -30, right: 20,
                  width: 70, height: 70, borderRadius: "50%",
                  background: "rgba(255,255,255,0.07)"
                }} />
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", marginBottom: 10 }}>
                  ✦ Verse of the Day
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: WARM_WHITE, lineHeight: 1.6, fontStyle: "italic", marginBottom: 12, fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
                  "For I know the plans I have for you" — this is the Lord's declaration — "plans for your well-being, not for disaster, to give you a future and a hope."
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: "0.05em" }}>
                  Jeremiah 29:11 CSB
                </div>
              </div>
            </div>

            {/* Welcome Strip */}
            <div style={{ padding: "18px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: DARK, letterSpacing: "-0.02em" }}>
                  Hey, Chosen One! 👋
                </div>
                <div style={{ fontSize: 13, color: "#777", marginTop: 2 }}>Here's what's happening this week</div>
              </div>
              <DotRow gap={6} />
            </div>

            {/* Quick Nav Grid */}
            <div style={{ padding: "16px 18px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: "📖", label: "Today's Devo", sub: "2 min read", color: BLUE, action: () => setTab("devo") },
                { icon: "🙏", label: "Prayer Wall", sub: `${prayers.length} requests`, color: RED, action: () => setTab("prayer") },
                { icon: "📅", label: "Events", sub: "4 upcoming", color: YELLOW, action: () => setTab("events") },
                { icon: "📣", label: "Announcements", sub: "4 new", color: BLUE, action: () => setTab("home") }
              ].map((q, i) => (
                <button key={i} className="tab-btn hover-lift" onClick={q.action} style={{ width: "100%", textAlign: "left" }}>
                  <div style={{
                    background: WARM_WHITE,
                    borderRadius: 18,
                    padding: "16px 16px",
                    border: `2px solid ${q.color}22`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: q.color + "18",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, marginBottom: 10
                    }}>{q.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: DARK }}>{q.label}</div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{q.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Announcements */}
            <div style={{ padding: "22px 18px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: DARK }}>What's New</div>
                <DotRow gap={5} />
              </div>
              {ANNOUNCEMENTS.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#BBB" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📣</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>No announcements yet.</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Check back soon!</div>
                </div>
              ) : ANNOUNCEMENTS.map(a => (
                <div key={a.id} style={{
                  background: WARM_WHITE,
                  borderRadius: 18,
                  padding: "14px 16px",
                  marginBottom: 10,
                  display: "flex", gap: 12, alignItems: "flex-start",
                  borderLeft: `4px solid ${a.color}`,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: a.color + "18",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0
                  }}>{a.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: DARK }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: "#AAA", marginLeft: 8, flexShrink: 0 }}>{a.date}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{a.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEVOTIONAL */}
        {tab === "devo" && (
          <div className="fade-in" style={{ padding: "20px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: DARK }}>Daily Devotional</div>
              <DotRow gap={6} />
            </div>

            {/* Day selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {adminDevotionals.map((d, i) => (
                <button key={i} className="tab-btn" onClick={() => setDevIndex(i)}>
                  <div style={{
                    padding: "8px 16px", borderRadius: 100,
                    background: devIndex === i ? adminDevotionals[i].color : WARM_WHITE,
                    color: devIndex === i ? WARM_WHITE : "#999",
                    fontSize: 12, fontWeight: 800,
                    border: `2px solid ${devIndex === i ? adminDevotionals[i].color : "#E8E4DC"}`,
                    transition: "all 0.25s"
                  }}>
                    {i === 0 ? "Today" : i === 1 ? "Yesterday" : d.date}
                  </div>
                </button>
              ))}
            </div>

            {/* Devo Card */}
            <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}>
              <div style={{ background: dev.color, padding: "24px 22px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", marginBottom: 8 }}>
                  {dev.date}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: WARM_WHITE, lineHeight: 1.3, marginBottom: 16 }}>
                  {dev.title}
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.18)",
                  borderRadius: 14, padding: "14px 16px",
                  borderLeft: "3px solid rgba(255,255,255,0.5)"
                }}>
                  <div style={{ fontSize: 14, fontStyle: "italic", color: WARM_WHITE, lineHeight: 1.65 }}>
                    {dev.verse}
                  </div>
                </div>
              </div>
              <div style={{ background: WARM_WHITE, padding: "22px" }}>
                <div style={{ fontSize: 15, color: "#555", lineHeight: 1.8, marginBottom: 20 }}>
                  {dev.body}
                </div>
                <div style={{ background: SOFT_GRAY, borderRadius: 16, padding: "16px 18px", borderLeft: `4px solid ${dev.color}` }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: dev.color, textTransform: "uppercase", marginBottom: 8 }}>
                    💬 Reflect On This
                  </div>
                  <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                    {dev.reflection}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRAYER WALL */}
        {tab === "prayer" && (
          <div className="fade-in" style={{ padding: "20px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: DARK }}>Prayer Wall</div>
              <DotRow gap={6} />
            </div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>Share your heart. Stand in faith together.</div>

            {/* Submit Form */}
            <div style={{
              background: WARM_WHITE,
              borderRadius: 22,
              padding: "18px",
              marginBottom: 22,
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              border: `2px solid ${RED}18`
            }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "18px 0" }} className="pop-in">
                  <div style={{ fontSize: 44, marginBottom: 10 }}>🙏</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: RED }}>Prayer Submitted!</div>
                  <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>We're believing with you.</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 800, color: DARK, marginBottom: 12 }}>Add a Prayer Request</div>
                  <textarea
                    value={newPrayer}
                    onChange={e => setNewPrayer(e.target.value)}
                    placeholder="What would you like prayer for?"
                    rows={3}
                    style={{
                      width: "100%", background: SOFT_GRAY,
                      border: "none", borderRadius: 12,
                      padding: "12px 14px", fontSize: 14, color: DARK,
                      resize: "none", lineHeight: 1.6, marginBottom: 10,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  />
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <input
                      value={prayerName}
                      onChange={e => setPrayerName(e.target.value)}
                      disabled={isAnon}
                      placeholder="Your name (optional)"
                      style={{
                        flex: 1, background: SOFT_GRAY,
                        border: "none", borderRadius: 10,
                        padding: "10px 12px", fontSize: 13, color: isAnon ? "#BBB" : DARK,
                        fontFamily: "'Nunito', sans-serif"
                      }}
                    />
                    <button className="tab-btn" onClick={() => setIsAnon(!isAnon)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6,
                        border: `2px solid ${isAnon ? RED : "#CCC"}`,
                        background: isAnon ? RED : "transparent",
                        transition: "all 0.2s",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        {isAnon && <span style={{ color: "#FFF", fontSize: 12 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#888" }}>Anonymous</span>
                    </button>
                  </div>
                  <button className="pill-btn" onClick={handlePrayerSubmit} style={{
                    width: "100%", padding: "14px",
                    background: newPrayer.trim() ? `linear-gradient(135deg, ${RED}, #F05A27)` : SOFT_GRAY,
                    color: newPrayer.trim() ? WARM_WHITE : "#BBB",
                    fontSize: 14, fontWeight: 800,
                    transition: "all 0.3s",
                    boxShadow: newPrayer.trim() ? `0 6px 20px ${RED}40` : "none"
                  }}>
                    Submit Prayer Request 🙏
                  </button>
                </>
              )}
            </div>

            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: "#AAA", textTransform: "uppercase", marginBottom: 14 }}>
              Standing in Faith — {prayers.length} requests
            </div>

            {prayers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#BBB" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🙏</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>No prayer requests yet.</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Be the first to share your heart.</div>
              </div>
            ) : prayers.map(p => (
              <div key={p.id} style={{
                background: WARM_WHITE,
                borderRadius: 18, padding: "16px 18px",
                marginBottom: 10,
                borderTop: `4px solid ${p.color}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: p.color }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#BBB" }}>{p.time}</div>
                </div>
                <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 12 }}>
                  {expandedPrayer === p.id || p.request.length < 100 ? p.request : p.request.slice(0, 100) + "..."}
                  {p.request.length >= 100 && (
                    <button className="tab-btn" onClick={() => setExpandedPrayer(expandedPrayer === p.id ? null : p.id)}
                      style={{ color: p.color, fontSize: 12, fontWeight: 800, marginLeft: 4 }}>
                      {expandedPrayer === p.id ? "less" : "more"}
                    </button>
                  )}
                </div>
                <button className="tab-btn" onClick={() => toggleLike(p.id)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 100,
                  background: p.liked ? p.color + "15" : SOFT_GRAY,
                  transition: "all 0.2s"
                }}>
                  <span style={{ fontSize: 15 }}>{p.liked ? "🙏" : "🤍"}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: p.liked ? p.color : "#999" }}>
                    {p.likes} praying
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* EVENTS */}
        {tab === "events" && (
          <div className="fade-in" style={{ padding: "20px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: DARK }}>Upcoming Events</div>
              <DotRow gap={6} />
            </div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>Don't miss what God has next!</div>

            {EVENTS.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#BBB" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>No events yet.</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Stay tuned — something is coming!</div>
              </div>
            ) : EVENTS.map(e => (
              <div key={e.id} style={{
                background: WARM_WHITE,
                borderRadius: 20, padding: "16px 18px",
                marginBottom: 12,
                display: "flex", gap: 16, alignItems: "center",
                boxShadow: "0 3px 16px rgba(0,0,0,0.07)"
              }}>
                <div style={{
                  width: 56, height: 62, borderRadius: 16,
                  background: e.color,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: `0 4px 14px ${e.color}50`
                }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.8)", letterSpacing: "0.1em" }}>{e.month}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: WARM_WHITE, lineHeight: 1.1 }}>{e.day}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 4 }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>🕐 {e.time}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>📍 {e.location}</div>
                </div>
                <button style={{
                  padding: "8px 14px", borderRadius: 100,
                  background: e.color, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 900, color: WARM_WHITE,
                  letterSpacing: "0.05em",
                  boxShadow: `0 4px 14px ${e.color}50`
                }}>
                  RSVP
                </button>
              </div>
            ))}

            <div style={{
              borderRadius: 22,
              background: `linear-gradient(135deg, ${BLUE}18, ${YELLOW}18)`,
              border: `2px dashed ${BLUE}40`,
              padding: "22px", textAlign: "center"
            }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>📩</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 6 }}>Never Miss an Event</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.5 }}>
                Turn on notifications to hear about events the moment they're announced.
              </div>
            </div>
          </div>
        )}
        {/* WORSHIP */}
        {tab === "worship" && (
          <div className="fade-in" style={{ padding: "20px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: DARK }}>Praise Team</div>
              <DotRow gap={6} />
            </div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>Set list and resources for the team.</div>

            {/* Serve date banner */}
            <div style={{
              background: `linear-gradient(135deg, ${YELLOW}, #F8C04A)`,
              borderRadius: 18, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 12, marginBottom: 22,
              boxShadow: `0 6px 20px ${YELLOW}50`
            }}>
              <div style={{ fontSize: 28 }}>🎶</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Next Serve Date</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: WARM_WHITE }}>{SERVE_DATE}</div>
              </div>
            </div>

            {/* Set List */}
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: "#AAA", textTransform: "uppercase", marginBottom: 14 }}>
              Set List — {SETLIST.length} Songs
            </div>

            {SETLIST.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#BBB" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎵</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Set list coming soon.</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Check back before your next serve date.</div>
              </div>
            ) : SETLIST.map((song, i) => {
              const dotColors = [RED, BLUE, YELLOW, RED, BLUE];
              const accent = dotColors[i % dotColors.length];
              const tempoColors = { Slow: BLUE, Medium: YELLOW, Upbeat: RED };
              return (
                <div key={song.id} style={{
                  background: WARM_WHITE,
                  borderRadius: 18, padding: "14px 16px",
                  marginBottom: 10,
                  display: "flex", alignItems: "center", gap: 14,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                }}>
                  {/* Order number */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: accent + "18",
                    border: `2px solid ${accent}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 900, color: accent, flexShrink: 0
                  }}>{i + 1}</div>

                  {/* Song info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: DARK, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.title}</div>
                    <div style={{ fontSize: 12, color: "#999" }}>{song.artist}</div>
                  </div>

                  {/* Key badge */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                    <div style={{
                      background: accent, borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 13, fontWeight: 900, color: WARM_WHITE,
                      boxShadow: `0 2px 8px ${accent}50`
                    }}>
                      Key of {song.key}
                    </div>
                    <div style={{
                      background: (tempoColors[song.tempo] || YELLOW) + "18",
                      borderRadius: 6, padding: "2px 8px",
                      fontSize: 10, fontWeight: 800,
                      color: tempoColors[song.tempo] || YELLOW,
                      textTransform: "uppercase", letterSpacing: "0.08em"
                    }}>{song.tempo}</div>
                  </div>
                </div>
              );
            })}

            {/* Song Submission Form */}
            <div style={{ marginTop: 24, marginBottom: 4 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 4 }}>Suggest a Song</div>
              <div style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>Have a song you'd love to worship to? Submit it here!</div>
            </div>

            <div style={{
              background: WARM_WHITE,
              borderRadius: 22, padding: "18px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              border: `2px solid ${YELLOW}25`
            }}>
              {songSubmitted ? (
                <div style={{ textAlign: "center", padding: "20px 0" }} className="pop-in">
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎵</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: YELLOW }}>Song Submitted!</div>
                  <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>Thank you! We'll take a look.</div>
                </div>
              ) : (
                <>
                  {[
                    { field: "title", placeholder: "Song title *", required: true },
                    { field: "artist", placeholder: "Artist / Worship leader", required: false },
                    { field: "key", placeholder: "Key (if you know it)", required: false }
                  ].map(f => (
                    <input
                      key={f.field}
                      value={songSub[f.field]}
                      onChange={e => setSongSub({ ...songSub, [f.field]: e.target.value })}
                      placeholder={f.placeholder}
                      style={{
                        width: "100%", background: SOFT_GRAY,
                        border: "none", borderRadius: 10,
                        padding: "11px 14px", fontSize: 13, color: DARK,
                        marginBottom: 10, fontFamily: "'Nunito', sans-serif"
                      }}
                    />
                  ))}
                  <textarea
                    value={songSub.notes}
                    onChange={e => setSongSub({ ...songSub, notes: e.target.value })}
                    placeholder="Any notes or why you love this song? (optional)"
                    rows={2}
                    style={{
                      width: "100%", background: SOFT_GRAY,
                      border: "none", borderRadius: 10,
                      padding: "11px 14px", fontSize: 13, color: DARK,
                      resize: "none", lineHeight: 1.6, marginBottom: 12,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  />
                  <button className="pill-btn" onClick={handleSongSubmit} style={{
                    width: "100%", padding: "13px",
                    background: songSub.title.trim() ? `linear-gradient(135deg, ${YELLOW}, #F8C04A)` : SOFT_GRAY,
                    color: songSub.title.trim() ? WARM_WHITE : "#BBB",
                    fontSize: 14, fontWeight: 800,
                    transition: "all 0.3s",
                    boxShadow: songSub.title.trim() ? `0 6px 20px ${YELLOW}50` : "none"
                  }}>
                    Submit Song 🎶
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* CONNECT — Confidential Message */}
        {tab === "connect" && (
          <div className="fade-in" style={{ padding: "20px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: DARK }}>Connect With Us</div>
              <DotRow gap={6} />
            </div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>Your message goes directly to your youth leaders.</div>

            {/* Leader cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[
                { name: "Kindal White", role: "Youth Leader", emoji: "👩🏾", color: RED },
                { name: "George White", role: "Youth Leader", emoji: "👨🏾", color: BLUE }
              ].map((leader, i) => (
                <div key={i} style={{
                  background: WARM_WHITE,
                  borderRadius: 18, padding: "16px 14px",
                  textAlign: "center",
                  border: `2px solid ${leader.color}20`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: leader.color + "18",
                    border: `3px solid ${leader.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 26, margin: "0 auto 10px"
                  }}>{leader.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: DARK }}>{leader.name}</div>
                  <div style={{ fontSize: 11, color: leader.color, fontWeight: 700, marginTop: 2 }}>{leader.role}</div>
                </div>
              ))}
            </div>

            {/* Confidential notice */}
            <div style={{
              background: `${BLUE}10`,
              border: `2px solid ${BLUE}25`,
              borderRadius: 14, padding: "12px 16px",
              display: "flex", gap: 10, alignItems: "flex-start",
              marginBottom: 22
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.55 }}>
                <span style={{ fontWeight: 800, color: BLUE }}>This message is confidential.</span> Only Kindal and George will see what you share. You're safe here.
              </div>
            </div>

            {/* Message form */}
            <div style={{
              background: WARM_WHITE,
              borderRadius: 22, padding: "18px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              border: `2px solid ${BLUE}18`
            }}>
              {msgSubmitted ? (
                <div style={{ textAlign: "center", padding: "24px 0" }} className="pop-in">
                  <div style={{ fontSize: 44, marginBottom: 12 }}>💌</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: BLUE }}>Message Sent!</div>
                  <div style={{ fontSize: 13, color: "#999", marginTop: 6, lineHeight: 1.6 }}>
                    Kindal and George received your message. You are seen and you are loved.
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 800, color: DARK, marginBottom: 14 }}>Send a Private Message</div>
                  <input
                    value={message.name}
                    onChange={e => setMessage({ ...message, name: e.target.value })}
                    placeholder="Your name (optional — you can stay anonymous)"
                    style={{
                      width: "100%", background: SOFT_GRAY,
                      border: "none", borderRadius: 10,
                      padding: "11px 14px", fontSize: 13, color: DARK,
                      marginBottom: 10, fontFamily: "'Nunito', sans-serif"
                    }}
                  />
                  <input
                    value={message.email}
                    onChange={e => setMessage({ ...message, email: e.target.value })}
                    placeholder="Your email (optional — if you want a response)"
                    style={{
                      width: "100%", background: SOFT_GRAY,
                      border: "none", borderRadius: 10,
                      padding: "11px 14px", fontSize: 13, color: DARK,
                      marginBottom: 10, fontFamily: "'Nunito', sans-serif"
                    }}
                  />
                  <textarea
                    value={message.body}
                    onChange={e => setMessage({ ...message, body: e.target.value })}
                    placeholder="What's on your heart? You can share anything here — questions, concerns, something you're going through, or just a prayer request you didn't want to post publicly..."
                    rows={5}
                    style={{
                      width: "100%", background: SOFT_GRAY,
                      border: "none", borderRadius: 10,
                      padding: "12px 14px", fontSize: 13, color: DARK,
                      resize: "none", lineHeight: 1.7, marginBottom: 12,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  />
                  <button className="pill-btn" onClick={handleMsgSubmit} style={{
                    width: "100%", padding: "14px",
                    background: message.body.trim() ? `linear-gradient(135deg, ${BLUE}, #45C5F5)` : SOFT_GRAY,
                    color: message.body.trim() ? WARM_WHITE : "#BBB",
                    fontSize: 14, fontWeight: 800,
                    transition: "all 0.3s",
                    boxShadow: message.body.trim() ? `0 6px 20px ${BLUE}50` : "none"
                  }}>
                    Send Message 💌
                  </button>
                </>
              )}
            </div>
          </div>
        )}


        {/* COMMUNITY CHAT */}
        {tab === "chat" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>

            {/* Header */}
            <div style={{ padding: "20px 18px 12px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: DARK }}>Community Chat</div>
                <DotRow gap={6} />
              </div>
              <div style={{ fontSize: 13, color: "#999" }}>A space for The CHOSEN Collective to connect. Keep it kind. 💛</div>

              {/* Community guidelines pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
                background: `${YELLOW}18`, borderRadius: 100, padding: "5px 12px",
                border: `1px solid ${YELLOW}30`
              }}>
                <span style={{ fontSize: 12 }}>✨</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: YELLOW }}>Be uplifting · Be respectful · Represent Christ well</span>
              </div>
            </div>

            {/* Chat feed — scrollable */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 12px" }}>
              {chats.map((c, idx) => {
                const isLast = idx === chats.length - 1;
                return (
                  <div key={c.id} style={{ marginBottom: 16 }} className={isLast ? "pop-in" : ""}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      {/* Avatar */}
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: c.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 900, color: WARM_WHITE,
                        flexShrink: 0, boxShadow: `0 2px 8px ${c.color}50`
                      }}>{c.avatar}</div>

                      <div style={{ flex: 1 }}>
                        {/* Name + time */}
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 900, color: c.color }}>{c.name}</span>
                          <span style={{ fontSize: 11, color: "#BBB" }}>{c.time}</span>
                        </div>

                        {/* Bubble */}
                        <div style={{
                          background: WARM_WHITE,
                          borderRadius: "4px 18px 18px 18px",
                          padding: "12px 14px",
                          fontSize: 14, color: "#333", lineHeight: 1.6,
                          boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                          marginBottom: 8
                        }}>
                          {c.message}
                        </div>

                        {/* Existing reactions */}
                        {c.reactions.length > 0 && (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                            {c.reactions.map(r => (
                              <button key={r.emoji} className="tab-btn" onClick={() => handleReact(c.id, r.emoji)}>
                                <div style={{
                                  display: "flex", alignItems: "center", gap: 4,
                                  background: c.reacted.includes(r.emoji) ? c.color + "20" : SOFT_GRAY,
                                  border: c.reacted.includes(r.emoji) ? `1.5px solid ${c.color}50` : "1.5px solid transparent",
                                  borderRadius: 100, padding: "3px 9px",
                                  fontSize: 13, transition: "all 0.2s"
                                }}>
                                  <span>{r.emoji}</span>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: c.reacted.includes(r.emoji) ? c.color : "#888" }}>{r.count}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Quick react row */}
                        <div style={{ display: "flex", gap: 4 }}>
                          {QUICK_REACTIONS.map(emoji => (
                            <button key={emoji} className="tab-btn" onClick={() => handleReact(c.id, emoji)} style={{
                              width: 28, height: 28, borderRadius: 8,
                              background: SOFT_GRAY, fontSize: 14,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              opacity: 0.6
                            }}>{emoji}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compose area — pinned above nav */}
            <div style={{
              flexShrink: 0,
              background: WARM_WHITE,
              borderTop: `2px solid ${SOFT_GRAY}`,
              padding: "12px 16px 14px"
            }}>
              {/* Name input — only show until they've posted */}
              {!chatNameSaved && (
                <input
                  value={chatName}
                  onChange={e => setChatName(e.target.value)}
                  placeholder="Enter your name to chat..."
                  style={{
                    width: "100%", background: SOFT_GRAY,
                    border: "none", borderRadius: 10,
                    padding: "10px 14px", fontSize: 13, color: DARK,
                    marginBottom: 8, fontFamily: "'Nunito', sans-serif"
                  }}
                />
              )}
              {chatNameSaved && (
                <div style={{ fontSize: 12, color: "#AAA", marginBottom: 6, fontWeight: 700 }}>
                  Chatting as <span style={{ color: RED }}>{chatName}</span>
                  <button className="tab-btn" onClick={() => setChatNameSaved(false)} style={{ color: "#CCC", fontSize: 11, marginLeft: 8 }}>change</button>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatPost(); } }}
                  placeholder="Say something encouraging..."
                  rows={2}
                  style={{
                    flex: 1, background: SOFT_GRAY,
                    border: "none", borderRadius: 12,
                    padding: "10px 14px", fontSize: 13, color: DARK,
                    resize: "none", lineHeight: 1.5,
                    fontFamily: "'Nunito', sans-serif"
                  }}
                />
                <button
                  className="pill-btn"
                  onClick={handleChatPost}
                  style={{
                    width: 44, height: 44, flexShrink: 0,
                    background: chatMsg.trim() && chatName.trim()
                      ? `linear-gradient(135deg, ${RED}, #F05A27)`
                      : SOFT_GRAY,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, transition: "all 0.25s",
                    boxShadow: chatMsg.trim() && chatName.trim() ? `0 4px 14px ${RED}50` : "none"
                  }}
                >
                  {chatMsg.trim() && chatName.trim() ? "➤" : "✉"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation — 6 tabs, scrollable */}
      <div style={{
        position: "fixed", bottom: 0,
        left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: WARM_WHITE,
        borderTop: `2px solid ${SOFT_GRAY}`,
        padding: "8px 0 20px",
        overflowX: "auto",
        display: "flex",
        justifyContent: "space-around",
        gap: 0
      }}>
        {[
          { key: "home",    icon: "🏠", label: "Home",    color: BLUE },
          { key: "devo",    icon: "📖", label: "Devo",    color: RED },
          { key: "prayer",  icon: "🙏", label: "Prayer",  color: RED },
          { key: "worship", icon: "🎶", label: "Worship", color: YELLOW },
          { key: "chat",    icon: "💬", label: "Chat",    color: BLUE },
          { key: "connect", icon: "💌", label: "Connect", color: BLUE }
        ].map(n => {
          const active = tab === n.key;
          return (
            <button key={n.key} className="tab-btn" onClick={() => setTab(n.key)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 11,
                background: active ? n.color : SOFT_GRAY,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, transition: "all 0.2s",
                boxShadow: active ? `0 3px 12px ${n.color}50` : "none",
                transform: active ? "scale(1.12)" : "scale(1)"
              }}>
                {n.icon}
              </div>
              <span style={{
                fontSize: 8, fontWeight: 900, letterSpacing: "0.04em",
                color: active ? n.color : "#CCC",
                textTransform: "uppercase"
              }}>{n.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── ADMIN PANEL OVERLAY ── */}
      {showAdmin && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: CREAM, maxWidth: 430, margin: "0 auto",
          display: "flex", flexDirection: "column", overflowY: "auto"
        }}>
          {/* Admin Header */}
          <div style={{
            background: DARK, padding: "18px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "sticky", top: 0, zIndex: 10
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: YELLOW, letterSpacing: "0.15em", textTransform: "uppercase" }}>Admin Panel</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: WARM_WHITE }}>The CHOSEN Collective</div>
            </div>
            <button className="tab-btn" onClick={() => { setShowAdmin(false); setAdminUnlocked(false); }} style={{
              background: "rgba(255,255,255,0.1)", borderRadius: 10,
              padding: "8px 14px", fontSize: 12, fontWeight: 800, color: WARM_WHITE
            }}>✕ Close</button>
          </div>

          {/* Password Gate */}
          {!adminUnlocked ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
              <div style={{ width: "100%", maxWidth: 340 }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>🔐</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: DARK }}>Leaders Only</div>
                  <div style={{ fontSize: 13, color: "#999", marginTop: 6 }}>Enter your admin password to continue.</div>
                </div>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={e => { setAdminPassword(e.target.value); setAdminPasswordError(false); }}
                  onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                  placeholder="Enter password"
                  style={{
                    width: "100%", background: WARM_WHITE,
                    border: `2px solid ${adminPasswordError ? RED : "#E8E4DC"}`,
                    borderRadius: 12, padding: "14px 16px",
                    fontSize: 15, color: DARK, marginBottom: 12,
                    fontFamily: "'Nunito', sans-serif", textAlign: "center"
                  }}
                />
                {adminPasswordError && (
                  <div style={{ fontSize: 12, color: RED, fontWeight: 700, textAlign: "center", marginBottom: 10 }}>
                    Incorrect password. Try again.
                  </div>
                )}
                <button className="pill-btn" onClick={handleAdminLogin} style={{
                  width: "100%", padding: "14px",
                  background: `linear-gradient(135deg, ${DARK}, #333)`,
                  color: WARM_WHITE, fontSize: 14, fontWeight: 800
                }}>Unlock Admin Panel</button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1 }}>

              {/* Saved flash */}
              {adminSaved && (
                <div style={{
                  position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)",
                  background: "#22C55E", color: WARM_WHITE, borderRadius: 100,
                  padding: "8px 20px", fontSize: 13, fontWeight: 800,
                  zIndex: 100, boxShadow: "0 4px 16px rgba(34,197,94,0.4)"
                }} className="pop-in">✓ Saved!</div>
              )}

              {/* Admin Tabs */}
              <div style={{
                display: "flex", overflowX: "auto", gap: 8,
                padding: "14px 16px", background: WARM_WHITE,
                borderBottom: `2px solid ${SOFT_GRAY}`, position: "sticky", top: 62, zIndex: 9
              }}>
                {[
                  { key: "announcements", label: "📣 News" },
                  { key: "events",        label: "📅 Events" },
                  { key: "devotionals",   label: "📖 Devos" },
                  { key: "worship",       label: "🎶 Worship" }
                ].map(t => (
                  <button key={t.key} className="tab-btn" onClick={() => setAdminTab(t.key)}>
                    <div style={{
                      padding: "8px 14px", borderRadius: 100, whiteSpace: "nowrap",
                      background: adminTab === t.key ? DARK : SOFT_GRAY,
                      color: adminTab === t.key ? WARM_WHITE : "#777",
                      fontSize: 12, fontWeight: 800, transition: "all 0.2s"
                    }}>{t.label}</div>
                  </button>
                ))}
              </div>

              <div style={{ padding: "20px 18px" }}>

                {/* ── ANNOUNCEMENTS ── */}
                {adminTab === "announcements" && (
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 16 }}>Add Announcement</div>
                    <div style={{ background: WARM_WHITE, borderRadius: 20, padding: 18, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                      {[
                        { key: "emoji", placeholder: "Emoji (e.g. 🔥)" },
                        { key: "title", placeholder: "Title *" },
                        { key: "detail", placeholder: "Details" },
                        { key: "date", placeholder: "Date (e.g. May 3)" }
                      ].map(f => (
                        <input key={f.key} value={newAnn[f.key]} onChange={e => setNewAnn({ ...newAnn, [f.key]: e.target.value })}
                          placeholder={f.placeholder} style={{ width: "100%", background: SOFT_GRAY, border: "none", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: DARK, marginBottom: 10, fontFamily: "'Nunito', sans-serif" }} />
                      ))}
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        {[RED, BLUE, YELLOW].map(c => (
                          <button key={c} className="tab-btn" onClick={() => setNewAnn({ ...newAnn, color: c })}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: c, border: newAnn.color === c ? `3px solid ${DARK}` : "3px solid transparent" }} />
                          </button>
                        ))}
                        <span style={{ fontSize: 12, color: "#999", alignSelf: "center" }}>Pick color</span>
                      </div>
                      <button className="pill-btn" onClick={addAnnouncement} style={{ width: "100%", padding: 13, background: `linear-gradient(135deg, ${RED}, #F05A27)`, color: WARM_WHITE, fontSize: 14, fontWeight: 800 }}>
                        Add Announcement
                      </button>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 800, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Current Announcements ({adminAnnouncements.length})</div>
                    {adminAnnouncements.length === 0 && <div style={{ color: "#CCC", fontSize: 13, textAlign: "center", padding: "16px 0" }}>No announcements yet.</div>}
                    {adminAnnouncements.map(a => (
                      <div key={a.id} style={{ background: WARM_WHITE, borderRadius: 14, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10, borderLeft: `4px solid ${a.color}` }}>
                        <span style={{ fontSize: 18 }}>{a.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: DARK }}>{a.title}</div>
                          <div style={{ fontSize: 11, color: "#999" }}>{a.date}</div>
                        </div>
                        <button className="tab-btn" onClick={() => removeAnnouncement(a.id)} style={{ fontSize: 18, color: "#DDD" }}>🗑</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── EVENTS ── */}
                {adminTab === "events" && (
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 16 }}>Add Event</div>
                    <div style={{ background: WARM_WHITE, borderRadius: 20, padding: 18, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        {[
                          { key: "month", placeholder: "Month (e.g. MAY)" },
                          { key: "day",   placeholder: "Day (e.g. 10)" }
                        ].map(f => (
                          <input key={f.key} value={newEvent[f.key]} onChange={e => setNewEvent({ ...newEvent, [f.key]: e.target.value })}
                            placeholder={f.placeholder} style={{ background: SOFT_GRAY, border: "none", borderRadius: 10, padding: "11px 12px", fontSize: 13, color: DARK, fontFamily: "'Nunito', sans-serif" }} />
                        ))}
                      </div>
                      {[
                        { key: "title",    placeholder: "Event name *" },
                        { key: "time",     placeholder: "Time (e.g. 7:00 PM)" },
                        { key: "location", placeholder: "Location" }
                      ].map(f => (
                        <input key={f.key} value={newEvent[f.key]} onChange={e => setNewEvent({ ...newEvent, [f.key]: e.target.value })}
                          placeholder={f.placeholder} style={{ width: "100%", background: SOFT_GRAY, border: "none", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: DARK, marginBottom: 10, fontFamily: "'Nunito', sans-serif" }} />
                      ))}
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        {[RED, BLUE, YELLOW].map(c => (
                          <button key={c} className="tab-btn" onClick={() => setNewEvent({ ...newEvent, color: c })}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: c, border: newEvent.color === c ? `3px solid ${DARK}` : "3px solid transparent" }} />
                          </button>
                        ))}
                        <span style={{ fontSize: 12, color: "#999", alignSelf: "center" }}>Pick color</span>
                      </div>
                      <button className="pill-btn" onClick={addEvent} style={{ width: "100%", padding: 13, background: `linear-gradient(135deg, ${BLUE}, #45C5F5)`, color: WARM_WHITE, fontSize: 14, fontWeight: 800 }}>
                        Add Event
                      </button>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 800, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Current Events ({adminEvents.length})</div>
                    {adminEvents.length === 0 && <div style={{ color: "#CCC", fontSize: 13, textAlign: "center", padding: "16px 0" }}>No events yet.</div>}
                    {adminEvents.map(e => (
                      <div key={e.id} style={{ background: WARM_WHITE, borderRadius: 14, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 44, borderRadius: 10, background: e.color, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <div style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.8)" }}>{e.month}</div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: WARM_WHITE }}>{e.day}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: DARK }}>{e.title}</div>
                          <div style={{ fontSize: 11, color: "#999" }}>{e.time} · {e.location}</div>
                        </div>
                        <button className="tab-btn" onClick={() => removeEvent(e.id)} style={{ fontSize: 18, color: "#DDD" }}>🗑</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── DEVOTIONALS ── */}
                {adminTab === "devotionals" && (
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 16 }}>Add Devotional</div>
                    <div style={{ background: WARM_WHITE, borderRadius: 20, padding: 18, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                      {[
                        { key: "date",       placeholder: "Date (e.g. May 3, 2026)" },
                        { key: "title",      placeholder: "Devotional title *" },
                        { key: "verse",      placeholder: "Scripture verse (include reference)" },
                      ].map(f => (
                        <input key={f.key} value={newDevo[f.key]} onChange={e => setNewDevo({ ...newDevo, [f.key]: e.target.value })}
                          placeholder={f.placeholder} style={{ width: "100%", background: SOFT_GRAY, border: "none", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: DARK, marginBottom: 10, fontFamily: "'Nunito', sans-serif" }} />
                      ))}
                      {[
                        { key: "body",       placeholder: "Devotional message..." },
                        { key: "reflection", placeholder: "Reflection question..." }
                      ].map(f => (
                        <textarea key={f.key} value={newDevo[f.key]} onChange={e => setNewDevo({ ...newDevo, [f.key]: e.target.value })}
                          placeholder={f.placeholder} rows={3}
                          style={{ width: "100%", background: SOFT_GRAY, border: "none", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: DARK, resize: "none", lineHeight: 1.6, marginBottom: 10, fontFamily: "'Nunito', sans-serif" }} />
                      ))}
                      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        {[RED, BLUE, YELLOW].map(c => (
                          <button key={c} className="tab-btn" onClick={() => setNewDevo({ ...newDevo, color: c })}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: c, border: newDevo.color === c ? `3px solid ${DARK}` : "3px solid transparent" }} />
                          </button>
                        ))}
                        <span style={{ fontSize: 12, color: "#999", alignSelf: "center" }}>Pick accent color</span>
                      </div>
                      <button className="pill-btn" onClick={saveDevo} style={{ width: "100%", padding: 13, background: `linear-gradient(135deg, ${RED}, #F05A27)`, color: WARM_WHITE, fontSize: 14, fontWeight: 800 }}>
                        Publish Devotional
                      </button>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 800, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Published Devotionals ({adminDevotionals.length})</div>
                    {adminDevotionals.map(d => (
                      <div key={d.id} style={{ background: WARM_WHITE, borderRadius: 14, padding: "12px 16px", marginBottom: 8, borderLeft: `4px solid ${d.color}` }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: DARK }}>{d.title}</div>
                        <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{d.date}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── WORSHIP ── */}
                {adminTab === "worship" && (
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 16 }}>Worship & Set List</div>

                    {/* Serve date */}
                    <div style={{ background: WARM_WHITE, borderRadius: 20, padding: 18, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: DARK, marginBottom: 10 }}>Next Serve Date</div>
                      <input value={adminServeDate} onChange={e => setAdminServeDate(e.target.value)}
                        placeholder="e.g. Friday, May 9, 2026"
                        style={{ width: "100%", background: SOFT_GRAY, border: "none", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: DARK, marginBottom: 12, fontFamily: "'Nunito', sans-serif" }} />
                      <button className="pill-btn" onClick={saveAndFlash} style={{ width: "100%", padding: 12, background: `linear-gradient(135deg, ${YELLOW}, #F8C04A)`, color: WARM_WHITE, fontSize: 13, fontWeight: 800 }}>
                        Save Serve Date
                      </button>
                    </div>

                    {/* Add song */}
                    <div style={{ background: WARM_WHITE, borderRadius: 20, padding: 18, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: DARK, marginBottom: 10 }}>Add Song to Set List</div>
                      {[
                        { key: "title",  placeholder: "Song title *" },
                        { key: "artist", placeholder: "Artist" },
                        { key: "key",    placeholder: "Key (e.g. G, B♭, F#)" }
                      ].map(f => (
                        <input key={f.key} value={newSong[f.key]} onChange={e => setNewSong({ ...newSong, [f.key]: e.target.value })}
                          placeholder={f.placeholder} style={{ width: "100%", background: SOFT_GRAY, border: "none", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: DARK, marginBottom: 10, fontFamily: "'Nunito', sans-serif" }} />
                      ))}
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        {["Slow", "Medium", "Upbeat"].map(t => (
                          <button key={t} className="tab-btn" onClick={() => setNewSong({ ...newSong, tempo: t })}>
                            <div style={{ padding: "7px 14px", borderRadius: 100, background: newSong.tempo === t ? DARK : SOFT_GRAY, color: newSong.tempo === t ? WARM_WHITE : "#777", fontSize: 12, fontWeight: 800 }}>{t}</div>
                          </button>
                        ))}
                      </div>
                      <button className="pill-btn" onClick={addSong} style={{ width: "100%", padding: 13, background: `linear-gradient(135deg, ${YELLOW}, #F8C04A)`, color: WARM_WHITE, fontSize: 14, fontWeight: 800 }}>
                        Add to Set List
                      </button>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 800, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Current Set List ({adminSetlist.length} songs)</div>
                    {adminSetlist.length === 0 && <div style={{ color: "#CCC", fontSize: 13, textAlign: "center", padding: "16px 0" }}>No songs yet.</div>}
                    {adminSetlist.map((s, i) => (
                      <div key={s.id} style={{ background: WARM_WHITE, borderRadius: 14, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: [RED,BLUE,YELLOW][i%3] + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: [RED,BLUE,YELLOW][i%3] }}>{i+1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: DARK }}>{s.title}</div>
                          <div style={{ fontSize: 11, color: "#999" }}>{s.artist} · Key of {s.key} · {s.tempo}</div>
                        </div>
                        <button className="tab-btn" onClick={() => removeSong(s.id)} style={{ fontSize: 18, color: "#DDD" }}>🗑</button>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}