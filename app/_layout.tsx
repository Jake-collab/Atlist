import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WebsitesProvider } from './websites-context';
import { SettingsProvider } from './settings-context';
import { ProfileProvider } from './profile-context';
import { AuthProvider, useAuth } from './auth-context';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const inAuth = segments[0] === 'auth';

  useEffect(() => {
    if (loading) return;
    if (!user && !inAuth) {
      router.replace('/auth');
    } else if (user && inAuth) {
      router.replace('/');
    }
  }, [user, loading, inAuth, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SettingsProvider>
          <ProfileProvider>
            <WebsitesProvider>
              <AuthGate>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="profile" />
                  <Stack.Screen name="settings" />
                  <Stack.Screen name="edit-profile" />
                  <Stack.Screen name="auth/index" />
                  <Stack.Screen name="auth/forgot-password" />
                </Stack>
              </AuthGate>
            </WebsitesProvider>
          </ProfileProvider>
        </SettingsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}


