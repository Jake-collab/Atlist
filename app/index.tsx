import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useWebsites } from './websites-context';
import { useSettings } from './settings-context';

const SERVICE_URLS: Record<string, string | undefined> = {
  Amazon: 'https://www.amazon.com/',
  OfferUp: 'https://offerup.com/',
  Walmart: 'https://www.walmart.com/',
  'Uber Eats': 'https://www.ubereats.com/',
  DoorDash: 'https://www.doordash.com/',
  TaskRabbit: 'https://www.taskrabbit.com/',
  Thumbtack: 'https://www.thumbtack.com/',
  Craigslist: 'https://www.craigslist.org/',
};

export default function HomeScreen() {
  const { activated, selected, setSelected } = useWebsites();
  const router = useRouter();
  const { settings } = useSettings();
  const [cache, setCache] = useState<string[]>(() => (selected ? [selected] : []));

  // keep selection valid if list changes
  useEffect(() => {
    if (!selected || !activated.find((s) => s.name === selected)) {
      setSelected(activated[0]?.name);
    }
  }, [activated, selected, setSelected]);

  const currentUrl = useMemo(() => (selected ? SERVICE_URLS[selected] : undefined), [selected]);

  const handleChipPress = useCallback((name: string) => {
    setSelected(name);
  }, []);

  // Determine which webviews to keep mounted
  useEffect(() => {
    if (settings.preload === 'on') {
      setCache(activated.map((s) => s.name));
    } else {
      if (!selected) return;
      setCache((prev) => {
        const filtered = prev.filter((n) => n === selected || activated.find((s) => s.name === n));
        if (!filtered.includes(selected)) filtered.push(selected);
        while (filtered.length > 2) filtered.shift();
        return [...filtered];
      });
    }
  }, [selected, activated, settings.preload]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Atlist</Text>
          <Pressable style={styles.avatar} onPress={() => router.push('/profile')}>
            <Text style={styles.avatarText}>AT</Text>
          </Pressable>
        </View>

        {/* Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}
        >
          {activated.map((service) => {
            const isActive = service.name === selected;
            const chipColor = service.color;
            return (
              <Pressable
                key={service.name}
                style={[
                  styles.chip,
                  chipColor && { backgroundColor: chipColor },
                  isActive && !chipColor && styles.chipSelected,
                ]}
                onPress={() => handleChipPress(service.name)}
              >
                <Text
                  style={[
                    styles.chipText,
                    (isActive || chipColor) && styles.chipTextSelected,
                  ]}
                >
                  {service.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Content */}
        <View style={styles.contentArea}>
          {cache.map((name) => {
            const uri = SERVICE_URLS[name];
            if (!uri) return null;
            const isActive = name === selected;
            return (
              <View
                key={name}
                style={[
                  StyleSheet.absoluteFillObject,
                  isActive ? styles.webVisible : styles.webHidden,
                ]}
                pointerEvents={isActive ? 'auto' : 'none'}
              >
                <WebView
                  source={{ uri }}
                  cacheEnabled
                  cacheMode="LOAD_CACHE_ELSE_NETWORK"
                  domStorageEnabled
                  sharedCookiesEnabled
                  thirdPartyCookiesEnabled
                  allowsInlineMediaPlayback
                  setSupportMultipleWindows={false}
                  allowsFullscreenVideo
                  originWhitelist={['*']}
                  overScrollMode="never"
                  javaScriptEnabled
                  renderToHardwareTextureAndroid
                  androidLayerType="hardware"
                  startInLoadingState={false}
                  style={{ flex: 1 }}
                />
              </View>
            );
          })}
          {!currentUrl ? (
            <View style={styles.fallback}>
              <ActivityIndicator />
              <Text style={styles.contentTitle}>No URL available</Text>
              <Text style={styles.contentSubtitle}>{selected ?? 'No site selected'}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, paddingHorizontal: 14, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, zIndex: 2 },
  logoText: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  chipScroll: { maxHeight: 36 },
  chipRow: { paddingVertical: 2, paddingRight: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, backgroundColor: '#e5e7eb', marginRight: 8 },
  chipSelected: { backgroundColor: '#111827' },
  chipText: { color: '#111827', fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#ffffff' },
  contentArea: { flex: 1, marginTop: 6, backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden' },
  webVisible: { opacity: 1 },
  webHidden: { opacity: 0 },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  contentTitle: { fontSize: 16, color: '#4b5563', marginBottom: 8 },
  contentSubtitle: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
});
