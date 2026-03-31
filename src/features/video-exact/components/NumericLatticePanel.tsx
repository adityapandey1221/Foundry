import { useMemo } from 'react';
import { formatDate } from '../../../utils/dates';
import { HudPanel } from './HudPanel';
import { useHabitHudData } from '../hooks/useHabitHudData';
import type { HabitHudHeatmapWeek, HabitHudSummary } from '../utils/habitHudData';

export type NumericLatticePanelProps = {
  heatmapWeeks?: HabitHudHeatmapWeek[];
  todaySummary?: HabitHudSummary;
  className?: string;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HEATMAP_COLORS = [
  'rgba(255, 255, 255, 0.03)', // 0% - very dark
  'rgba(255, 255, 255, 0.12)', // 1-24% - light
  'rgba(255, 255, 255, 0.24)', // 25-49% - medium
  'rgba(255, 255, 255, 0.45)', // 50-74% - bright
  'rgba(255, 255, 255, 0.78)', // 75-100% - very bright
];

/**
 * Format a date as month abbreviation (Jan, Feb, etc.)
 */
const getMonthLabel = (dateStr: string): string => {
  return formatDate(dateStr, 'short').split(' ')[0]; // Extract month from "Jan 23"
};

const buildLegend = () => [
  { label: '0%', color: HEATMAP_COLORS[0] },
  { label: '', color: HEATMAP_COLORS[1] },
  { label: '', color: HEATMAP_COLORS[2] },
  { label: '', color: HEATMAP_COLORS[3] },
  { label: '100%', color: HEATMAP_COLORS[4] },
];

export function NumericLatticePanel({
  heatmapWeeks,
  todaySummary,
  className,
}: NumericLatticePanelProps) {
  const fallback = useHabitHudData();
  const resolvedWeeks = heatmapWeeks?.length ? heatmapWeeks : fallback.heatmapWeeks;
  const resolvedSummary = todaySummary ?? fallback.todaySummary;
  const legend = useMemo(() => buildLegend(), []);

  // Group weeks by month
  const monthGroups = useMemo(() => {
    const groups: Map<string, typeof resolvedWeeks> = new Map();
    resolvedWeeks.forEach((week) => {
      const month = getMonthLabel(week.weekStart);
      if (!groups.has(month)) {
        groups.set(month, []);
      }
      groups.get(month)!.push(week);
    });
    return Array.from(groups.entries());
  }, [resolvedWeeks]);

  return (
    <HudPanel
      title="DAILY HABIT COUNT"
      meta="HABIT HEATMAP"
      className={className}
      bodyClassName="video-exact-fill"
      compact
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          height: '100%',
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '32px minmax(0, 1fr)',
            gap: '6px',
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          {/* Day labels */}
          <div
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(7, 14px)',
              gap: '2px',
              color: 'rgba(255, 255, 255, 0.34)',
              fontSize: '7px',
              letterSpacing: '0.12em',
              fontWeight: '500',
              textAlign: 'right',
              paddingRight: '4px',
              paddingTop: '15px',
              textTransform: 'uppercase',
            }}
          >
            {DAY_LABELS.map((label) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {label[0]}
              </div>
            ))}
          </div>

          {/* Heatmap by month */}
          <div style={{ display: 'flex', gap: '12px', minHeight: 0, overflow: 'auto', paddingBottom: '2px' }}>
            {monthGroups.map(([month, weeksInMonth]) => (
              <div key={month}>
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.64)',
                    fontSize: '6.5px',
                    fontWeight: '500',
                    marginBottom: '3px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    height: '12px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {month}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${weeksInMonth.length}, 14px)`,
                    gridTemplateRows: 'repeat(7, 14px)',
                    gap: '2px',
                  }}
                >
                  {weeksInMonth.map((week, weekIdx) =>
                    week.days.map((cell) => {
                      const band = Math.max(0, Math.min(4, cell.intensityBand));
                      const color = HEATMAP_COLORS[band];
                      const gridColumn = weekIdx + 1; // 1-indexed
                      const gridRow = cell.weekdayIndex + 1; // 1-indexed (0=Sun → row 1)

                      return (
                        <button
                          key={cell.date}
                          type="button"
                          aria-label={`${cell.date}, ${cell.completionPct}% complete`}
                          title={`${cell.date} ${cell.completedCount}/${cell.activeCount} habits`}
                          style={{
                            width: '14px',
                            height: '14px',
                            padding: 0,
                            border: cell.isToday ? '1px solid rgba(255, 255, 255, 0.42)' : '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '0px',
                            background: color,
                            cursor: 'pointer',
                            boxShadow:
                              cell.completionPct > 0
                                ? `inset 0 0 4px rgba(255, 255, 255, ${0.04 + band * 0.04})`
                                : 'none',
                            transition: 'all 150ms ease-out',
                            gridColumn,
                            gridRow,
                          }}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'rgba(255, 255, 255, 0.34)',
            fontSize: '7px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <span>Low</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {legend.map((entry, idx) => (
              <button
                key={idx}
                type="button"
                style={{
                  width: '6px',
                  height: '6px',
                  padding: 0,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0px',
                  background: entry.color,
                  cursor: 'default',
                }}
              />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>
    </HudPanel>
  );
}
