import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, orderBy, query,
  addDoc, updateDoc, deleteDoc, doc, setDoc, getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const NAVY = '#1a1a2e';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';

const COLOR_OPTIONS = [
  { name: 'Red', value: RED },
  { name: 'Blue', value: BLUE },
  { name: 'Yellow', value: YELLOW },
];

const TEMPO_OPTIONS = ['Slow', 'Medium', 'Upbeat'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function timeAgo(iso) {
  if (!iso) return 'just now';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ====================== SHARED COMPONENTS ====================== */

function FormModal({ title, onClose, onSave, saving, children }) {
  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>{title}</h2>
          <button onClick={onClose} style={s.modalClose}>✕</button>
        </div>
        <div style={s.modalBody}>{children}</div>
        <div style={s.modalActions}>
          <button onClick={onClose} style={s.cancelBtn}>Cancel</button>
          <button onClick={onSave} disabled={saving} style={s.saveBtn}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDelete({ name, onConfirm, onCancel }) {
  return (
    <div style={s.modalOverlay} onClick={onCancel}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={s.modalTitle}>Delete this {name}?</h2>
        <p style={s.confirmText}>This can't be undone.</p>
        <div style={s.modalActions}>
          <button onClick={onCancel} style={s.cancelBtn}>Cancel</button>
          <button onClick={onConfirm} style={s.deleteBtn}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <div style={s.colorPicker}>
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          style={{
            ...s.colorOption,
            backgroundColor: c.value,
            ...(value === c.value && s.colorOptionSelected),
          }}
          aria-label={c.name}
        />
      ))}
    </div>
  );
}

/* ====================== DEVOTIONALS TAB ====================== */

function DevotionalsTab() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [verse, setVerse] = useState('');
  const [body, setBody] = useState('');
  const [reflection, setReflection] = useState('');
  const [color, setColor] = useState(RED);

  useEffect(() => {
    const q = query(collection(db, 'devotionals'), orderBy('id', 'desc'));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ docId: d.id, ...d.data() })));
    });
  }, []);

  const openAdd = () => {
    setEditing(null);
    setDate('');
    setTitle('');
    setVerse('');
    setBody('');
    setReflection('');
    setColor(RED);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setDate(item.date || '');
    setTitle(item.title || '');
    setVerse(item.verse || '');
    setBody(item.body || '');
    setReflection(item.reflection || '');
    setColor(item.color || RED);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('Title is required.');
    setSaving(true);
    const data = {
      date: date.trim(),
      title: title.trim(),
      verse: verse.trim(),
      body: body.trim(),
      reflection: reflection.trim(),
      color,
    };
    try {
      if (editing) {
        await updateDoc(doc(db, 'devotionals', editing.docId), data);
      } else {
        data.id = Date.now();
        await addDoc(collection(db, 'devotionals'), data);
      }
      setShowForm(false);
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (docId) => {
    try {
      await deleteDoc(doc(db, 'devotionals', docId));
      setConfirmId(null);
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  return (
    <div>
      <div style={s.tabHeader}>
        <h2 style={s.tabTitle}>Devotionals</h2>
        <button onClick={openAdd} style={s.addBtn}>+ Add Devotional</button>
      </div>

      {items.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: 32 }}>📖</span>
          <p style={s.emptyText}>No devotionals yet. Add your first one!</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.docId} style={s.itemCard}>
            <div style={{ ...s.itemAccent, backgroundColor: item.color || RED }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={s.itemDate}>{item.date || 'No date'}</div>
              <div style={s.itemTitle}>{item.title}</div>
              {item.verse && <div style={s.itemPreview}>{item.verse.slice(0, 80)}{item.verse.length > 80 ? '...' : ''}</div>}
            </div>
            <div style={s.itemActions}>
              <button onClick={() => openEdit(item)} style={s.editBtn}>Edit</button>
              <button onClick={() => setConfirmId(item.docId)} style={s.deleteIconBtn}>🗑</button>
            </div>
          </div>
        ))
      )}

      {showForm && (
        <FormModal
          title={editing ? 'Edit Devotional' : 'New Devotional'}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          saving={saving}
        >
          <label style={s.label}>Date (e.g. April 23, 2026)</label>
          <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="April 23, 2026" style={s.input} />

          <label style={s.label}>Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="You Are Not Hidden" style={s.input} />

          <label style={s.label}>Verse</label>
          <textarea value={verse} onChange={(e) => setVerse(e.target.value)} placeholder='"But even the hairs..." — Luke 12:7 CSB' rows={3} style={s.textarea} />

          <label style={s.label}>Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="The main devotional content..." rows={6} style={s.textarea} />

          <label style={s.label}>Reflection question</label>
          <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="What is God speaking to you today?" rows={2} style={s.textarea} />

          <label style={s.label}>Accent Color</label>
          <ColorPicker value={color} onChange={setColor} />
        </FormModal>
      )}

      {confirmId && (
        <ConfirmDelete name="devotional" onConfirm={() => handleDelete(confirmId)} onCancel={() => setConfirmId(null)} />
      )}
    </div>
  );
}

