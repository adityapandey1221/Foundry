import { useState, memo } from 'react';
import { Panel } from '../shared/Panel';
import { SummaryRings } from './SummaryRings';
import { DailyHabitHeatmap } from './DailyHabitHeatmap';
import { WeeklyTasksList } from './WeeklyTasksList';
import { MonthlyHabitGrid } from './MonthlyHabitGrid';
import { ProgressBars } from './ProgressBars';
import { TodayEvents } from './TodayEvents';
import { BodyHologram } from '../weekly/BodyHologram';
import { BrainHologram } from '../weekly/BrainHologram';
import { getWeekStart, getWeekDates, getMonthWeeks } from '../../utils/dates';
import { WeeklyGrid } from '../weekly/WeeklyGrid';

const MonthlyDashboardComponent = ({ habits, completions, toggleHabitCompletion, updateHabit, removeHabit, currentDate, theme = 'matrix' }) => {
  const [selectedWeekStart, setSelectedWeekStart] = useState(getWeekStart(currentDate.today));
  const monthWeeks = getMonthWeeks(currentDate.year, currentDate.month);
  const weekDates = getWeekDates(selectedWeekStart);

  return (
    <div className="space-y-1.5 p-3">
{/* Header with summary, body hologram, and today events */}
      <div className="grid grid-cols-3 gap-1.5 jarvis-panel-grid">
        <div className="col-span-1">
          <Panel compact>
            <div className="panel-header">
              <h3 className="panel-header-title">SUMMARY</h3>
            </div>
            <div className="p-2">
              <SummaryRings habits={habits} completions={completions} weekDates={weekDates} theme={theme} />
            </div>
          </Panel>
        </div>
        <div className="col-span-1">
          <Panel compact>
            <div className="panel-header">
              <h3 className="panel-header-title">BODY</h3>
            </div>
            <div className="p-2">
              <BodyHologram
                habits={habits}
                completions={completions}
                selectedWeekStart={selectedWeekStart}
                isStandalone={true}
                theme={theme}
              />
            </div>
          </Panel>
        </div>
        <div className="col-span-1">
          <Panel compact>
            <div className="panel-header">
              <h3 className="panel-header-title">TODAY</h3>
            </div>
            <div className="p-2">
              <TodayEvents currentDate={currentDate} theme={theme} />
            </div>
          </Panel>
        </div>
      </div>

{/* Charts row with heatmap, tasks, and brain */}
      <div className="grid grid-cols-3 gap-1.5 jarvis-panel-grid">
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">DAILY HABIT COUNT</h3>
          </div>
          <div className="p-2">
            <DailyHabitHeatmap habits={habits} completions={completions} currentDate={currentDate} />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">WEEKLY TASKS</h3>
          </div>
          <div className="p-2">
            <WeeklyTasksList selectedWeekStart={selectedWeekStart} />
          </div>
        </Panel>
        <Panel compact>
          <div className="panel-header">
            <h3 className="panel-header-title">BRAIN</h3>
          </div>
          <div className="p-2">
            <BrainHologram
              habits={habits}
              completions={completions}
              selectedWeekStart={selectedWeekStart}
              isStandalone={true}
              theme={theme}
            />
          </div>
        </Panel>
      </div>

      {/* Weekly grid and progress */}
      <div className="grid grid-cols-3 gap-1.5 jarvis-panel-grid">
        <div className="col-span-2">
          <Panel compact>
            <div className="panel-header">
              <h3 className="panel-header-title">WEEKLY CHECKLIST</h3>
            </div>
            <div className="p-2">
              <WeeklyGrid
                habits={habits}
                completions={completions}
                weekDates={weekDates}
                toggleHabitCompletion={toggleHabitCompletion}
                updateHabit={updateHabit}
                removeHabit={removeHabit}
                currentDate={currentDate}
              />
            </div>
          </Panel>
        </div>
        <div className="col-span-1">
          <Panel compact>
            <div className="panel-header">
              <h3 className="panel-header-title">PROGRESS</h3>
            </div>
            <div className="p-2">
              <ProgressBars habits={habits} completions={completions} currentDate={currentDate} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export const MonthlyDashboard = memo(MonthlyDashboardComponent);
