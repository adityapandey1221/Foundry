import { useMemo } from 'react';
import { line as d3Line, curveCatmullRom } from 'd3-shape';
import { HudPanel } from './HudPanel';
import type { HabitHudMonthlyPoint } from '../utils/habitHudData';

export type SignalWaveformPanelProps = {
  series?: HabitHudMonthlyPoint[];
  className?: string;
};

const WIDTH = 1000;
const HEIGHT = 280;
const PADDING_X = 44;
const PADDING_TOP = 28;
const PADDING_BOTTOM = 34;

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const buildFallbackSeries = (): HabitHudMonthlyPoint[] => {
  const daysInMonth = 31;
  const base = [42, 55, 63, 48, 67, 72, 59, 65, 54, 71, 68, 75, 64, 72, 58, 69, 77, 65, 73, 68, 82, 71, 65, 79, 68, 73, 81, 75, 69, 74, 78];

  return Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    date: `fallback-${index}`,
    label: (index + 1).toString(),
    completionPct: base[index],
    completedCount: Math.round((base[index] / 100) * 8),
    activeCount: 8,
  }));
};

type ChartPoint = {
  x: number;
  y: number;
  point: HabitHudMonthlyPoint;
};

const toChartPoints = (series: HabitHudMonthlyPoint[], innerWidth: number, innerHeight: number): ChartPoint[] => {
  const count = Math.max(series.length - 1, 1);

  return series.map((point, index) => {
    const normalized = clamp(point.completionPct) / 100;
    const x = PADDING_X + (innerWidth * (index / count));
    const y = PADDING_TOP + innerHeight - (normalized * innerHeight);
    return { x, y, point };
  });
};

const buildPath = (points: ChartPoint[]): string => {
  if (points.length === 0) return '';

  const path = d3Line<ChartPoint>()
    .x((point) => point.x)
    .y((point) => point.y)
    .curve(curveCatmullRom.alpha(0.7));

  return path(points) ?? '';
};

const buildAreaPath = (points: ChartPoint[], baselineY: number): string => {
  if (points.length === 0) return '';

  const path = `${buildPath(points)} L ${points[points.length - 1].x.toFixed(2)} ${baselineY.toFixed(2)} L ${points[0].x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
  return path;
};

const formatPct = (value: number) => `${Math.round(clamp(value))}%`;

function WaveformChart({
  series,
}: {
  series: HabitHudMonthlyPoint[];
}) {
  const innerWidth = WIDTH - PADDING_X * 2;
  const innerHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const baselineY = HEIGHT - PADDING_BOTTOM;
  const points = toChartPoints(series, innerWidth, innerHeight);
  const path = buildPath(points);
  const area = buildAreaPath(points, baselineY);

  const gridLines = [0, 25, 50, 75, 100].map((value) => {
    const y = PADDING_TOP + innerHeight - ((value / 100) * innerHeight);
    return { value, y };
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      role="img"
      aria-label="Monthly habit progress graph"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="video-exact-waveform-glow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.42)" />
        </linearGradient>
        <linearGradient id="video-exact-waveform-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="transparent" />

      <g opacity="0.22">
        {gridLines.map((line) => (
          <g key={line.value}>
            <line
              x1={PADDING_X}
              y1={line.y}
              x2={WIDTH - PADDING_X}
              y2={line.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={PADDING_X - 8}
              y={line.y + 4}
              fill="rgba(255,255,255,0.34)"
              fontSize="10"
              textAnchor="end"
            >
              {line.value}%
            </text>
          </g>
        ))}
      </g>

      <g opacity="0.15">
        {series.map((point, index) => {
          const x = PADDING_X + (innerWidth * (index / Math.max(series.length - 1, 1)));
          return (
            <line
              key={`${point.day}-tick`}
              x1={x}
              y1={PADDING_TOP}
              x2={x}
              y2={baselineY}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </g>

      {area && <path d={area} fill="url(#video-exact-waveform-fill)" opacity={0.18} />}

      {path && (
        <path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}

      {path && (
        <path
          d={path}
          fill="none"
          stroke="url(#video-exact-waveform-glow)"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}

      {points.map((point) => (
        <g key={point.point.day}>
          <circle
            cx={point.x}
            cy={point.y}
            r={3.2}
            fill="rgba(255,255,255,0.88)"
          />
          <circle
            cx={point.x}
            cy={point.y}
            r={7}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        </g>
      ))}

      <line
        x1={PADDING_X}
        x2={WIDTH - PADDING_X}
        y1={baselineY}
        y2={baselineY}
        stroke="rgba(255,255,255,0.24)"
        strokeWidth={1}
        opacity={0.5}
      />
    </svg>
  );
}

export function SignalWaveformPanel({
  series,
  className,
}: SignalWaveformPanelProps) {
  const fallbackSeries = useMemo(() => buildFallbackSeries(), []);
  const resolvedSeries = series?.length ? series : fallbackSeries;

  const summary = resolvedSeries.reduce(
    (acc, point) => {
      acc.completed += point.completedCount;
      acc.active += point.activeCount;
      return acc;
    },
    { completed: 0, active: 0 }
  );

  const monthlyPct = summary.active > 0 ? Math.round((summary.completed / summary.active) * 100) : 0;

  return (
    <HudPanel title="SIGNAL WAVEFORM" meta="DAILY PROGRESS" compact className={className}>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr) auto',
          gap: '8px',
          height: '100%',
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            color: 'rgba(255,255,255,0.46)',
            fontSize: '9px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          <span>
            {summary.completed}/{summary.active} done
          </span>
          <span>{formatPct(monthlyPct)} month</span>
        </div>

        <div
          style={{
            position: 'relative',
            minHeight: 0,
            border: '1px solid rgba(255,255,255,0.08)',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0)), rgba(255,255,255,0.01)',
            overflow: 'hidden',
          }}
        >
          <WaveformChart series={resolvedSeries} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${resolvedSeries.length}, minmax(0, 1fr))`,
            gap: '4px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '7px',
            letterSpacing: '0.1em',
            textAlign: 'center',
          }}
        >
          {resolvedSeries.map((point, index) => {
            const showLabel = index === 0 || (index + 1) % 5 === 0 || index === resolvedSeries.length - 1;
            return (
              <div
                key={point.day}
                style={{
                  paddingTop: '2px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)',
                  visibility: showLabel ? 'visible' : 'hidden',
                }}
              >
                <div>{point.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </HudPanel>
  );
}
