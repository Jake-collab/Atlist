import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { loadState, saveState, clearState } from '../storage/persistedState';

export type ProfileState = {
  name: string;
  username: string;
  email: string;
  avatarText?: string;
  avatarColor?: string;
};

type ProfileContextValue = {
  profile: ProfileState;
  updateProfile: (next: Partial<ProfileState>) => void;
  reset: () => void;
  loading: boolean;
};

const DEFAULT_PROFILE: ProfileState = {
  name: 'Alex Taylor',
  username: '@atlist_user',
  email: 'alex@example.com',
  avatarText: 'AT',
  avatarColor: '#111827',
};

const STORAGE_KEY = 'profile_state';

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<ProfileState>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const stored = await loadState<ProfileState>(STORAGE_KEY);
      if (stored) {
        setProfile({ ...DEFAULT_PROFILE, ...stored });
      }
      setLoading(false);
    };
    hydrate();
  }, []);

  useEffect(() => {
    if (loading) return;
    saveState(STORAGE_KEY, profile);
  }, [profile, loading]);

  const updateProfile = (next: Partial<ProfileState>) => {
    setProfile((prev) => ({ ...prev, ...next }));
  };

  const reset = () => {
    setProfile(DEFAULT_PROFILE);
    clearState(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      reset,
      loading,
    }),
    [profile, loading],
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Initializing…</Text>
      </View>
    );
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
};
