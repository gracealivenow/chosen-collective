import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import DotRow from '../components/DotRow';

const RED = '#E8302A';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';

const FALLBACK_DEVO = {
  id: 1,
  date: '',
  title: 'Coming Soon',
  verse: '"Your word is a lamp for my feet and a light on my path." - Psalm 119:105 CSB',
  body: 'Your first devotional will appear here. Check back soon!',
  reflection: 'What is God speaking to you today?',
  color: RED,
};

export default function DevoScreen() {
  const [devo, setDevo] = useState(FALLBACK_DEVO);

  useEffect(() => {
    const q = query(collection(db, 'devotionals'), orderBy('id', 'desc'), limit(1));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setDevo(snap.docs[0].data());
    });
    return unsub;
  }, []);

  const accentColor = devo.color || RED;

  return (
    <div style={s.outer}>
      <div style={s.topRow}>
        <h1 style={s.pageTitle}>Daily Devotional</h1>
        <DotRow />
      </div>

      <div style={s.card}>
        {/* Header */}
        <div style={{ ...s.cardHeader, backgroundColor: accentColor }}>
          <div style={s.bubble1} />
          <div style={s.bubble2} />
          {devo.date && <div style={s.cardDate}>{devo.date}</div>}
          <h2 style={s.cardTitle}>{devo.title}</h2>
          <div style={s.verseBox}>
            <p style={s.verseText}>{devo.verse}</p>
          </div>
        </div>

        {/* Body */}
        <div style={s.cardBody}>
          <p style={s.bodyText}>{devo.body}</p>
          <div style={{ ...s.reflectBox, borderLeft: `4px solid ${accentColor}` }}>
            <div style={{ ...s.reflectLabel, color: accentColor }}>REFLECT ON THIS</div>
            <p style={s.reflectText}>{devo.reflection}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  outer: { backgroundColor: CREAM, minHeight: '100vh', paddingBottom: 100 },
  topRow: {
    padding: '20px 18px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  pageTitle: { fontSize: 18, fontWeight: 900, color: DARK, margin: 0 },
  card: {
    margin: '8px 18px 0', borderRadius: 24, overflow: 'hidden',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  },
  cardHeader: { padding: 24, position: 'relative', overflow: 'hidden' },
  bubble1: {
    position: 'absolute', top: -20, right: -20,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bubble2: {
    position: 'absolute', bottom: -30, right: 20,
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  cardDate: {
    fontSize: 11, fontWeight: 800, letterSpacing: 2,
    color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase',
    marginBottom: 8, position: 'relative',
  },
  cardTitle: {
    fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700,
    color: '#FFFFFF', lineHeight: 1.3, marginBottom: 16,
    margin: '0 0 16px', position: 'relative',
  },
  verseBox: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, padding: 14,
    borderLeft: '3px solid rgba(255,255,255,0.5)', position: 'relative',
  },
  verseText: { fontSize: 14, fontStyle: 'italic', color: '#FFFFFF', lineHeight: 1.6, margin: 0 },
  cardBody: { backgroundColor: WARM_WHITE, padding: 22 },
  bodyText: { fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 20, margin: '0 0 20px' },
  reflectBox: { backgroundColor: SOFT_GRAY, borderRadius: 16, padding: 16 },
  reflectLabel: {
    fontSize: 11, fontWeight: 800, letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 8,
  },
  reflectText: { fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 },
};