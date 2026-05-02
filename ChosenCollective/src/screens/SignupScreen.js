import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const AVATAR_COLORS = [RED, BLUE, YELLOW, '#9B59B6', '#27AE60', '#E67E22'];

export default function SignupScreen({ onSwitch }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarColor, setAvatarColor] = useState(RED);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleSignup = async () => {
    if (!firstName.trim() || !lastName.trim()) { setError('Please enter your first and last name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: phone.trim(),
        avatarColor,
        initials: initials || '??',
        createdAt: Date.now(),
      });
    } catch (e) {
      setLoading(false);
      if (e.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (e.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      return;
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CREAM }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={styles.headerArea}>
            <Text style={styles.headerTitle}>Join The CHOSEN Collective</Text>
            <Text style={styles.headerSub}>Create your account to connect with your community.</Text>
          </View>

          <View style={styles.avatarSection}>
            <View style={[styles.avatarPreview, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarInitials}>{initials || '?'}</Text>
            </View>
            <Text style={styles.avatarLabel}>Pick your avatar color</Text>
            <View style={styles.colorPicker}>
              {AVATAR_COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setAvatarColor(c)}>
                  <View style={[styles.colorOption, { backgroundColor: c }, avatarColor === c && styles.colorOptionSelected]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name *"
                placeholderTextColor="#BBB"
                style={[styles.input, { flex: 1 }]}
              />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name *"
                placeholderTextColor="#BBB"
                style={[styles.input, { flex: 1 }]}
              />
            </View>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address *"
              placeholderTextColor="#BBB"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number (optional)"
              placeholderTextColor="#BBB"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min 6 characters) *"
              placeholderTextColor="#BBB"
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password *"
              placeholderTextColor="#BBB"
              secureTextEntry
              style={styles.input}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              onPress={handleSignup}
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onSwitch} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={{ color: RED, fontWeight: '800' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.footer}>Grace Alive Youth Ministry · Richmond, VA</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24 },
  headerArea: { marginBottom: 24, marginTop: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', marginBottom: 6 },
  headerSub: { fontSize: 14, color: '#777' },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarPreview: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  avatarInitials: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
  avatarLabel: { fontSize: 12, color: '#999', marginBottom: 10 },
  colorPicker: { flexDirection: 'row', gap: 10 },
  colorOption: { width: 30, height: 30, borderRadius: 15 },
  colorOptionSelected: { borderWidth: 3, borderColor: '#1A1A1A' },
  form: { width: '100%' },
  nameRow: { flexDirection: 'row', gap: 10 },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 14, color: '#1A1A1A', marginBottom: 10,
    borderWidth: 1.5, borderColor: '#E8E4DC',
  },
  errorText: { fontSize: 13, color: '#E8302A', fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: '#E8302A', borderRadius: 100,
    paddingVertical: 15, alignItems: 'center', marginTop: 4,
    shadowColor: '#E8302A', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: '#777' },
  footer: { fontSize: 11, color: '#CCC', marginTop: 24, textAlign: 'center' },
});