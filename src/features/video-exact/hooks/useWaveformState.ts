import { useMemo } from 'react';
import { createWaveformLayers, type WaveformLayer } from '../utils/panelData';

export const useWaveformState = (seed: string): WaveformLayer[] => {
  return useMemo(() => createWaveformLayers(seed), [seed]);
};

