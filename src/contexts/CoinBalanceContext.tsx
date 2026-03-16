'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface CoinBalanceContextValue {
  coinBalance: number;
  refreshBalance: () => Promise<void>;
  /** Optimistically set the balance (e.g. after a purchase) */
  setBalance: (balance: number) => void;
}

const CoinBalanceContext = createContext<CoinBalanceContextValue>({
  coinBalance: 0,
  refreshBalance: async () => {},
  setBalance: () => {},
});

export function CoinBalanceProvider({
  initialBalance,
  children,
}: {
  initialBalance: number;
  children: React.ReactNode;
}) {
  const [coinBalance, setCoinBalance] = useState(initialBalance);
  const mountedRef = useRef(true);

  const refreshBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/user/balance');
      if (res.ok) {
        const data = await res.json();
        if (mountedRef.current) {
          setCoinBalance(data.coinBalance);
        }
      }
    } catch {
      // silently ignore fetch errors
    }
  }, []);

  // Refresh on window focus
  useEffect(() => {
    mountedRef.current = true;
    const onFocus = () => void refreshBalance();
    window.addEventListener('focus', onFocus);
    return () => {
      mountedRef.current = false;
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshBalance]);

  // Also refresh on navigation (Next.js popstate)
  useEffect(() => {
    const onPopState = () => void refreshBalance();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [refreshBalance]);

  return (
    <CoinBalanceContext.Provider
      value={{ coinBalance, refreshBalance, setBalance: setCoinBalance }}
    >
      {children}
    </CoinBalanceContext.Provider>
  );
}

export function useCoinBalance() {
  return useContext(CoinBalanceContext);
}
