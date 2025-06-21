
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Currency, DateFormat, Language } from '@/lib/definitions';

interface SettingsContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  dateFormat: DateFormat;
  setDateFormat: (dateFormat: DateFormat) => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [dateFormat, setDateFormat] = useState<DateFormat>('MM/dd/yyyy');
  const [language, setLanguage] = useState<Language>('en');

  const value = {
    currency,
    setCurrency,
    dateFormat,
    setDateFormat,
    language,
    setLanguage,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
