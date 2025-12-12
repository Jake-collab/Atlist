import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

type Row = {
  id: string;
  email: string | null;
  username: string | null;
  role: string | null;
  created_at: string | null;
};

export default function AdminUsers() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, role, created_at')
        .order('created_at', { ascending: false });
      if (error) {
        setError(error.message);
      } else {
        setRows(data as Row[]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
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
        <ScrollView contentContainerStyle={styles.list}>
          {rows.map((row) => (
            <Pressable key={row.id} style={styles.row} onPress={() => router.push(`/admin/users/${row.id}`)}>
              <Text style={styles.rowTitle}>{row.username ?? '(no username)'}</Text>
              <Text style={styles.rowSub}>{row.email ?? '(no email)'}</Text>
              <Text style={styles.rowMeta}>{row.role ?? 'user'} • {row.created_at?.slice(0, 10) ?? ''}</Text>
            </Pressable>
          ))}
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
  list: { padding: 16, gap: 10 },
  row: { backgroundColor: '#fff', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  rowSub: { color: '#4b5563' },
  rowMeta: { color: '#6b7280', marginTop: 4 },
});
