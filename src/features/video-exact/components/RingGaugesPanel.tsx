import { HudPanel } from './HudPanel';
import { useSyntheticTelemetry } from '../hooks/useSyntheticTelemetry';

const describeArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
  const toPoint = (angle: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians),
    };
  };

  const start = toPoint(endAngle);
  const end = toPoint(startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

function Gauge({ label, value }: { label: string; value: number }) {
  const start = -120;
  const end = 120;
  const angle = start + ((end - start) * value) / 100;
  const radians = (angle - 90) * (Math.PI / 180);
  const needleX = 48 + 24 * Math.cos(radians);
  const needleY = 48 + 24 * Math.sin(radians);

  return (
    <div style={{ display: 'grid', gap: '6px', justifyItems: 'center' }}>
      <svg viewBox="0 0 96 64" style={{ width: '100%', maxWidth: '118px', overflow: 'visible' }}>
        <path
          d={describeArc(48, 48, 33, start, end)}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1.5"
        />

        {Array.from({ length: 15 }, (_, index) => {
          const tickAngle = start + ((end - start) * index) / 14;
          const outerRadians = (tickAngle - 90) * (Math.PI / 180);
          const innerRadius = index % 2 === 0 ? 25 : 28;
          const outerRadius = 33;
          const x1 = 48 + innerRadius * Math.cos(outerRadians);
          const y1 = 48 + innerRadius * Math.sin(outerRadians);
          const x2 = 48 + outerRadius * Math.cos(outerRadians);
          const y2 = 48 + outerRadius * Math.sin(outerRadians);

          return (
            <line
              key={tickAngle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />
          );
        })}

        <line
          x1="48"
          y1="48"
          x2={needleX}
          y2={needleY}
          stroke="rgba(255,255,255,0.84)"
          strokeWidth="1.6"
        />
        <circle cx="48" cy="48" r="2.5" fill="rgba(255,255,255,0.82)" />
      </svg>

      <div style={{ display: 'grid', gap: '2px', justifyItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.48)', fontSize: '9px', letterSpacing: '0.18em' }}>{label}</span>
        <span style={{ color: 'rgba(255,255,255,0.84)', fontSize: '10px', letterSpacing: '0.14em' }}>{value}%</span>
      </div>
    </div>
  );
}

export function RingGaugesPanel() {
  const { gauges } = useSyntheticTelemetry();

  return (
    <HudPanel title="RING GAUGES" meta="CPU / NET / IO" className="video-exact-fill" bodyClassName="video-exact-fill" compact>
      <div
        style={{
          display: 'grid',
          gap: '6px',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          height: '100%',
          alignItems: 'end',
        }}
      >
        {gauges.map((gauge) => (
          <Gauge key={gauge.id} label={gauge.label} value={gauge.value} />
        ))}
      </div>
    </HudPanel>
  );
}
