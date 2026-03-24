import { useState, memo } from 'react';
import { Panel } from '../shared/Panel';
import { SummaryRings } from './SummaryRings';
import { DailyHabitHeatmap } from './DailyHabitHeatmap';
import { WeeklyTasksList } from './WeeklyTasksList';
import { MonthlyHabitGrid } from './MonthlyHabitGrid';
import { ProgressBars } from './ProgressBars';
import { BodyHologram } from '../weekly/BodyHologram';
import { BrainHologram } from '../weekly/BrainHologram';
import { getWeekStart, getWeekDates, getMonthWeeks } from '../../utils/dates';
import { WeeklyGrid } from '../weekly/WeeklyGrid';

const MonthlyDashboardComponent = ({ habits, completions, toggleHabitCompletion, currentDate }) => {
  const [selectedWeekStart, setSelectedWeekStart] = useState(getWeekStart(currentDate.today));
  const monthWeeks = getMonthWeeks(currentDate.year, currentDate.month);
  const weekDates = getWeekDates(selectedWeekStart);

  return (
    <div className="space-y-1.5 p-3">
{/* Header with summary, holograms, and weekly completion */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="col-span-1">
          <Panel compact>
            <div className="panel-header">
              <h3 className="panel-header-title">SUMMARY</h3>
            </div>
            <div className="p-2">
              <SummaryRings habits={habits} completions={completions} weekDates={weekDates} />
            </div>
          </Panel>
        </div>
        <div className="col-span-2">
          <Panel compact>
            <div className="panel-header">
              <h3 className="panel-header-title">WEEK</h3>
            </div>
            <div style={{ padding: '6px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <BodyHologram
                habits={habits}
                completions={completions}
                selectedWeekStart={selectedWeekStart}
                isStandalone={true}
              />
              <BrainHologram
                habits={habits}
                completions={completions}
                selectedWeekStart={selectedWeekStart}
                isStandalone={true}
              />
            </div>
          </Panel>
        </div>
      </div>

{/* Charts row */}
      <div className="grid grid-cols-3 gap-1.5">
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
            <h3 className="panel-header-title">RADAR</h3>
          </div>
          <div className="p-2">
            <div style={{ fontSize: '11px', color: '#22AA44' }}>Coming soon</div>
          </div>
        </Panel>
      </div>

      {/* Weekly grid and progress */}
      <div className="grid grid-cols-3 gap-1.5">
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
