
'use client';

import * as React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/contexts/settings-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SettingsProvider>{children}</SettingsProvider>
    </ThemeProvider>
  );
}
