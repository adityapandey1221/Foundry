import React, { memo, useMemo } from 'react';
import { line as d3Line, curveCatmullRom } from 'd3-shape';
import { getMonthDates } from '../../utils/dates';

interface MonthlyCompletionLineGraphProps {
  habits: any[];
  completions: Record<string, string[]>;
  year: number;
  month: number;
  accentColor?: string;
}

interface Point {
  x: number;
  y: number;
  val: number;
}

const MonthlyCompletionLineGraphComponent: React.FC<MonthlyCompletionLineGraphProps> = ({
  habits,
  completions,
  year,
  month,
  accentColor = '#39FF14',
}) => {
  const monthDates = getMonthDates(year, month);
  const activeHabits = habits.filter(h => h.isActive);

  // Calculate daily completion percentages
  const dailyCompletions = useMemo(() => {
    if (activeHabits.length === 0) return monthDates.map(() => 0);

    return monthDates.map(date => {
      const dayCompletions = completions[date] || [];
      const completed = activeHabits.filter(h => dayCompletions.includes(h.id)).length;
      return Math.round((completed / activeHabits.length) * 100);
    });
  }, [habits, completions, monthDates, activeHabits.length]);

  if (monthDates.length === 0) {
    return <div className="text-text-muted text-xs">No data</div>;
  }

  // SVG dimensions
  const width = 1200;
  const height = 200;
  const padding = 30;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Calculate points
  const points: Point[] = dailyCompletions.map((val, i) => {
    const x = padding + (i / (monthDates.length - 1 || 1)) * graphWidth;
    const y = padding + graphHeight - (val / 100) * graphHeight;
    return { x, y, val };
  });

  // Build smooth curve path using D3
  const pathGenerator = d3Line<Point>()
    .x((p) => p.x)
    .y((p) => p.y)
    .curve(curveCatmullRom.alpha(0.5));

  const smoothPath = pathGenerator(points) || '';

  // Build area fill path
  const areaPath = `${smoothPath} L ${points[points.length - 1].x} ${padding + graphHeight} L ${padding} ${padding + graphHeight} Z`;

  // Grid lines
  const gridLines = [0, 25, 50, 75, 100].map((val) => {
    const y = padding + graphHeight - (val / 100) * graphHeight;
    return { y, val };
  });

  // Calculate gradient color (brighten for glow effect)
  const accentColorRGB = parseInt(accentColor.slice(1), 16);
  const r = (accentColorRGB >> 16) & 255;
  const g = (accentColorRGB >> 8) & 255;
  const b = accentColorRGB & 255;

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-full"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="monthly-fill-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.02" />
            </linearGradient>
            <filter id="monthly-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={padding}
                y1={line.y}
                x2={width - padding}
                y2={line.y}
                stroke={accentColor}
                strokeWidth="0.8"
                opacity="0.12"
              />
              <text
                x={padding - 12}
                y={line.y + 5}
                fontSize="11"
                fill={accentColor}
                opacity="0.45"
                textAnchor="end"
                fontWeight="500"
              >
                {line.val}%
              </text>
            </g>
          ))}

          {/* Fill area with gradient */}
          <path
            d={areaPath}
            fill="url(#monthly-fill-gradient)"
            opacity="1"
          />

          {/* Glow stroke (wider, softer) */}
          <path
            d={smoothPath}
            fill="none"
            stroke={accentColor}
            strokeWidth="4"
            opacity="0.12"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#monthly-glow)"
          />

          {/* Main line */}
          <path
            d={smoothPath}
            fill="none"
            stroke={accentColor}
            strokeWidth="4"
            opacity="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points with halos */}
          {points.map((p, i) => (
            <g key={`point-${i}`}>
              {/* Halo */}
              <circle
                cx={p.x}
                cy={p.y}
                r="6"
                fill="none"
                stroke={accentColor}
                strokeWidth="1"
                opacity="0.15"
              />
              {/* Main point */}
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill={accentColor}
                opacity="0.9"
              />
            </g>
          ))}

          {/* Baseline */}
          <line
            x1={padding}
            x2={width - padding}
            y1={padding + graphHeight}
            y2={padding + graphHeight}
            stroke={accentColor}
            strokeWidth="1"
            opacity="0.25"
          />

          {/* Left axis */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={padding + graphHeight}
            stroke={accentColor}
            strokeWidth="1"
            opacity="0.25"
          />
        </svg>
      </div>
    </div>
  );
};

export const MonthlyCompletionLineGraph = memo(MonthlyCompletionLineGraphComponent);
