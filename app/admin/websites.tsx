import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

type CatalogRow = {
  id: string;
  name: string;
  category: string | null;
  url: string;
};

export default function AdminWebsites() {
  const router = useRouter();
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<CatalogRow | null>(null);
  const [form, setForm] = useState<{ id: string; name: string; category: string; url: string }>({
    id: '',
    name: '',
    category: '',
    url: '',
  });

  const loadRows = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('website_catalog').select('*').order('name');
    if (error) setError(error.message);
    else setRows(data as CatalogRow[]);
    setLoading(false);
  };

  useEffect(() => {
    loadRows();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ id: '', name: '', category: '', url: '' });
    setModalVisible(true);
  };

  const openEdit = (row: CatalogRow) => {
    setEditing(row);
    setForm({ id: row.id, name: row.name, category: row.category ?? '', url: row.url });
    setModalVisible(true);
  };

  const save = async () => {
    if (!form.id || !form.name || !form.url) {
      Alert.alert('Missing fields', 'ID, name, and URL are required.');
      return;
    }
    setLoading(true);
    if (editing) {
      const { error } = await supabase
        .from('website_catalog')
        .update({ name: form.name, category: form.category || null, url: form.url })
        .eq('id', editing.id);
      if (error) Alert.alert('Error', error.message);
    } else {
      const { error } = await supabase.from('website_catalog').insert({
        id: form.id,
        name: form.name,
        category: form.category || null,
        url: form.url,
      });
      if (error) Alert.alert('Error', error.message);
    }
    setModalVisible(false);
    await loadRows();
    setLoading(false);
  };

  const remove = (row: CatalogRow) => {
    Alert.alert('Delete Website', `Delete ${row.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('website_catalog').delete().eq('id', row.id);
          if (error) Alert.alert('Error', error.message);
          await loadRows();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Website Catalog</Text>
        <Pressable onPress={openAdd}>
          <Text style={styles.add}>Add</Text>
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
            <View key={row.id} style={styles.row}>
              <Text style={styles.rowTitle}>{row.name}</Text>
              <Text style={styles.rowSub}>{row.id}</Text>
              <Text style={styles.rowMeta}>{row.category ?? 'Uncategorized'}</Text>
              <Text style={styles.rowMeta}>{row.url}</Text>
              <View style={styles.rowActions}>
                <Pressable onPress={() => openEdit(row)}>
                  <Text style={styles.action}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => remove(row)}>
                  <Text style={[styles.action, styles.danger]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.back}>Close</Text>
            </Pressable>
            <Text style={styles.modalTitle}>{editing ? 'Edit Website' : 'Add Website'}</Text>
            <View style={{ width: 48 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {!editing && (
              <View style={styles.field}>
                <Text style={styles.label}>ID</Text>
                <TextInput style={styles.input} value={form.id} onChangeText={(v) => setForm((p) => ({ ...p, id: v }))} />
              </View>
            )}
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <TextInput style={styles.input} value={form.category} onChangeText={(v) => setForm((p) => ({ ...p, category: v }))} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>URL</Text>
              <TextInput style={styles.input} value={form.url} onChangeText={(v) => setForm((p) => ({ ...p, url: v }))} />
            </View>
            <Pressable style={styles.saveButton} onPress={save}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  back: { color: '#2563eb', fontWeight: '700' },
  add: { color: '#2563eb', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626' },
  list: { padding: 16, gap: 10 },
  row: { backgroundColor: '#fff', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, gap: 4 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  rowSub: { color: '#4b5563' },
  rowMeta: { color: '#6b7280' },
  rowActions: { flexDirection: 'row', gap: 12, marginTop: 6 },
  action: { color: '#2563eb', fontWeight: '700' },
  danger: { color: '#dc2626' },
  modalSafe: { flex: 1, backgroundColor: '#f8fafc' },
  modalHeader: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  modalContent: { padding: 16, gap: 12 },
  field: { gap: 6 },
  label: { color: '#4b5563' },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  saveButton: { backgroundColor: '#111827', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveText: { color: '#fff', fontWeight: '700' },
});
