import { HudPanel } from './HudPanel';
import { useSyntheticTelemetry } from '../hooks/useSyntheticTelemetry';
import type { MarketRow } from '../utils/panelData';

type SparklineProps = {
  points: number[];
};

function Sparkline({ points }: SparklineProps) {
  if (points.length === 0) {
    return null;
  }

  const width = 64;
  const height = 18;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const path = points
    .map((point, index) => {
      const x = index * step;
      const y = height - Math.max(1, Math.min(height - 1, point * height));
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      width={64}
      height={18}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        d={path}
        fill="none"
        stroke="rgba(255, 255, 255, 0.86)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

function MarketRowView({ row }: { row: MarketRow }) {
  return (
    <tr
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <td
        style={{
          padding: '4px 8px 4px 0',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '10px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {row.symbol}
      </td>
      <td
        style={{
          padding: '4px 6px',
          color: 'rgba(255, 255, 255, 0.64)',
          fontSize: '10px',
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
      >
        {formatPct(row.yes)}
      </td>
      <td
        style={{
          padding: '4px 6px',
          color: 'rgba(255, 255, 255, 0.64)',
          fontSize: '10px',
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
      >
        {formatPct(row.no)}
      </td>
      <td
        style={{
          padding: '4px 6px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '10px',
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
      >
        {row.volume}
      </td>
      <td
        style={{
          padding: '4px 0 4px 6px',
          textAlign: 'right',
          width: '74px',
        }}
      >
        <Sparkline points={row.trend} />
      </td>
    </tr>
  );
}

export function MarketsPanel() {
  const telemetry = useSyntheticTelemetry('video-exact-markets');
  const rows = telemetry.markets.slice(0, 6);

  return (
    <HudPanel title="MARKETS" meta="LIVE BASKET" compact>
      <div style={{ minWidth: 0 }}>
        <table
          aria-label="Markets table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr>
              <th
                scope="col"
                style={{
                  padding: '0 8px 6px 0',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '9px',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textAlign: 'left',
                  textTransform: 'uppercase',
                }}
              >
                Market
              </th>
              <th
                scope="col"
                style={{
                  padding: '0 6px 6px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '9px',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textAlign: 'right',
                  textTransform: 'uppercase',
                }}
              >
                Yes
              </th>
              <th
                scope="col"
                style={{
                  padding: '0 6px 6px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '9px',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textAlign: 'right',
                  textTransform: 'uppercase',
                }}
              >
                No
              </th>
              <th
                scope="col"
                style={{
                  padding: '0 6px 6px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '9px',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textAlign: 'right',
                  textTransform: 'uppercase',
                }}
              >
                Vol
              </th>
              <th
                scope="col"
                style={{
                  padding: '0 0 6px 6px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '9px',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textAlign: 'right',
                  textTransform: 'uppercase',
                }}
              >
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <MarketRowView key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </HudPanel>
  );
}
