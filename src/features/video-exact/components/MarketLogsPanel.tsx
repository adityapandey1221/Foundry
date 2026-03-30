import { HudPanel } from './HudPanel';
import { useSyntheticTelemetry } from '../hooks/useSyntheticTelemetry';
import type { MarketLogEntry } from '../utils/panelData';

export type MarketLogsPanelProps = {
  seed?: string;
  className?: string;
};

function MarketLogRow({ entry, isLast }: { entry: MarketLogEntry; isLast: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '74px minmax(0, 1fr)',
        gap: '10px',
        alignItems: 'start',
        padding: '5px 0',
        borderBottom: isLast ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        style={{
          color: 'rgba(255, 255, 255, 0.54)',
          fontSize: '9px',
          lineHeight: 1.2,
          letterSpacing: '0.12em',
          textAlign: 'left',
          whiteSpace: 'nowrap',
        }}
      >
        {entry.timestamp}
      </div>

      <div
        style={{
          color: 'rgba(255, 255, 255, 0.82)',
          fontSize: '9px',
          lineHeight: 1.25,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          wordBreak: 'break-word',
        }}
      >
        {entry.text}
      </div>
    </div>
  );
}

export function MarketLogsPanel({ seed = 'video-exact-hud', className }: MarketLogsPanelProps) {
  const telemetry = useSyntheticTelemetry(seed);
  const rows = telemetry.logs.slice(0, 6);

  return (
    <HudPanel
      title="15M MARKET LOGS"
      meta="DAY DIRECTION"
      compact
      muted
      className={className}
      bodyClassName="video-exact-market-logs"
    >
      <div
        aria-label="Market logs"
        style={{
          display: 'grid',
          gap: '2px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '74px minmax(0, 1fr)',
            gap: '10px',
            paddingBottom: '4px',
            color: 'rgba(255, 255, 255, 0.34)',
            fontSize: '8px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          <span>TIME</span>
          <span>FLOW TRACE</span>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '0',
            minWidth: 0,
          }}
        >
          {rows.map((entry, index) => (
            <MarketLogRow key={entry.id} entry={entry} isLast={index === rows.length - 1} />
          ))}
        </div>
      </div>
    </HudPanel>
  );
}
