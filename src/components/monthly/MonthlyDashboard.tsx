import { Panel } from '../shared/Panel';
import { SummaryRings } from './SummaryRings';
import { DailyHabitCountChart } from './DailyHabitCountChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { MonthlyHabitGrid } from './MonthlyHabitGrid';
import { ProgressBars } from './ProgressBars';

export const MonthlyDashboard = ({ habits, completions, toggleHabitCompletion, currentDate }) => {
  return (
    <div className="space-y-4 p-6">
      {/* Header with summary and weekly rings */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <Panel title="SUMMARY">
            <SummaryRings habits={habits} completions={completions} currentDate={currentDate} />
          </Panel>
        </div>
        <div className="col-span-2">
          <Panel title="WEEKLY PROGRESS">
            <div className="text-text-muted">Week breakdown coming soon...</div>
          </Panel>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        <Panel title="DAILY HABIT COUNT">
          <DailyHabitCountChart habits={habits} completions={completions} currentDate={currentDate} />
        </Panel>
        <Panel title="HABIT COUNT BY CATEGORY">
          <CategoryBreakdown habits={habits} completions={completions} currentDate={currentDate} />
        </Panel>
      </div>

      {/* Main grid and progress */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Panel title="DAILY HABITS">
            <MonthlyHabitGrid habits={habits} completions={completions} toggleHabitCompletion={toggleHabitCompletion} currentDate={currentDate} />
          </Panel>
        </div>
        <div className="col-span-1">
          <Panel title="PROGRESS">
            <ProgressBars habits={habits} completions={completions} currentDate={currentDate} />
          </Panel>
        </div>
      </div>
    </div>
  );
};
