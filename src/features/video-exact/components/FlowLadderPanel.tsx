import { HudPanel } from './HudPanel';
import { useSyntheticTelemetry } from '../hooks/useSyntheticTelemetry';

export type FlowLadderPanelProps = {
  seed?: string;
  className?: string;
};

function FlowBar({ intensity }: { intensity: number }) {
  const fill = Math.max(0.18, Math.min(1, intensity));
  const highlight = 0.2 + fill * 0.55;
  const secondary = 0.12 + fill * 0.35;

  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        height: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.03)',
        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.45)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '1px auto 1px 1px',
          width: `${Math.max(14, fill * 100)}%`,
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.74) 52%, rgba(255, 255, 255, 0.22))',
          boxShadow: `0 0 10px rgba(255, 255, 255, ${secondary})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '1px auto 1px 1px',
          width: `${Math.max(6, fill * 62)}%`,
          background: 'rgba(255, 255, 255, 0.92)',
          opacity: highlight,
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.045) 0, rgba(255, 255, 255, 0.045) 1px, transparent 1px, transparent 12px)',
          opacity: 0.18,
        }}
      />
    </div>
  );
}

function TrendSparkline({ points }: { points: number[] }) {
  const width = 56;
  const height = 12;
  const step = width / Math.max(points.length - 1, 1);
  const path = points
    .map((point, index) => {
      const x = index * step;
      const y = height - point * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="56" height="12" aria-hidden>
      <path d={path} fill="none" stroke="rgba(255, 255, 255, 0.72)" strokeWidth="1" />
    </svg>
  );
}

export function FlowLadderPanel({ seed = 'video-exact-hud', className }: FlowLadderPanelProps) {
  const telemetry = useSyntheticTelemetry(seed);
  const rows = telemetry.flowRows.slice(0, 10);

  return (
    <HudPanel
      title="FLOW LADDER"
      meta="MICRO DEPTH"
      compact
      className={className}
      bodyClassName="video-exact-flow-ladder"
    >
      <div
        style={{
          display: 'grid',
          gap: '6px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '42px minmax(0, 1fr) 68px',
            gap: '8px',
            alignItems: 'center',
            color: 'rgba(255, 255, 255, 0.42)',
            fontSize: '9px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            marginBottom: '2px',
          }}
        >
          <span>PRICE</span>
          <span style={{ textAlign: 'center' }}>DEPTH</span>
          <span style={{ textAlign: 'right' }}>DENSITY</span>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '4px',
          }}
        >
          {rows.map((row) => {
            const depth = Math.max(0.18, Math.min(1, row.intensity));
            const trend = row.leftValue >= row.rightValue ? 'UP' : 'DN';

            return (
              <div
                key={row.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '42px minmax(0, 1fr) 68px',
                  gap: '8px',
                  alignItems: 'center',
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.88)',
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.price}
                </div>

                <div style={{ minWidth: 0 }}>
                  <FlowBar intensity={depth} />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                    color: 'rgba(255, 255, 255, 0.56)',
                    fontSize: '9px',
                    letterSpacing: '0.1em',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{String(row.leftValue).padStart(3, '0')}</span>
                  <span>
                    {String(row.rightValue).padStart(3, '0')}
                    <span style={{ color: 'rgba(255, 255, 255, 0.28)', marginLeft: '4px' }}>{trend}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '42px minmax(0, 1fr) 68px',
            gap: '8px',
            alignItems: 'center',
            marginTop: '2px',
            color: 'rgba(255, 255, 255, 0.24)',
            fontSize: '8px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ textAlign: 'right' }}>MID</span>
          <TrendSparkline points={telemetry.markets[0]?.trend ?? [0.2, 0.4, 0.3, 0.5, 0.4]} />
          <span style={{ textAlign: 'right' }}>MICRO FLOW</span>
        </div>
      </div>
    </HudPanel>
  );
}
