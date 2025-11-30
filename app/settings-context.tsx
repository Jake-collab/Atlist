import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { loadState, saveState, clearState } from '../storage/persistedState';

type ThemeMode = 'light' | 'dark' | 'system';
type PreloadMode = 'on' | 'off';

type SettingsState = {
  theme: ThemeMode;
  notifications: boolean;
  preload: PreloadMode;
};

type SettingsContextValue = {
  settings: SettingsState;
  setTheme: (t: ThemeMode) => void;
  setNotifications: (on: boolean) => void;
  setPreload: (p: PreloadMode) => void;
  reset: () => void;
  clearCachedSessions: (deps?: { resetWebsites?: () => void; resetProfile?: () => void }) => Promise<void>;
  loading: boolean;
};

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'system',
  notifications: true,
  preload: 'on',
};

const STORAGE_KEY = 'settings_state';

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const stored = await loadState<SettingsState>(STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...stored });
      }
      setLoading(false);
    };
    hydrate();
  }, []);

  useEffect(() => {
    if (loading) return;
    saveState(STORAGE_KEY, settings);
  }, [settings, loading]);

  const setTheme = (t: ThemeMode) => setSettings((prev) => ({ ...prev, theme: t }));
  const setNotifications = (on: boolean) =>
    setSettings((prev) => ({ ...prev, notifications: on }));
  const setPreload = (p: PreloadMode) => setSettings((prev) => ({ ...prev, preload: p }));

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
    clearState(STORAGE_KEY);
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
      reset,
      clearCachedSessions,
      loading,
    }),
    [settings, loading],
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