/* ====================== ANNOUNCEMENTS TAB ====================== */

function AnnouncementsTab() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState('📣');
  const [color, setColor] = useState(RED);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('date', 'desc'));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ docId: d.id, ...d.data() })));
    });
  }, []);

  const openAdd = () => {
    setEditing(null);
    setDate('');
    setTitle('');
    setMessage('');
    setEmoji('📣');
    setColor(RED);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setDate(item.date || '');
    setTitle(item.title || '');
    setMessage(item.message || '');
    setEmoji(item.emoji || '📣');
    setColor(item.color || RED);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('Title is required.');
    setSaving(true);
    const data = {
      date: date.trim(),
      title: title.trim(),
      message: message.trim(),
      emoji: emoji.trim() || '📣',
      color,
    };
    try {
      if (editing) {
        await updateDoc(doc(db, 'announcements', editing.docId), data);
      } else {
        await addDoc(collection(db, 'announcements'), data);
      }
      setShowForm(false);
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (docId) => {
    await deleteDoc(doc(db, 'announcements', docId));
    setConfirmId(null);
  };

  return (
    <div>
      <div style={s.tabHeader}>
        <h2 style={s.tabTitle}>Announcements</h2>
        <button onClick={openAdd} style={s.addBtn}>+ Add Announcement</button>
      </div>

      {items.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: 32 }}>📣</span>
          <p style={s.emptyText}>No announcements yet.</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.docId} style={s.itemCard}>
            <div style={{ ...s.itemEmoji, backgroundColor: (item.color || RED) + '18' }}>
              <span style={{ fontSize: 18 }}>{item.emoji || '📣'}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={s.itemDate}>{item.date || 'No date'}</div>
              <div style={s.itemTitle}>{item.title}</div>
              {item.message && <div style={s.itemPreview}>{item.message.slice(0, 80)}{item.message.length > 80 ? '...' : ''}</div>}
            </div>
            <div style={s.itemActions}>
              <button onClick={() => openEdit(item)} style={s.editBtn}>Edit</button>
              <button onClick={() => setConfirmId(item.docId)} style={s.deleteIconBtn}>🗑</button>
            </div>
          </div>
        ))
      )}

      {showForm && (
        <FormModal
          title={editing ? 'Edit Announcement' : 'New Announcement'}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          saving={saving}
        >
          <label style={s.label}>Date (e.g. Apr 23 or Today)</label>
          <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Apr 23" style={s.input} />

          <label style={s.label}>Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sunday Service Time Change" style={s.input} />

          <label style={s.label}>Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Details..." rows={4} style={s.textarea} />

          <label style={s.label}>Emoji</label>
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="📣" style={{ ...s.input, fontSize: 18 }} maxLength={2} />

          <label style={s.label}>Accent Color</label>
          <ColorPicker value={color} onChange={setColor} />
        </FormModal>
      )}

      {confirmId && (
        <ConfirmDelete name="announcement" onConfirm={() => handleDelete(confirmId)} onCancel={() => setConfirmId(null)} />
      )}
    </div>
  );
}

/* ====================== WORSHIP TAB ====================== */

