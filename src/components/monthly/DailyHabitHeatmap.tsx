import { getMonthDates } from '../../utils/dates';

export const DailyHabitHeatmap = ({ habits, completions, currentDate }) => {
  const monthDates = getMonthDates(currentDate.year, currentDate.month);
  const activeHabits = habits.filter(h => h.isActive);

  // Calculate completion count for each day
  const dailyCompletions = monthDates.map(date => {
    const dayCompletions = completions[date] || [];
    return dayCompletions.filter(id => activeHabits.find(h => h.id === id)).length;
  });

  const maxCompletions = Math.max(...dailyCompletions, 1);

  // GitHub-style color scale: terminal green gradient
  const getHeatmapColor = (completionCount: number) => {
    if (completionCount === 0) return '#1a1a1a'; // darkest (no activity)
    const intensity = completionCount / maxCompletions;
    const hues = [
      '#0d3d0d', // 10%
      '#1a5c1a', // 20%
      '#228c22', // 30%
      '#2eaa2e', // 40%
      '#3fc83f', // 50%
      '#4dd64d', // 60%
      '#5be45b', // 70%
      '#72f272', // 80%
      '#39FF14', // 90%
      '#39FF14', // 100% (bright terminal green)
    ];
    const index = Math.floor(intensity * (hues.length - 1));
    return hues[index];
  };

  // Group dates by week for GitHub-style layout
  const weeks: (string | null)[][] = [];
  let currentWeek: (string | null)[] = [];

  // Start with empty cells for days before the month starts
  const firstDate = new Date(currentDate.year, currentDate.month, 1);
  const firstDayOfWeek = firstDate.getDay();

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  monthDates.forEach((date, index) => {
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Add remaining cells
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="p-4">
      <div className="flex items-start gap-6">
        {/* Day labels */}
        <div className="flex flex-col gap-1 justify-start pt-6">
          {dayLabels.map(day => (
            <div key={day} className="text-xs h-5 w-6 flex items-center justify-center" style={{ color: '#39FF14' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <div key={dayIndex} className="w-5 h-5" />;
                  }

                  const dayIndex_ = monthDates.indexOf(date);
                  const completionCount = dailyCompletions[dayIndex_];
                  const color = getHeatmapColor(completionCount);
                  const dayNum = new Date(date).getDate();

                  return (
                    <div
                      key={date}
                      className="w-5 h-5 rounded-sm border border-neutral-700 hover:border-neutral-400 cursor-pointer transition-all hover:shadow-lg"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 ${completionCount > 0 ? 6 : 0}px rgba(57, 255, 20, 0.3)`
                      }}
                      title={`${monthNames[currentDate.month]} ${dayNum}: ${completionCount}/${activeHabits.length} habits`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-neutral-800">
        <span className="text-xs" style={{ color: '#39FF14' }}>Less</span>
        <div className="flex gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm border border-neutral-700"
              style={{
                backgroundColor: getHeatmapColor(intensity * maxCompletions)
              }}
            />
          ))}
        </div>
        <span className="text-xs" style={{ color: '#39FF14' }}>More</span>
      </div>
    </div>
  );
};
