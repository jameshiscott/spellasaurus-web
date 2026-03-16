'use client';

import { useCoinBalance } from '@/contexts/CoinBalanceContext';

interface CoinDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function CoinDisplay({ size = 'md', label = 'Your Coins' }: CoinDisplayProps) {
  const { coinBalance } = useCoinBalance();

  const textSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl';

  return (
    <>
      <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide">{label}</p>
      <p className={`${textSize} font-black text-yellow-800`}>{coinBalance}</p>
    </>
  );
}