function WorshipTab() {
  const [setlist, setSetlist] = useState([]);
  const [serveDate, setServeDate] = useState('');
  const [serveDateDoc, setServeDateDoc] = useState(null);
  const [editingDate, setEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [songKey, setSongKey] = useState('');
  const [tempo, setTempo] = useState('Medium');
  const [order, setOrder] = useState(1);

  useEffect(() => {
    const slUnsub = onSnapshot(query(collection(db, 'setlist'), orderBy('order', 'asc')), (snap) => {
      setSetlist(snap.docs.map((d) => ({ docId: d.id, ...d.data() })));
    });
    const sdUnsub = onSnapshot(collection(db, 'serve_date'), (snap) => {
      if (!snap.empty) {
        const first = snap.docs[0];
        setServeDate(first.data().date || '');
        setServeDateDoc(first.id);
      }
    });
    return () => { slUnsub(); sdUnsub(); };
  }, []);

  const saveServeDate = async () => {
    try {
      if (serveDateDoc) {
        await updateDoc(doc(db, 'serve_date', serveDateDoc), { date: tempDate.trim() });
      } else {
        await setDoc(doc(db, 'serve_date', 'current'), { date: tempDate.trim() });
      }
      setEditingDate(false);
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  };

  const openAddSong = () => {
    setEditing(null);
    setTitle('');
    setArtist('');
    setSongKey('');
    setTempo('Medium');
    setOrder(setlist.length + 1);
    setShowForm(true);
  };

  const openEditSong = (item) => {
    setEditing(item);
    setTitle(item.title || '');
    setArtist(item.artist || '');
    setSongKey(item.key || '');
    setTempo(item.tempo || 'Medium');
    setOrder(item.order || 1);
    setShowForm(true);
  };

  const handleSaveSong = async () => {
    if (!title.trim()) return alert('Song title is required.');
    setSaving(true);
    const data = {
      title: title.trim(),
      artist: artist.trim(),
      key: songKey.trim(),
      tempo,
      order: Number(order) || 1,
    };
    try {
      if (editing) {
        await updateDoc(doc(db, 'setlist', editing.docId), data);
      } else {
        await addDoc(collection(db, 'setlist'), data);
      }
      setShowForm(false);
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
    setSaving(false);
  };

  const handleDeleteSong = async (docId) => {
    await deleteDoc(doc(db, 'setlist', docId));
    setConfirmId(null);
  };

  return (
    <div>
      {/* Serve Date Section */}
      <div style={s.section}>
        <h2 style={s.tabTitle}>Next Serve Date</h2>
        {editingDate ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              placeholder="Sunday, April 26, 2026"
              style={{ ...s.input, marginBottom: 0, flex: 1 }}
            />
            <button onClick={saveServeDate} style={s.saveBtnInline}>Save</button>
            <button onClick={() => setEditingDate(false)} style={s.cancelBtnInline}>Cancel</button>
          </div>
        ) : (
          <div style={s.serveBanner}>
            <span style={{ fontSize: 24 }}>🎶</span>
            <div style={{ flex: 1 }}>
              <div style={s.serveBannerLabel}>CURRENT</div>
              <div style={s.serveBannerDate}>{serveDate || 'Not set yet'}</div>
            </div>
            <button onClick={() => { setTempDate(serveDate); setEditingDate(true); }} style={s.editBtn}>Edit</button>
          </div>
        )}
      </div>

      {/* Set List Section */}
      <div style={s.section}>
        <div style={s.tabHeader}>
          <h2 style={s.tabTitle}>Set List</h2>
          <button onClick={openAddSong} style={s.addBtn}>+ Add Song</button>
        </div>

        {setlist.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: 32 }}>🎵</span>
            <p style={s.emptyText}>No songs in the set list yet.</p>
          </div>
        ) : (
          setlist.map((song) => (
            <div key={song.docId} style={s.itemCard}>
              <div style={{ ...s.songNumber, backgroundColor: YELLOW + '18', border: `2px solid ${YELLOW}30` }}>
                <span style={{ ...s.songNumberText, color: YELLOW }}>{song.order || '?'}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.itemTitle}>{song.title}</div>
                <div style={s.itemPreview}>
                  {song.artist}{song.key && ` · Key of ${song.key}`}{song.tempo && ` · ${song.tempo}`}
                </div>
              </div>
              <div style={s.itemActions}>
                <button onClick={() => openEditSong(song)} style={s.editBtn}>Edit</button>
                <button onClick={() => setConfirmId(song.docId)} style={s.deleteIconBtn}>🗑</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <FormModal
          title={editing ? 'Edit Song' : 'New Song'}
          onClose={() => setShowForm(false)}
          onSave={handleSaveSong}
          saving={saving}
        >
          <label style={s.label}>Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="He's Able" style={s.input} />

          <label style={s.label}>Artist</label>
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Darwin Hobbs" style={s.input} />

          <label style={s.label}>Key</label>
          <input value={songKey} onChange={(e) => setSongKey(e.target.value)} placeholder="G" style={s.input} />

          <label style={s.label}>Tempo</label>
          <select value={tempo} onChange={(e) => setTempo(e.target.value)} style={s.input}>
            {TEMPO_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <label style={s.label}>Order (1, 2, 3...)</label>
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} min={1} style={s.input} />
        </FormModal>
      )}

      {confirmId && (
        <ConfirmDelete name="song" onConfirm={() => handleDeleteSong(confirmId)} onCancel={() => setConfirmId(null)} />
      )}
    </div>
  );
}

