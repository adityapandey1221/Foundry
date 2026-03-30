import { memo, useMemo } from 'react';
import { Panel } from '../shared/Panel';
import { SummaryRings } from './SummaryRings';
import { DailyHabitHeatmap } from './DailyHabitHeatmap';
import { WeeklyTasksList } from './WeeklyTasksList';
import { ProgressBars } from './ProgressBars';
import { TodayEvents } from './TodayEvents';
import { BodyHologram } from '../weekly/BodyHologram';
import { BrainHologram } from '../weekly/BrainHologram';
import { getWeekStart, getWeekDates } from '../../utils/dates';
import { MonthlyCompletionLineGraph } from './MonthlyCompletionLineGraph';
import { MonthlyGrid } from './MonthlyGrid';

const MonthlyDashboardComponent = ({ habits, completions, toggleHabitCompletion, updateHabit, removeHabit, currentDate, theme = 'matrix' }) => {
  const selectedWeekStart = getWeekStart(currentDate.today);
  const weekDates = getWeekDates(selectedWeekStart);

  const accentColor = theme === 'jarvis' ? '#00FFFF' : '#39FF14';

  return (
    <div className="space-y-0.5 p-1.5">
{/* Header with summary, body hologram, brain, and today events - 4 column */}
      <div className="grid grid-cols-4 gap-0.5 jarvis-panel-grid">
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">SUMMARY</h3>
          </div>
          <div className="p-1">
            <SummaryRings habits={habits} completions={completions} weekDates={weekDates} theme={theme} />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">BODY</h3>
          </div>
          <div className="p-1">
            <BodyHologram
              habits={habits}
              completions={completions}
              year={currentDate.year}
              month={currentDate.month}
              isStandalone={true}
              theme={theme}
            />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">BRAIN</h3>
          </div>
          <div className="p-1">
            <BrainHologram
              habits={habits}
              completions={completions}
              year={currentDate.year}
              month={currentDate.month}
              isStandalone={true}
              theme={theme}
            />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">TODAY</h3>
          </div>
          <div className="p-1">
            <TodayEvents currentDate={currentDate} theme={theme} />
          </div>
        </Panel>
      </div>

{/* Analytics row - heatmap, tasks, progress */}
      <div className="grid grid-cols-3 gap-0.5 jarvis-panel-grid">
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">DAILY HABIT COUNT</h3>
          </div>
          <div className="p-1">
            <DailyHabitHeatmap habits={habits} completions={completions} currentDate={currentDate} />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">WEEKLY TASKS</h3>
          </div>
          <div className="p-1">
            <WeeklyTasksList selectedWeekStart={selectedWeekStart} />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">PROGRESS</h3>
          </div>
          <div className="p-1">
            <ProgressBars habits={habits} completions={completions} currentDate={currentDate} />
          </div>
        </Panel>
      </div>

      {/* Monthly checklist with completion graph - full width */}
      <div className="grid grid-cols-1 gap-0.5 jarvis-panel-grid">
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">MONTHLY COMPLETION TREND</h3>
          </div>
          <div className="p-2">
            <MonthlyCompletionLineGraph
              habits={habits}
              completions={completions}
              year={currentDate.year}
              month={currentDate.month}
              accentColor={accentColor}
            />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">MONTHLY CHECKLIST</h3>
          </div>
          <div className="p-0.5">
            <MonthlyGrid
              habits={habits}
              completions={completions}
              toggleHabitCompletion={toggleHabitCompletion}
              updateHabit={updateHabit}
              removeHabit={removeHabit}
              currentDate={currentDate}
              theme={theme}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
};

export const MonthlyDashboard = memo(MonthlyDashboardComponent);
