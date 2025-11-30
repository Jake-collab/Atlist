import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSettings } from './settings-context';
import { useWebsites } from './websites-context';
import { useProfile } from './profile-context';

const themes: { label: string; value: 'light' | 'dark' | 'system' }[] = [
  { label: 'Light Mode', value: 'light' },
  { label: 'Dark Mode', value: 'dark' },
  { label: 'System Default', value: 'system' },
];

const preloadOptions: { label: string; value: 'on' | 'off' }[] = [
  { label: 'On', value: 'on' },
  { label: 'Off', value: 'off' },
];

export default function SettingsScreen() {
  const { settings, setTheme, setNotifications, setPreload, clearCachedSessions } = useSettings();
  const { reset: resetWebsites } = useWebsites();
  const { reset: resetProfile } = useProfile();

  const sections = [
    {
      title: 'Appearance',
      note: 'Bubbles with no custom color adapt to the selected theme',
      items: themes.map((t) => ({
        label: t.label,
        right: settings.theme === t.value ? 'Selected' : '',
        onPress: () => setTheme(t.value),
        active: settings.theme === t.value,
      })),
    },
    {
      title: 'Notifications',
      items: [
        {
          label: 'Notifications',
          right: settings.notifications ? 'On' : 'Off',
          onPress: () => setNotifications(!settings.notifications),
        },
      ],
    },
    {
      title: 'App Behavior',
      items: preloadOptions.map((p) => ({
        label: `Preload: ${p.label}`,
        right: settings.preload === p.value ? 'Selected' : '',
        onPress: () => setPreload(p.value),
        active: settings.preload === p.value,
      })),
      extra: {
        label: 'Clear Cached Sessions',
        right: 'Reset',
        danger: true,
        onPress: () => clearCachedSessions({ resetWebsites, resetProfile }),
        note: 'Clears local state for websites, home selection, settings, profile.',
      },
    },
    {
      title: 'Security',
      items: [{ label: 'Two-Factor Authentication (2FA)', right: '›', onPress: () => {} }],
    },
    {
      title: 'Support',
      items: [
        { label: 'Contact Support', right: '›', onPress: () => {} },
        { label: 'Report a Bug', right: '›', onPress: () => {} },
        { label: 'Request a Feature', right: '›', onPress: () => {} },
      ],
    },
    {
      title: 'Legal',
      items: [
        { label: 'Privacy Policy', right: '›', onPress: () => {} },
        { label: 'Terms of Service', right: '›', onPress: () => {} },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Logout', right: '', onPress: () => {} },
        { label: 'Delete Account', right: '', onPress: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {sections.map((sec) => (
          <View key={sec.title} style={styles.card}>
            <Text style={styles.title}>{sec.title}</Text>
            {sec.note ? <Text style={styles.note}>{sec.note}</Text> : null}
            {sec.items.map((item) => (
              <Pressable
                key={item.label}
                style={[styles.row, item.active && styles.activeRow]}
                onPress={item.onPress}
              >
                <Text style={[styles.item, item.danger && styles.dangerText]}>{item.label}</Text>
                <Text style={[styles.status, item.danger && styles.dangerText]}>{item.right}</Text>
              </Pressable>
            ))}
            {sec.extra ? (
              <>
                <Pressable
                  style={[styles.row, styles.dangerRow]}
                  onPress={sec.extra.onPress}
                >
                  <Text style={[styles.item, styles.dangerText]}>{sec.extra.label}</Text>
                  <Text style={[styles.status, styles.dangerText]}>{sec.extra.right}</Text>
                </Pressable>
                {sec.extra.note ? <Text style={styles.note}>{sec.extra.note}</Text> : null}
              </>
            ) : null}
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
  rowSpace: {
    alignItems: 'center',
  },
  item: {
    fontSize: 14,
    color: '#111827',
  },
  status: {
    fontSize: 12,
    color: '#6b7280',
  },
  note: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  activeRow: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dangerRow: {
    marginTop: 6,
  },
  dangerText: {
    color: '#dc2626',
    fontWeight: '700',
  },
});
