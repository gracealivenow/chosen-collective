import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Platform, Modal, Alert, KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, orderBy, query, setDoc, updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';
const GREEN = '#22C55E';

const ACCENT_COLORS = [RED, BLUE, YELLOW];
const SUPER_ADMIN_EMAIL = 'kindal.w.white@gmail.com';

export default function AdminScreen({ onClose }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('announcements');
  const [saved, setSaved] = useState(false);

  // Data state
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [devotionals, setDevotionals] = useState([]);
  const [setlist, setSetlist] = useState([]);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [serveDate, setServeDateState] = useState('');
  const [serveDateDocId, setServeDateDocId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form state
  const [ann, setAnn] = useState({ emoji: '📣', title: '', detail: '', date: '', color: RED });
  const [event, setEvent] = useState({ month: '', day: '', title: '', time: '', location: '', color: RED });
  const [devo, setDevo] = useState({ date: '', title: '', verse: '', body: '', reflection: '', color: RED });
  const [song, setSong] = useState({ title: '', artist: '', key: '', tempo: 'Medium' });

  useEffect(() => {
    const unsubs = [
      onSnapshot(query(collection(db, 'announcements'), orderBy('id', 'desc')), s => setAnnouncements(s.docs.map(d => ({ ...d.data(), docId: d.id })))),
      onSnapshot(query(collection(db, 'events'), orderBy('id', 'asc')), s => setEvents(s.docs.map(d => ({ ...d.data(), docId: d.id })))),
      onSnapshot(query(collection(db, 'devotionals'), orderBy('id', 'desc')), s => setDevotionals(s.docs.map(d => ({ ...d.data(), docId: d.id })))),
      onSnapshot(query(collection(db, 'setlist'), orderBy('order', 'asc')), s => setSetlist(s.docs.map(d => ({ ...d.data(), docId: d.id })))),
      onSnapshot(query(collection(db, 'messages'), orderBy('id', 'desc')), s => setMessages(s.docs.map(d => ({ ...d.data(), docId: d.id })))),
      onSnapshot(query(collection(db, 'song_suggestions'), orderBy('id', 'desc')), s => setSuggestions(s.docs.map(d => ({ ...d.data(), docId: d.id })))),
      onSnapshot(collection(db, 'users'), s => {
        const allUsers = s.docs.map(d => ({ ...d.data(), docId: d.id }));
        allUsers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setUsers(allUsers);
      }),
      onSnapshot(collection(db, 'serve_date'), s => {
        if (!s.empty) {
          setServeDateState(s.docs[0].data().date || '');
          setServeDateDocId(s.docs[0].id);
        }
      }),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const addAnnouncement = async () => {
    if (!ann.title.trim()) return;
    await addDoc(collection(db, 'announcements'), { ...ann, id: Date.now() });
    setAnn({ emoji: '📣', title: '', detail: '', date: '', color: RED });
    flash();
  };

  const deleteAnnouncement = (docId) => deleteDoc(doc(db, 'announcements', docId));

  const addEvent = async () => {
    if (!event.title.trim()) return;
    await addDoc(collection(db, 'events'), { ...event, id: Date.now() });
    setEvent({ month: '', day: '', title: '', time: '', location: '', color: RED });
    flash();
  };

  const deleteEvent = (docId) => deleteDoc(doc(db, 'events', docId));

  const addDevo = async () => {
    if (!devo.title.trim()) return;
    await addDoc(collection(db, 'devotionals'), { ...devo, id: Date.now() });
    setDevo({ date: '', title: '', verse: '', body: '', reflection: '', color: RED });
    flash();
  };

  const addSong = async () => {
    if (!song.title.trim()) return;
    await addDoc(collection(db, 'setlist'), { ...song, id: Date.now(), order: setlist.length + 1 });
    setSong({ title: '', artist: '', key: '', tempo: 'Medium' });
    flash();
  };

  const deleteSong = (docId) => deleteDoc(doc(db, 'setlist', docId));

  const saveServeDate = async () => {
    if (serveDateDocId) {
      await setDoc(doc(db, 'serve_date', serveDateDocId), { date: serveDate });
    } else {
      await addDoc(collection(db, 'serve_date'), { date: serveDate });
    }
    flash();
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      const formatted = date.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      });
      setServeDateState(formatted);
    }
  };

  const removeUser = (user) => {
    if (user.email === SUPER_ADMIN_EMAIL) {
      Alert.alert('Cannot Remove', 'This account cannot be removed.');
      return;
    }
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${user.name || user.email}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteDoc(doc(db, 'users', user.docId)) }
      ]
    );
  };

  const toggleAdmin = async (user) => {
    if (user.email === SUPER_ADMIN_EMAIL) {
      Alert.alert('Super Admin', 'This account always has admin access.');
      return;
    }
    await updateDoc(doc(db, 'users', user.docId), { isAdmin: !user.isAdmin });
    flash();
  };

  const ADMIN_TABS = [
    { key: 'announcements', label: '📣 News' },
    { key: 'events', label: '📅 Events' },
    { key: 'devotionals', label: '📖 Devos' },
    { key: 'worship', label: '🎶 Worship' },
    { key: 'inbox', label: '💌 Inbox' },
    { key: 'users', label: '👥 Members' },
  ];

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: DARK }}>

        <View style={[styles.adminHeader, { paddingTop: insets.top + 12 }]}>
          <View>
            <Text style={styles.adminHeaderSub}>Admin Panel</Text>
            <Text style={styles.adminHeaderTitle}>The CHOSEN Collective</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: CREAM }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          {saved && (
            <View style={styles.savedBanner}>
              <Text style={styles.savedBannerText}>✓ Saved!</Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
              {ADMIN_TABS.map(t => (
                <TouchableOpacity key={t.key} onPress={() => setActiveTab(t.key)} style={[styles.tabPill, activeTab === t.key && styles.tabPillActive]}>
                  <Text style={[styles.tabPillText, activeTab === t.key && styles.tabPillTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>

              {/* ANNOUNCEMENTS */}
              {activeTab === 'announcements' && (
                <View>
                  <Text style={styles.sectionTitle}>Add Announcement</Text>
                  <View style={styles.formCard}>
                    {[{ val: ann.emoji, key: 'emoji', ph: 'Emoji (e.g. 🔥)' }, { val: ann.title, key: 'title', ph: 'Title *' }, { val: ann.detail, key: 'detail', ph: 'Details' }, { val: ann.date, key: 'date', ph: 'Date (e.g. May 3)' }].map(f => (
                      <TextInput key={f.key} value={f.val} onChangeText={v => setAnn({ ...ann, [f.key]: v })} placeholder={f.ph} placeholderTextColor="#BBB" style={styles.input} />
                    ))}
                    <View style={styles.colorRow}>
                      {ACCENT_COLORS.map(c => (
                        <TouchableOpacity key={c} onPress={() => setAnn({ ...ann, color: c })}>
                          <View style={[styles.colorDot, { backgroundColor: c, borderWidth: ann.color === c ? 3 : 0, borderColor: DARK }]} />
                        </TouchableOpacity>
                      ))}
                      <Text style={styles.colorLabel}>Pick color</Text>
                    </View>
                    <TouchableOpacity onPress={addAnnouncement} style={[styles.addBtn, { backgroundColor: RED }]}>
                      <Text style={styles.addBtnText}>Add Announcement</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.listLabel}>Current ({announcements.length})</Text>
                  {announcements.map((a, i) => (
                    <View key={i} style={[styles.listItem, { borderLeftColor: a.color }]}>
                      <Text style={{ fontSize: 16 }}>{a.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listItemTitle}>{a.title}</Text>
                        <Text style={styles.listItemSub}>{a.date}</Text>
                      </View>
                      <TouchableOpacity onPress={() => deleteAnnouncement(a.docId)}>
                        <Text style={{ fontSize: 18, color: '#DDD' }}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* EVENTS */}
              {activeTab === 'events' && (
                <View>
                  <Text style={styles.sectionTitle}>Add Event</Text>
                  <View style={styles.formCard}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TextInput value={event.month} onChangeText={v => setEvent({ ...event, month: v })} placeholder="Month (MAY)" placeholderTextColor="#BBB" style={[styles.input, { flex: 1 }]} />
                      <TextInput value={event.day} onChangeText={v => setEvent({ ...event, day: v })} placeholder="Day (10)" placeholderTextColor="#BBB" style={[styles.input, { flex: 1 }]} />
                    </View>
                    {[{ val: event.title, key: 'title', ph: 'Event name *' }, { val: event.time, key: 'time', ph: 'Time (e.g. 7:00 PM)' }, { val: event.location, key: 'location', ph: 'Location' }].map(f => (
                      <TextInput key={f.key} value={f.val} onChangeText={v => setEvent({ ...event, [f.key]: v })} placeholder={f.ph} placeholderTextColor="#BBB" style={styles.input} />
                    ))}
                    <View style={styles.colorRow}>
                      {ACCENT_COLORS.map(c => (
                        <TouchableOpacity key={c} onPress={() => setEvent({ ...event, color: c })}>
                          <View style={[styles.colorDot, { backgroundColor: c, borderWidth: event.color === c ? 3 : 0, borderColor: DARK }]} />
                        </TouchableOpacity>
                      ))}
                      <Text style={styles.colorLabel}>Pick color</Text>
                    </View>
                    <TouchableOpacity onPress={addEvent} style={[styles.addBtn, { backgroundColor: BLUE }]}>
                      <Text style={styles.addBtnText}>Add Event</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.listLabel}>Current Events ({events.length})</Text>
                  {events.map((e, i) => (
                    <View key={i} style={styles.listItem}>
                      <View style={[styles.dateBlock, { backgroundColor: e.color || RED }]}>
                        <Text style={styles.dateBlockMonth}>{e.month}</Text>
                        <Text style={styles.dateBlockDay}>{e.day}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listItemTitle}>{e.title}</Text>
                        <Text style={styles.listItemSub}>{e.time} · {e.location}</Text>
                      </View>
                      <TouchableOpacity onPress={() => deleteEvent(e.docId)}>
                        <Text style={{ fontSize: 18, color: '#DDD' }}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* DEVOTIONALS */}
              {activeTab === 'devotionals' && (
                <View>
                  <Text style={styles.sectionTitle}>Add Devotional</Text>
                  <View style={styles.formCard}>
                    {[{ val: devo.date, key: 'date', ph: 'Date (e.g. May 3, 2026)' }, { val: devo.title, key: 'title', ph: 'Title *' }, { val: devo.verse, key: 'verse', ph: 'Scripture verse (CSB)' }].map(f => (
                      <TextInput key={f.key} value={f.val} onChangeText={v => setDevo({ ...devo, [f.key]: v })} placeholder={f.ph} placeholderTextColor="#BBB" style={styles.input} />
                    ))}
                    {[{ val: devo.body, key: 'body', ph: 'Devotional message...' }, { val: devo.reflection, key: 'reflection', ph: 'Reflection question...' }].map(f => (
                      <TextInput key={f.key} value={f.val} onChangeText={v => setDevo({ ...devo, [f.key]: v })} placeholder={f.ph} placeholderTextColor="#BBB" multiline numberOfLines={3} style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]} />
                    ))}
                    <View style={styles.colorRow}>
                      {ACCENT_COLORS.map(c => (
                        <TouchableOpacity key={c} onPress={() => setDevo({ ...devo, color: c })}>
                          <View style={[styles.colorDot, { backgroundColor: c, borderWidth: devo.color === c ? 3 : 0, borderColor: DARK }]} />
                        </TouchableOpacity>
                      ))}
                      <Text style={styles.colorLabel}>Accent color</Text>
                    </View>
                    <TouchableOpacity onPress={addDevo} style={[styles.addBtn, { backgroundColor: RED }]}>
                      <Text style={styles.addBtnText}>Publish Devotional</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.listLabel}>Published ({devotionals.length})</Text>
                  {devotionals.map((d, i) => (
                    <View key={i} style={[styles.listItem, { borderLeftColor: d.color || RED }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listItemTitle}>{d.title}</Text>
                        <Text style={styles.listItemSub}>{d.date}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* WORSHIP */}
              {activeTab === 'worship' && (
                <View>
                  <Text style={styles.sectionTitle}>Serve Date</Text>
                  <View style={styles.formCard}>
                    <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)} style={styles.datePickerBtn}>
                      <Text style={styles.datePickerIcon}>📅</Text>
                      <Text style={styles.datePickerText}>{serveDate || 'Tap to select serve date'}</Text>
                      <Text style={{ fontSize: 12, color: '#999' }}>{showDatePicker ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker value={selectedDate} mode="date" display="spinner" onChange={handleDateChange} minimumDate={new Date()} style={{ backgroundColor: WARM_WHITE }} />
                    )}
                    <TouchableOpacity onPress={saveServeDate} style={[styles.addBtn, { backgroundColor: YELLOW }]}>
                      <Text style={styles.addBtnText}>Save Serve Date ✓</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Add Song to Set List</Text>
                  <View style={styles.formCard}>
                    {[{ val: song.title, key: 'title', ph: 'Song title *' }, { val: song.artist, key: 'artist', ph: 'Artist' }, { val: song.key, key: 'key', ph: 'Key (e.g. G, B♭)' }].map(f => (
                      <TextInput key={f.key} value={f.val} onChangeText={v => setSong({ ...song, [f.key]: v })} placeholder={f.ph} placeholderTextColor="#BBB" style={styles.input} />
                    ))}
                    <View style={styles.tempoRow}>
                      {['Slow', 'Medium', 'Upbeat'].map(t => (
                        <TouchableOpacity key={t} onPress={() => setSong({ ...song, tempo: t })} style={[styles.tempoPill, song.tempo === t && styles.tempoPillActive]}>
                          <Text style={[styles.tempoPillText, song.tempo === t && { color: WARM_WHITE }]}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity onPress={addSong} style={[styles.addBtn, { backgroundColor: YELLOW }]}>
                      <Text style={styles.addBtnText}>Add to Set List</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.listLabel}>Set List ({setlist.length} songs)</Text>
                  {setlist.map((s, i) => (
                    <View key={i} style={styles.listItem}>
                      <Text style={styles.listItemNum}>{i + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listItemTitle}>{s.title}</Text>
                        <Text style={styles.listItemSub}>{s.artist} · Key of {s.key} · {s.tempo}</Text>
                      </View>
                      <TouchableOpacity onPress={() => deleteSong(s.docId)}>
                        <Text style={{ fontSize: 18, color: '#DDD' }}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {suggestions.length > 0 && (
                    <>
                      <Text style={[styles.listLabel, { marginTop: 24 }]}>Song Suggestions ({suggestions.length})</Text>
                      {suggestions.map((s, i) => (
                        <View key={i} style={[styles.listItem, { borderLeftColor: [RED, BLUE, YELLOW][i % 3] }]}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.listItemTitle}>{s.title}</Text>
                            {s.artist ? <Text style={styles.listItemSub}>by {s.artist}{s.key ? ` · Key: ${s.key}` : ''}</Text> : null}
                            {s.notes ? <Text style={[styles.listItemSub, { fontStyle: 'italic' }]}>"{s.notes}"</Text> : null}
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              )}

              {/* INBOX */}
              {activeTab === 'inbox' && (
                <View>
                  <Text style={styles.sectionTitle}>Confidential Messages ({messages.length})</Text>
                  {messages.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={{ fontSize: 32, marginBottom: 8 }}>💌</Text>
                      <Text style={styles.emptyText}>No messages yet.</Text>
                    </View>
                  ) : messages.map((m, i) => (
                    <View key={i} style={[styles.listItem, { borderLeftColor: RED, flexDirection: 'column', gap: 6 }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.listItemTitle}>{m.name}</Text>
                        <Text style={styles.listItemSub}>{m.email || 'No email'}</Text>
                      </View>
                      <Text style={{ fontSize: 14, color: '#555', lineHeight: 20 }}>{m.body}</Text>
                      <Text style={[styles.listItemSub, { marginTop: 4 }]}>
                        {m.time ? new Date(m.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* MEMBERS */}
              {activeTab === 'users' && (
                <View>
                  <Text style={styles.sectionTitle}>All Members ({users.length})</Text>
                  <Text style={[styles.listItemSub, { marginBottom: 16 }]}>
                    Tap the shield to toggle admin. Tap remove to delete unrecognized accounts.
                  </Text>
                  {users.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={{ fontSize: 32, marginBottom: 8 }}>👥</Text>
                      <Text style={styles.emptyText}>No members signed up yet.</Text>
                    </View>
                  ) : users.map((u, i) => (
                    <View key={i} style={[styles.listItem, { borderLeftColor: u.isAdmin ? YELLOW : SOFT_GRAY }]}>
                      <View style={[styles.userAvatar, { backgroundColor: u.avatarColor || RED }]}>
                        <Text style={styles.userAvatarText}>{u.initials || '??'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.listItemTitle}>{u.name || u.fullName || 'Unknown'}</Text>
                          {u.isAdmin && <Text style={styles.adminBadge}>ADMIN</Text>}
                          {u.email === SUPER_ADMIN_EMAIL && <Text style={styles.superBadge}>SUPER</Text>}
                        </View>
                        <Text style={styles.listItemSub}>{u.email}</Text>
                        {u.createdAt && (
                          <Text style={styles.listItemSub}>
                            Joined {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Text>
                        )}
                      </View>
                      <View style={{ gap: 8, alignItems: 'flex-end' }}>
                        <TouchableOpacity onPress={() => toggleAdmin(u)} style={[styles.adminToggleBtn, { backgroundColor: u.isAdmin ? YELLOW : SOFT_GRAY }]}>
                          <Text style={{ fontSize: 14 }}>🛡</Text>
                        </TouchableOpacity>
                        {u.email !== SUPER_ADMIN_EMAIL && (
                          <TouchableOpacity onPress={() => removeUser(u)} style={styles.removeBtn}>
                            <Text style={styles.removeBtnText}>Remove</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  adminHeader: {
    backgroundColor: DARK, paddingHorizontal: 20, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  adminHeaderSub: { fontSize: 11, fontWeight: '800', color: YELLOW, letterSpacing: 2, textTransform: 'uppercase' },
  adminHeaderTitle: { fontSize: 17, fontWeight: '900', color: WARM_WHITE },
  closeBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  closeBtnText: { fontSize: 12, fontWeight: '800', color: WARM_WHITE },
  savedBanner: {
    position: 'absolute', top: 80, alignSelf: 'center',
    backgroundColor: GREEN, borderRadius: 100,
    paddingHorizontal: 20, paddingVertical: 8, zIndex: 100,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 10,
  },
  savedBannerText: { fontSize: 13, fontWeight: '800', color: WARM_WHITE },
  tabBar: { backgroundColor: WARM_WHITE, borderBottomWidth: 2, borderBottomColor: SOFT_GRAY, paddingHorizontal: 16, paddingVertical: 10, flexGrow: 0 },
  tabPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, backgroundColor: SOFT_GRAY, marginRight: 8 },
  tabPillActive: { backgroundColor: DARK },
  tabPillText: { fontSize: 12, fontWeight: '800', color: '#777' },
  tabPillTextActive: { color: WARM_WHITE },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: DARK, marginBottom: 14 },
  datePickerBtn: { backgroundColor: SOFT_GRAY, borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  datePickerIcon: { fontSize: 20 },
  datePickerText: { fontSize: 14, color: DARK, fontWeight: '600', flex: 1 },
  formCard: { backgroundColor: WARM_WHITE, borderRadius: 20, padding: 18, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  input: { backgroundColor: SOFT_GRAY, borderRadius: 10, padding: 11, fontSize: 13, color: DARK, marginBottom: 10 },
  colorRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 14 },
  colorDot: { width: 28, height: 28, borderRadius: 8 },
  colorLabel: { fontSize: 12, color: '#999' },
  addBtn: { borderRadius: 100, padding: 13, alignItems: 'center' },
  addBtnText: { color: WARM_WHITE, fontSize: 14, fontWeight: '800' },
  listLabel: { fontSize: 12, fontWeight: '800', color: '#AAA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  listItem: { backgroundColor: WARM_WHITE, borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4, borderLeftColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  listItemTitle: { fontSize: 13, fontWeight: '800', color: DARK },
  listItemSub: { fontSize: 11, color: '#999', marginTop: 2 },
  listItemNum: { width: 28, height: 28, borderRadius: 8, backgroundColor: SOFT_GRAY, textAlign: 'center', lineHeight: 28, fontSize: 13, fontWeight: '900', color: DARK },
  dateBlock: { width: 40, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dateBlockMonth: { fontSize: 8, fontWeight: '900', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' },
  dateBlockDay: { fontSize: 18, fontWeight: '900', color: WARM_WHITE },
  tempoRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tempoPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, backgroundColor: SOFT_GRAY },
  tempoPillActive: { backgroundColor: DARK },
  tempoPillText: { fontSize: 12, fontWeight: '800', color: '#777' },
  emptyState: { alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 13, fontWeight: '700', color: '#BBB', marginTop: 8 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 13, fontWeight: '900', color: WARM_WHITE },
  adminBadge: { fontSize: 9, fontWeight: '900', color: YELLOW, backgroundColor: DARK, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  superBadge: { fontSize: 9, fontWeight: '900', color: WARM_WHITE, backgroundColor: RED, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  adminToggleBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  removeBtn: { backgroundColor: '#FFE5E5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  removeBtnText: { fontSize: 11, fontWeight: '800', color: RED },
});