/* ====================== INBOX TAB ====================== */

function InboxTab() {
  const [prayers, setPrayers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, 'prayers'), orderBy('id', 'desc')), (snap) => {
      setPrayers(snap.docs.map((d) => ({ docId: d.id, type: 'prayer', ...d.data() })));
    });
    const u2 = onSnapshot(collection(db, 'song_suggestions'), (snap) => {
      setSongs(snap.docs.map((d) => ({ docId: d.id, type: 'song', ...d.data() })));
    });
    const u3 = onSnapshot(collection(db, 'messages'), (snap) => {
      setMessages(snap.docs.map((d) => ({ docId: d.id, type: 'message', ...d.data() })));
    });
    return () => { u1(); u2(); u3(); };
  }, []);

  const all = [...prayers, ...songs, ...messages].sort((a, b) => {
    const at = new Date(a.time || 0).getTime();
    const bt = new Date(b.time || 0).getTime();
    return bt - at;
  });

  const filtered =
    filter === 'All' ? all :
    filter === 'Prayers' ? prayers :
    filter === 'Songs' ? songs :
    messages;

  const unreadMessagesCount = messages.filter((m) => m.read === false).length;

  const toggleExpand = async (item) => {
    setExpandedId(expandedId === item.docId ? null : item.docId);
    // Mark message as read on first expand
    if (item.type === 'message' && item.read === false && expandedId !== item.docId) {
      try { await updateDoc(doc(db, 'messages', item.docId), { read: true }); } catch (e) {}
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    const collMap = { prayer: 'prayers', song: 'song_suggestions', message: 'messages' };
    await deleteDoc(doc(db, collMap[confirmDel.type], confirmDel.docId));
    setConfirmDel(null);
    setExpandedId(null);
  };

  const typeMeta = {
    prayer: { label: 'Prayer', color: RED, emoji: '🙏' },
    song: { label: 'Song', color: YELLOW, emoji: '🎵' },
    message: { label: 'Message', color: BLUE, emoji: '💌' },
  };

  return (
    <div>
      <div style={s.tabHeader}>
        <h2 style={s.tabTitle}>Inbox</h2>
      </div>

      <div style={s.filterRow}>
        {['All', 'Prayers', 'Songs', 'Messages'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ ...s.filterPill, ...(filter === f && s.filterPillActive) }}
          >
            {f}
            {f === 'Messages' && unreadMessagesCount > 0 && (
              <span style={s.unreadBadge}>{unreadMessagesCount}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: 32 }}>📭</span>
          <p style={s.emptyText}>No {filter === 'All' ? 'submissions' : filter.toLowerCase()} yet.</p>
        </div>
      ) : (
        filtered.map((item) => {
          const meta = typeMeta[item.type];
          const isExpanded = expandedId === item.docId;
          const isUnread = item.type === 'message' && item.read === false;
          const titleText =
            item.type === 'prayer' ? (item.request || '').slice(0, 60) :
            item.type === 'song' ? item.title :
            (item.body || '').slice(0, 60);

          return (
            <div key={item.docId} style={{ ...s.itemCard, ...(isUnread && { borderLeft: `4px solid ${BLUE}` }) }}>
              <div style={{ ...s.typeBadge, backgroundColor: meta.color + '18', color: meta.color }}>
                <span>{meta.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 800, marginLeft: 4, textTransform: 'uppercase' }}>{meta.label}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.itemTitle}>{item.name || 'Anonymous'}</div>
                <div style={s.itemPreview}>{titleText}{titleText && titleText.length >= 60 ? '...' : ''}</div>
                {isExpanded && (
                  <div style={s.expandedContent}>
                    {item.type === 'prayer' && <p style={s.fullText}>{item.request}</p>}
                    {item.type === 'song' && (
                      <div>
                        <p style={s.fullText}><strong>Title:</strong> {item.title}</p>
                        {item.artist && <p style={s.fullText}><strong>Artist:</strong> {item.artist}</p>}
                        {item.key && <p style={s.fullText}><strong>Key:</strong> {item.key}</p>}
                        {item.notes && <p style={s.fullText}><strong>Notes:</strong> {item.notes}</p>}
                      </div>
                    )}
                    {item.type === 'message' && (
                      <div>
                        {item.email && <p style={s.fullText}><strong>Email:</strong> {item.email}</p>}
                        <p style={s.fullText}>{item.body}</p>
                      </div>
                    )}
                    <div style={s.expandedTime}>{timeAgo(item.time)}</div>
                  </div>
                )}
              </div>
              <div style={s.itemActions}>
                <button onClick={() => toggleExpand(item)} style={s.editBtn}>{isExpanded ? 'Hide' : 'View'}</button>
                <button onClick={() => setConfirmDel(item)} style={s.deleteIconBtn}>🗑</button>
              </div>
            </div>
          );
        })
      )}

      {confirmDel && (
        <ConfirmDelete
          name={typeMeta[confirmDel.type].label.toLowerCase()}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
}

/* ====================== EVENTS TAB ====================== */

function EventsTab() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(RED);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('sortDate', 'asc'));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ docId: d.id, ...d.data() })));
    });
  }, []);

  const openAdd = () => {
    setEditing(null);
    setTitle('');
    setDateInput('');
    setTime('');
    setLocation('');
    setDescription('');
    setColor(RED);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setTitle(item.title || '');
    setDateInput(item.sortDate || '');
    setTime(item.time || '');
    setLocation(item.location || '');
    setDescription(item.description || '');
    setColor(item.color || RED);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('Title is required.');
    if (!dateInput) return alert('Date is required.');
    setSaving(true);
    const dateObj = new Date(dateInput + 'T00:00:00');
    const data = {
      title: title.trim(),
      sortDate: dateInput,
      month: MONTHS[dateObj.getMonth()],
      day: String(dateObj.getDate()),
      time: time.trim(),
      location: location.trim(),
      description: description.trim(),
      color,
    };
    try {
      if (editing) {
        await updateDoc(doc(db, 'events', editing.docId), data);
      } else {
        await addDoc(collection(db, 'events'), data);
      }
      setShowForm(false);
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (docId) => {
    await deleteDoc(doc(db, 'events', docId));
    setConfirmId(null);
  };

  return (
    <div>
      <div style={s.tabHeader}>
        <h2 style={s.tabTitle}>Events</h2>
        <button onClick={openAdd} style={s.addBtn}>+ Add Event</button>
      </div>

      {items.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: 32 }}>📅</span>
          <p style={s.emptyText}>No events yet.</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.docId} style={s.itemCard}>
            <div style={{ ...s.eventBadge, backgroundColor: item.color || RED }}>
              <div style={s.eventBadgeMonth}>{item.month}</div>
              <div style={s.eventBadgeDay}>{item.day}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={s.itemTitle}>{item.title}</div>
              <div style={s.itemPreview}>
                {item.time}{item.time && item.location && ' · '}{item.location}
              </div>
            </div>
            <div style={s.itemActions}>
              <button onClick={() => openEdit(item)} style={s.editBtn}>Edit</button>
              <button onClick={() => setConfirmId(item.docId)} style={s.deleteIconBtn}>🗑</button>
            </div>
          </div>
        ))
      )}

      {showForm && (
        <FormModal
          title={editing ? 'Edit Event' : 'New Event'}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          saving={saving}
        >
          <label style={s.label}>Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Youth Service" style={s.input} />

          <label style={s.label}>Date *</label>
          <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} style={s.input} />

          <label style={s.label}>Time</label>
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="7:00 PM - 9:00 PM" style={s.input} />

          <label style={s.label}>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Grace Alive Ministries" style={s.input} />

          <label style={s.label}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details about the event..." rows={3} style={s.textarea} />

          <label style={s.label}>Accent Color</label>
          <ColorPicker value={color} onChange={setColor} />
        </FormModal>
      )}

      {confirmId && (
        <ConfirmDelete name="event" onConfirm={() => handleDelete(confirmId)} onCancel={() => setConfirmId(null)} />
      )}
    </div>
  );
}

