import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, orderBy, query, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';

const RED = '#E8302A';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';

const QUICK_REACTIONS = ['🔥', '🙏', '❤️', '🙌', '😭', '✅'];

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
  const bottomRef = useRef(null);

  const userName = profile?.fullName || 'Anonymous';
  const userAvatar = profile?.initials || '??';
  const userColor = profile?.avatarColor || RED;

  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('id', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setChats(snap.docs.map((d) => ({ ...d.data(), docId: d.id })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chats]);

  const handlePost = async (e) => {
    if (e) e.preventDefault();
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
    const reactions = currentReactions || [];
    const existing = reactions.find((r) => r.emoji === emoji);
    let updated;
    if (existing) {
      updated = reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r));
    } else {
      updated = [...reactions, { emoji, count: 1 }];
    }
    await updateDoc(doc(db, 'chats', docId), { reactions: updated });
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <header style={s.header}>
        <h1 style={s.pageTitle}>Community Chat</h1>
        <p style={s.pageSub}>A space for The CHOSEN Collective to connect.</p>
      </header>

      {/* Guidelines */}
      <div style={s.guidelineWrap}>
        <div style={s.guidelinePill}>
          <span style={s.guidelineText}>✨ Be uplifting · Be respectful · Represent Christ well</span>
        </div>
      </div>

      {/* Messages */}
      <div style={s.scrollArea}>
        {chats.length === 0 && (
          <div style={s.emptyState}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>💬</span>
            <div style={s.emptyText}>No messages yet.</div>
            <div style={s.emptySub}>Be the first to say something!</div>
          </div>
        )}
        {chats.map((c, i) => {
          const color = c.color || RED;
          return (
            <div key={i} style={s.messageRow}>
              <div style={{ ...s.avatar, backgroundColor: color }}>
                <span style={s.avatarText}>{c.avatar}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.nameTime}>
                  <span style={{ ...s.msgName, color }}>{c.name}</span>
                  <span style={s.msgTime}>{timeAgo(c.time)}</span>
                </div>
                <div style={s.bubble}>
                  <p style={s.bubbleText}>{c.message}</p>
                </div>
                {c.reactions && c.reactions.length > 0 && (
                  <div style={s.reactionsRow}>
                    {c.reactions.map((r, ri) => (
                      <button
                        key={ri}
                        onClick={() => handleReact(c.docId, r.emoji, c.reactions)}
                        style={s.reactionBadge}
                      >
                        <span style={{ fontSize: 13 }}>{r.emoji}</span>
                        <span style={s.reactionCount}>{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div style={s.quickReactRow}>
                  {QUICK_REACTIONS.map((emoji, ri) => (
                    <button
                      key={ri}
                      onClick={() => handleReact(c.docId, emoji, c.reactions || [])}
                      style={s.quickReact}
                    >
                      <span style={{ fontSize: 14 }}>{emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <form style={s.composeArea} onSubmit={handlePost}>
        <div style={s.chattingAs}>
          <div style={{ ...s.miniAvatar, backgroundColor: userColor }}>
            <span style={s.miniAvatarText}>{userAvatar}</span>
          </div>
          <span style={s.chattingAsText}>
            Chatting as <span style={{ color: userColor, fontWeight: 800 }}>{userName}</span>
          </span>
        </div>
        <div style={s.composeRow}>
          <textarea
            value={chatMsg}
            onChange={(e) => setChatMsg(e.target.value)}
            placeholder="Say something encouraging..."
            rows={1}
            style={s.composeInput}
          />
          <button
            type="submit"
            disabled={!chatMsg.trim()}
            style={{
              ...s.sendBtn,
              ...(!chatMsg.trim() && { backgroundColor: SOFT_GRAY, boxShadow: 'none' }),
            }}
          >
            <span style={{ fontSize: 18, color: !chatMsg.trim() ? '#BBB' : '#FFF' }}>➤</span>
          </button>
        </div>
      </form>
    </div>
  );
}

const s = {
  container: {
    height: 'calc(100vh - 70px)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: CREAM,
  },
  header: {
    backgroundColor: WARM_WHITE,
    padding: '16px 18px',
    borderBottom: `2px solid ${SOFT_GRAY}`,
  },
  pageTitle: { fontSize: 18, fontWeight: 900, color: DARK, margin: 0 },
  pageSub: { fontSize: 13, color: '#999', marginTop: 2, margin: '2px 0 0' },
  guidelineWrap: { padding: '10px 18px' },
  guidelinePill: {
    backgroundColor: YELLOW + '18', borderRadius: 100,
    padding: '6px 14px', display: 'inline-block',
    border: `1px solid ${YELLOW}30`,
  },
  guidelineText: { fontSize: 11, fontWeight: 800, color: YELLOW },
  scrollArea: {
    flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 8,
  },
  messageRow: { display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 12, fontWeight: 900, color: WARM_WHITE },
  nameTime: { display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 5 },
  msgName: { fontSize: 13, fontWeight: 900 },
  msgTime: { fontSize: 11, color: '#BBB' },
  bubble: {
    backgroundColor: WARM_WHITE,
    borderRadius: '4px 18px 18px 18px',
    padding: 12, marginBottom: 8,
    boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
  },
  bubbleText: { fontSize: 14, color: '#333', lineHeight: 1.5, margin: 0, wordBreak: 'break-word' },
  reactionsRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 },
  reactionBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    backgroundColor: SOFT_GRAY, borderRadius: 100,
    padding: '3px 9px', border: 'none', cursor: 'pointer',
    fontFamily: 'inherit',
  },
  reactionCount: { fontSize: 11, fontWeight: 800, color: '#888' },
  quickReactRow: { display: 'flex', gap: 4 },
  quickReact: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: SOFT_GRAY,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer', opacity: 0.6,
    fontFamily: 'inherit',
  },
  composeArea: {
    backgroundColor: WARM_WHITE, borderTop: `2px solid ${SOFT_GRAY}`,
    padding: 12,
  },
  chattingAs: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  miniAvatar: {
    width: 24, height: 24, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  miniAvatarText: { fontSize: 9, fontWeight: 900, color: '#FFF' },
  chattingAsText: { fontSize: 12, color: '#AAA', fontWeight: 700 },
  composeRow: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  composeInput: {
    flex: 1, backgroundColor: SOFT_GRAY, borderRadius: 12,
    padding: '10px 14px', fontSize: 13, color: DARK, maxHeight: 80,
    border: 'none', outline: 'none', resize: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 100,
    backgroundColor: RED,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(232, 48, 42, 0.3)',
    fontFamily: 'inherit', flexShrink: 0,
  },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 13, fontWeight: 700, color: '#BBB', marginTop: 8 },
  emptySub: { fontSize: 12, color: '#CCC', marginTop: 4 },
};