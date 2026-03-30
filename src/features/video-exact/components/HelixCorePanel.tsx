import { HudPanel } from './HudPanel';
import { useSyntheticTelemetry } from '../hooks/useSyntheticTelemetry';
import { clamp } from '../utils/motion';

export type HelixCorePanelProps = {
  seed?: string;
  className?: string;
};

type Point = {
  x: number;
  y: number;
};

const WIDTH = 1000;
const HEIGHT = 560;
const LEFT = 68;
const RIGHT = WIDTH - 68;
const TOP = 54;
const BOTTOM = HEIGHT - 52;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2 + 6;
const POINT_COUNT = 112;

const buildTerrainPath = (clockSeconds: number, rowIndex: number): string => {
  const points: Point[] = [];
  const count = 84;
  const step = (RIGHT - LEFT) / (count - 1);
  const rowOffset = (rowIndex - 6) * 11;
  const ripple = 0.55 + rowIndex * 0.065;

  for (let index = 0; index < count; index += 1) {
    const t = index / (count - 1);
    const x = LEFT + step * index;
    const crest = Math.sin(t * Math.PI * 1.02 + clockSeconds * 0.24 + rowIndex * 0.12) * (138 - rowIndex * 6);
    const undulation = Math.cos(t * Math.PI * 2.8 - clockSeconds * 0.18 + rowIndex * 0.2) * (18 + rowIndex * 1.3);
    const wave = Math.sin((t * 10.5) + clockSeconds * ripple + rowIndex * 0.35) * (8 + rowIndex * 0.55);
    const valley = Math.pow(Math.abs(t - 0.5), 1.15) * 84;
    const y = CENTER_Y + rowOffset - crest - undulation + wave + valley * 0.15 + Math.sin(t * 4.5 + rowIndex) * 4;
    points.push({ x, y });
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
};

const buildHelixPath = (clockSeconds: number, phaseOffset: number): string => {
  const points: Point[] = [];
  const count = POINT_COUNT;
  const heightSpan = BOTTOM - TOP;

  for (let index = 0; index < count; index += 1) {
    const t = index / (count - 1);
    const y = TOP + heightSpan * t;
    const wobble = Math.sin(t * Math.PI * 16 + clockSeconds * 1.1 + phaseOffset) * (18 - Math.abs(t - 0.5) * 14);
    const squeeze = 1 - Math.pow(Math.abs(t - 0.5), 1.7) * 0.42;
    const x = CENTER_X + wobble * squeeze;
    points.push({ x, y });
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
};

const buildCoilRings = (clockSeconds: number, phaseOffset: number) => {
  const rings: { cx: number; cy: number; rx: number; ry: number; opacity: number }[] = [];
  const count = 18;

  for (let index = 0; index < count; index += 1) {
    const t = index / (count - 1);
    const y = TOP + (BOTTOM - TOP) * t;
    const radiusX = 25 + Math.sin(clockSeconds * 0.6 + index * 0.18 + phaseOffset) * 5;
    const radiusY = 12 + Math.cos(clockSeconds * 0.42 + index * 0.12 + phaseOffset) * 2;
    const opacity = clamp(0.2 + Math.sin(t * Math.PI) * 0.55, 0.18, 0.84);

    rings.push({
      cx: CENTER_X + Math.sin(clockSeconds * 0.8 + t * 8 + phaseOffset) * 2.5,
      cy: y,
      rx: radiusX,
      ry: radiusY,
      opacity,
    });
  }

  return rings;
};

const buildNoisePoints = (clockSeconds: number) => {
  const points: { x: number; y: number; size: number; opacity: number }[] = [];

  for (let index = 0; index < 28; index += 1) {
    const t = index / 28;
    const x = LEFT + (RIGHT - LEFT) * ((index * 37) % 28) / 28;
    const yBase = TOP + (BOTTOM - TOP) * ((index * 11) % 28) / 28;
    const y = yBase + Math.sin(clockSeconds * 0.38 + index * 0.7) * 12;
    points.push({
      x,
      y,
      size: 1.1 + (index % 5) * 0.6,
      opacity: clamp(0.08 + Math.cos(clockSeconds * 0.2 + t * 4) * 0.15 + (index % 3) * 0.03, 0.08, 0.38),
    });
  }

  return points;
};

function WireframeTerrain({ clockSeconds }: { clockSeconds: number }) {
  const paths = Array.from({ length: 12 }, (_, rowIndex) => buildTerrainPath(clockSeconds, rowIndex));

  return (
    <g aria-hidden="true">
      <g opacity="0.95">
        {paths.map((path, index) => (
          <path
            key={`terrain-row-${index}`}
            d={path}
            fill="none"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth={index < 2 ? 1.1 : 0.72}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>

      <g opacity="0.45">
        {Array.from({ length: 28 }, (_, index) => {
          const t = index / 27;
          const x = LEFT + (RIGHT - LEFT) * t;
          const yTop = TOP + Math.sin(t * Math.PI * 2 + clockSeconds * 0.2) * 3;
          const yBottom = BOTTOM + Math.cos(t * Math.PI * 2 + clockSeconds * 0.14) * 5;
          return (
            <line
              key={`terrain-column-${index}`}
              x1={x}
              y1={yTop}
              x2={x}
              y2={yBottom}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="0.6"
            />
          );
        })}
      </g>
    </g>
  );
}

export function HelixCorePanel({ seed = 'video-exact-hud', className }: HelixCorePanelProps) {
  const telemetry = useSyntheticTelemetry(seed);
  const { clockSeconds } = telemetry;
  const helixPrimary = buildHelixPath(clockSeconds, 0);
  const helixSecondary = buildHelixPath(clockSeconds, Math.PI / 1.8);
  const coilRings = buildCoilRings(clockSeconds, 0.4);
  const noisePoints = buildNoisePoints(clockSeconds);

  return (
    <HudPanel
      title="HELIX CORE ENGINE"
      meta="DNA / ATTRACTOR"
      compact
      className={className}
      bodyClassName="video-exact-helix-panel"
    >
      <div
        style={{
          position: 'relative',
          minHeight: 0,
          aspectRatio: '1.85 / 1',
          overflow: 'hidden',
        }}
      >
        <svg
          aria-label="Helix core engine visualization"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          <defs>
            <radialGradient id="video-exact-helix-glow" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="42%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <linearGradient id="video-exact-helix-core" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.96)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.88)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.72)" />
            </linearGradient>
            <filter id="video-exact-helix-soft-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="video-exact-helix-clip">
              <rect x={LEFT - 10} y={TOP - 16} width={RIGHT - LEFT + 20} height={BOTTOM - TOP + 32} rx="10" />
            </clipPath>
          </defs>

          <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="rgba(255, 255, 255, 0.012)" />
          <circle cx={CENTER_X} cy={CENTER_Y} r="210" fill="url(#video-exact-helix-glow)" opacity="0.9" />

          <g clipPath="url(#video-exact-helix-clip)">
            <WireframeTerrain clockSeconds={clockSeconds} />

            <g opacity="0.7">
              {noisePoints.map((point, index) => (
                <circle
                  key={`noise-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={point.size}
                  fill="rgba(255, 255, 255, 0.8)"
                  opacity={point.opacity}
                />
              ))}
            </g>

            <g opacity="0.82">
              {coilRings.map((ring, index) => (
                <ellipse
                  key={`coil-ring-${index}`}
                  cx={ring.cx}
                  cy={ring.cy}
                  rx={ring.rx}
                  ry={ring.ry}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.72)"
                  strokeWidth="1.18"
                  opacity={ring.opacity}
                />
              ))}
            </g>

            <g filter="url(#video-exact-helix-soft-glow)">
              <path
                d={helixSecondary}
                fill="none"
                stroke="rgba(255, 255, 255, 0.28)"
                strokeWidth="5.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.45"
              />
              <path
                d={helixPrimary}
                fill="none"
                stroke="url(#video-exact-helix-core)"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            <path
              d={helixPrimary}
              fill="none"
              stroke="rgba(255, 255, 255, 0.94)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <g opacity="0.24">
              {Array.from({ length: 13 }, (_, index) => {
                const y = TOP + ((BOTTOM - TOP) / 12) * index;
                return (
                  <line
                    key={`scan-${index}`}
                    x1={LEFT}
                    x2={RIGHT}
                    y1={y}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="0.8"
                  />
                );
              })}
            </g>
          </g>

          <g opacity="0.38">
            {Array.from({ length: 8 }, (_, index) => {
              const x = LEFT + ((RIGHT - LEFT) / 7) * index;
              return (
                <line
                  key={`edge-grid-${index}`}
                  x1={x}
                  x2={x}
                  y1={TOP}
                  y2={BOTTOM}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="0.65"
                />
              );
            })}
          </g>

          <rect
            x={LEFT - 6}
            y={TOP - 8}
            width={RIGHT - LEFT + 12}
            height={BOTTOM - TOP + 16}
            fill="none"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </HudPanel>
  );
}
