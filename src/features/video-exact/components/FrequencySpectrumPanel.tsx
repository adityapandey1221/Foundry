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
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          height: '100%',
          minHeight: 0,
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingTop: '8px',
          paddingBottom: '8px',
        }}
      >
        {/* Scrollable grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '200px minmax(0, 1fr)',
            gap: '6px',
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          {/* Left column: habit labels */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {/* Header: "HABIT" */}
            <div
              style={{
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                color: 'rgba(255,255,255,0.64)',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: '500',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              HABIT
            </div>

            {/* Percentage row */}
            <div
              style={{
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '11px',
              }}
            />

            {/* Habit rows */}
            {resolvedRows.map((row) => (
              <div
                key={row.habitId}
                style={{
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.72)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  paddingRight: '8px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {row.name}
              </div>
            ))}
          </div>

          {/* Right column: days grid */}
          <div
            style={{
              display: 'flex',
              gap: '7px',
              overflow: 'auto',
              paddingBottom: '2px',
            }}
          >
            {resolvedDays.map((day) => (
              <div
                key={day.date}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: 'max-content',
                }}
              >
                {/* Day header */}
                <div
                  style={{
                    height: '36px',
                    width: '48px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1px',
                    color: day.isToday ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.64)',
                    fontSize: '10px',
                    borderBottom: day.isToday ? '1px solid rgba(255,255,255,0.24)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600' }}>
                    {day.day}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>
                    {new Date(day.date).getDate()}
                  </div>
                </div>

                {/* Percentage */}
                <div
                  style={{
                    height: '36px',
                    width: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getPercentageColor(day.completionPct),
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    fontWeight: '500',
                  }}
                >
                  {day.completionPct > 0 ? `${day.completionPct}%` : '0%'}
                </div>

                {/* Habit cells */}
                {resolvedRows.map((row) => {
                  const isCompleted = row.completions[day.date] ?? false;

                  return (
                    <button
                      key={`${row.habitId}-${day.date}`}
                      type="button"
                      onClick={() => onToggleHabit?.(row.habitId, day.date)}
                      style={{
                        width: '36px',
                        height: '36px',
                        padding: 0,
                        border: day.isToday
                          ? '1px solid rgba(255,255,255,0.42)'
                          : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '4px',
                        background: isCompleted ? 'rgba(255,255,255,0.12)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        color: isCompleted ? 'rgba(255,255,255,0.72)' : 'transparent',
                        fontWeight: 'bold',
                        transition: 'all 100ms ease-out',
                      }}
                    >
                      {isCompleted ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </HudPanel>
  );
}
