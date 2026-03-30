import { createSeededRandom, hashCombine, seededNoise, type SeedInput } from './seededRandom';
import { clamp, mapRange, wrap } from './motion';

export type MarketRow = {
  id: string;
  symbol: string;
  yes: number;
  no: number;
  volume: string;
  trend: number[];
};

export type FlowRow = {
  id: string;
  price: string;
  leftValue: number;
  rightValue: number;
  intensity: number;
};

export type MarketLogEntry = {
  id: string;
  timestamp: string;
  text: string;
};

export type WaveformLayer = {
  id: string;
  amplitude: number;
  frequency: number;
  phase: number;
  offset: number;
  opacity: number;
};

export type SpectrumBand = {
  id: string;
  value: number;
};

export type RadarTarget = {
  id: string;
  angle: number;
  radius: number;
  size: number;
  intensity: number;
};

export type LatticeCell = {
  id: string;
  row: number;
  column: number;
  digit: string;
  intensity: number;
  active: boolean;
};

export type GaugeDatum = {
  id: string;
  label: string;
  value: number;
};

const MARKET_SYMBOLS = ['BTC RANGE', 'ETH VOL', 'SOL FLOW', 'SPX BREAK', 'DXY FLIP', 'QTL MOVE'] as const;
const LOG_TICKERS = ['BTC RANGE', 'ETH VOL', 'SOL DAY', 'QTL MOVE', 'SPX BREAK', 'NQ GAP', 'GOLD SPIKE', 'TSLA DAY'] as const;
const LOG_DIRECTIONS = ['UP', 'DOWN'] as const;
const LOG_TAGS = ['DAY RANGE', 'LIQUIDITY VACUUM', 'SWEEP + RECLAIM', 'DELTA HEDGE UNWIND', 'IMBALANCE CLUSTER', 'WHALE ABSORPTION'] as const;
const GAUGE_LABELS = ['CPU', 'NET', 'IO'] as const;

const formatPct = (value: number): number => Math.round(value * 10) / 10;

const formatVolume = (value: number): string => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}B`;
  }

  return `$${value.toFixed(1)}M`;
};

const makeTrend = (seed: SeedInput, clockSeconds: number, count = 28): number[] => {
  return Array.from({ length: count }, (_, index) => {
    const noiseA = seededNoise(hashCombine(seed, 'trend-a'), index * 0.31, clockSeconds * 0.08);
    const noiseB = seededNoise(hashCombine(seed, 'trend-b'), index * 0.12, clockSeconds * 0.19);
    const waveform = Math.sin((index * 0.42) + clockSeconds * 0.9) * 0.12;
    return clamp((noiseA * 0.55) + (noiseB * 0.25) + 0.15 + waveform, 0.08, 0.98);
  });
};

export const createMarkets = (seed: SeedInput, clockSeconds: number): MarketRow[] => {
  return MARKET_SYMBOLS.map((symbol, index) => {
    const rowSeed = hashCombine(seed, `${symbol}:${index}`);
    const random = createSeededRandom(rowSeed);
    const yesBase = random.float(18, 74);
    const wobble = Math.sin(clockSeconds * (0.35 + index * 0.04) + index) * 6.5;
    const yes = clamp((yesBase + wobble) / 100, 0.12, 0.88) * 100;
    const no = 100 - yes;
    const volume = 28 + random.float(0, 170) + (Math.sin(clockSeconds * 0.22 + index) * 12);

    return {
      id: symbol,
      symbol,
      yes: formatPct(yes),
      no: formatPct(no),
      volume: formatVolume(volume),
      trend: makeTrend(rowSeed, clockSeconds),
    };
  });
};

export const createFlowRows = (seed: SeedInput, clockSeconds: number, count = 10): FlowRow[] => {
  const random = createSeededRandom(hashCombine(seed, 'flow-rows'));
  const basePrice = 48.3;

  return Array.from({ length: count }, (_, index) => {
    const price = (basePrice - index * 0.1).toFixed(1);
    const leftValue = Math.round(200 + random.float(0, 430) + Math.sin(clockSeconds * 0.6 + index) * 55);
    const rightValue = Math.round(160 + random.float(0, 360) + Math.cos(clockSeconds * 0.74 + index * 0.4) * 48);
    const rawIntensity = 0.25 + seededNoise(seed, index * 0.33, clockSeconds * 0.22) * 0.75;

    return {
      id: `${price}-${index}`,
      price,
      leftValue: Math.max(120, leftValue),
      rightValue: Math.max(90, rightValue),
      intensity: clamp(rawIntensity, 0.18, 1),
    };
  });
};

export const createMarketLogs = (seed: SeedInput, clockSeconds: number, count = 6): MarketLogEntry[] => {
  const random = createSeededRandom(hashCombine(seed, 'logs'));
  const baseMinutes = Math.floor(clockSeconds * 0.4);

  return Array.from({ length: count }, (_, index) => {
    const ticker = LOG_TICKERS[(index + Math.floor(clockSeconds * 0.15)) % LOG_TICKERS.length];
    const direction = LOG_DIRECTIONS[(index + Math.floor(clockSeconds * 0.12)) % LOG_DIRECTIONS.length];
    const confidence = 58 + ((index * 7 + Math.floor(clockSeconds)) % 23);
    const pct = (0.2 + seededNoise(seed, index, clockSeconds * 0.17) * 1.5).toFixed(2);
    const tag = random.pick(LOG_TAGS);
    const minute = wrap(38 - baseMinutes - index, 0, 60);
    const second = wrap(13 - (Math.floor(clockSeconds * 2) + index * 11), 0, 60);
    const timestamp = `13:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;

    return {
      id: `${timestamp}-${ticker}-${index}`,
      timestamp,
      text: `${ticker} :: 15M ${direction} ${pct}% :: CONF ${confidence}% :: ${tag}`,
    };
  });
};

