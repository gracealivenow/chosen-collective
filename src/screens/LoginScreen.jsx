import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';

const dotColors = [RED, BLUE, YELLOW, RED, BLUE];

export default function LoginScreen({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={s.outer}>
      <form style={s.container} onSubmit={handleLogin}>
        <div style={s.logoArea}>
          <div style={s.logoIcon}>
            <span style={{ fontSize: 36 }}>✨</span>
          </div>
          <div style={s.logoThe}>THE</div>
          <div style={s.logoLetterRow}>
            {['C', 'H', 'O', 'S', 'E', 'N'].map((letter, i) => (
              <div key={i} style={s.logoLetterGroup}>
                <span style={s.logoLetter}>{letter}</span>
                {i < 5 && <span style={{ ...s.logoDot, backgroundColor: dotColors[i] }} />}
              </div>
            ))}
          </div>
          <div style={s.logoCollective}>COLLECTIVE</div>
          <div style={s.dotRow}>
            {dotColors.map((c, i) => (
              <span key={i} style={{ ...s.tinyDot, backgroundColor: c }} />
            ))}
          </div>
        </div>

        <h1 style={s.welcomeTitle}>Welcome Back!</h1>
        <p style={s.welcomeSub}>Sign in to connect with your community.</p>

        <div style={s.form}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            autoCapitalize="none"
            style={s.input}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={s.input}
          />
          {error && <div style={s.errorText}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ ...s.primaryBtn, ...(loading && { opacity: 0.7 }) }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or</span>
          <div style={s.dividerLine} />
        </div>

        <button type="button" onClick={onSwitch} style={s.signupLink}>
          <span style={s.signupLinkText}>
            Don't have an account? <span style={{ color: RED, fontWeight: 800 }}>Sign Up</span>
          </span>
        </button>

        <p style={s.footer}>Grace Alive Youth Ministry · Richmond, VA</p>
      </form>
    </div>
  );
}

const s = {
  outer: { minHeight: '100vh', backgroundColor: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  container: { width: '100%', maxWidth: 420, padding: 28, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  logoArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 },
  logoIcon: {
    width: 72, height: 72, borderRadius: 22, backgroundColor: RED,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, boxShadow: '0 8px 16px rgba(232, 48, 42, 0.3)',
  },
  logoThe: { fontFamily: 'Georgia, serif', fontSize: 14, letterSpacing: 4, color: DARK, marginBottom: 4 },
  logoLetterRow: { display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 },
  logoLetterGroup: { display: 'flex', alignItems: 'center', gap: 3 },
  logoLetter: { fontSize: 28, fontWeight: 700, color: DARK },
  logoDot: { width: 7, height: 7, borderRadius: 4, display: 'inline-block' },
  logoCollective: { fontFamily: 'Georgia, serif', fontSize: 12, letterSpacing: 3, color: DARK, marginTop: 4 },
  dotRow: { display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  tinyDot: { width: 6, height: 6, borderRadius: 3, display: 'inline-block' },
  welcomeTitle: { fontSize: 22, fontWeight: 900, color: DARK, marginBottom: 6, marginTop: 0, textAlign: 'center' },
  welcomeSub: { fontSize: 14, color: '#777', marginBottom: 28, marginTop: 6, textAlign: 'center' },
  form: { width: '100%', display: 'flex', flexDirection: 'column' },
  input: {
    backgroundColor: WARM_WHITE, borderRadius: 14, padding: '14px 16px',
    fontSize: 15, color: DARK, marginBottom: 12,
    border: '1.5px solid #E8E4DC', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box', width: '100%',
  },
  errorText: { fontSize: 13, color: RED, fontWeight: 700, marginBottom: 10, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: RED, borderRadius: 100, padding: '15px 0',
    border: 'none', color: WARM_WHITE, fontSize: 16, fontWeight: 900,
    cursor: 'pointer', boxShadow: '0 6px 12px rgba(232, 48, 42, 0.3)',
    marginTop: 4, width: '100%', fontFamily: 'inherit',
  },
  divider: { display: 'flex', alignItems: 'center', width: '100%', margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8E4DC' },
  dividerText: { fontSize: 13, color: '#BBB', margin: '0 12px' },
  signupLink: { background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0, fontFamily: 'inherit' },
  signupLinkText: { fontSize: 14, color: '#777' },
  footer: { fontSize: 11, color: '#CCC', marginTop: 24, textAlign: 'center' },
};