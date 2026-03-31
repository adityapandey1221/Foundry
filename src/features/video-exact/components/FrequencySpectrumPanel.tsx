import { useMemo } from 'react';
import { HudPanel } from './HudPanel';
import { useHabitHudData } from '../hooks/useHabitHudData';
import type { HabitHudMonthlyChecklistDay, HabitHudMonthlyChecklistRow } from '../utils/habitHudData';

export type FrequencySpectrumPanelProps = {
  monthlyChecklistDays?: HabitHudMonthlyChecklistDay[];
  monthlyChecklistRows?: HabitHudMonthlyChecklistRow[];
  onToggleHabit?: (habitId: string, date: string) => void;
  className?: string;
};

const getPercentageColor = (pct: number): string => {
  if (pct >= 90) return 'rgba(57, 255, 20, 0.9)'; // bright green
  if (pct >= 70) return 'rgba(144, 238, 144, 0.9)'; // light green
  if (pct >= 50) return 'rgba(255, 215, 0, 0.9)'; // gold
  if (pct >= 25) return 'rgba(255, 165, 0, 0.9)'; // orange
  return 'rgba(255, 100, 100, 0.9)'; // red
};

export function FrequencySpectrumPanel({
  monthlyChecklistDays,
  monthlyChecklistRows,
  onToggleHabit,
  className,
}: FrequencySpectrumPanelProps) {
  const fallback = useHabitHudData();
  const resolvedDays = monthlyChecklistDays?.length ? monthlyChecklistDays : fallback.monthlyChecklistDays;
  const resolvedRows = monthlyChecklistRows?.length ? monthlyChecklistRows : fallback.monthlyChecklistRows;

  return (
    <HudPanel
      title="MONTHLY CHECKLIST"
      meta="HABIT COMPLETION"
      className={className}
      bodyClassName="video-exact-fill"
      compact
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '140px repeat(7, 1fr)',
          gridTemplateRows: `auto auto repeat(${resolvedRows.length}, minmax(0, 1fr))`,
          gap: '0 4px',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          padding: '4px 10px',
        }}
      >
        {/* ── Header row ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '9px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: '500',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '4px 0',
          }}
        >
          HABIT
        </div>
        {resolvedDays.map((day) => (
          <div
            key={`hdr-${day.date}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: day.isToday ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)',
              fontSize: '9px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderBottom: day.isToday ? '1px solid rgba(255,255,255,0.24)' : '1px solid rgba(255,255,255,0.06)',
              padding: '4px 0',
            }}
          >
            <span>{day.day}</span>
            <span style={{ opacity: 0.6 }}>{new Date(day.date).getDate()}</span>
          </div>
        ))}

        {/* ── Percentage row ── */}
        <div style={{ padding: '2px 0' }} />
        {resolvedDays.map((day) => (
          <div
            key={`pct-${day.date}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: getPercentageColor(day.completionPct),
              fontSize: '9px',
              letterSpacing: '0.06em',
              fontWeight: '500',
              padding: '2px 0',
            }}
          >
            {day.completionPct}%
          </div>
        ))}

        {/* ── Habit rows (each row stretches to fill 1fr) ── */}
        {resolvedRows.map((row) => (
          <>
            <div
              key={`lbl-${row.habitId}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '9px',
                color: 'rgba(255,255,255,0.68)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                paddingRight: '6px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minHeight: 0,
              }}
            >
              {row.name}
            </div>
            {resolvedDays.map((day) => {
              const isCompleted = row.completions[day.date] ?? false;
              return (
                <button
                  key={`cell-${row.habitId}-${day.date}`}
                  type="button"
                  onClick={() => onToggleHabit?.(row.habitId, day.date)}
                  style={{
                    padding: '2px',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 0,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '28px',
                      aspectRatio: '1',
                      borderRadius: '5px',
                      border: day.isToday
                        ? '1px solid rgba(255,255,255,0.36)'
                        : '1px solid rgba(255,255,255,0.08)',
                      background: isCompleted ? 'rgba(255,255,255,0.13)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: isCompleted ? 'rgba(255,255,255,0.76)' : 'transparent',
                      fontWeight: 'bold',
                      transition: 'all 80ms ease-out',
                    }}
                  >
                    {isCompleted ? '✓' : ''}
                  </div>
                </button>
              );
            })}
          </>
        ))}
      </div>
    </HudPanel>
  );
}
