import React, { createContext, useContext, useMemo, useState } from 'react';

type Site = {
  name: string;
  color?: string;
};

type WebsitesContextValue = {
  activated: Site[];
  activate: (name: string) => void;
  deactivate: (name: string) => void;
  reorder: (next: Site[]) => void;
  setColor: (name: string, color?: string) => void;
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

const WebsitesContext = createContext<WebsitesContextValue | undefined>(undefined);

export const WebsitesProvider = ({ children }: { children: React.ReactNode }) => {
  const [activated, setActivated] = useState<Site[]>(DEFAULT_ACTIVATED);

  const activate = (name: string) => {
    setActivated((prev) => {
      if (prev.find((s) => s.name === name)) return prev;
      return [...prev, { name }];
    });
  };

  const deactivate = (name: string) => {
    setActivated((prev) => prev.filter((s) => s.name !== name));
  };

  const reorder = (next: Site[]) => {
    setActivated(next);
  };

  const setColor = (name: string, color?: string) => {
    setActivated((prev) => prev.map((s) => (s.name === name ? { ...s, color } : s)));
  };

  const value = useMemo(
    () => ({
      activated,
      activate,
      deactivate,
      reorder,
      setColor,
    }),
    [activated],
  );

  return <WebsitesContext.Provider value={value}>{children}</WebsitesContext.Provider>;
};

export const useWebsites = () => {
  const ctx = useContext(WebsitesContext);
  if (!ctx) throw new Error('useWebsites must be used within WebsitesProvider');
  return ctx;
};

export type { Site };
