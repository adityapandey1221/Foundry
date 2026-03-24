import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { BodyHologram } from '../weekly/BodyHologram';
import { getWeekDates } from '../../utils/dates';

interface CurrentWeekHologramProps {
  habits: any[];
  completions: Record<string, string[]>;
  selectedWeekStart: string;
}

/**
 * Calculate completion percentage for a specific week
 */
function calculateWeekCompletion(
  habits: any[],
  completions: Record<string, string[]>,
  weekStart: string
): number {
  const activeHabits = habits.filter(h => h.isActive);
  const totalPossible = activeHabits.length || 1;
  const weekDates = getWeekDates(weekStart);

  let totalCompleted = 0;
  weekDates.forEach(date => {
    const dayCompletions = completions[date] || [];
    dayCompletions.forEach(habitId => {
      if (activeHabits.find(h => h.id === habitId)) {
        totalCompleted++;
      }
    });
  });

  const totalWeekPossible = totalPossible * 7;
  return totalWeekPossible === 0 ? 0 : Math.round((totalCompleted / totalWeekPossible) * 100);
}

export const CurrentWeekHologram: React.FC<CurrentWeekHologramProps> = ({
  habits,
  completions,
  selectedWeekStart,
}) => {
  const completionPercent = calculateWeekCompletion(habits, completions, selectedWeekStart);

  return (
    <div style={{ width: '100%', height: '480px', background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, -0.3, 5.2], fov: 26 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', width: '100%', height: '88%' }}
      >
        <Suspense fallback={null}>
          <BodyHologram
            completionPercent={completionPercent}
            position={[0, 0, 0]}
            isCurrentWeek={true}
            index={0}
          />

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

      {/* Label below hologram */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'Courier New, monospace',
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#39FF14',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginTop: '4px',
        }}
      >
        {completionPercent}%
      </div>
    </div>
  );
};
