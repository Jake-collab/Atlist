import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../auth-context';
import { supabase } from '../../lib/supabase';
import { decode } from 'base-64';

type Mode = 'login' | 'signup';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const termsRef = useRef<ScrollView>(null);
  const [scrolledTerms, setScrolledTerms] = useState(false);

  const logoSource = useMemo(() => require('../../assets/icon.png'), []);

  const emailOrUsernameTaken = async () => {
    if (!email && !username) return false;
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .limit(1);
    return !error && data && data.length > 0;
  };

  const submit = async () => {
    setLoading(true);
    setError(null);

    if (mode === 'signup') {
      if (!email || !password || !passwordConfirm || !username || !firstName || !lastName) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
      if (password !== passwordConfirm) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (!accepted || !scrolledTerms) {
        setError('Scroll through and accept the terms to continue');
        setLoading(false);
        return;
      }
      const taken = await emailOrUsernameTaken();
      if (taken) {
        setError('Email or username already in use');
        setLoading(false);
        return;
      }
      const { error: signErr } = await signUp(email, password);
      if (signErr) {
        setError(signErr);
        setLoading(false);
        return;
      }
      // Post-signup: set profile fields (best-effort)
      const fullName = `${firstName} ${lastName}`.trim();
      await supabase.from('profiles').upsert({
        email,
        username,
        full_name: fullName,
      });
      router.replace('/');
      setLoading(false);
      return;
    }

    // Login flow
    const { error: loginErr } = await signIn(email, password);
    if (loginErr) {
      setError(loginErr);
    } else {
      router.replace('/');
    }
    setLoading(false);
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const redirectTo = 'exp://127.0.0.1:8081'; // TODO: set your deep link / scheme
      const { error: googleErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (googleErr) setError(googleErr.message);
    } catch (e: any) {
      setError(e?.message ?? 'Google sign-in failed');
    }
  };

  const showSignup = mode === 'signup';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Atlist</Text>
        </View>

        <View style={styles.card}>
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

          {showSignup && (
            <>
              <View style={styles.row}>
                <View style={[styles.field, styles.half]}>
                  <Text style={styles.label}>First name</Text>
                  <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
                </View>
                <View style={[styles.field, styles.half]}>
                  <Text style={styles.label}>Last name</Text>
                  <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Username</Text>
                <TextInput style={styles.input} value={username} autoCapitalize="none" onChangeText={setUsername} />
              </View>
            </>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              secureTextEntry
              onChangeText={setPassword}
            />
          </View>

          {showSignup && (
            <View style={styles.field}>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                style={styles.input}
                value={passwordConfirm}
                secureTextEntry
                onChangeText={setPasswordConfirm}
              />
            </View>
          )}

          {showSignup && (
          <View style={styles.termsBox}>
            <Text style={styles.termsTitle}>Terms of Service</Text>
            <ScrollView
              style={styles.termsScroll}
              ref={termsRef}
              onScroll={(e) => {
                const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
                const reachedBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
                if (reachedBottom) setScrolledTerms(true);
              }}
              scrollEventThrottle={16}
            >
              <Text style={styles.termsText}>
                Dummy terms text... Please scroll to read. By continuing, you agree to the Atlist membership terms.
              </Text>
            </ScrollView>
            <Pressable style={styles.checkboxRow} onPress={() => setAccepted((v) => !v)}>
              <View style={[styles.checkbox, accepted && styles.checkboxChecked]} />
                <Text style={styles.checkboxLabel}>I accept the terms</Text>
              </Pressable>
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.bottomButtons}>
            <Pressable style={[styles.buttonPrimary, loading && styles.buttonDisabled]} onPress={submit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{mode === 'login' ? 'Log In' : 'Sign Up'}</Text>}
            </Pressable>
            <Pressable style={styles.buttonSecondary} onPress={loginWithGoogle}>
              <Text style={styles.buttonSecondaryText}>Continue with Google</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push('/auth/forgot-password')} style={styles.link}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 20, gap: 12, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 12 },
  logo: { width: 120, height: 120 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggle: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#e5e7eb', alignItems: 'center' },
  toggleActive: { backgroundColor: '#0f172a' },
  toggleText: { fontWeight: '700', color: '#111827' },
  toggleTextActive: { color: '#fff' },
  field: { gap: 6 },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  label: { color: '#4b5563', fontWeight: '600' },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  termsBox: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, gap: 8 },
  termsTitle: { fontWeight: '700', color: '#0f172a' },
  termsScroll: { maxHeight: 100 },
  termsText: { color: '#475569', lineHeight: 18 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#94a3b8', backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  checkboxLabel: { color: '#0f172a', fontWeight: '600' },
  bottomButtons: { gap: 8 },
  buttonPrimary: { backgroundColor: '#0f172a', padding: 12, borderRadius: 12, alignItems: 'center' },
  buttonSecondary: { backgroundColor: '#e5e7eb', padding: 12, borderRadius: 12, alignItems: 'center' },
  buttonSecondaryText: { color: '#0f172a', fontWeight: '700' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#dc2626' },
  link: { marginTop: 8, alignItems: 'center' },
  linkText: { color: '#2563eb', fontWeight: '600' },
});
