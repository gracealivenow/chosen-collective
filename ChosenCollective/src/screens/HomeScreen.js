import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';
import ProfileScreen from './ProfileScreen';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';

const DotRow = () => (
  <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
    {[RED, BLUE, YELLOW, RED, BLUE].map((c, i) => (
      <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c, opacity: 0.7 }} />
    ))}
  </View>
);

const ChosenLogo = () => {
  const dots = [RED, BLUE, YELLOW, RED, BLUE];
  const letters = ['C', 'H', 'O', 'S', 'E', 'N'];
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 12, letterSpacing: 4, color: DARK, marginBottom: 2 }}>THE</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        {letters.map((letter, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: DARK }}>{letter}</Text>
            {i < letters.length - 1 && (
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dots[i] }} />
            )}
          </View>
        ))}
      </View>
      <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 11, letterSpacing: 3, color: DARK, marginTop: 2 }}>COLLECTIVE</Text>
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const { profile } = useUser();
  const [announcements, setAnnouncements] = useState([]);
  const [devotional, setDevo] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const annQ = query(collection(db, 'announcements'), orderBy('date', 'desc'), limit(4));
    const unsubAnn = onSnapshot(annQ, snap => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const devoQ = query(collection(db, 'devotionals'), orderBy('date', 'desc'), limit(1));
    const unsubDevo = onSnapshot(devoQ, snap => {
      if (!snap.empty) setDevo(snap.docs[0].data());
    });
    return () => { unsubAnn(); unsubDevo(); };
  }, []);

  const quickLinks = [
    { icon: '📖', label: "Today's Devo", sub: '2 min read', color: BLUE, screen: 'Devo' },
    { icon: '🙏', label: 'Prayer Wall', sub: 'Stand in faith', color: RED, screen: 'Prayer' },
    { icon: '📅', label: 'Events', sub: "What's coming", color: YELLOW, screen: 'Events', wide: true },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CREAM }}>
      {showProfile && <ProfileScreen onClose={() => setShowProfile(false)} />}

      {/* Header */}
      <View style={styles.header}>
        <ChosenLogo />
        <TouchableOpacity onPress={() => setShowProfile(true)}>
          <View style={[styles.profileAvatar, { backgroundColor: profile?.avatarColor || RED }]}>
            <Text style={styles.profileAvatarText}>{profile?.initials || '??'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

        {/* Hero Verse Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBubble1} />
          <View style={styles.heroBubble2} />
          <Text style={styles.heroLabel}>✦ Verse of the Day</Text>
          <Text style={styles.heroVerse}>
            {devotional?.verse || '"Are not five sparrows sold for two pennies? Yet not one of them is forgotten in God\'s sight... you are worth more than many sparrows." — Luke 12:7 CSB'}
          </Text>
          <Text style={styles.heroRef}>Jeremiah 29:11 CSB</Text>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.welcomeTitle}>Hey, Chosen One! 👋</Text>
            <Text style={styles.welcomeSub}>Here's what's happening this week</Text>
          </View>
          <DotRow />
        </View>

        {/* Quick Links */}
        <View style={styles.gridContainer}>
          {quickLinks.map((q, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.gridItem, q.wide && styles.gridItemWide]}
              onPress={() => navigation.navigate(q.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIcon, { backgroundColor: q.color + '18' }]}>
                <Text style={{ fontSize: 22 }}>{q.icon}</Text>
              </View>
              <Text style={styles.gridLabel}>{q.label}</Text>
              <Text style={styles.gridSub}>{q.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* What's New / Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What's New</Text>
            <DotRow />
          </View>
          {announcements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 28 }}>📣</Text>
              <Text style={styles.emptyText}>No announcements yet</Text>
              <Text style={styles.emptySub}>Check back soon!</Text>
            </View>
          ) : announcements.map((a, i) => (
            <View key={i} style={[styles.announcementCard, { borderLeftColor: a.color || RED }]}>
              <View style={[styles.announcementIcon, { backgroundColor: (a.color || RED) + '18' }]}>
                <Text style={{ fontSize: 18 }}>{a.emoji || '📣'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={styles.annTitle}>{a.title}</Text>
                  <Text style={styles.annDate}>{a.date}</Text>
                </View>
                <Text style={styles.annDetail}>{a.message}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: WARM_WHITE,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: SOFT_GRAY,
  },
  profileAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  profileAvatarText: { fontSize: 13, fontWeight: '900', color: '#FFF' },
  heroCard: {
    margin: 18, borderRadius: 24,
    backgroundColor: RED,
    padding: 24, overflow: 'hidden',
    shadowColor: RED, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
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
    fontSize: 11, fontWeight: '800',
    letterSpacing: 2, color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase', marginBottom: 10,
  },
  heroVerse: {
    fontSize: 16, fontWeight: '600',
    color: WARM_WHITE, lineHeight: 26,
    fontStyle: 'italic', marginBottom: 12,
  },
  heroRef: {
    fontSize: 13, fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
  },
  welcomeRow: {
    paddingHorizontal: 18, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeTitle: {
    fontSize: 20, fontWeight: '900',
    color: DARK, letterSpacing: -0.5,
  },
  welcomeSub: {
    fontSize: 13, color: '#777', marginTop: 2,
  },
  gridContainer: {
    paddingHorizontal: 18,
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  gridItem: {
    width: '47.5%', backgroundColor: WARM_WHITE,
    borderRadius: 18, padding: 16,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  gridItemWide: {
    width: '100%',
    alignItems: 'center',
  },
  gridIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  gridLabel: {
    fontSize: 13, fontWeight: '800', color: DARK, textAlign: 'center',
  },
  gridSub: {
    fontSize: 11, color: '#999', marginTop: 2, textAlign: 'center',
  },
  section: { paddingHorizontal: 18, marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: '900', color: DARK,
  },
  announcementCard: {
    backgroundColor: WARM_WHITE, borderRadius: 18,
    padding: 14, marginBottom: 10,
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  announcementIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  annTitle: { fontSize: 13, fontWeight: '800', color: DARK },
  annDate: { fontSize: 11, color: '#AAA' },
  annDetail: { fontSize: 12, color: '#777', lineHeight: 18 },
  emptyState: {
    alignItems: 'center', padding: 24,
  },
  emptyText: { fontSize: 13, fontWeight: '700', color: '#BBB', marginTop: 8 },
  emptySub: { fontSize: 12, color: '#CCC', marginTop: 4 },
});