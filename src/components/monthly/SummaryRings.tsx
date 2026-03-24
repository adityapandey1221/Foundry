import { useMemo } from 'react';
import { calculatePercentage } from '../../utils/scoring';
import { CATEGORIES } from '../../utils/constants';

export const SummaryRings = ({ habits, completions, weekDates }) => {
  const rings = useMemo(() => {
    const activeHabits = habits.filter(h => h.isActive);

    // Overall completion
    const totalCompleted = weekDates.reduce((sum, date) => {
      const dayCompletes = completions[date] || [];
      return sum + dayCompletes.filter((id: any) => activeHabits.find((h: any) => h.id === id)).length;
    }, 0);
    const totalPossible = activeHabits.length * weekDates.length;
    const overallPct = calculatePercentage(totalCompleted, totalPossible);

    // Per-category completion
    const categoryData = {};
    Object.values(CATEGORIES).forEach(cat => {
      const catHabits = activeHabits.filter(h => h.category === cat.key);
      if (catHabits.length === 0) return;

      const catCompleted = weekDates.reduce((sum, date) => {
        const dayCompletes = completions[date] || [];
        return sum + dayCompletes.filter((id: any) => catHabits.find((h: any) => h.id === id)).length;
      }, 0);

      const catPossible = catHabits.length * weekDates.length;
      const catPct = calculatePercentage(catCompleted, catPossible);

      categoryData[cat.key] = {
        label: cat.label,
        color: cat.hex,
        percentage: catPct,
        completed: catCompleted,
        total: catPossible,
      };
    });

    // Sort by habit count descending, take top 3
    const topCategories = Object.entries(categoryData)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 3)
      .map(([key, data]) => ({ key, ...data }));

    return {
      overall: { percentage: overallPct, completed: totalCompleted, total: totalPossible },
      categories: topCategories,
    };
  }, [habits, completions, weekDates]);

  const RingCircle = ({ pct, color, r, strokeWidth = 6, label }: any) => {
    const circumference = 2 * Math.PI * r;
    const strokeDasharray = (pct / 100) * circumference;

    return (
      <g>
        {/* Background */}
        <circle cx="60" cy="60" r={r} fill="none" stroke="#22AA44" strokeWidth={strokeWidth} opacity="0.2" />
        {/* Progress */}
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${strokeDasharray} ${circumference}`}
          transform="rotate(-90 60 60)"
          style={{
            transition: 'stroke-dasharray 0.4s ease-out',
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative w-40 h-40 mb-4">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          {/* Ring 1: Overall (outermost, r=54) */}
          <RingCircle pct={rings.overall.percentage} color="#39FF14" r={54} strokeWidth={6} />

          {/* Ring 2: Category 1 (r=42) */}
          {rings.categories[0] && (
            <RingCircle pct={rings.categories[0].percentage} color={rings.categories[0].color} r={42} strokeWidth={5} />
          )}

          {/* Ring 3: Category 2 (r=30) */}
          {rings.categories[1] && (
            <RingCircle pct={rings.categories[1].percentage} color={rings.categories[1].color} r={30} strokeWidth={5} />
          )}

          {/* Ring 4: Category 3 (innermost, r=18) */}
          {rings.categories[2] && (
            <RingCircle pct={rings.categories[2].percentage} color={rings.categories[2].color} r={18} strokeWidth={4} />
          )}

          {/* Center text */}
          <text x="60" y="55" textAnchor="middle" style={{ fontSize: '20px', fontWeight: 'bold', fill: '#39FF14', fontFamily: 'monospace' }}>
            {rings.overall.percentage}%
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#39FF14', boxShadow: '0 0 6px rgba(57, 255, 20, 0.6)' }} />
          <span className="text-xs uppercase" style={{ color: '#39FF14' }}>OVERALL</span>
        </div>
        {rings.categories.map(cat => (
          <div key={cat.key} className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}80` }} />
            <span className="text-xs uppercase" style={{ color: cat.color }}>
              {cat.label} {cat.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
