import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { BodyHologram } from './BodyHologram';
import { getWeekDates } from '../../utils/dates';

interface WeekSummary {
  weekStart: string;
  weekIndex: number;
  overallPercentage: number;
}

interface BodyHologramRowProps {
  weekSummaries: WeekSummary[];
  currentWeekStart: string;
}

/**
 * Calculate week summaries from habits and completions
 * Returns per-week completion percentages
 */
export function calculateWeekSummaries(
  habits: any[],
  completions: Record<string, string[]>,
  weekStarts: string[]
): WeekSummary[] {
  const activeHabits = habits.filter(h => h.isActive);
  const totalPossible = activeHabits.length || 1;

  return weekStarts.map((weekStart, weekIndex) => {
    const weekDates = getWeekDates(weekStart);
    let totalCompleted = 0;

    // Count completed habit instances across all days in the week
    weekDates.forEach(date => {
      const dayCompletions = completions[date] || [];
      dayCompletions.forEach(habitId => {
        if (activeHabits.find(h => h.id === habitId)) {
          totalCompleted++;
        }
      });
    });

    const totalWeekPossible = totalPossible * 7; // 7 days per week
    const overallPercentage =
      totalWeekPossible === 0 ? 0 : Math.round((totalCompleted / totalWeekPossible) * 100);

    return {
      weekStart,
      weekIndex,
      overallPercentage,
    };
  });
}

export const BodyHologramRow: React.FC<BodyHologramRowProps> = ({
  weekSummaries,
  currentWeekStart,
}) => {
  const count = weekSummaries.length;
  const spacing = 1.8; // distance between figures
  const offsetX = -(count - 1) * spacing / 2; // center the row

  return (
    <div style={{ width: '100%', height: '320px', background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 1.0, 4.5], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        {/* Suspense required for useLoader in BodyHologram */}
        <Suspense fallback={null}>
          {/* No lights needed — holographic shader is self-lit */}

          {weekSummaries.map((week, i) => (
            <BodyHologram
              key={week.weekStart}
              completionPercent={week.overallPercentage}
              position={[offsetX + i * spacing, 0, 0]}
              isCurrentWeek={week.weekStart === currentWeekStart}
              index={i}
            />
          ))}

          <EffectComposer>
            <Bloom
              intensity={1.2}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              radius={0.8}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* HTML labels below the canvas */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0',
          alignItems: 'center',
        }}
      >
        {weekSummaries.map((week, i) => {
          const labelColor = week.overallPercentage >= 70 ? '#39FF14' : 'rgba(57,255,20,0.6)';
          return (
            <div key={week.weekStart} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'Courier New, monospace',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: labelColor,
                  marginBottom: '2px',
                }}
              >
                WEEK {i + 1}
              </div>
              <div
                style={{
                  fontFamily: 'Courier New, monospace',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: labelColor,
                  letterSpacing: '0.05em',
                }}
              >
                {Math.round(week.overallPercentage)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
