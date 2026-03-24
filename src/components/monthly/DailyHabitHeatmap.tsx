import { getMonthDates } from '../../utils/dates';

export const DailyHabitHeatmap = ({ habits, completions, currentDate }) => {
  const monthDates = getMonthDates(currentDate.year, currentDate.month);
  const activeHabits = habits.filter(h => h.isActive);

  // Calculate completion percentage for each day
  const totalActiveHabits = Math.max(activeHabits.length, 1);
  const dailyPercentages = monthDates.map(date => {
    const dayCompletions = completions[date] || [];
    const completed = dayCompletions.filter(id => activeHabits.find(h => h.id === id)).length;
    return (completed / totalActiveHabits) * 100;
  });

  // GitHub-style color scale: terminal green gradient based on percentage
  const getHeatmapColor = (percentage: number) => {
    if (percentage === 0) return '#1a1a1a'; // darkest (no activity)
    if (percentage <= 10) return '#0d3d0d';
    if (percentage <= 20) return '#1a5c1a';
    if (percentage <= 30) return '#228c22';
    if (percentage <= 40) return '#2eaa2e';
    if (percentage <= 50) return '#3fc83f';
    if (percentage <= 60) return '#4dd64d';
    if (percentage <= 70) return '#5be45b';
    if (percentage <= 80) return '#72f272';
    if (percentage <= 90) return '#39FF14';
    return '#39FF14'; // 100% (brightest terminal green)
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
                  const percentage = dailyPercentages[dayIndex_];
                  const completionCount = Math.round((percentage / 100) * totalActiveHabits);
                  const color = getHeatmapColor(percentage);
                  const dayNum = new Date(date).getDate();

                  return (
                    <div
                      key={date}
                      className="w-5 h-5 rounded-sm border border-neutral-700 hover:border-neutral-400 cursor-pointer transition-all hover:shadow-lg"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 ${percentage > 0 ? 6 : 0}px rgba(57, 255, 20, 0.3)`
                      }}
                      title={`${monthNames[currentDate.month]} ${dayNum}: ${completionCount}/${totalActiveHabits} habits (${Math.round(percentage)}%)`}
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
        <span className="text-xs" style={{ color: '#39FF14' }}>0%</span>
        <div className="flex gap-1">
          {[0, 20, 40, 60, 80, 100].map((percentage, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm border border-neutral-700"
              style={{
                backgroundColor: getHeatmapColor(percentage)
              }}
            />
          ))}
        </div>
        <span className="text-xs" style={{ color: '#39FF14' }}>100%</span>
      </div>
    </div>
  );
};
