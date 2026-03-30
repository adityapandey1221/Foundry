import { HudPanel } from './HudPanel';
import { useSyntheticTelemetry } from '../hooks/useSyntheticTelemetry';

export type FrequencySpectrumPanelProps = {
  seed?: string;
  className?: string;
};

type SpectrumBarProps = {
  x: number;
  width: number;
  value: number;
  height: number;
  baselineY: number;
};

function SpectrumBar({ x, width, value, height, baselineY }: SpectrumBarProps) {
  const magnitude = Math.max(0.14, Math.min(1, value));
  const barHeight = Math.max(3, height * magnitude);
  const top = baselineY - barHeight;
  const glowOpacity = 0.08 + magnitude * 0.18;
  const coreOpacity = 0.58 + magnitude * 0.36;
  const accentOpacity = 0.1 + magnitude * 0.16;

  return (
    <g transform={`translate(${x}, 0)`} aria-hidden="true">
      <rect
        x={0}
        y={top}
        width={width}
        height={barHeight}
        fill="rgba(255, 255, 255, 0.18)"
        opacity={glowOpacity}
      />
      <rect
        x={0}
        y={top + 1}
        width={width}
        height={Math.max(2, barHeight - 1)}
        fill="rgba(255, 255, 255, 0.86)"
        opacity={coreOpacity}
      />
      <rect
        x={0}
        y={top + 1}
        width={width}
        height={Math.max(2, barHeight - 2)}
        fill="rgba(255, 255, 255, 0.94)"
        opacity={accentOpacity}
      />
    </g>
  );
}

export function FrequencySpectrumPanel({ seed = 'video-exact-spectrum', className }: FrequencySpectrumPanelProps) {
  const telemetry = useSyntheticTelemetry(seed);
  const bands = telemetry.spectrumBands;

  const width = 640;
  const height = 132;
  const topPad = 10;
  const bottomPad = 14;
  const baselineY = height - bottomPad;
  const bandCount = bands.length;
  const barGap = 1;
  const barWidth = (width - (bandCount - 1) * barGap) / bandCount;

  return (
    <HudPanel
      title="FREQUENCY SPECTRUM"
      meta="64 BANDS"
      compact
      className={className}
      bodyClassName="video-exact-spectrum-panel"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="132"
        preserveAspectRatio="none"
        role="img"
        aria-label="Frequency spectrum bars"
        style={{
          display: 'block',
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id="video-exact-spectrum-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.28)" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={width} height={height} fill="rgba(255, 255, 255, 0.01)" />

        <g opacity={0.18}>
          {Array.from({ length: 5 }, (_, index) => {
            const y = topPad + index * 24;
            return (
              <line
                key={`guide-${index}`}
                x1={0}
                x2={width}
                y1={y}
                y2={y}
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth="1"
              />
            );
          })}
        </g>

        <g opacity={0.14}>
          {Array.from({ length: 8 }, (_, index) => {
            const x = index * (width / 7);
            return (
              <line
                key={`grid-${index}`}
                x1={x}
                x2={x}
                y1={topPad}
                y2={baselineY}
                stroke="rgba(255, 255, 255, 0.11)"
                strokeWidth="1"
              />
            );
          })}
        </g>

        <g opacity={0.9}>
          {bands.map((band, index) => {
            const x = index * (barWidth + barGap);
            const jitter = Math.sin(telemetry.clockSeconds * 1.3 + index * 0.55) * 0.035;
            const shimmer = Math.cos(telemetry.clockSeconds * 0.85 + index * 0.23) * 0.02;
            const value = Math.max(0.08, Math.min(1, band.value + jitter + shimmer));

            return (
              <SpectrumBar
                key={band.id}
                x={x}
                width={Math.max(4, barWidth)}
                value={value}
                height={baselineY - topPad}
                baselineY={baselineY}
              />
            );
          })}
        </g>

        <line
          x1={0}
          x2={width}
          y1={baselineY}
          y2={baselineY}
          stroke="url(#video-exact-spectrum-fade)"
          strokeWidth="1"
          opacity={0.42}
        />
      </svg>
    </HudPanel>
  );
}
