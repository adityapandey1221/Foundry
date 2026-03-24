import { useState } from 'react';
import { Panel } from '../shared/Panel';
import { WeeklyGrid } from './WeeklyGrid';
import { WeeklyCompletionBars } from './WeeklyCompletionBars';
import { WeeklyStats } from './WeeklyStats';
import { getWeekStart, getWeekDates, getMonthWeeks } from '../../utils/dates';

export const WeeklyTracker = ({ habits, completions, toggleHabitCompletion, currentDate }) => {
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
            className={`px-4 py-2 font-display text-h2 uppercase transition ${
              weekStart === selectedWeekStart
                ? 'bg-accent-3 text-bg-void'
                : 'bg-surface border border-border-subtle text-text-muted hover:text-text-secondary'
            }`}
            style={{ borderRadius: '2px' }}
          >
            W{idx + 1}
          </button>
        ))}
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

      {/* Placeholder for body/brain maps (v2) */}
      <div className="grid grid-cols-2 gap-4">
        <Panel title="NEURAL MAP">
          <div className="text-text-muted text-body text-center py-8">
            Body & brain visualizations coming in v2.
          </div>
        </Panel>
        <Panel title="BODY MAP">
          <div className="text-text-muted text-body text-center py-8">
            Body & brain visualizations coming in v2.
          </div>
        </Panel>
      </div>
    </div>
  );
};
