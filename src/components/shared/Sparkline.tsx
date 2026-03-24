import React, { memo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDot?: boolean;
}

const SparklineComponent: React.FC<SparklineProps> = ({
  data,
  width = 60,
  height = 20,
  color = '#39FF14',
  showDot = true,
}) => {
  if (!data || data.length === 0) {
    return <svg width={width} height={height} />;
  }

  // Normalize data to fit within height
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);

  // Calculate points
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1 || 1)) * width;
    const normalized = (val - min) / range;
    const y = height - normalized * height;
    return { x, y, val };
  });

  // Build path
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillPath = `${pathData} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'inline-block' }}
    >
      {/* Fill */}
      <path
        d={fillPath}
        fill={color}
        opacity="0.15"
      />

      {/* Line */}
      <polyline
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dot on last point */}
      {showDot && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="2"
          fill={color}
          opacity="0.8"
        />
      )}
    </svg>
  );
};

export const Sparkline = memo(SparklineComponent);
