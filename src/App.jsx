import { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import DevoScreen from './screens/DevoScreen';
import PrayerScreen from './screens/PrayerScreen';
import WorshipScreen from './screens/WorshipScreen';
import ChatScreen from './screens/ChatScreen';
import ConnectScreen from './screens/ConnectScreen';
import AdminScreen from './screens/AdminScreen';
import BottomTabs from './components/BottomTabs';
import InstallPrompt from './components/InstallPrompt';

function MainApp() {
  const { user, loading } = useUser();
  const [showSignup, setShowSignup] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [adminMode, setAdminMode] = useState(false);

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

  if (adminMode) {
    return <AdminScreen onClose={() => setAdminMode(false)} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home': return <HomeScreen onNavigate={setActiveTab} onAdminClick={() => setAdminMode(true)} />;
      case 'Devo': return <DevoScreen />;
      case 'Prayer': return <PrayerScreen />;
      case 'Worship': return <WorshipScreen />;
      case 'Chat': return <ChatScreen />;
      case 'Connect': return <ConnectScreen />;
      default: return <HomeScreen onNavigate={setActiveTab} onAdminClick={() => setAdminMode(true)} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
      <InstallPrompt />
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}