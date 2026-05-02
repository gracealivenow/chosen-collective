import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import { UserProvider, useUser } from './context/UserContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';

function MainApp() {
  const { user, profile, loading } = useUser();
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FDFCF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#777' }}>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return showSignup
      ? <SignupScreen onSwitch={() => setShowSignup(false)} />
      : <LoginScreen onSwitch={() => setShowSignup(true)} />;
  }

  // Placeholder until Session 2 builds the real screens
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FDFCF8', padding: 40, textAlign: 'center' }}>
      <h1 style={{ color: '#1A1A1A' }}>You are signed in! ✨</h1>
      <p style={{ color: '#777' }}>Welcome, {profile?.firstName || user.email}</p>
      <p style={{ color: '#999', fontSize: 13 }}>The full app screens are coming in the next session.</p>
      <button
        onClick={() => signOut(auth)}
        style={{
          marginTop: 20, padding: '12px 30px', borderRadius: 100,
          backgroundColor: '#E8302A', color: 'white', border: 'none',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}