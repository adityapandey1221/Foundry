import { HudPanel } from './HudPanel';
import { useSyntheticTelemetry } from '../hooks/useSyntheticTelemetry';

const VIEWBOX_SIZE = 240;
const CENTER = VIEWBOX_SIZE / 2;
const RADIUS = 94;

const polarToCartesian = (radius: number, angle: number) => {
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
};

const toDegrees = (angle: number): number => (angle * 180) / Math.PI;

function buildSectorPath(angle: number, spread: number) {
  const start = angle - spread;
  const end = angle + spread;
  const startPoint = polarToCartesian(RADIUS, start);
  const endPoint = polarToCartesian(RADIUS, end);
  const largeArcFlag = spread * 2 > Math.PI ? 1 : 0;

  return [
    `M ${CENTER} ${CENTER}`,
    `L ${startPoint.x.toFixed(2)} ${startPoint.y.toFixed(2)}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${endPoint.x.toFixed(2)} ${endPoint.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

export type RadarSweepPanelProps = {
  seed?: string;
  className?: string;
};

export function RadarSweepPanel({ seed = 'video-exact-hud', className }: RadarSweepPanelProps) {
  const telemetry = useSyntheticTelemetry(seed);
  const { sweepAngle, targets } = telemetry.radar;

  const sweepSpread = 0.44;
  const sweepPoint = polarToCartesian(RADIUS - 2, sweepAngle - Math.PI / 2);

  return (
    <HudPanel
      title="RADAR SWEEP"
      meta="RINGS + AZIMUTH"
      compact
      className={className}
      bodyClassName="video-exact-radar"
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 0,
          minWidth: 0,
          transform: 'translateY(-15px)',
        }}
      >
        <svg
          aria-label="Radar sweep visualization"
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
              <stop offset="48%" stopColor="rgba(255, 255, 255, 0.04)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </radialGradient>
            <linearGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
              <stop offset="55%" stopColor="rgba(255, 255, 255, 0.16)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.72)" />
            </linearGradient>
            <clipPath id="radarClip">
              <circle cx={CENTER} cy={CENTER} r={RADIUS} />
            </clipPath>
          </defs>

          <g clipPath="url(#radarClip)">
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="url(#radarGlow)" />

            {[0.28, 0.48, 0.68, 0.88, 1].map((ring) => (
              <circle
                key={ring}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS * ring}
                fill="none"
                stroke="rgba(255, 255, 255, 0.16)"
                strokeWidth="0.9"
              />
            ))}

            <circle cx={CENTER} cy={CENTER} r="4.4" fill="rgba(255, 255, 255, 0.84)" />
            <circle cx={CENTER} cy={CENTER} r="10" fill="none" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.8" />
            <circle cx={CENTER} cy={CENTER} r="24" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.8" />

            <g stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1">
              {Array.from({ length: 32 }, (_, index) => {
                const angle = (Math.PI * 2 * index) / 32 - Math.PI / 2;
                const inner = polarToCartesian(RADIUS - (index % 4 === 0 ? 10 : 4), angle);
                const outer = polarToCartesian(RADIUS + 3, angle);
                return <line key={index} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} />;
              })}
            </g>

            <g
              transform={`rotate(${toDegrees(sweepAngle)} ${CENTER} ${CENTER})`}
            >
              <path d={buildSectorPath(-Math.PI / 2, sweepSpread)} fill="url(#radarSweep)" opacity="0.95" />
              <line
                x1={CENTER}
                y1={CENTER}
                x2={sweepPoint.x}
                y2={sweepPoint.y}
                stroke="rgba(255, 255, 255, 0.92)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>

            {targets.map((target) => {
              const angle = target.angle - Math.PI / 2;
              const point = polarToCartesian(RADIUS * target.radius, angle);
              const pulse = 0.18 + target.intensity * 0.62;
              return (
                <g key={target.id} opacity={0.98}>
                  <circle cx={point.x} cy={point.y} r={target.size * 0.9} fill="rgba(255, 255, 255, 0.82)" />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={target.size * 2.4}
                    fill="none"
                    stroke={`rgba(255, 255, 255, ${pulse * 0.28})`}
                    strokeWidth="0.8"
                  />
                </g>
              );
            })}
          </g>

          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          <circle cx={CENTER} cy={CENTER} r={RADIUS + 6} fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
        </svg>
      </div>
    </HudPanel>
  );
}
