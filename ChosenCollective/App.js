import { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import DevoScreen from './src/screens/DevoScreen';
import PrayerScreen from './src/screens/PrayerScreen';
import WorshipScreen from './src/screens/WorshipScreen';
import ChatScreen from './src/screens/ChatScreen';
import ConnectScreen from './src/screens/ConnectScreen';
import EventsScreen from './src/screens/EventsScreen';
import AnnouncementsScreen from './src/screens/AnnouncementsScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminScreen from './src/screens/AdminScreen';

import { UserProvider, useUser } from './src/context/UserContext';

// Colors
const RED = '#E8302A';
const BLUE = '#29ABE2';
const DARK = '#1a1a2e';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotifications() {
  if (!Device.isDevice) return;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
}

// Bottom tab navigator (no Events or Announcements here)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DARK,
          borderTopColor: '#333',
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 80 : 60,
        },
        tabBarActiveTintColor: RED,
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Devo: focused ? 'book' : 'book-outline',
            Prayer: focused ? 'heart' : 'heart-outline',
            Worship: focused ? 'musical-notes' : 'musical-notes-outline',
            Chat: focused ? 'chatbubbles' : 'chatbubbles-outline',
            Connect: focused ? 'mail' : 'mail-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Devo" component={DevoScreen} />
      <Tab.Screen name="Prayer" component={PrayerScreen} />
      <Tab.Screen name="Worship" component={WorshipScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Connect" component={ConnectScreen} />
    </Tab.Navigator>
  );
}

function MainApp() {
  const { user, loading } = useUser();
  const [showSignup, setShowSignup] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotifications();
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});
    return () => {
      if (notificationListener.current?.remove) notificationListener.current.remove();
      if (responseListener.current?.remove) responseListener.current.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: DARK, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff' }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return showSignup
      ? <SignupScreen onSwitch={() => setShowSignup(false)} />
      : <LoginScreen onSwitch={() => setShowSignup(true)} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Events" component={EventsScreen} />
        <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}