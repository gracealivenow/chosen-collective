import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useUser } from '../context/UserContext';
import ChosenLogo from '../components/ChosenLogo';
import DotRow from '../components/DotRow';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';
const NAVY = '#1a1a2e';

export default function HomeScreen({ onNavigate, onAdminClick }) {
  const { user, profile } = useUser();
  const [announcements, setAnnouncements] = useState([]);
  const [devotional, setDevo] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const annQ = query(collection(db, 'announcements'), orderBy('date', 'desc'), limit(4));
    const unsubAnn = onSnapshot(annQ, (snap) => {
      setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const devoQ = query(collection(db, 'devotionals'), orderBy('date', 'desc'), limit(1));
    const unsubDevo = onSnapshot(devoQ, (snap) => {
      if (!snap.empty) setDevo(snap.docs[0].data());
    });
    return () => {
      unsubAnn();
      unsubDevo();
    };
  }, []);

  const quickLinks = [
    { icon: '📖', label: "Today's Devo", sub: '2 min read', color: BLUE, screen: 'Devo' },
    { icon: '🙏', label: 'Prayer Wall', sub: 'Stand in faith', color: RED, screen: 'Prayer' },
    { icon: '📅', label: 'Events', sub: "What's coming", color: YELLOW, screen: 'Events', wide: true },
  ];

  const handleQuickLink = (screen) => {
    if (screen === 'Events') {
      alert('Events screen coming soon!');
      return;
    }
    onNavigate(screen);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleAdmin = () => {
    setShowProfile(false);
    onAdminClick();
  };

  return (
    <div style={s.outer}>
      {/* Profile Modal */}
      {showProfile && (
        <div style={s.modalOverlay} onClick={() => setShowProfile(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...s.modalAvatar, backgroundColor: profile?.avatarColor || RED }}>
              <span style={s.modalAvatarText}>{profile?.initials || '??'}</span>
            </div>
            <h2 style={s.modalName}>{profile?.fullName || user?.email}</h2>
            <p style={s.modalEmail}>{user?.email}</p>
            {profile?.isAdmin && (
              <button onClick={handleAdmin} style={s.adminBtn}>Admin Panel</button>
            )}
            <button onClick={handleSignOut} style={s.signOutBtn}>Sign Out</button>
            <button onClick={() => setShowProfile(false)} style={s.closeBtn}>Close</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={s.header}>
        <ChosenLogo />
        <button onClick={() => setShowProfile(true)} style={s.avatarBtn}>
          <div style={{ ...s.profileAvatar, backgroundColor: profile?.avatarColor || RED }}>
            <span style={s.profileAvatarText}>{profile?.initials || '??'}</span>
          </div>
        </button>
      </header>

      {/* Hero Verse Card */}
      <div style={s.heroCard}>
        <div style={s.heroBubble1} />
        <div style={s.heroBubble2} />
        <div style={s.heroLabel}>✦ VERSE OF THE DAY</div>
        <p style={s.heroVerse}>
          {devotional?.verse ||
            '"For I know the plans I have for you" — this is the Lord\'s declaration — "plans for your well-being, not for disaster, to give you a future and a hope."'}
        </p>
        <div style={s.heroRef}>Jeremiah 29:11 CSB</div>
      </div>

      {/* Welcome */}
      <div style={s.welcomeRow}>
        <div>
          <h1 style={s.welcomeTitle}>Hey, Chosen One! 👋</h1>
          <p style={s.welcomeSub}>Here's what's happening this week</p>
        </div>
        <DotRow />
      </div>

      {/* Quick Links Grid */}
      <div style={s.gridContainer}>
        {quickLinks.map((q, i) => (
          <button
            key={i}
            onClick={() => handleQuickLink(q.screen)}
            style={{ ...s.gridItem, ...(q.wide && s.gridItemWide) }}
          >
            <div style={{ ...s.gridIcon, backgroundColor: q.color + '18' }}>
              <span style={{ fontSize: 22 }}>{q.icon}</span>
            </div>
            <div style={s.gridLabel}>{q.label}</div>
            <div style={s.gridSub}>{q.sub}</div>
          </button>
        ))}
      </div>

      {/* What's New */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>What's New</h2>
          <DotRow />
        </div>
        {announcements.length === 0 ? (
          <div style={s.emptyState}>
            <span style={{ fontSize: 28 }}>📣</span>
            <div style={s.emptyText}>No announcements yet</div>
            <div style={s.emptySub}>Check back soon!</div>
          </div>
        ) : (
          announcements.map((a, i) => (
            <div key={i} style={{ ...s.announcementCard, borderLeft: `4px solid ${a.color || RED}` }}>
              <div style={{ ...s.announcementIcon, backgroundColor: (a.color || RED) + '18' }}>
                <span style={{ fontSize: 18 }}>{a.emoji || '📣'}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.annTopRow}>
                  <span style={s.annTitle}>{a.title}</span>
                  <span style={s.annDate}>{a.date}</span>
                </div>
                <p style={s.annDetail}>{a.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const s = {
  outer: { backgroundColor: CREAM, minHeight: '100vh', paddingBottom: 100 },
  header: {
    backgroundColor: WARM_WHITE,
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `2px solid ${SOFT_GRAY}`,
  },
  avatarBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  profileAvatar: {
    width: 36, height: 36, borderRadius: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  },
  profileAvatarText: { fontSize: 13, fontWeight: 900, color: '#FFF' },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modal: {
    backgroundColor: WARM_WHITE, borderRadius: 24, padding: 30,
    width: '100%', maxWidth: 340, textAlign: 'center',
  },
  modalAvatar: {
    width: 70, height: 70, borderRadius: 35,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  modalAvatarText: { fontSize: 24, fontWeight: 900, color: '#FFF' },
  modalName: { fontSize: 18, fontWeight: 900, color: DARK, margin: '0 0 4px' },
  modalEmail: { fontSize: 13, color: '#777', margin: '0 0 24px' },
  adminBtn: {
    width: '100%', padding: 14, borderRadius: 100,
    backgroundColor: NAVY, color: '#FFF', border: 'none',
    fontSize: 14, fontWeight: 800, cursor: 'pointer',
    fontFamily: 'inherit', marginBottom: 10,
  },
  signOutBtn: {
    width: '100%', padding: 14, borderRadius: 100,
    backgroundColor: RED, color: '#FFF', border: 'none',
    fontSize: 14, fontWeight: 800, cursor: 'pointer',
    fontFamily: 'inherit', marginBottom: 10,
  },
  closeBtn: {
    width: '100%', padding: 12, borderRadius: 100,
    backgroundColor: SOFT_GRAY, color: '#777', border: 'none',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  heroCard: {
    margin: 18, borderRadius: 24, backgroundColor: RED,
    padding: 24, position: 'relative', overflow: 'hidden',
    boxShadow: '0 8px 16px rgba(232, 48, 42, 0.3)',
  },
  heroBubble1: {
    position: 'absolute', top: -20, right: -20,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroBubble2: {
    position: 'absolute', bottom: -30, right: 20,
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroLabel: {
    fontSize: 11, fontWeight: 800, letterSpacing: 2,
    color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase',
    marginBottom: 10, position: 'relative',
  },
  heroVerse: {
    fontSize: 16, fontWeight: 600, color: WARM_WHITE,
    lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12,
    margin: '0 0 12px', position: 'relative',
  },
  heroRef: {
    fontSize: 13, fontWeight: 800,
    color: 'rgba(255,255,255,0.85)', position: 'relative',
  },
  welcomeRow: {
    padding: '14px 18px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  welcomeTitle: { fontSize: 20, fontWeight: 900, color: DARK, letterSpacing: -0.5, margin: 0 },
  welcomeSub: { fontSize: 13, color: '#777', marginTop: 2, margin: '2px 0 0' },
  gridContainer: {
    padding: '0 18px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  gridItem: {
    backgroundColor: WARM_WHITE, borderRadius: 18, padding: 16,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  gridItemWide: { gridColumn: '1 / -1' },
  gridIcon: {
    width: 42, height: 42, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  gridLabel: { fontSize: 13, fontWeight: 800, color: DARK, textAlign: 'center' },
  gridSub: { fontSize: 11, color: '#999', marginTop: 2, textAlign: 'center' },
  section: { padding: '0 18px', marginTop: 20 },
  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: 900, color: DARK, margin: 0 },
  announcementCard: {
    backgroundColor: WARM_WHITE, borderRadius: 18, padding: 14, marginBottom: 10,
    display: 'flex', gap: 12, alignItems: 'flex-start',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  announcementIcon: {
    width: 38, height: 38, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  annTopRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 3 },
  annTitle: { fontSize: 13, fontWeight: 800, color: DARK },
  annDate: { fontSize: 11, color: '#AAA' },
  annDetail: { fontSize: 12, color: '#777', lineHeight: 1.5, margin: 0 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 13, fontWeight: 700, color: '#BBB', marginTop: 8 },
  emptySub: { fontSize: 12, color: '#CCC', marginTop: 4 },
};