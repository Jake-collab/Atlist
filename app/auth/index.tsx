import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../auth-context';

type Mode = 'login' | 'signup';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    const action = mode === 'login' ? signIn : signUp;
    const { error } = await action(email, password);
    if (error) {
      setError(error);
    } else {
      router.replace('/');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{mode === 'login' ? 'Log In' : 'Sign Up'}</Text>
        <View style={styles.toggleRow}>
          <Pressable onPress={() => setMode('login')} style={[styles.toggle, mode === 'login' && styles.toggleActive]}>
            <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>Login</Text>
          </Pressable>
          <Pressable onPress={() => setMode('signup')} style={[styles.toggle, mode === 'signup' && styles.toggleActive]}>
            <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>Sign Up</Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{mode === 'login' ? 'Log In' : 'Sign Up'}</Text>}
        </Pressable>

        <Pressable onPress={() => router.push('/auth/forgot-password')} style={styles.link}>
          <Text style={styles.linkText}>Forgot password?</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggle: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#e5e7eb', alignItems: 'center' },
  toggleActive: { backgroundColor: '#0f172a' },
  toggleText: { fontWeight: '700', color: '#111827' },
  toggleTextActive: { color: '#fff' },
  field: { gap: 6 },
  label: { color: '#4b5563' },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  button: { backgroundColor: '#0f172a', padding: 12, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#dc2626' },
  link: { marginTop: 8 },
  linkText: { color: '#2563eb', fontWeight: '600' },
});
