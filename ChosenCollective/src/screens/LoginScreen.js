import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const CREAM = '#FDFCF8';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';

const DotRow = () => (
  <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
    {[RED, BLUE, YELLOW, RED, BLUE].map((c, i) => (
      <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c }} />
    ))}
  </View>
);

export default function LoginScreen({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CREAM }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.logoArea}>
            <View style={styles.logoIcon}>
              <Text style={{ fontSize: 36 }}>✨</Text>
            </View>
            <Text style={styles.logoThe}>THE</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 }}>
              {['C', 'H', 'O', 'S', 'E', 'N'].map((letter, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Text style={styles.logoLetter}>{letter}</Text>
                  {i < 5 && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: [RED, BLUE, YELLOW, RED, BLUE][i] }} />}
                </View>
              ))}
            </View>
            <Text style={styles.logoCollective}>COLLECTIVE</Text>
            <View style={{ marginTop: 10 }}>
              <DotRow />
            </View>
          </View>

          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSub}>Sign in to connect with your community.</Text>

          <View style={styles.form}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#BBB"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#BBB"
              secureTextEntry
              style={styles.input}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity onPress={onSwitch} style={styles.signupLink}>
            <Text style={styles.signupLinkText}>
              Don't have an account? <Text style={{ color: RED, fontWeight: '800' }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.footer}>Grace Alive Youth Ministry · Richmond, VA</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 28, alignItems: 'center', justifyContent: 'center' },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: RED, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: RED, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  logoThe: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 14, letterSpacing: 4, color: DARK, marginBottom: 4,
  },
  logoLetter: { fontSize: 28, fontWeight: '700', color: DARK },
  logoCollective: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 12, letterSpacing: 3, color: DARK, marginTop: 4,
  },
  welcomeTitle: { fontSize: 22, fontWeight: '900', color: DARK, marginBottom: 6, textAlign: 'center' },
  welcomeSub: { fontSize: 14, color: '#777', marginBottom: 28, textAlign: 'center' },
  form: { width: '100%' },
  input: {
    backgroundColor: WARM_WHITE, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: DARK, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#E8E4DC',
  },
  errorText: { fontSize: 13, color: RED, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: RED, borderRadius: 100,
    paddingVertical: 15, alignItems: 'center',
    shadowColor: RED, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    marginTop: 4,
  },
  primaryBtnText: { color: WARM_WHITE, fontSize: 16, fontWeight: '900' },
  divider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8E4DC' },
  dividerText: { fontSize: 13, color: '#BBB', marginHorizontal: 12 },
  signupLink: { marginBottom: 16 },
  signupLinkText: { fontSize: 14, color: '#777' },
  footer: { fontSize: 11, color: '#CCC', marginTop: 24, textAlign: 'center' },
});