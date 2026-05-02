import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, addDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { db } from '../config/firebase';
import DotRow from '../components/DotRow';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';

emailjs.init('ZO9Pl_54bMxJkS-Hs');

const TEMPO_COLORS = { Slow: BLUE, Medium: YELLOW, Upbeat: RED };
const DOT_COLORS = [RED, BLUE, YELLOW, RED, BLUE];

export default function WorshipScreen() {
  const [setlist, setSetlist] = useState([]);
  const [serveDate, setServeDate] = useState('Date coming soon');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [songKey, setSongKey] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'setlist'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setSetlist(snap.docs.map((d) => d.data()));
    });
    const sdUnsub = onSnapshot(collection(db, 'serve_date'), (snap) => {
      if (!snap.empty) setServeDate(snap.docs[0].data().date || 'Date coming soon');
    });
    return () => {
      unsub();
      sdUnsub();
    };
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;
    const entry = {
      id: Date.now(),
      title: title.trim(),
      artist: artist.trim(),
      key: songKey.trim(),
      notes: notes.trim(),
      time: new Date().toISOString(),
    };
    await addDoc(collection(db, 'song_suggestions'), entry);
    emailjs
      .send('service_mwzf07u', 'template_ndlfg0j', {
        subject: '🎶 New Song Suggestion — The CHOSEN Collective',
        message: `SONG TITLE: ${entry.title}\n${entry.artist ? `ARTIST: ${entry.artist}\n` : ''}${entry.key ? `KEY: ${entry.key}\n` : ''}${entry.notes ? `\nNOTES: "${entry.notes}"` : ''}\n\n---\nSent via The CHOSEN Collective App`,
      })
      .catch(console.error);
    setTitle('');
    setArtist('');
    setSongKey('');
    setNotes('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <div style={s.outer}>
      <div style={s.topRow}>
        <div>
          <h1 style={s.pageTitle}>Praise Team</h1>
          <p style={s.pageSub}>Set list and resources for the team.</p>
        </div>
        <DotRow />
      </div>

      {/* Serve Date Banner */}
      <div style={s.serveBanner}>
        <span style={{ fontSize: 28 }}>🎶</span>
        <div>
          <div style={s.serveBannerLabel}>NEXT SERVE DATE</div>
          <div style={s.serveBannerDate}>{serveDate}</div>
        </div>
      </div>

      {/* Set List */}
      <div style={s.section}>
        <div style={s.sectionLabel}>
          Set List — {setlist.length} {setlist.length === 1 ? 'Song' : 'Songs'}
        </div>
        {setlist.length === 0 ? (
          <div style={s.emptyState}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>🎵</span>
            <div style={s.emptyText}>Set list coming soon.</div>
            <div style={s.emptySub}>Check back before your next serve date.</div>
          </div>
        ) : (
          setlist.map((song, i) => {
            const color = DOT_COLORS[i % 5];
            return (
              <div key={i} style={s.songCard}>
                <div style={{ ...s.songNumber, backgroundColor: color + '18', border: `2px solid ${color}30` }}>
                  <span style={{ ...s.songNumberText, color }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.songTitle}>{song.title}</div>
                  <div style={s.songArtist}>{song.artist}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {song.key && song.key.trim().length > 0 && (
                    <div style={{ ...s.keyBadge, backgroundColor: color }}>
                      <span style={s.keyBadgeText}>Key of {song.key}</span>
                    </div>
                  )}
                  {song.tempo && song.tempo.trim().length > 0 && (
                    <div style={{ ...s.tempoBadge, backgroundColor: (TEMPO_COLORS[song.tempo] || YELLOW) + '18' }}>
                      <span style={{ ...s.tempoBadgeText, color: TEMPO_COLORS[song.tempo] || YELLOW }}>{song.tempo}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Song Suggestion Form */}
      <div style={s.section}>
        <div style={s.formTitle}>Suggest a Song</div>
        <p style={s.formSub}>Have a song you'd love to worship to? Submit it here!</p>
        <form style={s.formCard} onSubmit={handleSubmit}>
          {submitted ? (
            <div style={s.successBox}>
              <span style={{ fontSize: 40, marginBottom: 10 }}>🎵</span>
              <div style={s.successTitle}>Song Submitted!</div>
              <div style={s.successSub}>Thank you! We'll take a look.</div>
            </div>
          ) : (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song title *"
                style={s.input}
              />
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist / Worship leader"
                style={s.input}
              />
              <input
                value={songKey}
                onChange={(e) => setSongKey(e.target.value)}
                placeholder="Key (if you know it)"
                style={s.input}
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes or why you love this song? (optional)"
                rows={2}
                style={{ ...s.input, minHeight: 60, resize: 'vertical' }}
              />
              <button
                type="submit"
                disabled={!title.trim()}
                style={{
                  ...s.submitBtn,
                  ...(!title.trim() && { backgroundColor: SOFT_GRAY, color: '#BBB', boxShadow: 'none' }),
                }}
              >
                Submit Song 🎶
              </button>
            </>
          )}
        </form>
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
  serveBanner: {
    margin: 18, borderRadius: 18, padding: 16, backgroundColor: YELLOW,
    display: 'flex', gap: 12, alignItems: 'center',
    boxShadow: '0 6px 12px rgba(245, 166, 35, 0.35)',
  },
  serveBannerLabel: {
    fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  serveBannerDate: { fontSize: 15, fontWeight: 900, color: WARM_WHITE, marginTop: 2 },
  section: { padding: '0 18px', marginBottom: 8 },
  sectionLabel: {
    fontSize: 12, fontWeight: 800, color: '#AAA',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14,
  },
  songCard: {
    backgroundColor: WARM_WHITE, borderRadius: 18, padding: 14, marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  songNumber: {
    width: 34, height: 34, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxSizing: 'border-box',
  },
  songNumberText: { fontSize: 14, fontWeight: 900 },
  songTitle: {
    fontSize: 14, fontWeight: 900, color: DARK, marginBottom: 2,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  songArtist: { fontSize: 12, color: '#999' },
  keyBadge: { borderRadius: 8, padding: '4px 10px' },
  keyBadgeText: { fontSize: 13, fontWeight: 900, color: WARM_WHITE },
  tempoBadge: { borderRadius: 6, padding: '2px 8px' },
  tempoBadgeText: { fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 },
  formTitle: { fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 4 },
  formSub: { fontSize: 13, color: '#999', marginBottom: 16, margin: '4px 0 16px' },
  formCard: {
    backgroundColor: WARM_WHITE, borderRadius: 22, padding: 18,
    boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
    border: `1px solid ${YELLOW}25`,
  },
  input: {
    width: '100%', backgroundColor: SOFT_GRAY, borderRadius: 10,
    padding: 11, fontSize: 13, color: DARK, marginBottom: 10,
    border: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%', backgroundColor: YELLOW, borderRadius: 100,
    padding: 13, color: WARM_WHITE, fontSize: 14, fontWeight: 800,
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 6px 12px rgba(245, 166, 35, 0.3)',
  },
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' },
  successTitle: { fontSize: 16, fontWeight: 900, color: YELLOW },
  successSub: { fontSize: 13, color: '#999', marginTop: 4 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 13, fontWeight: 700, color: '#BBB', marginTop: 8 },
  emptySub: { fontSize: 12, color: '#CCC', marginTop: 4 },
};