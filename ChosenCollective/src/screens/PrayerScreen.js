import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, orderBy, query, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';

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

function timeAgo(iso) {
  if (!iso) return 'just now';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PrayerScreen() {
  const { profile } = useUser();
  const [prayers, setPrayers] = useState([]);
  const [newPrayer, setNewPrayer] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'prayers'), orderBy('id', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setPrayers(snap.docs.map(d => ({ ...d.data(), docId: d.id })));
    });
    return unsub;
  }, []);

  const handleSubmit = async () => {
    if (!newPrayer.trim()) return;
    const colors = [RED, BLUE, YELLOW];
    const entry = {
      id: Date.now(),
      name: isAnon ? 'Anonymous' : (profile?.fullName || 'Anonymous'),
      request: newPrayer.trim(),
      time: new Date().toISOString(),
      likes: 0,
      color: profile?.avatarColor || colors[Math.floor(Math.random() * 3)]
    };
    await addDoc(collection(db, 'prayers'), entry);
    setNewPrayer('');
    setIsAnon(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleLike = async (docId, currentLikes) => {
    await updateDoc(doc(db, 'prayers', docId), { likes: currentLikes + 1 });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CREAM }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.pageTitle}>Prayer Wall</Text>
              <Text style={styles.pageSub}>Share your heart. Stand in faith together.</Text>
            </View>
            <DotRow />
          </View>

          {/* Submit Form */}
          <View style={styles.formCard}>
            {submitted ? (
              <View style={styles.successBox}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>🙏</Text>
                <Text style={styles.successTitle}>Prayer Submitted!</Text>
                <Text style={styles.successSub}>We're believing with you.</Text>
              </View>
            ) : (
              <>
                <Text style={styles.formTitle}>Add a Prayer Request</Text>
                <View style={styles.postingAs}>
                  <View style={[styles.miniAvatar, { backgroundColor: profile?.avatarColor || RED }]}>
                    <Text style={styles.miniAvatarText}>{profile?.initials || '??'}</Text>
                  </View>
                  <Text style={styles.postingAsText}>
                    Posting as <Text style={{ color: profile?.avatarColor || RED, fontWeight: '800' }}>
                      {isAnon ? 'Anonymous' : (profile?.fullName || 'Anonymous')}
                    </Text>
                  </Text>
                </View>
                <TextInput
                  value={newPrayer}
                  onChangeText={setNewPrayer}
                  placeholder="What would you like prayer for?"
                  placeholderTextColor="#BBB"
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                />
                <View style={styles.anonRow}>
                  <TouchableOpacity onPress={() => setIsAnon(!isAnon)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={[styles.checkbox, isAnon && { backgroundColor: RED, borderColor: RED }]}>
                      {isAnon && <Text style={{ color: '#FFF', fontSize: 10 }}>✓</Text>}
                    </View>
                    <Text style={styles.anonLabel}>Post anonymously</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitBtn, !newPrayer.trim() && { backgroundColor: SOFT_GRAY }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.submitBtnText, !newPrayer.trim() && { color: '#BBB' }]}>
                    Submit Prayer Request 🙏
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Prayer List */}
          <View style={styles.section}>
            <Text style={styles.countLabel}>Standing in Faith — {prayers.length} requests</Text>
            {prayers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🙏</Text>
                <Text style={styles.emptyText}>No prayer requests yet.</Text>
                <Text style={styles.emptySub}>Be the first to share your heart.</Text>
              </View>
            ) : prayers.map((p, i) => (
              <View key={i} style={[styles.prayerCard, { borderTopColor: p.color || RED }]}>
                <View style={styles.prayerHeader}>
                  <Text style={[styles.prayerName, { color: p.color || RED }]}>{p.name}</Text>
                  <Text style={styles.prayerTime}>{timeAgo(p.time)}</Text>
                </View>
                <Text style={styles.prayerText}>
                  {expanded === i || p.request.length < 100
                    ? p.request
                    : p.request.slice(0, 100) + '...'}
                </Text>
                {p.request.length >= 100 && (
                  <TouchableOpacity onPress={() => setExpanded(expanded === i ? null : i)}>
                    <Text style={[styles.moreBtn, { color: p.color || RED }]}>
                      {expanded === i ? 'less' : 'more'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleLike(p.docId, p.likes || 0)}
                  style={[styles.likeBtn, { backgroundColor: SOFT_GRAY }]}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 15 }}>🙏</Text>
                  <Text style={[styles.likeBtnText, { color: p.color || RED }]}>
                    {p.likes || 0} praying
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topRow: {
    paddingHorizontal: 18, paddingTop: 20, paddingBottom: 4,
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
  },
  pageTitle: { fontSize: 18, fontWeight: '900', color: '#1A1A1A' },
  pageSub: { fontSize: 13, color: '#999', marginTop: 2 },
  formCard: {
    margin: 18, backgroundColor: '#FFFFFF', borderRadius: 22,
    padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: RED + '18',
  },
  formTitle: { fontSize: 14, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  textArea: {
    backgroundColor: '#F2F0EB', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#1A1A1A',
    minHeight: 80, textAlignVertical: 'top', marginBottom: 10,
  },
  postingAs: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  miniAvatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { fontSize: 9, fontWeight: '900', color: '#FFF' },
  postingAsText: { fontSize: 13, color: '#AAA' },
  anonRow: { marginBottom: 12 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 2, borderColor: '#CCC',
    alignItems: 'center', justifyContent: 'center',
  },
  anonLabel: { fontSize: 12, fontWeight: '700', color: '#888' },
  submitBtn: {
    backgroundColor: RED, borderRadius: 100,
    padding: 14, alignItems: 'center',
    shadowColor: RED, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  successBox: { alignItems: 'center', paddingVertical: 20 },
  successTitle: { fontSize: 16, fontWeight: '900', color: RED },
  successSub: { fontSize: 13, color: '#999', marginTop: 4 },
  section: { paddingHorizontal: 18 },
  countLabel: {
    fontSize: 12, fontWeight: '800', color: '#AAA',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14,
  },
  prayerCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16,
    marginBottom: 10, borderTopWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  prayerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  prayerName: { fontSize: 13, fontWeight: '800' },
  prayerTime: { fontSize: 11, color: '#BBB' },
  prayerText: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 12 },
  moreBtn: { fontSize: 12, fontWeight: '800', marginBottom: 10 },
  likeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 100, alignSelf: 'flex-start',
  },
  likeBtnText: { fontSize: 12, fontWeight: '800' },
  emptyState: { alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 13, fontWeight: '700', color: '#BBB', marginTop: 8 },
  emptySub: { fontSize: 12, color: '#CCC', marginTop: 4 },
});