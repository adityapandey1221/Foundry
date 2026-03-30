export type SeedInput = string | number;

const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

export const hashSeed = (input: SeedInput): number => {
  const str = String(input);
  let hash = FNV_OFFSET;

  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return hash >>> 0;
};

export const hashCombine = (seed: SeedInput, salt: SeedInput): number => {
  return hashSeed(`${String(seed)}:${String(salt)}`);
};

export const toSeedNumber = (input: SeedInput): number => {
  if (typeof input === 'number') {
    return input >>> 0;
  }

  return hashSeed(input);
};

export class SeededRandom {
  private state: number;

  constructor(seed: SeedInput) {
    const normalized = toSeedNumber(seed);
    this.state = normalized === 0 ? 1 : normalized;
  }

  next(): number {
    // Mulberry32: compact, fast, and good enough for deterministic UI synthesis.
    this.state += 0x6D2B79F5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  float(min = 0, max = 1): number {
    return min + (max - min) * this.next();
  }

  int(min: number, max: number): number {
    return Math.floor(this.float(min, max + 1));
  }

  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('SeededRandom.pick requires at least one item');
    }

    return items[this.int(0, items.length - 1)];
  }

  weightedPick<T>(items: readonly { value: T; weight: number }[]): T {
    const total = items.reduce((sum, item) => sum + item.weight, 0);

    if (total <= 0) {
      throw new Error('SeededRandom.weightedPick requires positive total weight');
    }

    let cursor = this.float(0, total);

    for (const item of items) {
      cursor -= item.weight;
      if (cursor <= 0) {
        return item.value;
      }
    }

    return items[items.length - 1].value;
  }

  shuffle<T>(items: readonly T[]): T[] {
    const output = [...items];

    for (let i = output.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [output[i], output[j]] = [output[j], output[i]];
    }

    return output;
  }

  clone(): SeededRandom {
    const copy = new SeededRandom(1);
    copy.state = this.state;
    return copy;
  }

  fork(salt: SeedInput): SeededRandom {
    return new SeededRandom(hashCombine(this.state, salt));
  }
}

export const createSeededRandom = (seed: SeedInput): SeededRandom => new SeededRandom(seed);

export const seededNoise = (seed: SeedInput, x: number, y = 0, z = 0): number => {
  const n = Math.sin((x * 12.9898) + (y * 78.233) + (z * 37.719) + toSeedNumber(seed)) * 43758.5453;
  return n - Math.floor(n);
};

