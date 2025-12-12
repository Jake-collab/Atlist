import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

type ProfileRow = {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  role: string | null;
};
type SettingsRow = {
  theme: string | null;
  notifications_enabled: boolean | null;
  preload_enabled: boolean | null;
  two_factor_enabled: boolean | null;
};
type WebsiteRow = {
  website_id: string;
  position: number;
  custom_color: string | null;
  website_catalog: { name: string; category: string | null; url: string } | null;
};

export default function AdminUserDetail() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [websites, setWebsites] = useState<WebsiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [{ data: pData, error: pErr }, { data: sData, error: sErr }, { data: wData, error: wErr }] =
          await Promise.all([
            supabase.from('profiles').select('id, email, username, full_name, role').eq('id', userId).single(),
            supabase.from('user_settings').select('theme, notifications_enabled, preload_enabled, two_factor_enabled').eq('user_id', userId).single(),
            supabase
              .from('user_websites')
              .select('website_id, position, custom_color, website_catalog(name, category, url)')
              .eq('user_id', userId)
              .order('position', { ascending: true }),
          ]);
        if (pErr) throw pErr;
        setProfile(pData as ProfileRow);
        if (!sErr && sData) setSettings(sData as SettingsRow);
        if (!wErr && wData) setWebsites(wData as WebsiteRow[]);
      } catch (e: any) {
        setError(e.message ?? 'Error loading user');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>User Detail</Text>
        <View style={{ width: 48 }} />
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profile</Text>
            <Text style={styles.label}>Email: <Text style={styles.value}>{profile?.email ?? '—'}</Text></Text>
            <Text style={styles.label}>Username: <Text style={styles.value}>{profile?.username ?? '—'}</Text></Text>
            <Text style={styles.label}>Name: <Text style={styles.value}>{profile?.full_name ?? '—'}</Text></Text>
            <Text style={styles.label}>Role: <Text style={styles.value}>{profile?.role ?? 'user'}</Text></Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Settings</Text>
            <Text style={styles.label}>Theme: <Text style={styles.value}>{settings?.theme ?? '—'}</Text></Text>
            <Text style={styles.label}>Notifications: <Text style={styles.value}>{settings?.notifications_enabled ? 'On' : 'Off'}</Text></Text>
            <Text style={styles.label}>Preload: <Text style={styles.value}>{settings?.preload_enabled ? 'On' : 'Off'}</Text></Text>
            <Text style={styles.label}>2FA: <Text style={styles.value}>{settings?.two_factor_enabled ? 'On' : 'Off'}</Text></Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Websites</Text>
            {websites.length === 0 ? (
              <Text style={styles.value}>None</Text>
            ) : (
              websites.map((w) => (
                <View key={`${w.website_id}-${w.position}`} style={styles.siteRow}>
                  <Text style={styles.value}>
                    {w.position + 1}. {w.website_catalog?.name ?? w.website_id} ({w.website_catalog?.category ?? '—'})
                  </Text>
                  <Text style={styles.label}>URL: <Text style={styles.value}>{w.website_catalog?.url ?? '—'}</Text></Text>
                  <Text style={styles.label}>Color: <Text style={styles.value}>{w.custom_color ?? 'default'}</Text></Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  back: { color: '#2563eb', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626' },
  content: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  label: { color: '#4b5563' },
  value: { color: '#0f172a', fontWeight: '600' },
  siteRow: { paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
});
