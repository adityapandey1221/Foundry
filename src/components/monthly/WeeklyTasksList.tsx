import { useWeeklyPlan } from '../../hooks/useWeeklyPlan';
import { getWeekDates } from '../../utils/dates';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeeklyTasksList = ({ selectedWeekStart }) => {
  const { weekPlan, toggleDayTask } = useWeeklyPlan(selectedWeekStart);
  const weekDates = getWeekDates(selectedWeekStart);

  if (!weekPlan) return <div>Loading...</div>;

  // Count total tasks and completed
  let totalTasks = 0;
  let completedTasks = 0;
  weekPlan.days.forEach(day => {
    day.tasks.forEach(task => {
      totalTasks += 1;
      if (task.completed) completedTasks += 1;
    });
  });

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="text-sm" style={{ color: '#39FF14' }}>
        {completedTasks}/{totalTasks} tasks completed
      </div>

      {/* Tasks by day */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {weekPlan.days.map((day, dayIndex) => {
          if (day.tasks.length === 0) return null;

          const dayDate = new Date(day.date);
          const dayNum = dayDate.getDate();
          const dayLabel = DAY_LABELS[dayDate.getDay()];

          return (
            <div key={day.date} className="space-y-2">
              <div className="text-xs uppercase font-bold" style={{ color: '#39FF14' }}>
                {dayLabel} {dayNum}
              </div>
              <div className="space-y-1 pl-3 border-l" style={{ borderColor: '#22AA44' }}>
                {day.tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 text-xs cursor-pointer hover:opacity-80 transition"
                    onClick={() => toggleDayTask(dayIndex, task.id)}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="w-3 h-3 rounded"
                      style={{
                        backgroundColor: task.completed ? '#39FF14' : 'transparent',
                        borderColor: '#39FF14',
                        cursor: 'pointer',
                      }}
                    />
                    <span
                      style={{
                        color: task.completed ? '#22AA44' : '#39FF14',
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {weekPlan.days.every(d => d.tasks.length === 0) && (
          <div className="text-xs" style={{ color: '#22AA44' }}>
            No tasks for this week. Add some in the Weekly Planner!
          </div>
        )}
      </div>
    </div>
  );
};
