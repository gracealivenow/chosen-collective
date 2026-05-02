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
import BottomTabs from './components/BottomTabs';

function MainApp() {
  const { user, loading } = useUser();
  const [showSignup, setShowSignup] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

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

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home': return <HomeScreen onNavigate={setActiveTab} />;
      case 'Devo': return <DevoScreen />;
      case 'Prayer': return <PrayerScreen />;
      case 'Worship': return <WorshipScreen />;
      case 'Chat': return <ChatScreen />;
      case 'Connect': return <ConnectScreen />;
      default: return <HomeScreen onNavigate={setActiveTab} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
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