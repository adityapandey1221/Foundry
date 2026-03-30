import { useMemo } from 'react';
import { useRafClock } from '../utils/motion';
import {
  createFlowRows,
  createGaugeData,
  createLatticeCells,
  createMarketLogs,
  type FlowRow,
  type GaugeDatum,
  type LatticeCell,
  type MarketLogEntry,
  type MarketRow,
  type SpectrumBand,
  type WaveformLayer,
} from '../utils/panelData';
import { useTickerTape } from './useTickerTape';
import { useRadarSweep, type RadarSweepState } from './useRadarSweep';
import { useSpectrumBands } from './useSpectrumBands';
import { useWaveformState } from './useWaveformState';

export type SyntheticTelemetryState = {
  clockSeconds: number;
  markets: MarketRow[];
  flowRows: FlowRow[];
  logs: MarketLogEntry[];
  waveformLayers: WaveformLayer[];
  spectrumBands: SpectrumBand[];
  radar: RadarSweepState;
  latticeCells: LatticeCell[];
  gauges: GaugeDatum[];
};

export const useSyntheticTelemetry = (seed = 'video-exact-hud'): SyntheticTelemetryState => {
  const clock = useRafClock({ fps: 24 });
  const clockSeconds = clock.elapsedMs / 1000;
  const markets = useTickerTape(seed, clockSeconds);
  const waveformLayers = useWaveformState(seed);
  const spectrumBands = useSpectrumBands(seed, clockSeconds);
  const radar = useRadarSweep(seed, clockSeconds);

  const flowRows = useMemo(() => createFlowRows(seed, clockSeconds), [clockSeconds, seed]);
  const logs = useMemo(() => createMarketLogs(seed, clockSeconds), [clockSeconds, seed]);
  const latticeCells = useMemo(() => createLatticeCells(seed, clockSeconds), [clockSeconds, seed]);
  const gauges = useMemo(() => createGaugeData(seed, clockSeconds), [clockSeconds, seed]);

  return {
    clockSeconds,
    markets,
    flowRows,
    logs,
    waveformLayers,
    spectrumBands,
    radar,
    latticeCells,
    gauges,
  };
};
