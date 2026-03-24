import { useMemo } from 'react';
// @ts-ignore - Using git package source directly
import ActivityRings from '@jonasdoesthings/react-activity-rings/src/components/ActivityRings';
import { calculatePercentage } from '../../utils/scoring';
import { CATEGORIES } from '../../utils/constants';

type CategoryData = {
  label: string;
  color: string;
  value: number;
  completed: number;
  total: number;
};

type ActivityRing = {
  filledPercentage: number;
  color: string;
  ringWidth?: number;
};

type ActivityRingContainerOptions = {
  containerHeight?: string;
  containerWidth?: string;
  initialRadius?: number;
  paddingBetweenRings?: number;
  animationDurationMillis?: number;
  backgroundOpacity?: number;
};

export const SummaryRings = ({ habits, completions, weekDates, theme = 'matrix' }) => {
  const data = useMemo(() => {
    const activeHabits = habits.filter(h => h.isActive);

    // Overall completion
    const totalCompleted = weekDates.reduce((sum, date) => {
      const dayCompletes = completions[date] || [];
      return sum + dayCompletes.filter((id: any) => activeHabits.find((h: any) => h.id === id)).length;
    }, 0);
    const totalPossible = activeHabits.length * weekDates.length;
    const overallValue = calculatePercentage(totalCompleted, totalPossible) / 100;

    // Per-category completion
    const categoryData: Record<string, CategoryData> = {};
    Object.values(CATEGORIES).forEach(cat => {
      const catHabits = activeHabits.filter(h => h.category === cat.key);
      if (catHabits.length === 0) return;

      const catCompleted = weekDates.reduce((sum, date) => {
        const dayCompletes = completions[date] || [];
        return sum + dayCompletes.filter((id: any) => catHabits.find((h: any) => h.id === id)).length;
      }, 0);

      const catPossible = catHabits.length * weekDates.length;
      const catValue = calculatePercentage(catCompleted, catPossible) / 100;

      categoryData[cat.key] = {
        label: cat.label,
        color: cat.hex,
        value: catValue,
        completed: catCompleted,
        total: catPossible,
      };
    });

    // Sort by habit count descending, take top 2 for concentric rings
    const topCategories = Object.entries(categoryData)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 2)
      .map(([key, data]) => ({ key, ...data }));

    // Build activity rings: overall + top 2 categories
    // Colors match the cyberpunk terminal theme (or white for JARVIS)
    const overallColor = theme === 'jarvis' ? '#FFFFFF' : '#39FF14';
    const ringColors = [overallColor, '#5B8FF9', '#E866A0']; // Overall, Sleep Blue, Productivity Pink
    const rings: ActivityRing[] = [
      { filledPercentage: overallValue, color: ringColors[0], ringWidth: 12 },
      ...topCategories.slice(0, 2).map((cat, idx) => ({
        filledPercentage: cat.value,
        color: ringColors[idx + 1],
        ringWidth: 12,
      })),
    ];

    return {
      rings,
      overallValue,
      overallPct: Math.round(overallValue * 100),
      topCategories,
    };
  }, [habits, completions, weekDates]);

  const options: ActivityRingContainerOptions = {
    containerHeight: '240px',
    containerWidth: '240px',
    initialRadius: 30,
    paddingBetweenRings: 0,
    animationDurationMillis: 1000,
    backgroundOpacity: 0.3,
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '240px', height: '240px' }}>
        <ActivityRings rings={data.rings} options={options} />
      </div>

      <div className="text-center">
        <div
          className="text-3xl font-bold"
          style={{ color: '#39FF14', fontFamily: 'monospace' }}
        >
          {data.overallPct}%
        </div>
        <div
          className="text-xs uppercase tracking-wider mt-1"
          style={{ color: '#22AA44' }}
        >
          Completion
        </div>
      </div>

      {/* Legend for top categories */}
      <div className="flex flex-col gap-1 text-center">
        {data.topCategories.map(cat => (
          <div key={cat.key} className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}80` }}
            />
            <span className="text-xs uppercase" style={{ color: cat.color }}>
              {cat.label} {Math.round(cat.value * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
