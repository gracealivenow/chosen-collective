import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';
import DotRow from '../components/DotRow';
import kindalPhoto from '../assets/kindal.avif';
import georgePhoto from '../assets/george.avif';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';

emailjs.init('ZO9Pl_54bMxJkS-Hs');

const LEADERS = [
  { name: 'Kindal White', role: 'Youth Leader', color: RED, photo: kindalPhoto },
  { name: 'George White', role: 'Youth Leader', color: BLUE, photo: georgePhoto },
];

export default function ConnectScreen() {
  const { profile } = useUser();
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!body.trim()) return;
    const entry = {
      id: Date.now(),
      name: profile?.fullName || 'Anonymous',
      email: profile?.email || '',
      body: body.trim(),
      time: new Date().toISOString(),
      read: false,
    };
    await addDoc(collection(db, 'messages'), entry);
    emailjs
      .send('service_mwzf07u', 'template_ndlfg0j', {
        subject: `💌 Confidential Message from ${entry.name} — The CHOSEN Collective`,
        message: `FROM: ${entry.name}\n${entry.email ? `REPLY TO: ${entry.email}` : 'No reply email provided'}\n\nMESSAGE:\n${entry.body}\n\n---\nSent via The CHOSEN Collective App`,
      })
      .catch(console.error);
    setBody('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div style={s.outer}>
      <div style={s.topRow}>
        <div>
          <h1 style={s.pageTitle}>Connect With Us</h1>
          <p style={s.pageSub}>Your message goes directly to your youth leaders.</p>
        </div>
        <DotRow />
      </div>

      {/* Leader Cards */}
      <div style={s.leadersRow}>
        {LEADERS.map((leader, i) => (
          <div key={i} style={{ ...s.leaderCard, border: `2px solid ${leader.color}20` }}>
            <img
              src={leader.photo}
              alt={leader.name}
              style={{ ...s.leaderPhoto, border: `3px solid ${leader.color}` }}
            />
            <div style={s.leaderName}>{leader.name}</div>
            <div style={{ ...s.leaderRole, color: leader.color }}>{leader.role}</div>
          </div>
        ))}
      </div>

      {/* Confidential Notice */}
      <div style={s.confidentialBox}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
        <p style={s.confidentialText}>
          <span style={{ fontWeight: 800, color: BLUE }}>This message is confidential. </span>
          Only Kindal and George will see what you share. You're safe here.
        </p>
      </div>

      {/* Message Form */}
      <form style={s.formCard} onSubmit={handleSubmit}>
        {submitted ? (
          <div style={s.successBox}>
            <span style={{ fontSize: 44, marginBottom: 12 }}>💌</span>
            <div style={s.successTitle}>Message Sent!</div>
            <div style={s.successSub}>
              Kindal and George received your message.
              <br />
              You are seen and you are loved.
            </div>
          </div>
        ) : (
          <>
            <div style={s.formTitle}>Send a Private Message</div>
            <div style={s.sendingAs}>
              <div style={{ ...s.miniAvatar, backgroundColor: profile?.avatarColor || RED }}>
                <span style={s.miniAvatarText}>{profile?.initials || '??'}</span>
              </div>
              <div>
                <div style={s.sendingAsName}>{profile?.fullName || 'Anonymous'}</div>
                <div style={s.sendingAsEmail}>{profile?.email || ''}</div>
              </div>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's on your heart? You can share anything here — questions, concerns, something you're going through, or just a prayer request you didn't want to post publicly..."
              rows={5}
              style={{ ...s.input, minHeight: 120, resize: 'vertical' }}
            />
            <button
              type="submit"
              disabled={!body.trim()}
              style={{
                ...s.submitBtn,
                ...(!body.trim() && { backgroundColor: SOFT_GRAY, color: '#BBB', boxShadow: 'none' }),
              }}
            >
              Send Message 💌
            </button>
          </>
        )}
      </form>
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
  leadersRow: {
    display: 'flex', gap: 10,
    padding: '0 18px', marginTop: 16, marginBottom: 16,
  },
  leaderCard: {
    flex: 1, backgroundColor: WARM_WHITE, borderRadius: 18,
    padding: 16,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  leaderPhoto: {
    width: 70, height: 70, borderRadius: 35,
    marginBottom: 10, objectFit: 'cover',
  },
  leaderName: { fontSize: 13, fontWeight: 900, color: DARK, textAlign: 'center' },
  leaderRole: { fontSize: 11, fontWeight: 700, marginTop: 2 },
  confidentialBox: {
    margin: '0 18px 16px',
    backgroundColor: BLUE + '10', borderRadius: 14, padding: 14,
    display: 'flex', gap: 10, alignItems: 'flex-start',
    border: `1px solid ${BLUE}25`,
  },
  confidentialText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 1.5, margin: 0 },
  formCard: {
    margin: '0 18px', backgroundColor: WARM_WHITE, borderRadius: 22, padding: 18,
    boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
    border: `1px solid ${BLUE}18`,
  },
  formTitle: { fontSize: 14, fontWeight: 800, color: DARK, marginBottom: 14 },
  sendingAs: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
    padding: 12, backgroundColor: SOFT_GRAY, borderRadius: 12,
  },
  miniAvatar: {
    width: 36, height: 36, borderRadius: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  miniAvatarText: { fontSize: 12, fontWeight: 900, color: '#FFF' },
  sendingAsName: { fontSize: 13, fontWeight: 800, color: DARK },
  sendingAsEmail: { fontSize: 11, color: '#999', marginTop: 1 },
  input: {
    width: '100%', backgroundColor: SOFT_GRAY, borderRadius: 10,
    padding: 11, fontSize: 13, color: DARK, marginBottom: 10,
    border: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%', backgroundColor: BLUE, borderRadius: 100,
    padding: 14, color: WARM_WHITE, fontSize: 14, fontWeight: 800,
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 6px 12px rgba(41, 171, 226, 0.3)',
  },
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' },
  successTitle: { fontSize: 16, fontWeight: 900, color: BLUE },
  successSub: { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center', lineHeight: 1.5 },
};