export const createWaveformLayers = (seed: SeedInput): WaveformLayer[] => {
  const random = createSeededRandom(hashCombine(seed, 'waveform'));

  return Array.from({ length: 4 }, (_, index) => ({
    id: `layer-${index}`,
    amplitude: 0.18 + random.float(0, 0.18),
    frequency: 1.1 + random.float(0, 1.6),
    phase: random.float(0, Math.PI * 2),
    offset: mapRange(index, 0, 3, -0.25, 0.25),
    opacity: 0.25 + index * 0.16,
  }));
};

export const createSpectrumBands = (seed: SeedInput, clockSeconds: number, count = 64): SpectrumBand[] => {
  return Array.from({ length: count }, (_, index) => {
    const base = seededNoise(hashCombine(seed, 'spectrum'), index * 0.18, clockSeconds * 0.42);
    const slow = seededNoise(hashCombine(seed, 'spectrum-slow'), index * 0.07, clockSeconds * 0.11);
    const value = clamp(0.24 + base * 0.52 + slow * 0.14, 0.12, 0.96);

    return {
      id: `band-${index}`,
      value,
    };
  });
};

export const createRadarTargets = (seed: SeedInput, clockSeconds: number, count = 14): RadarTarget[] => {
  const random = createSeededRandom(hashCombine(seed, 'radar'));

  return Array.from({ length: count }, (_, index) => {
    const baseAngle = random.float(0, Math.PI * 2);
    const angle = wrap(baseAngle + clockSeconds * (0.03 + index * 0.002), 0, Math.PI * 2);
    const radius = random.float(0.1, 0.92);
    const intensity = clamp(0.22 + seededNoise(seed, index * 0.41, clockSeconds * 0.48) * 0.78, 0.18, 1);

    return {
      id: `target-${index}`,
      angle,
      radius,
      size: 1.4 + random.float(0.8, 3.6),
      intensity,
    };
  });
};

export const createLatticeCells = (
  seed: SeedInput,
  clockSeconds: number,
  rows = 7,
  columns = 15
): LatticeCell[] => {
  return Array.from({ length: rows * columns }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const noise = seededNoise(hashCombine(seed, 'lattice'), row * 0.17, column * 0.19, clockSeconds * 0.23);
    const active = noise > 0.67;
    const digitNoise = seededNoise(hashCombine(seed, 'digits'), row * 1.7, column * 2.1, Math.floor(clockSeconds * 0.8));

    return {
      id: `${row}-${column}`,
      row,
      column,
      digit: String(Math.floor(digitNoise * 10)),
      intensity: clamp(noise, 0.08, 1),
      active,
    };
  });
};

export const createGaugeData = (seed: SeedInput, clockSeconds: number): GaugeDatum[] => {
  return GAUGE_LABELS.map((label, index) => {
    const noise = seededNoise(hashCombine(seed, label), clockSeconds * 0.15, index * 0.37);
    const value = 42 + noise * 18 + Math.sin(clockSeconds * (0.25 + index * 0.03)) * 4;

    return {
      id: label.toLowerCase(),
      label,
      value: Math.round(clamp(value / 100, 0.32, 0.84) * 100),
    };
  });
};

