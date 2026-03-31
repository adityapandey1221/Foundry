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
          gap: '4px',
          height: '100%',
          minHeight: 0,
        }}
      >
        {/* Scrollable grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px minmax(0, 1fr)',
            gap: '4px',
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          {/* Left column: habit labels */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {/* Header: "HABIT" */}
            <div
              style={{
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                color: 'rgba(255,255,255,0.64)',
                fontSize: '7px',
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
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '7px',
              }}
            />

            {/* Habit rows */}
            {resolvedRows.map((row) => (
              <div
                key={row.habitId}
                style={{
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '7px',
                  color: 'rgba(255,255,255,0.72)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  paddingRight: '4px',
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
              gap: '2px',
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
                  gap: '4px',
                  minWidth: 'max-content',
                }}
              >
                {/* Day header */}
                <div
                  style={{
                    height: '20px',
                    width: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: day.isToday ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.64)',
                    fontSize: '6.5px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: '500',
                    borderBottom: day.isToday ? '1px solid rgba(255,255,255,0.24)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {day.day}
                </div>

                {/* Percentage */}
                <div
                  style={{
                    height: '20px',
                    width: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.42)',
                    fontSize: '6px',
                    letterSpacing: '0.08em',
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
                        width: '16px',
                        height: '16px',
                        padding: 0,
                        border: day.isToday
                          ? '1px solid rgba(255,255,255,0.42)'
                          : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '1px',
                        background: isCompleted ? 'rgba(255,255,255,0.12)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
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
