import { useMemo } from 'react';
import { createRadarTargets, type RadarTarget } from '../utils/panelData';

export type RadarSweepState = {
  sweepAngle: number;
  targets: RadarTarget[];
};

export const useRadarSweep = (seed: string, clockSeconds: number): RadarSweepState => {
  return useMemo(
    () => ({
      sweepAngle: (clockSeconds * 0.65) % (Math.PI * 2),
      targets: createRadarTargets(seed, clockSeconds),
    }),
    [clockSeconds, seed]
  );
};

