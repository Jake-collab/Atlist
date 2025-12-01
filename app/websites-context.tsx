import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { loadState, saveState, clearState } from '../storage/persistedState';
import { supabase } from '../lib/supabase';
import { useAuth } from './auth-context';

type Site = {
  name: string;
  color?: string;
};

type WebsitesState = {
  activated: Site[];
  selected?: string;
};

type WebsitesContextValue = {
  activated: Site[];
  selected?: string;
  setSelected: (name: string | undefined) => void;
  activate: (name: string) => void;
  deactivate: (name: string) => void;
  reorder: (next: Site[]) => void;
  setColor: (name: string, color?: string) => void;
  reset: () => void;
  loading: boolean;
  syncing: boolean;
};

const DEFAULT_ACTIVATED: Site[] = [
  { name: 'Amazon' },
  { name: 'OfferUp' },
  { name: 'Walmart' },
  { name: 'Uber Eats' },
  { name: 'DoorDash' },
  { name: 'TaskRabbit' },
  { name: 'Thumbtack' },
  { name: 'Craigslist' },
];

const STORAGE_KEY = 'websites_state';

const WebsitesContext = createContext<WebsitesContextValue | undefined>(undefined);

export const WebsitesProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<WebsitesState>({
    activated: DEFAULT_ACTIVATED,
    selected: DEFAULT_ACTIVATED[0]?.name,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const storageKey = user ? `${STORAGE_KEY}_${user.id}` : STORAGE_KEY;

  useEffect(() => {
    const hydrate = async () => {
      const stored = await loadState<WebsitesState>(storageKey);
      if (stored && stored.activated?.length) {
        setState({
          activated: stored.activated,
          selected: stored.selected ?? stored.activated[0]?.name,
        });
      } else {
        setState({
          activated: DEFAULT_ACTIVATED,
          selected: DEFAULT_ACTIVATED[0]?.name,
        });
      }
      setLoading(false);
    };
    hydrate();
  }, [storageKey]);

  // reset on logout
  useEffect(() => {
    if (!user && !loading) {
      setState({ activated: DEFAULT_ACTIVATED, selected: DEFAULT_ACTIVATED[0]?.name });
      clearState(storageKey);
    }
  }, [user, loading, storageKey]);

  // Pull from Supabase on auth
  useEffect(() => {
    const fetchRemote = async () => {
      if (!user) return;
      setSyncing(true);
      const { data, error } = await supabase
        .from('user_websites')
        .select('website_id, position, custom_color')
        .eq('user_id', user.id)
        .order('position', { ascending: true });
      if (!error && data) {
        const nextSites = data.map((row) => ({
          name: row.website_id,
          color: row.custom_color ?? undefined,
        }));
        if (nextSites.length) {
          setState({
            activated: nextSites,
            selected: nextSites[0]?.name,
          });
        } else {
          setState({
            activated: DEFAULT_ACTIVATED,
            selected: DEFAULT_ACTIVATED[0]?.name,
          });
        }
      }
      setSyncing(false);
    };
    fetchRemote();
  }, [user]);

  const pushRemote = useCallback(
    async (next: WebsitesState) => {
      if (!user) return;
      setSyncing(true);
      try {
        const rows = next.activated.map((s, idx) => ({
          user_id: user.id,
          website_id: s.name,
          position: idx,
          custom_color: s.color ?? null,
        }));
        await supabase.from('user_websites').delete().eq('user_id', user.id);
        if (rows.length) {
          await supabase.from('user_websites').upsert(rows);
        }
      } finally {
        setSyncing(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (loading) return;
    saveState(storageKey, state);
    pushRemote(state);
  }, [state, loading, pushRemote, storageKey]);

  const setSelected = (name: string | undefined) => {
    setState((prev) => ({
      ...prev,
      selected: name,
    }));
  };

  const activate = (name: string) => {
    setState((prev) => {
      if (prev.activated.find((s) => s.name === name)) return prev;
      const nextActivated = [...prev.activated, { name }];
      return {
        activated: nextActivated,
        selected: prev.selected ?? name,
      };
    });
  };

  const deactivate = (name: string) => {
    setState((prev) => {
      const nextActivated = prev.activated.filter((s) => s.name !== name);
      const nextSelected =
        prev.selected === name ? nextActivated[0]?.name : prev.selected;
      return {
        activated: nextActivated,
        selected: nextSelected,
      };
    });
  };

  const reorder = (next: Site[]) => {
    setState((prev) => {
      const stillSelected = next.find((s) => s.name === prev.selected);
      return {
        activated: next,
        selected: stillSelected ? prev.selected : next[0]?.name,
      };
    });
  };

  const setColor = (name: string, color?: string) => {
    setState((prev) => ({
      ...prev,
      activated: prev.activated.map((s) => (s.name === name ? { ...s, color } : s)),
    }));
  };

  const reset = () => {
    const next = { activated: DEFAULT_ACTIVATED, selected: DEFAULT_ACTIVATED[0]?.name };
    setState(next);
    clearState(storageKey);
    if (user) {
      supabase.from('user_websites').delete().eq('user_id', user.id);
    }
  };

  const value = useMemo(
    () => ({
      activated: state.activated,
      selected: state.selected,
      setSelected,
      activate,
      deactivate,
      reorder,
      setColor,
      reset,
      loading,
      syncing,
    }),
    [state, loading, syncing],
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Initializing…</Text>
      </View>
    );
  }

  return <WebsitesContext.Provider value={value}>{children}</WebsitesContext.Provider>;
};

export const useWebsites = () => {
  const ctx = useContext(WebsitesContext);
  if (!ctx) throw new Error('useWebsites must be used within WebsitesProvider');
  return ctx;
};

export type { Site };

