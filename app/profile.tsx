import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWebsites, type Site } from './websites-context';

type SiteCategory = {
  title: string;
  items: string[];
};

const COLOR_PALETTE = [
  '#111827',
  '#2563eb',
  '#16a34a',
  '#f59e0b',
  '#dc2626',
  '#7c3aed',
  '#0ea5e9',
  '#ea580c',
  '#64748b',
  '#e2e8f0',
];

const SITE_CATEGORIES: SiteCategory[] = [
  {
    title: 'Shopping & Retail — General Retail',
    items: [
      'Amazon',
      'Walmart',
      'Target',
      'Costco',
      "Sam's Club",
      "BJ's",
      'eBay',
      'Wayfair',
      'Temu',
      'Shein',
      'Etsy',
      'Groupon',
    ],
  },
  {
    title: 'Shopping & Retail — Marketplace (Buy / Sell / Local)',
    items: ['OfferUp', 'Craigslist'],
  },
  {
    title: 'Food & Grocery Delivery — Food Delivery',
    items: ['DoorDash', 'Uber Eats', 'Grubhub', 'Postmates'],
  },
  {
    title: 'Food & Grocery Delivery — Grocery Delivery',
    items: ['Instacart', 'Shipt'],
  },
  {
    title: 'Local Services & Gig Work — Local Task Services',
    items: ['TaskRabbit', 'Thumbtack', "Angie's List"],
  },
  {
    title: 'Local Services & Gig Work — Pet Services',
    items: ['Wag', 'Rover'],
  },
  {
    title: 'Local Services & Gig Work — Gig Labor / Instant Work',
    items: ['Instawork'],
  },
  {
    title: 'Housing & Real Estate — Buy / Sell Homes',
    items: ['Zillow', 'Redfin', 'Realtor'],
  },
  {
    title: 'Housing & Real Estate — Rentals',
    items: ['HotPads', 'Apartments.com'],
  },
  {
    title: 'Travel & Vacation — Vacation Rentals',
    items: ['Airbnb', 'Vrbo'],
  },
  {
    title: 'Travel & Vacation — Travel Booking',
    items: ['Booking.com', 'Hotels.com', 'Kayak'],
  },
  {
    title: 'Social Media & Communities — Social Platforms',
    items: ['Facebook', 'X (Twitter)', 'Threads', 'Tumblr', 'LinkedIn', 'Reddit'],
  },
  {
    title: 'Social Media & Communities — Video Platforms',
    items: ['YouTube', 'Twitch'],
  },
  {
    title: 'Job Search & Hiring',
    items: ['Indeed', 'ZipRecruiter', 'Glassdoor', 'Snagajob', 'Monster'],
  },
  {
    title: 'Online Freelance Services',
    items: ['Fiverr', 'Upwork'],
  },
];

