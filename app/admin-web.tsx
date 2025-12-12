import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';

// TODO: replace with your real admin URL
const ADMIN_URL = 'https://admin.atlist.app';

export default function AdminWeb() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={20}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Admin Panel (Web)</Text>
        <View style={{ width: 48 }} />
      </View>
      <View style={styles.body}>
        <WebView
          source={{ uri: ADMIN_URL }}
          startInLoadingState
          cacheEnabled
          originWhitelist={['*']}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
  },
  backText: { color: '#2563eb', fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  body: { flex: 1 },
});
