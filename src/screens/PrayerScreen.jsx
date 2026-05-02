import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';
import DotRow from '../components/DotRow';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';

function timeAgo(iso) {
  if (!iso) return 'just now';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PrayerScreen() {
  const { profile } = useUser();
  const [prayers, setPrayers] = useState([]);
  const [newPrayer, setNewPrayer] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'prayers'), orderBy('id', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPrayers(snap.docs.map((d) => ({ ...d.data(), docId: d.id })));
    });
    return unsub;
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newPrayer.trim()) return;
    const colors = [RED, BLUE, YELLOW];
    const entry = {
      id: Date.now(),
      name: isAnon ? 'Anonymous' : profile?.fullName || 'Anonymous',
      request: newPrayer.trim(),
      time: new Date().toISOString(),
      likes: 0,
      color: profile?.avatarColor || colors[Math.floor(Math.random() * 3)],
    };
    await addDoc(collection(db, 'prayers'), entry);
    setNewPrayer('');
    setIsAnon(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleLike = async (docId, currentLikes) => {
    await updateDoc(doc(db, 'prayers', docId), { likes: (currentLikes || 0) + 1 });
  };

  return (
    <div style={s.outer}>
      <div style={s.topRow}>
        <div>
          <h1 style={s.pageTitle}>Prayer Wall</h1>
          <p style={s.pageSub}>Share your heart. Stand in faith together.</p>
        </div>
        <DotRow />
      </div>

      {/* Submit Form */}
      <form style={s.formCard} onSubmit={handleSubmit}>
        {submitted ? (
          <div style={s.successBox}>
            <span style={{ fontSize: 40, marginBottom: 10 }}>🙏</span>
            <div style={s.successTitle}>Prayer Submitted!</div>
            <div style={s.successSub}>We're believing with you.</div>
          </div>
        ) : (
          <>
            <div style={s.formTitle}>Add a Prayer Request</div>
            <div style={s.postingAs}>
              <div style={{ ...s.miniAvatar, backgroundColor: profile?.avatarColor || RED }}>
                <span style={s.miniAvatarText}>{profile?.initials || '??'}</span>
              </div>
              <span style={s.postingAsText}>
                Posting as{' '}
                <span style={{ color: profile?.avatarColor || RED, fontWeight: 800 }}>
                  {isAnon ? 'Anonymous' : profile?.fullName || 'Anonymous'}
                </span>
              </span>
            </div>
            <textarea
              value={newPrayer}
              onChange={(e) => setNewPrayer(e.target.value)}
              placeholder="What would you like prayer for?"
              rows={3}
              style={s.textArea}
            />
            <div style={s.anonRow}>
              <button
                type="button"
                onClick={() => setIsAnon(!isAnon)}
                style={s.anonToggle}
              >
                <span style={{ ...s.checkbox, ...(isAnon && { backgroundColor: RED, borderColor: RED }) }}>
                  {isAnon && <span style={{ color: '#FFF', fontSize: 11 }}>✓</span>}
                </span>
                <span style={s.anonLabel}>Post anonymously</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={!newPrayer.trim()}
              style={{
                ...s.submitBtn,
                ...(!newPrayer.trim() && { backgroundColor: SOFT_GRAY, color: '#BBB', boxShadow: 'none' }),
              }}
            >
              Submit Prayer Request 🙏
            </button>
          </>
        )}
      </form>

      {/* Prayer List */}
      <div style={s.section}>
        <div style={s.countLabel}>
          Standing in Faith — {prayers.length} {prayers.length === 1 ? 'request' : 'requests'}
        </div>
        {prayers.length === 0 ? (
          <div style={s.emptyState}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>🙏</span>
            <div style={s.emptyText}>No prayer requests yet.</div>
            <div style={s.emptySub}>Be the first to share your heart.</div>
          </div>
        ) : (
          prayers.map((p, i) => {
            const accent = p.color || RED;
            const isExpanded = expanded === i;
            const isLong = p.request.length >= 100;
            const displayText = isExpanded || !isLong ? p.request : p.request.slice(0, 100) + '...';
            return (
              <div key={i} style={{ ...s.prayerCard, borderTop: `4px solid ${accent}` }}>
                <div style={s.prayerHeader}>
                  <span style={{ ...s.prayerName, color: accent }}>{p.name}</span>
                  <span style={s.prayerTime}>{timeAgo(p.time)}</span>
                </div>
                <p style={s.prayerText}>{displayText}</p>
                {isLong && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : i)}
                    style={{ ...s.moreBtn, color: accent }}
                  >
                    {isExpanded ? 'less' : 'more'}
                  </button>
                )}
                <button
                  onClick={() => handleLike(p.docId, p.likes)}
                  style={s.likeBtn}
                >
                  <span style={{ fontSize: 15 }}>🙏</span>
                  <span style={{ ...s.likeBtnText, color: accent }}>
                    {p.likes || 0} praying
                  </span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const s = {
  outer: { backgroundColor: CREAM, minHeight: '100vh', paddingBottom: 100 },
  topRow: {
    padding: '20px 18px 4px',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
  },
  pageTitle: { fontSize: 18, fontWeight: 900, color: DARK, margin: 0 },
  pageSub: { fontSize: 13, color: '#999', marginTop: 2, margin: '2px 0 0' },
  formCard: {
    margin: 18, backgroundColor: WARM_WHITE, borderRadius: 22, padding: 18,
    boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
    border: `1px solid ${RED}18`,
  },
  formTitle: { fontSize: 14, fontWeight: 800, color: DARK, marginBottom: 12 },
  postingAs: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  miniAvatar: {
    width: 26, height: 26, borderRadius: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  miniAvatarText: { fontSize: 9, fontWeight: 900, color: '#FFF' },
  postingAsText: { fontSize: 13, color: '#AAA' },
  textArea: {
    width: '100%', backgroundColor: SOFT_GRAY, borderRadius: 12, padding: 12,
    fontSize: 14, color: DARK, minHeight: 80, marginBottom: 10,
    border: 'none', outline: 'none', resize: 'vertical',
    fontFamily: 'inherit', boxSizing: 'border-box',
  },
  anonRow: { marginBottom: 12 },
  anonToggle: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 0, fontFamily: 'inherit',
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    border: '2px solid #CCC',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  anonLabel: { fontSize: 12, fontWeight: 700, color: '#888' },
  submitBtn: {
    width: '100%', backgroundColor: RED, borderRadius: 100,
    padding: 14, color: WARM_WHITE, fontSize: 14, fontWeight: 800,
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 6px 12px rgba(232, 48, 42, 0.3)',
  },
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' },
  successTitle: { fontSize: 16, fontWeight: 900, color: RED },
  successSub: { fontSize: 13, color: '#999', marginTop: 4 },
  section: { padding: '0 18px' },
  countLabel: {
    fontSize: 12, fontWeight: 800, color: '#AAA',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14,
  },
  prayerCard: {
    backgroundColor: WARM_WHITE, borderRadius: 18, padding: 16, marginBottom: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  prayerHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  prayerName: { fontSize: 13, fontWeight: 800 },
  prayerTime: { fontSize: 11, color: '#BBB' },
  prayerText: { fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 12, margin: '0 0 12px' },
  moreBtn: {
    fontSize: 12, fontWeight: 800, marginBottom: 10,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 0, fontFamily: 'inherit',
  },
  likeBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 100,
    backgroundColor: SOFT_GRAY, border: 'none', cursor: 'pointer',
    fontFamily: 'inherit',
  },
  likeBtnText: { fontSize: 12, fontWeight: 800 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 13, fontWeight: 700, color: '#BBB', marginTop: 8 },
  emptySub: { fontSize: 12, color: '#CCC', marginTop: 4 },
};