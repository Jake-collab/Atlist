import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { loadState, saveState, clearState } from '../storage/persistedState';
import { supabase } from '../lib/supabase';
import { useAuth } from './auth-context';

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
  syncing: boolean;
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
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const storageKey = user ? `${STORAGE_KEY}_${user.id}` : STORAGE_KEY;

  useEffect(() => {
    const hydrate = async () => {
      const stored = await loadState<ProfileState>(storageKey);
      if (stored) {
        setProfile({ ...DEFAULT_PROFILE, ...stored });
      }
      if (user) {
        setSyncing(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('email, username, full_name, avatar_url')
            .eq('id', user.id)
            .single();
          if (!error && data) {
            setProfile({
              ...DEFAULT_PROFILE,
              email: data.email ?? DEFAULT_PROFILE.email,
              username: data.username ?? DEFAULT_PROFILE.username,
              name: data.full_name ?? DEFAULT_PROFILE.name,
              avatarText: DEFAULT_PROFILE.avatarText,
              avatarColor: DEFAULT_PROFILE.avatarColor,
            });
          } else if (error && (error.code === 'PGRST116' || error.code === 'PGRST103')) {
            const defaults = {
              id: user.id,
              email: user.email ?? DEFAULT_PROFILE.email,
              username: user.email ? `@${user.email.split('@')[0]}` : DEFAULT_PROFILE.username,
              full_name: DEFAULT_PROFILE.name,
              avatar_url: DEFAULT_PROFILE.avatarColor,
            };
            await supabase.from('profiles').insert(defaults);
            setProfile({
              ...DEFAULT_PROFILE,
              email: defaults.email,
              username: defaults.username,
              name: defaults.full_name,
            });
          }
        } catch (e) {
          // ignore bootstrap errors
        } finally {
          setSyncing(false);
        }
      }
      setLoading(false);
    };
    hydrate();
  }, [user, storageKey]);

  useEffect(() => {
    if (!user && !loading) {
      setProfile(DEFAULT_PROFILE);
      clearState(storageKey);
    }
  }, [user, loading, storageKey]);

  useEffect(() => {
    if (loading) return;
    saveState(storageKey, profile);
    if (user) {
      (async () => {
        setSyncing(true);
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: profile.email,
            username: profile.username,
            full_name: profile.name,
            avatar_url: profile.avatarColor,
          });
        } finally {
          setSyncing(false);
        }
      })();
    }
  }, [profile, loading, user, storageKey]);

  const updateProfile = (next: Partial<ProfileState>) => {
    setProfile((prev) => ({ ...prev, ...next }));
  };

  const reset = () => {
    setProfile(DEFAULT_PROFILE);
    clearState(storageKey);
    if (user) {
      supabase.from('profiles').delete().eq('id', user.id);
    }
  };

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      reset,
      loading,
      syncing,
    }),
    [profile, loading, syncing],
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
