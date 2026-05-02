import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useUser } from '../context/UserContext';
import AdminScreen from './AdminScreen';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const SOFT_GRAY = '#F2F0EB';
const AVATAR_COLORS = [RED, BLUE, YELLOW, '#9B59B6', '#27AE60', '#E67E22'];

const SUPER_ADMIN_EMAIL = 'kindal.w.white@gmail.com';

export default function ProfileScreen({ onClose }) {
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile } = useUser();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatarColor, setAvatarColor] = useState(profile?.avatarColor || RED);
  const [saving, setSaving] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const isAdmin = profile?.email === SUPER_ADMIN_EMAIL || profile?.isAdmin === true;

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setSaving(true);
    await updateDoc(doc(db, 'users', user.uid), {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      phone: phone.trim(),
      avatarColor,
      initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(),
    });
    await refreshProfile();
    setSaving(false);
    setEditing(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  const initials = profile?.initials || '??';
  const color = avatarColor || profile?.avatarColor || RED;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      {showAdmin && <AdminScreen onClose={() => setShowAdmin(false)} />}
      <View style={{ flex: 1, backgroundColor: DARK }}>
        <View style={[styles.modalHeader, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.modalTitle}>My Profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, backgroundColor: CREAM }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

            {/* Avatar + Name */}
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: color }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.profileName}>{profile?.fullName || 'Your Name'}</Text>
              <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
              {profile?.phone ? <Text style={styles.profilePhone}>{profile.phone}</Text> : null}
              {isAdmin && (
                <View style={styles.adminBadgeRow}>
                  <Text style={styles.adminBadgeText}>
                    {profile?.email === SUPER_ADMIN_EMAIL ? '⭐ Super Admin' : '🛡 Admin'}
                  </Text>
                </View>
              )}
            </View>

            {/* Profile Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Profile Info</Text>
                <TouchableOpacity onPress={() => setEditing(!editing)}>
                  <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
                </TouchableOpacity>
              </View>
              {editing ? (
                <View style={styles.formCard}>
                  <View style={styles.nameRow}>
                    <TextInput value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor="#BBB" style={[styles.input, { flex: 1 }]} />
                    <TextInput value={lastName} onChangeText={setLastName} placeholder="Last name" placeholderTextColor="#BBB" style={[styles.input, { flex: 1 }]} />
                  </View>
                  <TextInput value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor="#BBB" keyboardType="phone-pad" style={styles.input} />
                  <Text style={styles.colorLabel}>Choose avatar color</Text>
                  <View style={styles.colorPicker}>
                    {AVATAR_COLORS.map(c => (
                      <TouchableOpacity key={c} onPress={() => setAvatarColor(c)}>
                        <View style={[styles.colorDot, { backgroundColor: c }, avatarColor === c && styles.colorDotSelected]} />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, saving && { opacity: 0.7 }]} disabled={saving}>
                    <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.infoCard}>
                  {[
                    { label: 'Full Name', value: profile?.fullName },
                    { label: 'Email', value: profile?.email },
                    { label: 'Phone', value: profile?.phone || 'Not provided' },
                  ].map((item, i) => (
                    <View key={i} style={[styles.infoRow, i < 2 && { borderBottomWidth: 1, borderBottomColor: SOFT_GRAY }]}>
                      <Text style={styles.infoLabel}>{item.label}</Text>
                      <Text style={styles.infoValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Admin Panel Button -- only visible to admins */}
            {isAdmin && (
              <View style={styles.section}>
                <TouchableOpacity onPress={() => setShowAdmin(true)} style={styles.adminBtn} activeOpacity={0.8}>
                  <Text style={styles.adminBtnIcon}>✨</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.adminBtnTitle}>Admin Panel</Text>
                    <Text style={styles.adminBtnSub}>Manage content, events, and members</Text>
                  </View>
                  <Text style={{ color: WARM_WHITE, fontSize: 16 }}>›</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Sign Out */}
            <View style={styles.section}>
              <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} activeOpacity={0.8}>
                <Text style={styles.signOutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>The CHOSEN Collective · Grace Alive Youth Ministry</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalHeader: { backgroundColor: DARK, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 17, fontWeight: '900', color: WARM_WHITE },
  closeBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  closeBtnText: { fontSize: 12, fontWeight: '800', color: WARM_WHITE },
  profileHeader: { alignItems: 'center', paddingVertical: 32, backgroundColor: WARM_WHITE, borderBottomWidth: 2, borderBottomColor: SOFT_GRAY },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { fontSize: 32, fontWeight: '900', color: WARM_WHITE },
  profileName: { fontSize: 22, fontWeight: '900', color: DARK, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#777', marginBottom: 2 },
  profilePhone: { fontSize: 13, color: '#999' },
  adminBadgeRow: { marginTop: 10, backgroundColor: DARK, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 5 },
  adminBadgeText: { fontSize: 12, fontWeight: '800', color: YELLOW },
  section: { paddingHorizontal: 18, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: DARK },
  editBtn: { fontSize: 14, fontWeight: '800', color: RED },
  formCard: { backgroundColor: WARM_WHITE, borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  nameRow: { flexDirection: 'row', gap: 10 },
  input: { backgroundColor: SOFT_GRAY, borderRadius: 10, padding: 11, fontSize: 13, color: DARK, marginBottom: 10 },
  colorLabel: { fontSize: 12, color: '#999', marginBottom: 10 },
  colorPicker: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  colorDotSelected: { borderWidth: 3, borderColor: DARK },
  saveBtn: { backgroundColor: RED, borderRadius: 100, padding: 13, alignItems: 'center' },
  saveBtnText: { color: WARM_WHITE, fontSize: 14, fontWeight: '800' },
  infoCard: { backgroundColor: WARM_WHITE, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  infoLabel: { fontSize: 13, color: '#999', fontWeight: '600' },
  infoValue: { fontSize: 13, color: DARK, fontWeight: '700' },
  adminBtn: { backgroundColor: DARK, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  adminBtnIcon: { fontSize: 22 },
  adminBtnTitle: { fontSize: 14, fontWeight: '900', color: WARM_WHITE },
  adminBtnSub: { fontSize: 11, color: '#AAA', marginTop: 2 },
  signOutBtn: { backgroundColor: WARM_WHITE, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#E8E4DC' },
  signOutBtnText: { fontSize: 15, fontWeight: '800', color: '#777' },
  footer: { fontSize: 11, color: '#CCC', marginTop: 32, textAlign: 'center' },
});