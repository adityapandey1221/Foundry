import { getMonthDates } from '../../utils/dates';

export const DailyHabitHeatmap = ({ habits, completions, currentDate }) => {
  const activeHabits = habits.filter(h => h.isActive);
  const totalActiveHabits = Math.max(activeHabits.length, 1);

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

  // Generate weeks for a given month
  const generateMonthWeeks = (year: number, month: number): (string | null)[][] => {
    const monthDates = getMonthDates(year, month);
    const weeks: (string | null)[][] = [];
    let currentWeek: (string | null)[] = [];

    // Start with empty cells for days before the month starts
    const firstDate = new Date(year, month, 1);
    const firstDayOfWeek = firstDate.getDay();

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    monthDates.forEach((date) => {
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

    return weeks;
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-4">
      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        {/* Day labels on the left */}
        <div className="flex flex-col gap-1 justify-start flex-shrink-0">
          {/* Placeholder for month label alignment */}
          <div className="text-xs font-bold h-5" />
          {dayLabels.map(day => (
            <div key={day} className="text-xs h-5 w-6 flex items-center justify-center" style={{ color: '#39FF14' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Horizontal scrollable heatmap for all 12 months */}
        <div className="flex gap-8 flex-shrink-0">
          {monthNames.map((monthName, monthIndex) => {
            const weeks = generateMonthWeeks(currentDate.year, monthIndex);

            return (
              <div key={monthIndex} className="flex flex-col gap-2">
                {/* Month label */}
                <div className="text-xs font-bold h-5 flex items-center" style={{ color: '#39FF14' }}>
                  {monthName}
                </div>

                {/* Month heatmap */}
                <div className="flex gap-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((date, dayIndex) => {
                        if (!date) {
                          return <div key={dayIndex} className="w-5 h-5" />;
                        }

                        const dayCompletions = completions[date] || [];
                        const completed = dayCompletions.filter(id => activeHabits.find(h => h.id === id)).length;
                        const percentage = (completed / totalActiveHabits) * 100;
                        const completionCount = Math.round((percentage / 100) * totalActiveHabits);
                        const color = getHeatmapColor(percentage);
                        const dayNum = parseInt(date.split('-')[2]);

                        return (
                          <div
                            key={date}
                            className="w-5 h-5 rounded-sm border border-neutral-700 hover:border-neutral-400 cursor-pointer transition-all hover:shadow-lg"
                            style={{
                              backgroundColor: color,
                              boxShadow: `0 0 ${percentage > 0 ? 6 : 0}px rgba(57, 255, 20, 0.3)`
                            }}
                            title={`${monthName} ${dayNum}: ${completionCount}/${totalActiveHabits} habits (${Math.round(percentage)}%)`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-4 border-t border-neutral-800">
        <span className="text-xs" style={{ color: '#39FF14' }}>0%</span>
        <div className="flex gap-1">
          {[0, 20, 40, 60, 80, 100].map((percentage, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded border border-neutral-700"
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
