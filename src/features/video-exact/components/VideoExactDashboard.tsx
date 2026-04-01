import type { CSSProperties, ReactNode } from 'react';
import { useMemo } from 'react';
import { FlowLadderPanel } from './FlowLadderPanel';
import { FrequencySpectrumPanel } from './FrequencySpectrumPanel';
import { HelixCorePanel } from './HelixCorePanel';
import { MarketsPanel } from './MarketsPanel';
import { NumericLatticePanel } from './NumericLatticePanel';
import { RadarSweepPanel } from './RadarSweepPanel';
import { RingGaugesPanel } from './RingGaugesPanel';
import { SignalWaveformPanel } from './SignalWaveformPanel';
import { TelemetryStrip, type TelemetryItem } from './TelemetryStrip';
import { TodayEventsPanel } from './TodayEventsPanel';
import { useHabitHudData } from '../hooks/useHabitHudData';
import { useCurrentDate } from '../../../hooks/useCurrentDate';
import { getWeekStart, getDayName } from '../../../utils/dates';
import { parseLocalDate } from '../../../utils/timezone';

type VideoExactDashboardProps = {
  className?: string;
  style?: CSSProperties;
  banner?: ReactNode;
  telemetryItems?: TelemetryItem[];
  leftRail?: ReactNode;
  centerRail?: ReactNode;
  rightRail?: ReactNode;
  navTabs?: ReactNode;
};

function RailShell({
  title,
  children,
  rows,
}: {
  title: string;
  children: ReactNode;
  rows: string;
}) {
  return (
    <section
      style={{
        display: 'grid',
        gap: '8px',
        gridTemplateRows: rows,
        minHeight: 0,
      }}
    >
      {children}
      <div style={{ display: 'none' }} aria-hidden>
        {title}
      </div>
    </section>
  );
}

export function VideoExactDashboard({
  className,
  style,
  banner,
  telemetryItems,
  leftRail,
  centerRail,
  rightRail,
  navTabs,
}: VideoExactDashboardProps) {
  const habitHudData = useHabitHudData();
  const currentDate = useCurrentDate();
  const weekStart = getWeekStart(currentDate.today);

  // Calculate weekly completion percentage
  const weeklyCompletionPct = useMemo(() => {
    const activeHabits = habitHudData.habits.filter((h) => h.isActive);
    const totalPossible = activeHabits.length || 1;

    if (totalPossible === 0) return 0;

    const weekStartDate = parseLocalDate(weekStart);
    let totalCompleted = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const dayCompletions = habitHudData.completions[dateKey] || [];

      dayCompletions.forEach((habitId) => {
        if (activeHabits.find((h) => h.id === habitId)) {
          totalCompleted++;
        }
      });
    }

    const totalWeekPossible = totalPossible * 7;
    return totalWeekPossible === 0 ? 0 : totalCompleted / totalWeekPossible;
  }, [habitHudData.habits, habitHudData.completions, weekStart]);

  const weeklyChecklistDays = useMemo(() => {
    const days = [];
    const today = currentDate.today;
    const activeHabits = habitHudData.habits.filter((h) => h.isActive);
    const activeCount = activeHabits.length;

    // weekStart is already set to Monday by getWeekStart (ISO string)
    const weekStartDate = parseLocalDate(weekStart);

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = getDayName(dateStr).toUpperCase().substring(0, 3);

      // Calculate completion % from actual completions data
      const dayCompletions = habitHudData.completions[dateStr] || [];
      const completedCount = activeHabits.filter(h => dayCompletions.includes(h.id)).length;
      const completionPct = activeCount > 0 ? Math.round((completedCount / activeCount) * 100) : 0;

      days.push({
        date: dateStr,
        completionPct,
        day: dayLabel,
        isToday: dateStr === today,
      });
    }
    return days;
  }, [habitHudData.habits, habitHudData.completions, weekStart, currentDate.today]);

  const weeklyChecklistRows = useMemo(() => {
    const activeHabits = habitHudData.habits.filter((h) => h.isActive);
    const weekDates = weeklyChecklistDays.map(d => d.date);

    return activeHabits.map((habit) => {
      const completions_map: Record<string, boolean> = {};
      weekDates.forEach((date) => {
        completions_map[date] = (habitHudData.completions[date] ?? []).includes(habit.id);
      });

      return {
        habitId: habit.id,
        name: habit.name,
        category: habit.category,
        completions: completions_map,
      };
    });
  }, [habitHudData.habits, habitHudData.completions, weeklyChecklistDays]);

  return (
    <main
      className={className}
      style={{
        alignItems: 'center',
        background:
          'radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.03), transparent 28%), #020202',
        color: 'rgba(255, 255, 255, 0.88)',
        display: 'flex',
        fontFamily:
          '"IBM Plex Mono", "Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        justifyContent: 'center',
        minHeight: '100vh',
        overflow: 'hidden',
        padding: '8px',
        ...style,
      }}
    >
      <div
        style={{
          aspectRatio: '16 / 9',
          background: '#050505',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.04) inset',
          display: 'grid',
          gridTemplateRows: '36px minmax(0, 1fr)',
          height: 'min(calc(100vh - 16px), calc((100vw - 16px) * 9 / 16))',
          maxWidth: 'calc(100vw - 16px)',
          overflow: 'hidden',
          width: 'min(calc(100vw - 16px), calc((100vh - 16px) * 16 / 9))',
        }}
      >
        {navTabs || <TelemetryStrip banner={banner} items={telemetryItems} />}

        <div
          style={{
            display: 'grid',
            gap: '8px',
            gridTemplateColumns: '24fr 45fr 31fr',
            minHeight: 0,
            padding: '8px',
          }}
        >
          <RailShell title="Left Rail" rows="28fr 38fr 34fr">
            {leftRail ?? (
              <>
                <MarketsPanel />
                <FlowLadderPanel />
                <TodayEventsPanel />
              </>
            )}
          </RailShell>

          <RailShell title="Center Rail" rows="35fr 20fr 45fr">
            {centerRail ?? (
              <>
                <HelixCorePanel weeklyCompletionPct={weeklyCompletionPct} />
                <SignalWaveformPanel weeklySeries={habitHudData.weeklyProgressSeries} />
                <FrequencySpectrumPanel
                  monthlyChecklistDays={weeklyChecklistDays}
                  monthlyChecklistRows={weeklyChecklistRows}
                  weeklyCompletionPct={weeklyCompletionPct}
                  onToggleHabit={(habitId, date) => {
                    habitHudData.toggleHabitCompletion(habitId, date);
                  }}
                />
              </>
            )}
          </RailShell>

          <RailShell title="Right Rail" rows="38fr 31fr 31fr">
            {rightRail ?? (
              <>
                <RadarSweepPanel />
                <NumericLatticePanel
                  heatmapWeeks={habitHudData.heatmapWeeks}
                  todaySummary={habitHudData.todaySummary}
                />
                <RingGaugesPanel weeklyCompletionPct={weeklyCompletionPct} />
              </>
            )}
          </RailShell>
        </div>
      </div>
    </main>
  );
}