export default function ProfileScreen() {
  const { activated, activate, deactivate, reorder, setColor } = useWebsites();
  const [modalVisible, setModalVisible] = useState(false);
  const [colorPickerFor, setColorPickerFor] = useState<string | null>(null);
  const router = useRouter();

  const activeNames = useMemo(() => new Set(activated.map((s) => s.name)), [activated]);

  const renderSite = ({ item, drag, isActive }: RenderItemParams<Site>) => {
    const swatchColor = item.color ?? '#e5e7eb';
    return (
      <Pressable
        onLongPress={drag}
        disabled={isActive}
        style={[
          styles.siteRow,
          isActive && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
      >
        <View style={[styles.swatch, { backgroundColor: swatchColor }]} />
        <View style={styles.siteInfo}>
          <Text style={styles.siteName}>{item.name}</Text>
        </View>
      </Pressable>
    );
  };

  const profileCard = (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>AT</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.username}>@atlist_user</Text>
          <Text style={styles.name}>Alex Taylor</Text>
        </View>
        <Pressable style={styles.pencilButton} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.pencilText}>✏️</Text>
        </Pressable>
      </View>
      <Pressable style={styles.gearRow} onPress={() => router.push('/settings')}>
        <Text style={styles.gearText}>⚙️ Settings</Text>
        <Text style={styles.gearChevron}>›</Text>
      </Pressable>
    </View>
  );

  const listHeader = (
    <View style={styles.listHeaderCard}>
      <Text style={styles.sectionTitle}>My Websites</Text>
      <Text style={styles.sectionSubtitle}>Drag & drop to reorder • Top shows first</Text>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Website</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <DraggableFlatList
        data={activated}
        keyExtractor={(item) => item.name}
        renderItem={renderSite}
        onDragEnd={({ data }) => reorder(data)}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        ListHeaderComponent={() => (
          <>
            {profileCard}
            {listHeader}
          </>
        )}
        ListFooterComponent={footer}
        contentContainerStyle={styles.listContainer}
        activationDistance={0}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Back</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Add Website</Text>
            <View style={{ width: 48 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {SITE_CATEGORIES.map((cat) => (
              <View key={cat.title} style={styles.categoryBlock}>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                {cat.items.map((site) => {
                  const active = activeNames.has(site);
                  const isOpen = colorPickerFor === site;
                  const siteColor = activated.find((s) => s.name === site)?.color;
                  const previewColor = siteColor ?? '#e5e7eb';
                  return (
                    <View key={site} style={styles.categoryRow}>
                      <View style={styles.categoryLeft}>
                        <View style={[styles.colorPreview, { backgroundColor: previewColor }]} />
                        <Text style={styles.categorySite}>{site}</Text>
                      </View>
                      <View style={styles.categoryActions}>
                        <Pressable
                          style={styles.pencilButtonSmall}
                          onPress={() => setColorPickerFor(isOpen ? null : site)}
                        >
                          <Text style={styles.pencilText}>✏️</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.toggleBox, active ? styles.minusBox : styles.plusBox]}
                          onPress={() => {
                            if (active) {
                              deactivate(site);
                            } else {
                              activate(site);
                            }
                          }}
                        >
                          <Text style={active ? styles.toggleMinus : styles.togglePlus}>
                            {active ? '–' : '+'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
                {cat.items.map((site) => {
                  const isOpen = colorPickerFor === site;
                  if (!isOpen) return null;
                  return (
                    <View key={`${site}-palette`} style={styles.colorRow}>
                      {COLOR_PALETTE.map((c) => (
                        <Pressable
                          key={c}
                          style={[styles.colorDot, { backgroundColor: c }]}
                          onPress={() => {
                            setColor(site, c);
                            setColorPickerFor(null);
                          }}
                        />
                      ))}
                      <Pressable
                        style={[styles.colorDot, styles.clearDot]}
                        onPress={() => {
                          setColor(site, undefined);
                          setColorPickerFor(null);
                        }}
                      >
                        <Text style={styles.clearDotText}>×</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 16,
    gap: 10,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  profileText: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    color: '#4b5563',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  pencilButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  pencilText: {
    fontSize: 16,
  },
  gearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  gearText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  gearChevron: {
    fontSize: 16,
    color: '#9ca3af',
  },
  listHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginTop: 12,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubtitle: {
    color: '#4b5563',
    fontSize: 13,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  listSeparator: {
    height: 10,
  },
  siteRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  swatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  siteInfo: {
    flex: 1,
    gap: 4,
  },
  siteName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 14,
  },
  modalContent: {
    padding: 16,
    gap: 12,
  },
  categoryBlock: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  categorySite: {
    fontSize: 14,
    color: '#111827',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pencilButtonSmall: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  toggleBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
  },
  plusBox: {
    borderColor: '#16a34a',
  },
  minusBox: {
    borderColor: '#dc2626',
  },
  togglePlus: {
    color: '#16a34a',
    fontSize: 20,
    fontWeight: '800',
  },
  toggleMinus: {
    color: '#dc2626',
    fontSize: 20,
    fontWeight: '800',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  clearDot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
  },
  clearDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
});
