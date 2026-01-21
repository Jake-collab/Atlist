import React, { useState } from 'react';
import { Alert, Linking, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from './settings-context';
import { useWebsites } from './websites-context';
import { useProfile } from './profile-context';
import { useAuth } from './auth-context';
import { supabase } from '../lib/supabase';

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
  const [ticketModal, setTicketModal] = useState<{ open: boolean; type: 'support' | 'bug'; message: string }>({ open: false, type: 'support', message: '' });

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
          onPress: () => setTwoFactor(!settings.twoFactor), // TODO: wire email OTP
        },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Contact Support', right: '✉️', onPress: () => setTicketModal({ open: true, type: 'support', message: '' }) },
        { label: 'Report a Bug', right: '✉️', onPress: () => setTicketModal({ open: true, type: 'bug', message: '' }) },
        { label: 'Request a Feature', right: '✉️', onPress: () => Linking.openURL('mailto:support@atlist.app?subject=Feature Request') },
      ],
    },
    {
      title: 'Legal',
      items: [
        { label: 'Privacy Policy', right: '📄', onPress: () => router.push('/legal/privacy') },
        { label: 'Terms of Service', right: '📄', onPress: () => router.push('/legal/terms') },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Logout',
          right: '',
          onPress: () =>
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: () => signOut() },
            ]),
        },
        {
          label: 'Delete Account',
          right: '',
          onPress: () =>
            Alert.alert('Delete Account', 'This will delete your data and sign you out.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    const { data: userData } = await supabase.auth.getUser();
                    const uid = userData?.user?.id;
                    if (uid) {
                      await supabase.from('user_websites').delete().eq('user_id', uid);
                      await supabase.from('user_settings').delete().eq('user_id', uid);
                      await supabase.from('support_tickets').delete().eq('user_id', uid);
                      await supabase.from('profiles').delete().eq('id', uid);
                      // TODO: secure function to delete auth user from Supabase Auth
                    }
                  } catch {
                    // ignore
                  } finally {
                    signOut();
                  }
                },
              },
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

      <Modal visible={ticketModal.open} transparent animationType="fade" onRequestClose={() => setTicketModal({ ...ticketModal, open: false })}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{ticketModal.type === 'support' ? 'Contact Support' : 'Report a Bug'}</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              placeholder="Type your message"
              placeholderTextColor="#94a3b8"
              value={ticketModal.message}
              onChangeText={(t) => setTicketModal((prev) => ({ ...prev, message: t }))}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalButtonSecondary} onPress={() => setTicketModal({ ...ticketModal, open: false })}>
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalButton}
                onPress={async () => {
                  if (!ticketModal.message.trim()) return;
                  const { data: userData } = await supabase.auth.getUser();
                  await supabase.from('support_tickets').insert({
                    user_id: userData?.user?.id,
                    email: userData?.user?.email,
                    type: ticketModal.type,
                    message: ticketModal.message.trim(),
                  });
                  setTicketModal({ open: false, type: 'support', message: '' });
                }}
              >
                <Text style={styles.modalButtonText}>Send</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  note: {
    color: '#4b5563',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  activeRow: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  item: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
  },
  status: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },
  dangerRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  dangerText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 380, backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  modalInput: { minHeight: 100, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, textAlignVertical: 'top', color: '#0f172a' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  modalButton: { backgroundColor: '#0f172a', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  modalButtonText: { color: '#fff', fontWeight: '800' },
  modalButtonSecondary: { backgroundColor: '#e5e7eb', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  modalButtonSecondaryText: { color: '#111827', fontWeight: '700' },
});
