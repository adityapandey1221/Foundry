import { useMemo } from 'react';
import { createMarkets, type MarketRow } from '../utils/panelData';

export const useTickerTape = (seed: string, clockSeconds: number): MarketRow[] => {
  return useMemo(() => createMarkets(seed, clockSeconds), [clockSeconds, seed]);
};

