import { useMemo } from 'react';
import { HudPanel } from './HudPanel';
import { useSyntheticTelemetry } from '../hooks/useSyntheticTelemetry';

const GRID_COLUMNS = 15;

export function NumericLatticePanel() {
  const { latticeCells } = useSyntheticTelemetry();

  const activeCount = useMemo(
    () => latticeCells.reduce((sum, cell) => sum + (cell.active ? 1 : 0), 0),
    [latticeCells]
  );

  return (
    <HudPanel
      title="NUMERIC LATTICE"
      meta="GRAPH FIELD"
      action={
        <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '9px', letterSpacing: '0.14em' }}>
          {String(activeCount).padStart(2, '0')} HOT
        </span>
      }
      className="video-exact-fill"
      bodyClassName="video-exact-fill"
      compact
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
          gridAutoRows: '1fr',
          gap: '2px',
          height: '100%',
          minHeight: 0,
        }}
      >
        {latticeCells.map((cell) => (
          <div
            key={cell.id}
            style={{
              alignItems: 'center',
              background: cell.active ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.035)',
              border: `1px solid ${cell.active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.055)'}`,
              boxShadow: cell.active ? '0 0 14px rgba(255,255,255,0.05) inset' : 'none',
              color: cell.active ? 'rgba(255,255,255,0.76)' : 'rgba(255,255,255,0.28)',
              display: 'flex',
              fontSize: '10px',
              fontVariantNumeric: 'tabular-nums',
              justifyContent: 'center',
              lineHeight: 1,
              minHeight: 0,
              opacity: 0.35 + (cell.intensity * 0.65),
            }}
          >
            {cell.active ? cell.digit : ''}
          </div>
        ))}
      </div>
    </HudPanel>
  );
}