/* ====================== MAIN SCREEN ====================== */

export default function AdminScreen({ onClose }) {
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState('Devotionals');

  if (!profile?.isAdmin) {
    return (
      <div style={s.container}>
        <header style={s.header}>
          <button onClick={onClose} style={s.backBtn}>← Close</button>
          <h1 style={s.headerTitle}>Admin Panel</h1>
          <div style={{ width: 70 }} />
        </header>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <span style={{ fontSize: 48 }}>🔒</span>
          <h2 style={{ fontSize: 18, color: DARK, marginTop: 16 }}>Admin access required</h2>
          <p style={{ color: '#777', fontSize: 14 }}>You need admin privileges to view this area.</p>
        </div>
      </div>
    );
  }

const TABS = ['Devotionals', 'Announcements', 'Worship', 'Events', 'Inbox'];
  return (
    <div style={s.container}>
      <header style={s.header}>
        <button onClick={onClose} style={s.backBtn}>← Close</button>
        <h1 style={s.headerTitle}>Admin Panel</h1>
        <div style={{ width: 70 }} />
      </header>

      <nav style={s.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ ...s.tab, ...(activeTab === tab && s.tabActive) }}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main style={s.main}>
{activeTab === 'Devotionals' && <DevotionalsTab />}
{activeTab === 'Announcements' && <AnnouncementsTab />}
{activeTab === 'Worship' && <WorshipTab />}
{activeTab === 'Events' && <EventsTab />}
{activeTab === 'Inbox' && <InboxTab />}
      </main>
    </div>
  );
}

