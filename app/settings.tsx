import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const SECTIONS = [
  {
    title: 'Appearance',
    items: ['Dark Mode', 'Light Mode', 'System Default'],
    note: 'Bubbles with no custom color adapt to the selected theme',
  },
  {
    title: 'Notifications',
    items: ['On / Off'],
  },
  {
    title: 'App Behavior',
    items: ['Preload Options', 'Clear Cached Sessions'],
    note: 'Preload controls background loading; clearing sessions resets logins.',
  },
  {
    title: 'Security',
    items: ['Two-Factor Authentication (2FA)'],
  },
  {
    title: 'Support',
    items: ['Contact Support', 'Report a Bug', 'Request a Feature'],
  },
  {
    title: 'Legal',
    items: ['Privacy Policy', 'Terms of Service'],
  },
  {
    title: 'Account',
    items: ['Logout', 'Delete Account'],
  },
];

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {SECTIONS.map((sec) => (
          <View key={sec.title} style={styles.card}>
            <Text style={styles.title}>{sec.title}</Text>
            {sec.items.map((item) => (
              <Pressable key={item} style={styles.row}>
                <Text style={styles.item}>{item}</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
            {sec.note ? <Text style={styles.note}>{sec.note}</Text> : null}
          </View>
        ))}
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  item: {
    fontSize: 14,
    color: '#111827',
  },
  chevron: {
    fontSize: 16,
    color: '#9ca3af',
  },
  note: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});
