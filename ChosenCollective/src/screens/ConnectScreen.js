import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import emailjs from '@emailjs/react-native';
import { useUser } from '../context/UserContext';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';

emailjs.init({ publicKey: 'ZO9Pl_54bMxJkS-Hs' });
const DotRow = () => (
  <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
    {[RED, BLUE, YELLOW, RED, BLUE].map((c, i) => (
      <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c, opacity: 0.7 }} />
    ))}
  </View>
);

const LEADERS = [
  { name: 'Kindal White', role: 'Youth Leader', color: RED, photo: 'https://i.imgur.com/t71XOKt.jpg' },
  { name: 'George White', role: 'Youth Leader', color: BLUE, photo: 'https://i.imgur.com/hx67Si6.jpg' },
];

export default function ConnectScreen() {
  const { profile } = useUser();
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    const entry = {
      id: Date.now(),
      name: profile?.fullName || 'Anonymous',
      email: profile?.email || '',
      body: body.trim(),
      time: new Date().toISOString(),
      read: false,
    };
    await addDoc(collection(db, 'messages'), entry);
    emailjs.send('service_mwzf07u', 'template_ndlfg0j', {
      subject: `💌 Confidential Message from ${entry.name} — The CHOSEN Collective`,
      message: `FROM: ${entry.name}\n${entry.email ? `REPLY TO: ${entry.email}` : 'No reply email provided'}\n\nMESSAGE:\n${entry.body}\n\n---\nSent via The CHOSEN Collective App`
    }).catch(console.error);
    setBody('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CREAM }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.pageTitle}>Connect With Us</Text>
              <Text style={styles.pageSub}>Your message goes directly to your youth leaders.</Text>
            </View>
            <DotRow />
          </View>

          {/* Leader Cards */}
          <View style={styles.leadersRow}>
            {LEADERS.map((leader, i) => (
              <View key={i} style={[styles.leaderCard, { borderColor: leader.color + '20' }]}>
                <Image
                  source={{ uri: leader.photo }}
                  style={[styles.leaderPhoto, { borderColor: leader.color }]}
                />
                <Text style={styles.leaderName}>{leader.name}</Text>
                <Text style={[styles.leaderRole, { color: leader.color }]}>{leader.role}</Text>
              </View>
            ))}
          </View>

          {/* Confidential Notice */}
          <View style={styles.confidentialBox}>
            <Text style={{ fontSize: 18 }}>🔒</Text>
            <Text style={styles.confidentialText}>
              <Text style={{ fontWeight: '800', color: BLUE }}>This message is confidential. </Text>
              Only Kindal and George will see what you share. You're safe here.
            </Text>
          </View>

          {/* Message Form */}
          <View style={styles.formCard}>
            {submitted ? (
              <View style={styles.successBox}>
                <Text style={{ fontSize: 44, marginBottom: 12 }}>💌</Text>
                <Text style={styles.successTitle}>Message Sent!</Text>
                <Text style={styles.successSub}>
                  Kindal and George received your message.{'\n'}You are seen and you are loved.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.formTitle}>Send a Private Message</Text>
                <View style={styles.sendingAs}>
                  <View style={[styles.miniAvatar, { backgroundColor: profile?.avatarColor || RED }]}>
                    <Text style={styles.miniAvatarText}>{profile?.initials || '??'}</Text>
                  </View>
                  <View>
                    <Text style={styles.sendingAsName}>{profile?.fullName || 'Anonymous'}</Text>
                    <Text style={styles.sendingAsEmail}>{profile?.email || ''}</Text>
                  </View>
                </View>
                <TextInput
                  value={body}
                  onChangeText={setBody}
                  placeholder="What's on your heart? You can share anything here — questions, concerns, something you're going through, or just a prayer request you didn't want to post publicly..."
                  placeholderTextColor="#BBB"
                  multiline
                  numberOfLines={5}
                  style={[styles.input, { minHeight: 120, textAlignVertical: 'top' }]}
                />
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitBtn, !body.trim() && { backgroundColor: SOFT_GRAY }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.submitBtnText, !body.trim() && { color: '#BBB' }]}>
                    Send Message 💌
                  </Text>
                </TouchableOpacity>
              </>
            )}
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
  leadersRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 18, marginTop: 16, marginBottom: 16,
  },
  leaderCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18,
    padding: 16, alignItems: 'center', borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  leaderPhoto: {
    width: 70, height: 70, borderRadius: 35,
    borderWidth: 3, marginBottom: 10,
  },
  leaderName: { fontSize: 13, fontWeight: '900', color: '#1A1A1A', textAlign: 'center' },
  leaderRole: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  confidentialBox: {
    marginHorizontal: 18, marginBottom: 16,
    backgroundColor: BLUE + '10', borderRadius: 14,
    padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    borderWidth: 1, borderColor: BLUE + '25',
  },
  confidentialText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 20 },
  formCard: {
    marginHorizontal: 18, backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: BLUE + '18',
  },
  sendingAs: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, padding: 12, backgroundColor: SOFT_GRAY, borderRadius: 12 },
  miniAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { fontSize: 12, fontWeight: '900', color: '#FFF' },
  sendingAsName: { fontSize: 13, fontWeight: '800', color: DARK },
  sendingAsEmail: { fontSize: 11, color: '#999', marginTop: 1 },
  formTitle: { fontSize: 14, fontWeight: '800', color: '#1A1A1A', marginBottom: 14 },
  input: {
    backgroundColor: '#F2F0EB', borderRadius: 10,
    padding: 11, fontSize: 13, color: '#1A1A1A', marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: BLUE, borderRadius: 100,
    padding: 14, alignItems: 'center',
    shadowColor: BLUE, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  successBox: { alignItems: 'center', paddingVertical: 24 },
  successTitle: { fontSize: 16, fontWeight: '900', color: BLUE },
  successSub: { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center', lineHeight: 20 },
});