/* ====================== STYLES ====================== */

const s = {
  container: {
    position: 'fixed', inset: 0,
    backgroundColor: CREAM, zIndex: 200,
    display: 'flex', flexDirection: 'column',
  },
  header: {
    backgroundColor: NAVY,
    padding: '14px 16px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexShrink: 0,
  },
  backBtn: {
    background: 'none', border: 'none', color: '#fff',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', padding: '4px 0',
  },
  headerTitle: { fontSize: 16, fontWeight: 900, color: '#fff', margin: 0 },
  tabBar: {
    backgroundColor: WARM_WHITE,
    display: 'flex',
    borderBottom: `1px solid ${SOFT_GRAY}`,
    flexShrink: 0,
  },
  tab: {
    flex: 1, padding: '14px 8px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 700, color: '#888',
    fontFamily: 'inherit',
    borderBottom: '2px solid transparent',
  },
  tabActive: { color: RED, borderBottom: `2px solid ${RED}` },
  main: { flex: 1, overflowY: 'auto', padding: 16 },
  section: { marginBottom: 32 },
  tabHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 14,
  },
  tabTitle: { fontSize: 16, fontWeight: 900, color: DARK, margin: 0 },
  addBtn: {
    backgroundColor: RED, color: WARM_WHITE,
    padding: '8px 14px', borderRadius: 100,
    border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 800, fontFamily: 'inherit',
    boxShadow: '0 4px 8px rgba(232, 48, 42, 0.25)',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: 40, textAlign: 'center',
  },
  emptyText: { fontSize: 13, color: '#999', marginTop: 8 },
  itemCard: {
    backgroundColor: WARM_WHITE, borderRadius: 14,
    padding: 12, marginBottom: 8,
    display: 'flex', gap: 12, alignItems: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  itemAccent: {
    width: 4, height: 36, borderRadius: 2, flexShrink: 0,
  },
  itemEmoji: {
    width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  itemDate: { fontSize: 10, fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: 0.8 },
  itemTitle: {
    fontSize: 14, fontWeight: 800, color: DARK,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    marginTop: 2,
  },
  itemPreview: { fontSize: 12, color: '#777', marginTop: 2, lineHeight: 1.4 },
  itemActions: { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 },
  editBtn: {
    backgroundColor: SOFT_GRAY, color: DARK,
    padding: '6px 12px', borderRadius: 100,
    border: 'none', cursor: 'pointer',
    fontSize: 11, fontWeight: 800, fontFamily: 'inherit',
  },
  deleteIconBtn: {
    backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
    fontSize: 16, padding: 6,
  },
  serveBanner: {
    backgroundColor: WARM_WHITE, borderRadius: 14, padding: 14,
    display: 'flex', gap: 12, alignItems: 'center',
    border: `2px solid ${YELLOW}40`,
  },
  serveBannerLabel: { fontSize: 10, fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: 0.8 },
  serveBannerDate: { fontSize: 14, fontWeight: 900, color: DARK, marginTop: 2 },
  saveBtnInline: {
    backgroundColor: RED, color: WARM_WHITE,
    padding: '0 16px', borderRadius: 100,
    border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 800, fontFamily: 'inherit',
  },
  cancelBtnInline: {
    backgroundColor: SOFT_GRAY, color: DARK,
    padding: '0 12px', borderRadius: 100,
    border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
  },
  songNumber: {
    width: 34, height: 34, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxSizing: 'border-box',
  },
  songNumberText: { fontSize: 14, fontWeight: 900 },
  filterRow: { display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' },
  filterPill: {
    backgroundColor: WARM_WHITE, color: '#777',
    padding: '6px 14px', borderRadius: 100,
    border: '1px solid #E8E4DC', cursor: 'pointer',
    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  },
  filterPillActive: {
    backgroundColor: RED, color: WARM_WHITE, border: `1px solid ${RED}`,
  },
  unreadBadge: {
    backgroundColor: BLUE, color: WARM_WHITE,
    padding: '2px 6px', borderRadius: 100,
    fontSize: 10, fontWeight: 800,
  },
  typeBadge: {
    padding: '4px 8px', borderRadius: 8,
    display: 'inline-flex', alignItems: 'center',
    fontSize: 10, flexShrink: 0,
  },
  expandedContent: {
    marginTop: 10, paddingTop: 10,
    borderTop: `1px solid ${SOFT_GRAY}`,
  },
  fullText: { fontSize: 13, color: '#444', lineHeight: 1.5, margin: '0 0 8px', whiteSpace: 'pre-wrap' },
  expandedTime: { fontSize: 11, color: '#999', marginTop: 6 },

  /* Modal styles */
  modalOverlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 300,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: WARM_WHITE, borderRadius: 18,
    width: '100%', maxWidth: 480, maxHeight: '90vh',
    display: 'flex', flexDirection: 'column',
  },
  modalHeader: {
    padding: '16px 18px', borderBottom: `1px solid ${SOFT_GRAY}`,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexShrink: 0,
  },
  modalTitle: { fontSize: 16, fontWeight: 900, color: DARK, margin: 0 },
  modalClose: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 18, color: '#999', padding: 4,
  },
  modalBody: { padding: 18, overflowY: 'auto', flex: 1 },
  modalActions: {
    padding: 14, borderTop: `1px solid ${SOFT_GRAY}`,
    display: 'flex', gap: 10, justifyContent: 'flex-end',
    flexShrink: 0,
  },
  cancelBtn: {
    backgroundColor: SOFT_GRAY, color: DARK,
    padding: '10px 18px', borderRadius: 100,
    border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
  },
  saveBtn: {
    backgroundColor: RED, color: WARM_WHITE,
    padding: '10px 22px', borderRadius: 100,
    border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 800, fontFamily: 'inherit',
  },
  deleteBtn: {
    backgroundColor: RED, color: WARM_WHITE,
    padding: '10px 22px', borderRadius: 100,
    border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 800, fontFamily: 'inherit',
  },
  confirmText: { fontSize: 14, color: '#777', padding: '0 18px 14px' },
  label: {
    display: 'block', fontSize: 11, fontWeight: 800,
    color: '#666', textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 6, marginTop: 12,
  },
  input: {
    width: '100%', backgroundColor: SOFT_GRAY,
    borderRadius: 10, padding: 11, fontSize: 14, color: DARK,
    border: 'none', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', backgroundColor: SOFT_GRAY,
    borderRadius: 10, padding: 11, fontSize: 14, color: DARK,
    border: 'none', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box', resize: 'vertical', minHeight: 60,
  },
  colorPicker: { display: 'flex', gap: 10 },
  colorOption: {
    width: 32, height: 32, borderRadius: 16,
    border: 'none', cursor: 'pointer', padding: 0,
  },
colorOptionSelected: { boxShadow: `0 0 0 3px ${WARM_WHITE}, 0 0 0 5px ${DARK}` },
  eventBadge: {
    width: 48, height: 48, borderRadius: 10,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  eventBadgeMonth: {
    fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  eventBadgeDay: { fontSize: 18, fontWeight: 900, color: WARM_WHITE, lineHeight: 1 },
};