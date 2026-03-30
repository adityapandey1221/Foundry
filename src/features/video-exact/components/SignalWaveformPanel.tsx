import { HudPanel } from './HudPanel';
import { useSyntheticTelemetry } from '../hooks/useSyntheticTelemetry';
import type { WaveformLayer } from '../utils/panelData';

type Point = {
  x: number;
  y: number;
};

const WIDTH = 1000;
const HEIGHT = 280;
const PADDING_X = 44;
const PADDING_Y = 34;

const buildTrace = (
  layer: WaveformLayer,
  clockSeconds: number,
  traceIndex: number,
  pointCount = 128
): string => {
  const points: Point[] = [];
  const usableWidth = WIDTH - PADDING_X * 2;
  const usableHeight = HEIGHT - PADDING_Y * 2;
  const baseline = HEIGHT / 2 + layer.offset * usableHeight * 0.44;

  for (let index = 0; index < pointCount; index += 1) {
    const t = index / (pointCount - 1);
    const x = PADDING_X + usableWidth * t;
    const phase = (t * Math.PI * layer.frequency * 2) + layer.phase + clockSeconds * (0.55 + traceIndex * 0.09);
    const slowDrift = Math.sin(clockSeconds * 0.33 + traceIndex * 0.6) * 0.08;
    const fineNoise = Math.sin((t * 18) + clockSeconds * 1.3 + traceIndex) * 0.025;
    const harmonic = Math.sin(phase) * layer.amplitude;
    const overtone = Math.sin(phase * 0.5 + traceIndex) * layer.amplitude * 0.36;
    const y = baseline - ((harmonic + overtone + slowDrift + fineNoise) * usableHeight * 0.34);

    points.push({ x, y });
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
};

const buildGuides = (): string[] => {
  const guides: string[] = [];

  for (let index = 0; index < 7; index += 1) {
    const y = PADDING_Y + ((HEIGHT - PADDING_Y * 2) / 6) * index;
    guides.push(`M ${PADDING_X} ${y.toFixed(2)} L ${WIDTH - PADDING_X} ${y.toFixed(2)}`);
  }

  for (let index = 0; index < 11; index += 1) {
    const x = PADDING_X + ((WIDTH - PADDING_X * 2) / 10) * index;
    guides.push(`M ${x.toFixed(2)} ${PADDING_Y} L ${x.toFixed(2)} ${HEIGHT - PADDING_Y}`);
  }

  return guides;
};

export function SignalWaveformPanel() {
  const telemetry = useSyntheticTelemetry('signal-waveform');
  const guidePaths = buildGuides();
  const traces = telemetry.waveformLayers.slice(0, 4);

  return (
    <HudPanel title="SIGNAL WAVEFORM" meta="MULTI-LAYER" compact bodyClassName="video-exact-waveform__body">
      <div className="video-exact-waveform">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="video-exact-waveform__svg"
          role="img"
          aria-label="Signal waveform visualization"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="video-exact-waveform-glow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="transparent" />

          <g opacity="0.28">
            {guidePaths.map((path, index) => (
              <path
                key={`guide-${index}`}
                d={path}
                fill="none"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          <g opacity="0.18">
            <path
              d={`M ${PADDING_X} ${HEIGHT / 2} L ${WIDTH - PADDING_X} ${HEIGHT / 2}`}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          </g>

          {traces.map((layer, index) => {
            const path = buildTrace(layer, telemetry.clockSeconds, index);
            const strokeOpacity = 0.3 + index * 0.16;

            return (
              <g key={layer.id} opacity={layer.opacity}>
                <path
                  d={path}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={3.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={path}
                  fill="none"
                  stroke="url(#video-exact-waveform-glow)"
                  strokeOpacity={strokeOpacity}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </HudPanel>
  );
}

