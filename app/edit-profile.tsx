import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from './profile-context';
import { supabase } from '../lib/supabase';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState('••••••••');
  const [confirm, setConfirm] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(() => {
    return (
      name !== profile.name ||
      username !== profile.username ||
      email !== profile.email ||
      password !== '••••••••' ||
      confirm !== '••••••••'
    );
  }, [name, username, email, password, confirm, profile]);

  const onSave = async () => {
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    // Duplicate checks
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, username')
      .or(`email.eq.${email},username.eq.${username}`)
      .limit(1);
    if (!error && data && data.length > 0 && (email !== profile.email || username !== profile.username)) {
      setError('Email or username already in use');
      return;
    }
    setError(null);
    updateProfile({ name, username, email });
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={20}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} secureTextEntry />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {isDirty ? (
          <Pressable style={styles.saveButton} onPress={onSave}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
  },
  backText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  field: {
    gap: 6,
  },
  label: {
    color: '#4b5563',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    color: '#dc2626',
    marginTop: 4,
  },
});
