import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WebsitesProvider } from './websites-context';
import { SettingsProvider } from './settings-context';
import { ProfileProvider } from './profile-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <ProfileProvider>
          <WebsitesProvider>
            <Stack>
              <Stack.Screen name="index" options={{ title: 'Home' }} />
              <Stack.Screen name="profile" options={{ title: 'Profile' }} />
              <Stack.Screen name="settings" options={{ title: 'Settings' }} />
              <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
            </Stack>
          </WebsitesProvider>
        </ProfileProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}


