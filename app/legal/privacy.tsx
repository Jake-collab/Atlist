import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>
          Dummy privacy policy text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis euismod, nisl sed tempor feugiat, felis purus faucibus magna, ac facilisis augue lectus at metus. Donec in nunc eget justo pharetra vulputate. 
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  headerBar: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { color: '#2563eb', fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  content: { padding: 16 },
  body: { color: '#111827', fontSize: 14, lineHeight: 20 },
});
