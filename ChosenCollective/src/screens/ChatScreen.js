import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform
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

const QUICK_REACTIONS = ['🔥', '🙏', '❤️', '🙌', '😭', '✅'];
const AVATAR_COLORS = [RED, BLUE, YELLOW];

function timeAgo(iso) {
  if (!iso) return 'just now';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ChatScreen() {
  const { profile } = useUser();
  const [chats, setChats] = useState([]);
  const [chatMsg, setChatMsg] = useState('');
  const scrollRef = useRef(null);

  const userName = profile?.fullName || 'Anonymous';
  const userAvatar = profile?.initials || '??';
  const userColor = profile?.avatarColor || RED;

  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('id', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setChats(snap.docs.map(d => ({ ...d.data(), docId: d.id })));
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsub;
  }, []);

  const handlePost = async () => {
    if (!chatMsg.trim()) return;
    const entry = {
      id: Date.now(),
      name: userName,
      avatar: userAvatar,
      color: userColor,
      message: chatMsg.trim(),
      time: new Date().toISOString(),
      reactions: [],
    };
    await addDoc(collection(db, 'chats'), entry);
    setChatMsg('');
  };

  const handleReact = async (docId, emoji, currentReactions) => {
    const existing = currentReactions.find(r => r.emoji === emoji);
    let updated;
    if (existing) {
      updated = currentReactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r);
    } else {
      updated = [...currentReactions, { emoji, count: 1 }];
    }
    await updateDoc(doc(db, 'chats', docId), { reactions: updated });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CREAM }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Community Chat</Text>
            <Text style={styles.pageSub}>A space for The CHOSEN Collective to connect.</Text>
          </View>
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinePill}>
          <Text style={styles.guidelineText}>✨ Be uplifting · Be respectful · Represent Christ well</Text>
        </View>

        {/* Chat Feed */}
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        >
          {chats.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>💬</Text>
              <Text style={styles.emptyText}>No messages yet.</Text>
              <Text style={styles.emptySub}>Be the first to say something!</Text>
            </View>
          )}
          {chats.map((c, i) => (
            <View key={i} style={styles.messageRow}>
              <View style={[styles.avatar, { backgroundColor: c.color || RED }]}>
                <Text style={styles.avatarText}>{c.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameTime}>
                  <Text style={[styles.msgName, { color: c.color || RED }]}>{c.name}</Text>
                  <Text style={styles.msgTime}>{timeAgo(c.time)}</Text>
                </View>
                <View style={styles.bubble}>
                  <Text style={styles.bubbleText}>{c.message}</Text>
                </View>
                {c.reactions && c.reactions.length > 0 && (
                  <View style={styles.reactionsRow}>
                    {c.reactions.map((r, ri) => (
                      <TouchableOpacity
                        key={ri}
                        onPress={() => handleReact(c.docId, r.emoji, c.reactions)}
                        style={styles.reactionBadge}
                      >
                        <Text style={{ fontSize: 13 }}>{r.emoji}</Text>
                        <Text style={styles.reactionCount}>{r.count}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <View style={styles.quickReactRow}>
                  {QUICK_REACTIONS.map((emoji, ri) => (
                    <TouchableOpacity
                      key={ri}
                      onPress={() => handleReact(c.docId, emoji, c.reactions || [])}
                      style={styles.quickReact}
                    >
                      <Text style={{ fontSize: 14 }}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Compose */}
        <View style={styles.composeArea}>
          <View style={styles.chattingAs}>
            <View style={[styles.miniAvatar, { backgroundColor: userColor }]}>
              <Text style={styles.miniAvatarText}>{userAvatar}</Text>
            </View>
            <Text style={styles.chattingAsText}>
              Chatting as <Text style={{ color: userColor, fontWeight: '800' }}>{userName}</Text>
            </Text>
          </View>
          <View style={styles.composeRow}>
            <TextInput
              value={chatMsg}
              onChangeText={setChatMsg}
              placeholder="Say something encouraging..."
              placeholderTextColor="#BBB"
              multiline
              style={[styles.composeInput, { flex: 1 }]}
            />
            <TouchableOpacity
              onPress={handlePost}
              style={[styles.sendBtn, !chatMsg.trim() && { backgroundColor: SOFT_GRAY }]}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 18, color: !chatMsg.trim() ? '#BBB' : '#FFF' }}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 18,
    paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: '#F2F0EB',
  },
  pageTitle: { fontSize: 18, fontWeight: '900', color: '#1A1A1A' },
  pageSub: { fontSize: 13, color: '#999', marginTop: 2 },
  guidelinePill: {
    marginHorizontal: 18, marginVertical: 10,
    backgroundColor: YELLOW + '18', borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: YELLOW + '30', alignSelf: 'flex-start',
  },
  guidelineText: { fontSize: 11, fontWeight: '800', color: YELLOW },
  messageRow: { flexDirection: 'row', gap: 10, marginBottom: 16, alignItems: 'flex-start' },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 12, fontWeight: '900', color: '#FFFFFF' },
  nameTime: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 5 },
  msgName: { fontSize: 13, fontWeight: '900' },
  msgTime: { fontSize: 11, color: '#BBB' },
  bubble: {
    backgroundColor: '#FFFFFF', borderRadius: 4,
    borderTopRightRadius: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
    padding: 12, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  bubbleText: { fontSize: 14, color: '#333', lineHeight: 22 },
  reactionsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 6 },
  reactionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F2F0EB', borderRadius: 100,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  reactionCount: { fontSize: 11, fontWeight: '800', color: '#888' },
  quickReactRow: { flexDirection: 'row', gap: 4 },
  quickReact: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#F2F0EB', alignItems: 'center', justifyContent: 'center',
    opacity: 0.6,
  },
  composeArea: {
    backgroundColor: '#FFFFFF', borderTopWidth: 2,
    borderTopColor: '#F2F0EB', padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 0 : 12,
  },
  chattingAs: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  miniAvatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { fontSize: 9, fontWeight: '900', color: '#FFF' },
  chattingAsText: { fontSize: 12, color: '#AAA', fontWeight: '700' },
  composeRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  composeInput: {
    backgroundColor: '#F2F0EB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 13, color: '#1A1A1A', maxHeight: 80,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 100,
    backgroundColor: RED, alignItems: 'center', justifyContent: 'center',
    shadowColor: RED, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 13, fontWeight: '700', color: '#BBB', marginTop: 8 },
  emptySub: { fontSize: 12, color: '#CCC', marginTop: 4 },
});