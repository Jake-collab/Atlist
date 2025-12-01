import React from 'react';
import { Alert, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from './settings-context';
import { useWebsites } from './websites-context';
import { useProfile } from './profile-context';
import { useAuth } from './auth-context';

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
  const router = useRouter();
  const { settings, setTheme, setNotifications, setPreload, clearCachedSessions, setTwoFactor } = useSettings();
  const { reset: resetWebsites } = useWebsites();
  const { reset: resetProfile } = useProfile();
  const { signOut } = useAuth();

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
      items: [
        {
          label: 'Two-Factor Authentication (2FA)',
          right: settings.twoFactor ? 'On' : 'Off',
          onPress: () => setTwoFactor(!settings.twoFactor),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Contact Support', right: '›', onPress: () => Linking.openURL('mailto:support@atlist.app?subject=Support') },
        { label: 'Report a Bug', right: '›', onPress: () => Linking.openURL('mailto:support@atlist.app?subject=Bug Report') },
        { label: 'Request a Feature', right: '›', onPress: () => Linking.openURL('mailto:support@atlist.app?subject=Feature Request') },
      ],
    },
    {
      title: 'Legal',
      items: [
        { label: 'Privacy Policy', right: '›', onPress: () => Linking.openURL('https://atlist.app/privacy') },
        { label: 'Terms of Service', right: '›', onPress: () => Linking.openURL('https://atlist.app/terms') },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Logout', right: '', onPress: () => signOut() },
        {
          label: 'Delete Account',
          right: '',
          onPress: () =>
            Alert.alert('Delete Account', 'This will be handled by support.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'OK', onPress: () => {} }, // TODO: wire to backend/edge function
            ]),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 48 }} />
      </View>
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
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
  },
  backText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
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
