import { useState, memo, useMemo } from 'react';
import { Panel } from '../shared/Panel';
import { SummaryRings } from './SummaryRings';
import { DailyHabitHeatmap } from './DailyHabitHeatmap';
import { WeeklyTasksList } from './WeeklyTasksList';
import { ProgressBars } from './ProgressBars';
import { TodayEvents } from './TodayEvents';
import { BodyHologram } from '../weekly/BodyHologram';
import { BrainHologram } from '../weekly/BrainHologram';
import { getWeekStart, getWeekDates } from '../../utils/dates';
import { WeeklyGrid } from '../weekly/WeeklyGrid';

const MonthlyDashboardComponent = ({ habits, completions, toggleHabitCompletion, updateHabit, removeHabit, currentDate, theme = 'matrix' }) => {
  const [selectedWeekStart, setSelectedWeekStart] = useState(getWeekStart(currentDate.today));
  const weekDates = getWeekDates(selectedWeekStart);

  const accentColor = theme === 'jarvis' ? '#00FFFF' : '#39FF14';

  // Calculate per-day completion percentages
  const dailyPercentages = useMemo(() => {
    const activeHabits = habits.filter(h => h.isActive);
    if (activeHabits.length === 0) return [];

    return weekDates.map(date => {
      const dayCompletions = completions[date] || [];
      const completed = activeHabits.filter(h => dayCompletions.includes(h.id)).length;
      const percentage = Math.round((completed / activeHabits.length) * 100);
      return { date, percentage };
    });
  }, [habits, completions, weekDates]);

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return accentColor;
    if (percentage >= 50) return '#FFD700';
    return '#FF4444';
  };

  return (
    <div className="space-y-1 p-2">
{/* Header with summary, body hologram, brain, and today events - 4 column */}
      <div className="grid grid-cols-4 gap-1 jarvis-panel-grid">
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">SUMMARY</h3>
          </div>
          <div className="p-1.5">
            <SummaryRings habits={habits} completions={completions} weekDates={weekDates} theme={theme} />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">BODY</h3>
          </div>
          <div className="p-1.5">
            <BodyHologram
              habits={habits}
              completions={completions}
              selectedWeekStart={selectedWeekStart}
              isStandalone={true}
              theme={theme}
            />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">BRAIN</h3>
          </div>
          <div className="p-1.5">
            <BrainHologram
              habits={habits}
              completions={completions}
              selectedWeekStart={selectedWeekStart}
              isStandalone={true}
              theme={theme}
            />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">TODAY</h3>
          </div>
          <div className="p-1.5">
            <TodayEvents currentDate={currentDate} theme={theme} />
          </div>
        </Panel>
      </div>

{/* Analytics row - heatmap, tasks, progress */}
      <div className="grid grid-cols-3 gap-1 jarvis-panel-grid">
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">DAILY HABIT COUNT</h3>
          </div>
          <div className="p-1.5">
            <DailyHabitHeatmap habits={habits} completions={completions} currentDate={currentDate} />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">WEEKLY TASKS</h3>
          </div>
          <div className="p-1.5">
            <WeeklyTasksList selectedWeekStart={selectedWeekStart} />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">PROGRESS</h3>
          </div>
          <div className="p-1.5">
            <ProgressBars habits={habits} completions={completions} currentDate={currentDate} />
          </div>
        </Panel>
      </div>

      {/* Weekly checklist - full width */}
      <div className="grid grid-cols-1 gap-1 jarvis-panel-grid">
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">WEEKLY CHECKLIST</h3>
          </div>
          <div className="p-1.5">
            <WeeklyGrid
              habits={habits}
              completions={completions}
              weekDates={weekDates}
              toggleHabitCompletion={toggleHabitCompletion}
              updateHabit={updateHabit}
              removeHabit={removeHabit}
              currentDate={currentDate}
              theme={theme}
              dailyPercentages={dailyPercentages}
              getPercentageColor={getPercentageColor}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
};

export const MonthlyDashboard = memo(MonthlyDashboardComponent);
