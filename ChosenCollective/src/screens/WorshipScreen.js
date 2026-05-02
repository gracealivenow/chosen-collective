import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, orderBy, query, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import emailjs from '@emailjs/react-native';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';

emailjs.init('ZO9Pl_54bMxJkS-Hs');

const DotRow = () => (
  <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
    {[RED, BLUE, YELLOW, RED, BLUE].map((c, i) => (
      <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c, opacity: 0.7 }} />
    ))}
  </View>
);

const TEMPO_COLORS = { Slow: BLUE, Medium: YELLOW, Upbeat: RED };
const DOT_COLORS = [RED, BLUE, YELLOW, RED, BLUE];

export default function WorshipScreen() {
  const [setlist, setSetlist] = useState([]);
  const [serveDate, setServeDate] = useState('Date coming soon');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'setlist'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) setSetlist(snap.docs.map(d => d.data()));
    });
    const sdUnsub = onSnapshot(collection(db, 'serve_date'), snap => {
      if (!snap.empty) setServeDate(snap.docs[0].data().date || 'Date coming soon');
    });
    return () => { unsub(); sdUnsub(); };
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    const entry = {
      id: Date.now(),
      title: title.trim(),
      artist: artist.trim(),
      key: key.trim(),
      notes: notes.trim(),
      time: new Date().toISOString(),
    };
    await addDoc(collection(db, 'song_suggestions'), entry);
    emailjs.send('service_mwzf07u', 'template_ndlfg0j', {
      subject: `🎶 New Song Suggestion — The CHOSEN Collective`,
      message: `SONG TITLE: ${entry.title}\n${entry.artist ? `ARTIST: ${entry.artist}\n` : ''}${entry.key ? `KEY: ${entry.key}\n` : ''}${entry.notes ? `\nNOTES: "${entry.notes}"` : ''}\n\n---\nSent via The CHOSEN Collective App`
    }).catch(console.error);
    setTitle(''); setArtist(''); setKey(''); setNotes('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CREAM }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.pageTitle}>Praise Team</Text>
              <Text style={styles.pageSub}>Set list and resources for the team.</Text>
            </View>
            <DotRow />
          </View>

          {/* Serve Date Banner */}
          <View style={styles.serveBanner}>
            <Text style={{ fontSize: 28 }}>🎶</Text>
            <View>
              <Text style={styles.serveBannerLabel}>Next Serve Date</Text>
              <Text style={styles.serveBannerDate}>{serveDate}</Text>
            </View>
          </View>

          {/* Set List */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Set List — {setlist.length} Songs</Text>
            {setlist.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🎵</Text>
                <Text style={styles.emptyText}>Set list coming soon.</Text>
                <Text style={styles.emptySub}>Check back before your next serve date.</Text>
              </View>
            ) : setlist.map((song, i) => (
              <View key={i} style={styles.songCard}>
                <View style={[styles.songNumber, { backgroundColor: DOT_COLORS[i % 5] + '18', borderColor: DOT_COLORS[i % 5] + '30' }]}>
                  <Text style={[styles.songNumberText, { color: DOT_COLORS[i % 5] }]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                  <Text style={styles.songArtist}>{song.artist}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {song.key && song.key.trim().length > 0 ? (
                    <View style={[styles.keyBadge, { backgroundColor: DOT_COLORS[i % 5] }]}>
                      <Text style={styles.keyBadgeText}>Key of {song.key}</Text>
                    </View>
                  ) : null}
                  {song.tempo && song.tempo.trim().length > 0 ? (
                    <View style={[styles.tempoBadge, { backgroundColor: (TEMPO_COLORS[song.tempo] || YELLOW) + '18' }]}>
                      <Text style={[styles.tempoBadgeText, { color: TEMPO_COLORS[song.tempo] || YELLOW }]}>{song.tempo}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>

          {/* Song Suggestion Form */}
          <View style={styles.section}>
            <Text style={styles.formTitle}>Suggest a Song</Text>
            <Text style={styles.formSub}>Have a song you'd love to worship to? Submit it here!</Text>
            <View style={styles.formCard}>
              {submitted ? (
                <View style={styles.successBox}>
                  <Text style={{ fontSize: 40, marginBottom: 10 }}>🎵</Text>
                  <Text style={styles.successTitle}>Song Submitted!</Text>
                  <Text style={styles.successSub}>Thank you! We'll take a look.</Text>
                </View>
              ) : (
                <>
                  {[
                    { val: title, set: setTitle, placeholder: 'Song title *' },
                    { val: artist, set: setArtist, placeholder: 'Artist / Worship leader' },
                    { val: key, set: setKey, placeholder: 'Key (if you know it)' },
                  ].map((f, i) => (
                    <TextInput
                      key={i}
                      value={f.val}
                      onChangeText={f.set}
                      placeholder={f.placeholder}
                      placeholderTextColor="#BBB"
                      style={styles.input}
                    />
                  ))}
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Any notes or why you love this song? (optional)"
                    placeholderTextColor="#BBB"
                    multiline
                    numberOfLines={2}
                    style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
                  />
                  <TouchableOpacity
                    onPress={handleSubmit}
                    style={[styles.submitBtn, !title.trim() && { backgroundColor: SOFT_GRAY }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.submitBtnText, !title.trim() && { color: '#BBB' }]}>
                      Submit Song 🎶
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
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
  serveBanner: {
    margin: 18, borderRadius: 18, padding: 16,
    backgroundColor: YELLOW, flexDirection: 'row', gap: 12, alignItems: 'center',
    shadowColor: YELLOW, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  serveBannerLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 },
  serveBannerDate: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
  section: { paddingHorizontal: 18, marginBottom: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#AAA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  songCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  songNumber: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  songNumberText: { fontSize: 14, fontWeight: '900' },
  songTitle: { fontSize: 14, fontWeight: '900', color: '#1A1A1A', marginBottom: 2 },
  songArtist: { fontSize: 12, color: '#999' },
  keyBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  keyBadgeText: { fontSize: 13, fontWeight: '900', color: '#FFFFFF' },
  tempoBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  tempoBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  formTitle: { fontSize: 15, fontWeight: '900', color: '#1A1A1A', marginBottom: 4 },
  formSub: { fontSize: 13, color: '#999', marginBottom: 16 },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: YELLOW + '25',
  },
  input: {
    backgroundColor: '#F2F0EB', borderRadius: 10,
    padding: 11, fontSize: 13, color: '#1A1A1A', marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: YELLOW, borderRadius: 100,
    padding: 13, alignItems: 'center',
    shadowColor: YELLOW, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  successBox: { alignItems: 'center', paddingVertical: 20 },
  successTitle: { fontSize: 16, fontWeight: '900', color: YELLOW },
  successSub: { fontSize: 13, color: '#999', marginTop: 4 },
  emptyState: { alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 13, fontWeight: '700', color: '#BBB', marginTop: 8 },
  emptySub: { fontSize: 12, color: '#CCC', marginTop: 4 },
});