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

    // Build single activity ring for overall progress
    const overallRingColor = theme === 'jarvis' ? '#00FFFF' : '#39FF14';
    const rings: ActivityRing[] = [
      { filledPercentage: overallValue, color: overallRingColor, ringWidth: 12 },
    ];

    return {
      rings,
      overallValue,
      overallPct: Math.round(overallValue * 100),
      topCategories,
      theme,
    };
  }, [habits, completions, weekDates, theme]);

  const options: ActivityRingContainerOptions = {
    containerHeight: '240px',
    containerWidth: '240px',
    initialRadius: 30,
    paddingBetweenRings: 0,
    animationDurationMillis: 1000,
    backgroundOpacity: 0.3,
  };

  const primaryColor = theme === 'jarvis' ? '#00FFFF' : '#39FF14';
  const glowColor = theme === 'jarvis'
    ? 'rgba(0, 255, 255, 0.6)'
    : 'rgba(57, 255, 20, 0.6)';

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Holographic rings container with glow effect */}
      <div
        className="holographic-rings"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '240px',
          height: '240px',
          position: 'relative',
          // Holographic glow effect
          boxShadow: `
            0 0 20px ${glowColor},
            0 0 40px ${glowColor},
            inset 0 0 20px ${glowColor.replace('0.6', '0.1').replace('0.5', '0.1')}
          `,
          borderRadius: '50%',
          background: theme === 'jarvis'
            ? 'radial-gradient(circle, rgba(0,255,255,0.05) 0%, rgba(0,30,50,0.1) 100%)'
            : 'radial-gradient(circle, rgba(57,255,20,0.03) 0%, rgba(0,0,0,0.1) 100%)',
          // Scanline effect overlay
          backgroundImage: theme === 'jarvis'
            ? 'repeating-linear-gradient(0deg, rgba(0,255,255,0.03) 0px, rgba(0,255,255,0.03) 1px, transparent 1px, transparent 2px)'
            : 'repeating-linear-gradient(0deg, rgba(57,255,20,0.02) 0px, rgba(57,255,20,0.02) 1px, transparent 1px, transparent 2px)',
        }}
      >
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div
            className="text-3xl font-bold"
            style={{
              color: primaryColor,
              fontFamily: 'monospace',
              textShadow: `0 0 12px ${glowColor}`,
            }}
          >
            {data.overallPct}%
          </div>
          <div
            className="text-xs uppercase tracking-wider mt-1"
            style={{
              color: theme === 'jarvis' ? '#0099CC' : '#22AA44',
              textShadow: `0 0 6px ${glowColor.replace('0.6', '0.3').replace('0.5', '0.2')}`,
            }}
          >
            Completion
          </div>
        </div>
        <ActivityRings rings={data.rings} options={options} />
      </div>
    </div>
  );
};
