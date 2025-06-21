
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type GlobalFilterContextType = {
  accountId: string;
  setAccountId: (id: string) => void;
};

const GlobalFilterContext = createContext<GlobalFilterContextType | undefined>(undefined);

export function GlobalFilterProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState('all');

  return (
    <GlobalFilterContext.Provider value={{ accountId, setAccountId }}>
      {children}
    </GlobalFilterContext.Provider>
  );
}

export function useGlobalFilter() {
  const context = useContext(GlobalFilterContext);
  if (context === undefined) {
    throw new Error('useGlobalFilter must be used within a GlobalFilterProvider');
  }
  return context;
}
