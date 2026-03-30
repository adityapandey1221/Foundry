import type { CSSProperties, ReactNode } from 'react';

export type TelemetryItem = {
  label: string;
  value: string;
};

export type TelemetryStripProps = {
  banner?: ReactNode;
  items?: TelemetryItem[];
  className?: string;
  style?: CSSProperties;
};

const defaultItems: TelemetryItem[] = [
  { label: 'UTC', value: '13:38:13' },
  { label: 'LATENCY', value: '43MS' },
  { label: 'PACKETS', value: '6197' },
  { label: 'MODE', value: 'ATTRACTOR-FIELD' },
];

export function TelemetryStrip({
  banner = "TERMINAL TURBOQUANT: GOOGLE'S FREE MEMORY KILLER.",
  items = defaultItems,
  className,
  style,
}: TelemetryStripProps) {
  return (
    <header
      className={className}
      style={{
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        color: 'rgba(255, 255, 255, 0.78)',
        display: 'flex',
        gap: '16px',
        justifyContent: 'space-between',
        letterSpacing: '0.12em',
        minHeight: '36px',
        padding: '0 10px',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      <div
        style={{
          flex: '1 1 auto',
          fontSize: '10px',
          lineHeight: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {banner}
      </div>

      <div
        style={{
          display: 'flex',
          flex: '0 0 auto',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: '10px 16px',
        }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              gap: '6px',
              fontSize: '10px',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: 'rgba(255, 255, 255, 0.42)' }}>{item.label}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.88)' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </header>
  );
}
