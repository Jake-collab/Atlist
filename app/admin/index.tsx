import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function AdminHome() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Pressable style={styles.card} onPress={() => router.push('/admin/users')}>
          <Text style={styles.cardTitle}>Users</Text>
          <Text style={styles.cardDesc}>View all users and details</Text>
        </Pressable>
        <Pressable style={styles.card} onPress={() => router.push('/admin/websites')}>
          <Text style={styles.cardTitle}>Website Catalog</Text>
          <Text style={styles.cardDesc}>Manage master site list</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardDesc: { color: '#4b5563' },
});
