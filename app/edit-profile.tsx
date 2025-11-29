import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function EditProfileScreen() {
  const [name, setName] = useState('Alex Taylor');
  const [username, setUsername] = useState('@atlist_user');
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('••••••••');
  const [confirm, setConfirm] = useState('••••••••');

  const isDirty = useMemo(() => {
    return (
      name !== 'Alex Taylor' ||
      username !== '@atlist_user' ||
      email !== 'alex@example.com' ||
      password !== '••••••••' ||
      confirm !== '••••••••'
    );
  }, [name, username, email, password, confirm]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Edit Profile</Text>
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
        {isDirty ? (
          <Pressable style={styles.saveButton}>
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
});
