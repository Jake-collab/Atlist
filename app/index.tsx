import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';

const SERVICES = [
  'Amazon',
  'OfferUp',
  'Walmart',
  'Uber Eats',
  'DoorDash',
  'TaskRabbit',
  'Thumbtack',
  'Craigslist',
];

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
  const [selected, setSelected] = useState<string>(SERVICES[0]);
  const router = useRouter();

  const currentUrl = useMemo(() => SERVICE_URLS[selected], [selected]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Atlist</Text>
          <Pressable style={styles.avatar} onPress={() => router.push('/profile')}>
            <Text style={styles.avatarText}>AT</Text>
          </Pressable>
        </View>

        {/* Compact bubbles pinned near the top */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}
        >
          {SERVICES.map((service) => {
            const isSelected = service === selected;
            return (
              <Pressable
                key={service}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelected(service)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {service}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Full-height area below chips */}
        <View style={styles.contentArea}>
          {currentUrl ? (
            <WebView style={styles.webview} source={{ uri: currentUrl }} />
          ) : (
            <View style={styles.fallback}>
              <Text style={styles.contentTitle}>No URL available</Text>
              <Text style={styles.contentSubtitle}>{selected}</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 0, // no top gap
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  chipScroll: {
    maxHeight: 36,
  },
  chipRow: {
    paddingVertical: 2,
    paddingRight: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#111827',
  },
  chipText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  contentArea: {
    flex: 1,
    marginTop: 6,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  webview: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  contentTitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
  contentSubtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
});

