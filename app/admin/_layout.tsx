import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import { useProfile } from '../profile-context';
import { useAuth } from '../auth-context';

export default function AdminLayout() {
  const { profile, loading } = useProfile();
  const { user } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!user || profile.role !== 'admin') {
    router.replace('/');
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Not authorized</Text>
      </SafeAreaView>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="users/[userId]" />
      <Stack.Screen name="websites" />
    </Stack>
  );
}
