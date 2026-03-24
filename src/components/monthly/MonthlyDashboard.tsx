import { useState } from 'react';
import { Panel } from '../shared/Panel';
import { SummaryRings } from './SummaryRings';
import { DailyHabitCountChart } from './DailyHabitCountChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { MonthlyHabitGrid } from './MonthlyHabitGrid';
import { ProgressBars } from './ProgressBars';
import { getWeekStart, getWeekDates, getMonthWeeks } from '../../utils/dates';
import { WeeklyGrid } from '../weekly/WeeklyGrid';
import { WeeklyCompletionBars } from '../weekly/WeeklyCompletionBars';

export const MonthlyDashboard = ({ habits, completions, toggleHabitCompletion, currentDate }) => {
  const [selectedWeekStart, setSelectedWeekStart] = useState(getWeekStart(currentDate.today));
  const monthWeeks = getMonthWeeks(currentDate.year, currentDate.month);
  const weekDates = getWeekDates(selectedWeekStart);

  return (
    <div className="space-y-4 p-6">
      {/* Week selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {monthWeeks.map((weekStart, idx) => (
          <button
            key={weekStart}
            onClick={() => setSelectedWeekStart(weekStart)}
            className={`btn ${
              weekStart === selectedWeekStart ? 'btn-primary' : 'btn-secondary'
            } text-xs uppercase`}
          >
            W{idx + 1}
          </button>
        ))}
      </div>

      {/* Header with summary and weekly rings */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <Panel>
            <div className="panel-header">
              <h3 className="panel-header-title">SUMMARY</h3>
            </div>
            <div className="panel-content">
              <SummaryRings habits={habits} completions={completions} currentDate={currentDate} />
            </div>
          </Panel>
        </div>
        <div className="col-span-2">
          <Panel>
            <div className="panel-header">
              <h3 className="panel-header-title">WEEKLY COMPLETION</h3>
            </div>
            <div className="panel-content">
              <WeeklyCompletionBars habits={habits} completions={completions} weekDates={weekDates} />
            </div>
          </Panel>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        <Panel>
          <div className="panel-header">
            <h3 className="panel-header-title">DAILY HABIT COUNT</h3>
          </div>
          <div className="panel-content">
            <DailyHabitCountChart habits={habits} completions={completions} currentDate={currentDate} />
          </div>
        </Panel>
        <Panel>
          <div className="panel-header">
            <h3 className="panel-header-title">HABIT COUNT BY CATEGORY</h3>
          </div>
          <div className="panel-content">
            <CategoryBreakdown habits={habits} completions={completions} currentDate={currentDate} />
          </div>
        </Panel>
      </div>

      {/* Weekly grid and progress */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Panel>
            <div className="panel-header">
              <h3 className="panel-header-title">WEEKLY CHECKLIST</h3>
            </div>
            <div className="panel-content">
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
          <Panel>
            <div className="panel-header">
              <h3 className="panel-header-title">PROGRESS</h3>
            </div>
            <div className="panel-content">
              <ProgressBars habits={habits} completions={completions} currentDate={currentDate} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};
