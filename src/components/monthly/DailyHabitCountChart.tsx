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
        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
        <XAxis dataKey="date" stroke="#a3a3a3" style={{ fontSize: '11px', fill: '#a3a3a3' }} />
        <YAxis stroke="#a3a3a3" style={{ fontSize: '11px', fill: '#a3a3a3' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040' }}
          labelStyle={{ color: '#e5e5e5' }}
          itemStyle={{ color: '#e5e5e5' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px', color: '#a3a3a3' }} />
        {Object.keys(categoryHabits).map(category => (
          <Bar key={category} dataKey={category} fill={CATEGORIES[category].hex} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
