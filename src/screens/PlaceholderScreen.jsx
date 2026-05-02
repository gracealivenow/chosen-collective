import DotRow from '../components/DotRow';

const CREAM = '#FDFCF8';
const DARK = '#1A1A1A';

const EMOJIS = {
  Worship: '🎵',
  Chat: '💬',
  Connect: '✉️',
};

export default function PlaceholderScreen({ name }) {
  return (
    <div style={s.outer}>
      <div style={s.box}>
        <span style={{ fontSize: 48, marginBottom: 16 }}>{EMOJIS[name] || '✨'}</span>
        <h1 style={s.title}>{name}</h1>
        <p style={s.sub}>Coming soon!</p>
        <p style={s.note}>This screen will be built in our next session.</p>
        <div style={{ marginTop: 24 }}>
          <DotRow />
        </div>
      </div>
    </div>
  );
}

const s = {
  outer: {
    backgroundColor: CREAM, minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px 100px',
  },
  box: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', maxWidth: 320,
  },
  title: { fontSize: 28, fontWeight: 900, color: DARK, margin: '0 0 8px' },
  sub: { fontSize: 16, color: '#777', margin: '0 0 12px' },
  note: { fontSize: 13, color: '#999', margin: 0 },
};