import React, { memo, useMemo } from 'react';
import { getMonthDates } from '../../utils/dates';

interface MonthlyCompletionLineGraphProps {
  habits: any[];
  completions: Record<string, string[]>;
  year: number;
  month: number;
  accentColor?: string;
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
  const height = 180;
  const padding = 25;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Calculate points
  const points = dailyCompletions.map((val, i) => {
    const x = padding + (i / (monthDates.length - 1 || 1)) * graphWidth;
    const y = padding + graphHeight - (val / 100) * graphHeight;
    return { x, y, val, i };
  });

  // Build path
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillPath = `${pathData} L ${points[points.length - 1].x} ${padding + graphHeight} L ${padding} ${padding + graphHeight} Z`;

  // Grid lines
  const gridLines = [0, 25, 50, 75, 100].map((val) => {
    const y = padding + graphHeight - (val / 100) * graphHeight;
    return { y, val };
  });

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-full"
        >
          {/* Grid lines */}
          {gridLines.map((line, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={padding}
                y1={line.y}
                x2={width - padding}
                y2={line.y}
                stroke={accentColor}
                strokeWidth="0.5"
                opacity="0.1"
              />
              <text
                x={padding - 8}
                y={line.y + 4}
                fontSize="10"
                fill={accentColor}
                opacity="0.5"
                textAnchor="end"
              >
                {line.val}%
              </text>
            </g>
          ))}

          {/* Fill */}
          <path
            d={fillPath}
            fill={accentColor}
            opacity="0.1"
          />

          {/* Line */}
          <polyline
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={accentColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={`point-${i}`}
              cx={p.x}
              cy={p.y}
              r="3"
              fill={accentColor}
              opacity="0.7"
            />
          ))}

          {/* Axes */}
          <line x1={padding} y1={padding} x2={padding} y2={padding + graphHeight} stroke={accentColor} strokeWidth="1" opacity="0.3" />
          <line x1={padding} y1={padding + graphHeight} x2={width - padding} y2={padding + graphHeight} stroke={accentColor} strokeWidth="1" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
};

export const MonthlyCompletionLineGraph = memo(MonthlyCompletionLineGraphComponent);
