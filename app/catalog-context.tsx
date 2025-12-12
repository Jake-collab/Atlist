import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { supabase } from '../lib/supabase';

export type CatalogEntry = {
  id: string;
  name: string;
  category: string | null;
  url: string;
};

type CatalogContextValue = {
  catalog: CatalogEntry[];
  byId: Record<string, CatalogEntry>;
  loading: boolean;
};

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export const CatalogProvider = ({ children }: { children: React.ReactNode }) => {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('website_catalog').select('*').order('name');
        if (!error && data) setCatalog(data as CatalogEntry[]);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const byId = useMemo(() => {
    const map: Record<string, CatalogEntry> = {};
    catalog.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [catalog]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <CatalogContext.Provider value={{ catalog, byId, loading }}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
};
