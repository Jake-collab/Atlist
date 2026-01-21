import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { loadState, saveState, clearState } from '../storage/persistedState';
import { supabase } from '../lib/supabase';
import { useAuth } from './auth-context';
import { useCatalog } from './catalog-context';

const SERVICE_URLS: Record<string, string | undefined> = {
  Amazon: 'https://www.amazon.com/',
  'OfferUp': 'https://offerup.com/',
  'Uber Eats': 'https://www.ubereats.com/',
  'Thumbtack': 'https://www.thumbtack.com/',
  'Airbnb': 'https://www.airbnb.com/',
  X: 'https://x.com/',
  'Indeed': 'https://www.indeed.com/',
};

export type Site = {
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
  { name: 'Uber Eats' },
  { name: 'Thumbtack' },
  { name: 'Airbnb' },
  { name: 'X' },
  { name: 'Indeed' },
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
  const { byId, loading: catalogLoading } = useCatalog();
  const storageKey = user ? `${STORAGE_KEY}_${user.id}` : STORAGE_KEY;

  const pruneToCatalog = useCallback(
    (sites: Site[]) => {
      const hasCatalog = Object.keys(byId).length > 0;
      if (!hasCatalog) return sites; // no catalog loaded yet; don't prune
      return sites.filter((s) => !!byId[s.name]);
    },
    [byId],
  );

  const fallbackDefault = useCallback(() => {
    const hasCatalog = Object.keys(byId).length > 0;
    if (!hasCatalog) return DEFAULT_ACTIVATED;
    const filtered = DEFAULT_ACTIVATED.filter((s) => byId[s.name]);
    return filtered.length ? filtered : DEFAULT_ACTIVATED;
  }, [byId]);

  useEffect(() => {
    const hydrate = async () => {
      const stored = await loadState<WebsitesState>(storageKey);
      const initial = stored && stored.activated?.length
        ? { activated: stored.activated, selected: stored.selected ?? stored.activated[0]?.name }
        : { activated: DEFAULT_ACTIVATED, selected: DEFAULT_ACTIVATED[0]?.name };
      const pruned = pruneToCatalog(initial.activated);
      const fallback = fallbackDefault();
      const finalActivated = pruned.length ? pruned : fallback;
      const finalSelected = finalActivated.find((s) => s.name === initial.selected)?.name ?? finalActivated[0]?.name;
      setState({
        activated: finalActivated,
        selected: finalSelected,
      });
      setLoading(false);
    };
    hydrate();
  }, [storageKey, pruneToCatalog, fallbackDefault]);

  // reset on logout
  useEffect(() => {
    if (!user && !loading) {
      const fallback = fallbackDefault();
      setState({ activated: fallback, selected: fallback[0]?.name });
      clearState(storageKey);
    }
  }, [user, loading, storageKey, fallbackDefault]);

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
        const pruned = pruneToCatalog(nextSites);
        if (pruned.length) {
          setState({
            activated: pruned,
            selected: pruned[0]?.name,
          });
        } else {
          const fallback = fallbackDefault();
          setState({
            activated: fallback,
            selected: fallback[0]?.name,
          });
        }
      }
      setSyncing(false);
    };
    fetchRemote();
  }, [user, pruneToCatalog, fallbackDefault]);

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

  // Persist local + Supabase
  useEffect(() => {
    if (loading) return;
    saveState(storageKey, state);
    pushRemote(state);
  }, [state, loading, pushRemote, storageKey]);

  const setSelected = (name: string | undefined) => {
    setState((prev) => {
      if (prev.selected === name) return prev;
      return { ...prev, selected: name };
    });
  };

  const activate = (name: string) => {
    setState((prev) => {
      const hasCatalog = Object.keys(byId).length > 0;
      if (hasCatalog && !byId[name] && !SERVICE_URLS[name]) return prev;
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
    const pruned = pruneToCatalog(next);
    setState((prev) => {
      const stillSelected = pruned.find((s) => s.name === prev.selected);
      return {
        activated: pruned,
        selected: stillSelected ? prev.selected : pruned[0]?.name,
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
    const fallback = fallbackDefault();
    const next = { activated: fallback, selected: fallback[0]?.name };
    setState(next);
    clearState(storageKey);
    if (user) {
      supabase.from('user_websites').delete().eq('user_id', user.id);
    }
  };

  // prune again when catalog loads
  useEffect(() => {
    if (catalogLoading) return;
    setState((prev) => {
      const pruned = pruneToCatalog(prev.activated);
      if (pruned.length === prev.activated.length) return prev;
      return { activated: pruned, selected: pruned[0]?.name };
    });
  }, [catalogLoading, pruneToCatalog]);

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
        <Text>Initializing...</Text>
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
