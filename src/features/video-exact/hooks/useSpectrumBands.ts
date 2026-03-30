import { useMemo } from 'react';
import { createSpectrumBands, type SpectrumBand } from '../utils/panelData';

export const useSpectrumBands = (seed: string, clockSeconds: number): SpectrumBand[] => {
  return useMemo(() => createSpectrumBands(seed, clockSeconds), [clockSeconds, seed]);
};

