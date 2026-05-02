import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView,
  StyleSheet, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';

const DotRow = () => (
  <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
    {[RED, BLUE, YELLOW, RED, BLUE].map((c, i) => (
      <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c, opacity: 0.7 }} />
    ))}
  </View>
);

const FALLBACK_DEVO = {
  id: 1,
  date: '',
  title: 'Coming Soon',
  verse: '"Your word is a lamp for my feet and a light on my path." - Psalm 119:105 CSB',
  body: 'Your first devotional will appear here. Check back soon!',
  reflection: 'What is God speaking to you today?',
  color: RED
};

export default function DevoScreen() {
  const [devo, setDevo] = useState(FALLBACK_DEVO);

  useEffect(() => {
    const q = query(collection(db, 'devotionals'), orderBy('id', 'desc'), limit(1));
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        setDevo(snap.docs[0].data());
      }
    });
    return unsub;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CREAM }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.topRow}>
          <Text style={styles.pageTitle}>Daily Devotional</Text>
          <DotRow />
        </View>

        {/* Devo Card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={[styles.cardHeader, { backgroundColor: devo.color || RED }]}>
            <View style={styles.bubble1} />
            <View style={styles.bubble2} />
            {devo.date ? <Text style={styles.cardDate}>{devo.date}</Text> : null}
            <Text style={styles.cardTitle}>{devo.title}</Text>
            <View style={styles.verseBox}>
              <Text style={styles.verseText}>{devo.verse}</Text>
            </View>
          </View>

          {/* Body */}
          <View style={styles.cardBody}>
            <Text style={styles.bodyText}>{devo.body}</Text>
            <View style={[styles.reflectBox, { borderLeftColor: devo.color || RED }]}>
              <Text style={[styles.reflectLabel, { color: devo.color || RED }]}>
                REFLECT ON THIS
              </Text>
              <Text style={styles.reflectText}>{devo.reflection}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topRow: {
    paddingHorizontal: 18, paddingTop: 20, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pageTitle: { fontSize: 18, fontWeight: '900', color: '#1A1A1A' },
  card: {
    marginHorizontal: 18, marginTop: 8, borderRadius: 24, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 8,
  },
  cardHeader: { padding: 24, overflow: 'hidden' },
  bubble1: {
    position: 'absolute', top: -20, right: -20,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bubble2: {
    position: 'absolute', bottom: -30, right: 20,
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  cardDate: {
    fontSize: 11, fontWeight: '800',
    letterSpacing: 2, color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase', marginBottom: 8,
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24, fontWeight: '700',
    color: '#FFFFFF', lineHeight: 32, marginBottom: 16,
  },
  verseBox: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14, padding: 14,
    borderLeftWidth: 3, borderLeftColor: 'rgba(255,255,255,0.5)',
  },
  verseText: {
    fontSize: 14, fontStyle: 'italic',
    color: '#FFFFFF', lineHeight: 22,
  },
  cardBody: { backgroundColor: '#FFFFFF', padding: 22 },
  bodyText: {
    fontSize: 15, color: '#555',
    lineHeight: 26, marginBottom: 20,
  },
  reflectBox: {
    backgroundColor: '#F2F0EB',
    borderRadius: 16, padding: 16, borderLeftWidth: 4,
  },
  reflectLabel: {
    fontSize: 11, fontWeight: '800',
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8,
  },
  reflectText: { fontSize: 14, color: '#555', lineHeight: 22 },
});