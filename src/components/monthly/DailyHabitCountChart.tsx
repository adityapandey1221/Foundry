import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getMonthDates } from '../../utils/dates';
import { CATEGORIES } from '../../utils/constants';

export const DailyHabitCountChart = ({ habits, completions, currentDate }) => {
  const monthDates = getMonthDates(currentDate.year, currentDate.month);
  const activeHabits = habits.filter(h => h.isActive);

  // Group habits by category
  const categoryHabits = {};
  activeHabits.forEach(habit => {
    if (!categoryHabits[habit.category]) {
      categoryHabits[habit.category] = [];
    }
    categoryHabits[habit.category].push(habit);
  });

  // Build chart data
  const data = monthDates.map(date => {
    const item = { date: new Date(date).getDate() };
    const dayCompletions = completions[date] || [];

    Object.keys(categoryHabits).forEach(category => {
      const completed = categoryHabits[category].filter(h => dayCompletions.includes(h.id)).length;
      item[category] = completed;
    });

    return item;
  });

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#22AA44" opacity="0.2" />
        <XAxis dataKey="date" stroke="#39FF14" style={{ fontSize: '11px', fill: '#39FF14' }} />
        <YAxis stroke="#39FF14" style={{ fontSize: '11px', fill: '#39FF14' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#000000', border: '1px solid #39FF14', boxShadow: '0 0 8px rgba(57, 255, 20, 0.3)' }}
          labelStyle={{ color: '#39FF14' }}
          itemStyle={{ color: '#39FF14' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px', color: '#39FF14' }} />
        {Object.keys(categoryHabits).map(category => (
          <Bar key={category} dataKey={category} fill={CATEGORIES[category].hex} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
