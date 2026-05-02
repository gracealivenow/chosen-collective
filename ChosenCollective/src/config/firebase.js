import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAvVtssT53qH3rnejocTKnM5dY-9PIp1cA",
  authDomain: "chosen-collective.firebaseapp.com",
  projectId: "chosen-collective",
  storageBucket: "chosen-collective.firebasestorage.app",
  messagingSenderId: "328243125149",
  appId: "1:328243125149:web:d6d682ca032dcf23132d74",
  measurementId: "G-4VHG6TN6HK"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getApps().length === 1
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    })
  : require('firebase/auth').getAuth(app);

export const db = getFirestore(app);