import React, { createContext, useContext } from 'react';
import { useFinance, FinanceStore } from './useFinance';

const FinanceContext = createContext<FinanceStore | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const store = useFinance();
  return <FinanceContext.Provider value={store}>{children}</FinanceContext.Provider>;
}

export function useFinanceStore(): FinanceStore {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinanceStore must be used within FinanceProvider');
  return ctx;
}
