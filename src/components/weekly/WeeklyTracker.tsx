import { useState } from 'react';
import { Panel } from '../shared/Panel';
import { WeeklyGrid } from './WeeklyGrid';
import { WeeklyCompletionBars } from './WeeklyCompletionBars';
import { WeeklyStats } from './WeeklyStats';
import { getWeekStart, getWeekDates, getYearWeeks, getISOWeekNumber } from '../../utils/dates';

export const WeeklyTracker = ({ habits, completions, toggleHabitCompletion, currentDate }) => {
  const [selectedWeekStart, setSelectedWeekStart] = useState(getWeekStart(currentDate.today));

  const yearWeeks = getYearWeeks(currentDate.year);
  const weekDates = getWeekDates(selectedWeekStart);

  // Get the Monday of the current week for comparison
  const currentWeekStart = getWeekStart(currentDate.today);

  return (
    <div className="space-y-4 p-6">
      {/* Week selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {yearWeeks.map((weekStart) => {
          const weekNumber = getISOWeekNumber(weekStart);
          const isFuture = weekStart > currentWeekStart;
          const isSelected = weekStart === selectedWeekStart;

          return (
            <button
              key={weekStart}
              onClick={() => !isFuture && setSelectedWeekStart(weekStart)}
              disabled={isFuture}
              className={`px-4 py-2 font-display text-h2 uppercase transition flex-shrink-0 ${
                isSelected
                  ? 'bg-accent-3 text-bg-void'
                  : isFuture
                  ? 'bg-surface border border-border-subtle text-text-muted opacity-40 cursor-not-allowed'
                  : 'bg-surface border border-border-subtle text-text-muted hover:text-text-secondary'
              }`}
              style={{ borderRadius: '2px' }}
            >
              W{weekNumber}
            </button>
          );
        })}
      </div>

      {/* Weekly grid */}
      <Panel title="DAILY CHECKLIST">
        <WeeklyGrid
          habits={habits}
          completions={completions}
          weekDates={weekDates}
          toggleHabitCompletion={toggleHabitCompletion}
          currentDate={currentDate}
        />
      </Panel>

      {/* Completion bars and stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Panel title="COMPLETION %" >
            <WeeklyCompletionBars habits={habits} completions={completions} weekDates={weekDates} />
          </Panel>
        </div>
        <div className="col-span-1">
          <Panel title="WEEKLY STATS">
            <WeeklyStats habits={habits} completions={completions} weekDates={weekDates} />
          </Panel>
        </div>
      </div>
    </div>
  );
};
