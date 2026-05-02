import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import DotRow from '../components/DotRow';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';

const COLORS_BY_INDEX = [RED, BLUE, YELLOW];

export default function EventsScreen({ onBack }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('sortDate', 'asc'));
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ docId: d.id, ...d.data() })));
    });
  }, []);

  return (
    <div style={s.outer}>
      <div style={s.topRow}>
        <button onClick={onBack} style={s.backBtn}>← Home</button>
        <DotRow />
      </div>

      <div style={s.titleArea}>
        <h1 style={s.pageTitle}>Upcoming Events</h1>
        <p style={s.pageSub}>What's happening in The CHOSEN Collective</p>
      </div>

      {events.length === 0 ? (
        <div style={s.emptyState}>
          <span style={{ fontSize: 40 }}>📅</span>
          <div style={s.emptyText}>No upcoming events yet.</div>
          <div style={s.emptySub}>Check back soon!</div>
        </div>
      ) : (
        <div style={s.list}>
          {events.map((event, i) => {
            const color = event.color || COLORS_BY_INDEX[i % 3];
            return (
              <div key={event.docId} style={s.eventCard}>
                <div style={{ ...s.eventDateBlock, backgroundColor: color }}>
                  <div style={s.eventMonth}>{event.month || ''}</div>
                  <div style={s.eventDay}>{event.day || ''}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.eventTitle}>{event.title}</div>
                  {event.time && <div style={s.eventDetail}>🕐 {event.time}</div>}
                  {event.location && <div style={s.eventDetail}>📍 {event.location}</div>}
                  {event.description && <p style={s.eventDescription}>{event.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  outer: { backgroundColor: CREAM, minHeight: '100vh', paddingBottom: 100 },
  topRow: {
    padding: '20px 18px 0',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: {
    background: 'none', border: 'none', color: RED,
    fontSize: 14, fontWeight: 800, cursor: 'pointer',
    fontFamily: 'inherit', padding: '4px 0',
  },
  titleArea: { padding: '12px 18px 4px' },
  pageTitle: { fontSize: 22, fontWeight: 900, color: DARK, margin: 0 },
  pageSub: { fontSize: 13, color: '#999', marginTop: 4, margin: '4px 0 0' },
  list: { padding: 18 },
  eventCard: {
    backgroundColor: WARM_WHITE, borderRadius: 18,
    padding: 14, marginBottom: 12,
    display: 'flex', gap: 14, alignItems: 'flex-start',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  eventDateBlock: {
    width: 64, height: 64, borderRadius: 14,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  eventMonth: {
    fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  eventDay: { fontSize: 24, fontWeight: 900, color: WARM_WHITE, lineHeight: 1, marginTop: 2 },
  eventTitle: { fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 6 },
  eventDetail: { fontSize: 12, color: '#666', marginBottom: 3 },
  eventDescription: { fontSize: 13, color: '#555', lineHeight: 1.5, marginTop: 8, margin: '8px 0 0' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60 },
  emptyText: { fontSize: 14, fontWeight: 700, color: '#BBB', marginTop: 12 },
  emptySub: { fontSize: 12, color: '#CCC', marginTop: 4 },
};