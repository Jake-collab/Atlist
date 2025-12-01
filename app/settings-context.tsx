import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { loadState, saveState, clearState } from '../storage/persistedState';
import { supabase } from '../lib/supabase';
import { useAuth } from './auth-context';

type ThemeMode = 'light' | 'dark' | 'system';
type PreloadMode = 'on' | 'off';

type SettingsState = {
  theme: ThemeMode;
  notifications: boolean;
  preload: PreloadMode;
  twoFactor: boolean;
};

type SettingsContextValue = {
  settings: SettingsState;
  setTheme: (t: ThemeMode) => void;
  setNotifications: (on: boolean) => void;
  setPreload: (p: PreloadMode) => void;
  setTwoFactor: (on: boolean) => void;
  reset: () => void;
  clearCachedSessions: (deps?: { resetWebsites?: () => void; resetProfile?: () => void }) => Promise<void>;
  loading: boolean;
  syncing: boolean;
};

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'system',
  notifications: false,
  preload: 'on',
  twoFactor: false,
};

const STORAGE_KEY = 'settings_state';

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const storageKey = user ? `${STORAGE_KEY}_${user.id}` : STORAGE_KEY;

  useEffect(() => {
    const hydrate = async () => {
      const stored = await loadState<SettingsState>(storageKey);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...stored });
      }
      if (user) {
        setSyncing(true);
        try {
          const { data, error } = await supabase
            .from('user_settings')
            .select('theme, notifications_enabled, preload_enabled, two_factor_enabled')
            .eq('user_id', user.id)
            .single();
          if (!error && data) {
            setSettings({
              theme: (data.theme as ThemeMode) ?? DEFAULT_SETTINGS.theme,
              notifications: data.notifications_enabled ?? DEFAULT_SETTINGS.notifications,
              preload: (data.preload_enabled ? 'on' : 'off') as PreloadMode,
              twoFactor: data.two_factor_enabled ?? false,
            });
          } else if (error && (error.code === 'PGRST116' || error.code === 'PGRST103')) {
            await supabase.from('user_settings').insert({
              user_id: user.id,
              theme: DEFAULT_SETTINGS.theme,
              notifications_enabled: DEFAULT_SETTINGS.notifications,
              preload_enabled: DEFAULT_SETTINGS.preload === 'on',
              two_factor_enabled: DEFAULT_SETTINGS.twoFactor ?? false,
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

  // On logout clear to defaults
  useEffect(() => {
    if (!user && !loading) {
      setSettings(DEFAULT_SETTINGS);
      clearState(storageKey);
    }
  }, [user, loading, storageKey]);

  useEffect(() => {
    if (loading) return;
    saveState(storageKey, settings);
    if (user) {
      (async () => {
        setSyncing(true);
        try {
          await supabase.from('user_settings').upsert({
            user_id: user.id,
            theme: settings.theme,
            notifications_enabled: settings.notifications,
            preload_enabled: settings.preload === 'on',
            two_factor_enabled: settings.twoFactor ?? false,
          });
        } finally {
          setSyncing(false);
        }
      })();
    }
  }, [settings, loading, user, storageKey]);

  const setTheme = (t: ThemeMode) => setSettings((prev) => ({ ...prev, theme: t }));
  const setNotifications = (on: boolean) =>
    setSettings((prev) => ({ ...prev, notifications: on }));
  const setPreload = (p: PreloadMode) => setSettings((prev) => ({ ...prev, preload: p }));
  const setTwoFactor = (on: boolean) => setSettings((prev) => ({ ...prev, twoFactor: on }));

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
    clearState(storageKey);
    if (user) {
      supabase.from('user_settings').delete().eq('user_id', user.id);
    }
  };

  const clearCachedSessions = async (deps?: {
    resetWebsites?: () => void;
    resetProfile?: () => void;
  }) => {
    reset();
    deps?.resetWebsites?.();
    deps?.resetProfile?.();
    // TODO: Clear deeper WebView cache/cookies if needed at native layer.
  };

  const value = useMemo(
    () => ({
      settings,
      setTheme,
      setNotifications,
      setPreload,
      setTwoFactor,
      reset,
      clearCachedSessions,
      loading,
      syncing,
    }),
    [settings, loading, syncing],
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Initializing…</Text>
      </View>
    );
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
