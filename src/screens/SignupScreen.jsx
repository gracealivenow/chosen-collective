import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const AVATAR_COLORS = [RED, BLUE, YELLOW, '#9B59B6', '#27AE60', '#E67E22'];

export default function SignupScreen({ onSwitch }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarColor, setAvatarColor] = useState(RED);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) { setError('Please enter your first and last name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: phone.trim(),
        avatarColor,
        initials: initials || '??',
        createdAt: Date.now(),
      });
    } catch (err) {
      setLoading(false);
      if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists.');
      else if (err.code === 'auth/invalid-email') setError('Please enter a valid email address.');
      else setError('Something went wrong. Please try again.');
      return;
    }
    setLoading(false);
  };

  return (
    <div style={s.outer}>
      <form style={s.container} onSubmit={handleSignup}>
        <div style={s.headerArea}>
          <h1 style={s.headerTitle}>Join The CHOSEN Collective</h1>
          <p style={s.headerSub}>Create your account to connect with your community.</p>
        </div>

        <div style={s.avatarSection}>
          <div style={{ ...s.avatarPreview, backgroundColor: avatarColor }}>
            <span style={s.avatarInitials}>{initials || '?'}</span>
          </div>
          <div style={s.avatarLabel}>Pick your avatar color</div>
          <div style={s.colorPicker}>
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAvatarColor(c)}
                style={{
                  ...s.colorOption,
                  backgroundColor: c,
                  ...(avatarColor === c && s.colorOptionSelected),
                }}
              />
            ))}
          </div>
        </div>

        <div style={s.form}>
          <div style={s.nameRow}>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name *"
              style={{ ...s.input, flex: 1 }}
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name *"
              style={{ ...s.input, flex: 1 }}
            />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address *"
            autoCapitalize="none"
            style={s.input}
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number (optional)"
            style={s.input}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters) *"
            style={s.input}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password *"
            style={s.input}
          />

          {error && <div style={s.errorText}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{ ...s.primaryBtn, ...(loading && { opacity: 0.7 }) }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        <button type="button" onClick={onSwitch} style={s.loginLink}>
          <span style={s.loginLinkText}>
            Already have an account? <span style={{ color: RED, fontWeight: 800 }}>Sign In</span>
          </span>
        </button>

        <p style={s.footer}>Grace Alive Youth Ministry · Richmond, VA</p>
      </form>
    </div>
  );
}

const s = {
  outer: { minHeight: '100vh', backgroundColor: CREAM, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' },
  container: { width: '100%', maxWidth: 420, padding: 24, boxSizing: 'border-box' },
  headerArea: { marginBottom: 24, marginTop: 8 },
  headerTitle: { fontSize: 22, fontWeight: 900, color: DARK, marginBottom: 6, marginTop: 0 },
  headerSub: { fontSize: 14, color: '#777', margin: 0 },
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 },
  avatarPreview: {
    width: 80, height: 80, borderRadius: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
  avatarInitials: { fontSize: 28, fontWeight: 900, color: WARM_WHITE },
  avatarLabel: { fontSize: 12, color: '#999', marginBottom: 10 },
  colorPicker: { display: 'flex', flexDirection: 'row', gap: 10 },
  colorOption: { width: 30, height: 30, borderRadius: 15, border: 'none', cursor: 'pointer', padding: 0 },
  colorOptionSelected: { border: '3px solid #1A1A1A' },
  form: { width: '100%', display: 'flex', flexDirection: 'column' },
  nameRow: { display: 'flex', flexDirection: 'row', gap: 10 },
  input: {
    backgroundColor: WARM_WHITE, borderRadius: 14, padding: '13px 16px',
    fontSize: 14, color: DARK, marginBottom: 10,
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
  loginLink: { background: 'none', border: 'none', cursor: 'pointer', marginTop: 20, padding: 0, width: '100%', fontFamily: 'inherit' },
  loginLinkText: { fontSize: 14, color: '#777' },
  footer: { fontSize: 11, color: '#CCC', marginTop: 24, textAlign: 'center' },
};