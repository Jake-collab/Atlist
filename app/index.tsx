import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useWebsites } from './websites-context';
import { useSettings } from './settings-context';
import { useCatalog } from './catalog-context';

const SERVICE_URLS: Record<string, string | undefined> = {
  // Shopping & Retail
  Amazon: 'https://www.amazon.com/',
  Walmart: 'https://www.walmart.com/',
  Target: 'https://www.target.com/',
  Costco: 'https://www.costco.com/',
  "Sam's Club": 'https://www.samsclub.com/',
  "BJ's": 'https://www.bjs.com/',
  eBay: 'https://www.ebay.com/',
  Wayfair: 'https://www.wayfair.com/',
  Temu: 'https://www.temu.com/',
  Shein: 'https://us.shein.com/',
  Etsy: 'https://www.etsy.com/',
  Groupon: 'https://www.groupon.com/',
  // Marketplace
  OfferUp: 'https://offerup.com/',
  Craigslist: 'https://www.craigslist.org/',
  // Food & Grocery
  DoorDash: 'https://www.doordash.com/',
  'Uber Eats': 'https://www.ubereats.com/',
  Grubhub: 'https://www.grubhub.com/',
  Postmates: 'https://postmates.com/',
  Instacart: 'https://www.instacart.com/',
  Shipt: 'https://www.shipt.com/',
  // Local Services & Gig
  TaskRabbit: 'https://www.taskrabbit.com/',
  Thumbtack: 'https://www.thumbtack.com/',
  "Angie's List": 'https://www.angi.com/',
  Wag: 'https://wagwalking.com/',
  Rover: 'https://www.rover.com/',
  Instawork: 'https://www.instawork.com/',
  // Housing
  Zillow: 'https://www.zillow.com/',
  Redfin: 'https://www.redfin.com/',
  Realtor: 'https://www.realtor.com/',
  HotPads: 'https://hotpads.com/',
  'Apartments.com': 'https://www.apartments.com/',
  // Travel
  Airbnb: 'https://www.airbnb.com/',
  Vrbo: 'https://www.vrbo.com/',
  'Booking.com': 'https://www.booking.com/',
  'Hotels.com': 'https://www.hotels.com/',
  Kayak: 'https://www.kayak.com/',
  // Social / Media
  Facebook: 'https://www.facebook.com/',
  X: 'https://x.com/',
  Threads: 'https://www.threads.net/',
  Tumblr: 'https://www.tumblr.com/',
  LinkedIn: 'https://www.linkedin.com/',
  Reddit: 'https://www.reddit.com/',
  YouTube: 'https://www.youtube.com/',
  Twitch: 'https://www.twitch.tv/',
  // Jobs
  Indeed: 'https://www.indeed.com/',
  ZipRecruiter: 'https://www.ziprecruiter.com/',
  Glassdoor: 'https://www.glassdoor.com/',
  Snagajob: 'https://www.snagajob.com/',
  Monster: 'https://www.monster.com/',
  // Freelance
  Fiverr: 'https://www.fiverr.com/',
  Upwork: 'https://www.upwork.com/',
};

export default function HomeScreen() {
  const { activated, selected, setSelected } = useWebsites();
  const router = useRouter();
  const { settings } = useSettings();
  const [cache, setCache] = useState<string[]>(() => (selected ? [selected] : []));
  const [fullScreen, setFullScreen] = useState(false);
  const { byId } = useCatalog();
  const isDark = settings.theme === 'dark';

  // keep selection valid if list changes
  useEffect(() => {
    if (!activated.length) return;
    if (!selected || !activated.find((s) => s.name === selected)) {
      setSelected(activated[0]?.name);
    }
  }, [activated, selected, setSelected]);

  const currentUrl = useMemo(() => {
    if (!selected) return undefined;
    return byId[selected]?.url ?? SERVICE_URLS[selected];
  }, [selected, byId]);

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
        {!fullScreen && (
          <>
            <View style={styles.header}>
              <Text style={[styles.logoText, isDark && styles.darkText]}>Atlist</Text>
              <View style={styles.headerActions}>
                <Pressable style={[styles.widenButton, isDark && styles.widenButtonDark]} onPress={() => setFullScreen(true)}>
                  <Text style={[styles.widenText, isDark && styles.darkButtonText]}>⇱</Text>
                </Pressable>
                <Pressable style={[styles.avatar, isDark && styles.avatarDark]} onPress={() => router.push('/profile')}>
                  <Text style={[styles.avatarText, isDark && styles.avatarTextDark]}>AT</Text>
                </Pressable>
              </View>
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
                const bubbleIsDark = isDark && !chipColor;
                return (
                  <Pressable
                    key={service.name}
                    style={[
                      styles.chip,
                      chipColor && { backgroundColor: chipColor },
                      bubbleIsDark && styles.chipDark,
                      isActive && !chipColor && !isDark && styles.chipSelected,
                      isActive && bubbleIsDark && styles.chipSelectedDark,
                    ]}
                    onPress={() => handleChipPress(service.name)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        (isActive || chipColor || isDark) && styles.chipTextSelected,
                      ]}
                    >
                      {service.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Content */}
        <View style={[styles.contentArea, fullScreen && styles.contentAreaFull]}>
          {cache.map((name) => {
            const uri = byId[name]?.url ?? SERVICE_URLS[name];
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
          {fullScreen && (
            <Pressable style={styles.minimizeButton} onPress={() => setFullScreen(false)}>
              <Text style={styles.minimizeText}>⇲</Text>
            </Pressable>
          )}
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  widenButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  widenButtonDark: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#fff' },
  widenText: { color: '#111827', fontWeight: '800', fontSize: 16 },
  darkButtonText: { color: '#fff' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  avatarDark: { backgroundColor: '#fff' },
  avatarText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  avatarTextDark: { color: '#111827' },
  chipScroll: { maxHeight: 36 },
  chipRow: { paddingVertical: 2, paddingRight: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, backgroundColor: '#e5e7eb', marginRight: 8, borderWidth: 1, borderColor: '#000' },
  chipSelected: { backgroundColor: '#111827' },
  chipDark: { backgroundColor: '#000', borderColor: '#fff' },
  chipSelectedDark: { backgroundColor: '#000', borderColor: '#fff' },
  chipText: { color: '#111827', fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#ffffff' },
  contentArea: { flex: 1, marginTop: 6, backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden' },
  contentAreaFull: { marginTop: 0, borderRadius: 0 },
  webVisible: { opacity: 1 },
  webHidden: { opacity: 0 },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  contentTitle: { fontSize: 16, color: '#4b5563', marginBottom: 8 },
  contentSubtitle: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  minimizeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  minimizeText: { color: '#fff', fontWeight: '800' },
});
