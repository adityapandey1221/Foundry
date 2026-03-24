import { useMemo, memo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { calculatePercentage, calculateWeekSummary } from '../../utils/scoring';
import { CATEGORIES } from '../../utils/constants';
import { getWeekDates } from '../../utils/dates';

interface CategoryRadarProps {
  habits: any[];
  completions: any;
  currentDate: any;
  weekDates: string[];
}

const CategoryRadarComponent = ({
  habits,
  completions,
  currentDate,
  weekDates,
}: CategoryRadarProps) => {
  const data = useMemo(() => {
    const activeHabits = habits.filter(h => h.isActive);

    // Current week data
    const weekData = Object.values(CATEGORIES).map(cat => {
      const catHabits = activeHabits.filter(h => h.category === cat.key);
      if (catHabits.length === 0) return null;

      const catCompleted = weekDates.reduce((sum, date) => {
        const dayCompletes = completions[date] || [];
        return sum + dayCompletes.filter((id: any) => catHabits.find((h: any) => h.id === id)).length;
      }, 0);

      const catPossible = catHabits.length * weekDates.length;
      const catPct = calculatePercentage(catCompleted, catPossible);

      return {
        category: cat.label,
        'This Week': catPct,
        color: cat.hex,
      };
    }).filter(Boolean);

    // Previous week data for comparison
    const prevWeekStart = new Date(weekDates[0] + 'T00:00:00');
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekStartStr = `${prevWeekStart.getFullYear()}-${String(prevWeekStart.getMonth() + 1).padStart(2, '0')}-${String(prevWeekStart.getDate()).padStart(2, '0')}`;
    const prevWeekDates = getWeekDates(prevWeekStartStr);

    weekData.forEach(item => {
      if (!item) return;
      const catKey = Object.entries(CATEGORIES).find(([_, cat]) => cat.label === item.category)?.[0];
      if (!catKey) return;

      const catHabits = activeHabits.filter(h => h.category === catKey);
      const catCompleted = prevWeekDates.reduce((sum, date) => {
        const dayCompletes = completions[date] || [];
        return sum + dayCompletes.filter((id: any) => catHabits.find((h: any) => h.id === id)).length;
      }, 0);

      const catPossible = catHabits.length * prevWeekDates.length;
      const catPct = calculatePercentage(catCompleted, catPossible);

      item['Last Week'] = catPct;
    });

    return weekData.filter(Boolean);
  }, [habits, completions, weekDates]);

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <PolarGrid stroke="rgba(57, 255, 20, 0.15)" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: '#39FF14' }}
        />
        <Radar
          name="This Week"
          dataKey="This Week"
          stroke="#39FF14"
          fill="rgba(57, 255, 20, 0.2)"
          strokeWidth={2}
        />
        <Radar
          name="Last Week"
          dataKey="Last Week"
          stroke="#22AA44"
          fill="rgba(34, 170, 68, 0.1)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export const CategoryRadar = memo(CategoryRadarComponent);
