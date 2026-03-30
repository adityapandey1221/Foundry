import { useEffect, useRef, useState } from 'react';

export interface RafClock {
  elapsedMs: number;
  deltaMs: number;
  frame: number;
}

export interface RafOptions {
  enabled?: boolean;
  fps?: number;
}

export const clamp = (value: number, min = 0, max = 1): number => {
  return Math.min(max, Math.max(min, value));
};

export const lerp = (from: number, to: number, amount: number): number => {
  return from + (to - from) * amount;
};

export const inverseLerp = (from: number, to: number, value: number): number => {
  if (from === to) return 0;
  return clamp((value - from) / (to - from));
};

export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return lerp(outMin, outMax, inverseLerp(inMin, inMax, value));
};

export const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const t = inverseLerp(edge0, edge1, value);
  return t * t * (3 - 2 * t);
};

export const easeInOutSine = (value: number): number => {
  return -(Math.cos(Math.PI * clamp(value)) - 1) / 2;
};

export const easeOutCubic = (value: number): number => {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
};

export const wrap = (value: number, min: number, max: number): number => {
  const range = max - min;
  if (range === 0) return min;
  return ((((value - min) % range) + range) % range) + min;
};

export const pingPong = (value: number, length: number): number => {
  const range = length * 2;
  const wrapped = wrap(value, 0, range);
  return length - Math.abs(wrapped - length);
};

export const useRafClock = (options: RafOptions = {}): RafClock => {
  const { enabled = true, fps = 60 } = options;
  const [clock, setClock] = useState<RafClock>({ elapsedMs: 0, deltaMs: 0, frame: 0 });
  const lastTimeRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const throttleRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let rafId = 0;
    const minFrameMs = 1000 / Math.max(1, fps);

    const loop = (now: number) => {
      rafId = window.requestAnimationFrame(loop);

      if (throttleRef.current && now - throttleRef.current < minFrameMs) {
        return;
      }

      throttleRef.current = now;
      const previous = lastTimeRef.current ?? now;
      const deltaMs = now - previous;

      lastTimeRef.current = now;
      frameRef.current += 1;

      setClock({
        elapsedMs: now,
        deltaMs,
        frame: frameRef.current,
      });
    };

    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [enabled, fps]);

  return clock;
};

