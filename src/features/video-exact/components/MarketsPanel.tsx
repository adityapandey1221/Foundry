import { useMemo } from 'react';
import { HudPanel } from './HudPanel';
import { useWeeklyPlan } from '../../../hooks/useWeeklyPlan';
import { useCurrentDate } from '../../../hooks/useCurrentDate';
import { getWeekStart, getDayName } from '../../../utils/dates';
import { useRafClock, clamp } from '../utils/motion';
import { seededNoise, hashCombine } from '../utils/seededRandom';

type SparklineProps = {
  points: number[];
};

function Sparkline({ points }: SparklineProps) {
  if (points.length === 0) {
    return null;
  }

  const width = 64;
  const height = 18;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const path = points
    .map((point, index) => {
      const x = index * step;
      const y = height - Math.max(1, Math.min(height - 1, point * height));
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      width={64}
      height={18}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        d={path}
        fill="none"
        stroke="rgba(255, 255, 255, 0.86)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface TaskRow {
  dayLabel: string;
  dayNum: number;
  taskTitle: string;
  isCompleted: boolean;
  rowIndex: number;
  dayIndex: number;
  taskId: string;
}

const makeTrend = (seed: string | number, clockSeconds: number, count = 28): number[] => {
  return Array.from({ length: count }, (_, index) => {
    const noiseA = seededNoise(hashCombine(seed, 'trend-a'), index * 0.31, clockSeconds * 0.08);
    const noiseB = seededNoise(hashCombine(seed, 'trend-b'), index * 0.12, clockSeconds * 0.19);
    const waveform = Math.sin((index * 0.42) + clockSeconds * 0.9) * 0.12;
    return clamp((noiseA * 0.55) + (noiseB * 0.25) + 0.15 + waveform, 0.08, 0.98);
  });
};

export function MarketsPanel() {
  const currentDate = useCurrentDate();
  const weekStart = getWeekStart(currentDate.today);
  const { weekPlan, toggleDayTask } = useWeeklyPlan(weekStart);
  const clock = useRafClock({ fps: 24 });
  const clockSeconds = clock.elapsedMs / 1000;

  const { taskRows, taskStats } = useMemo(() => {
    if (!weekPlan) return { taskRows: [], taskStats: { completed: 0, total: 0 } };

    const rows: TaskRow[] = [];
    let totalCompleted = 0;
    let totalTasks = 0;
    let rowIndex = 0;

    weekPlan.days.forEach((day, dayIndex) => {
      const dayLabel = getDayName(day.date).toUpperCase();
      const dayNum = new Date(`${day.date}T00:00:00`).getDate();

      day.tasks.forEach((task) => {
        totalTasks += 1;
        if (task.completed) totalCompleted += 1;

        rows.push({
          dayLabel,
          dayNum,
          taskTitle: task.title,
          isCompleted: task.completed,
          rowIndex: rowIndex++,
          dayIndex,
          taskId: task.id,
        });
      });
    });

    return {
      taskRows: rows,
      taskStats: { completed: totalCompleted, total: totalTasks },
    };
  }, [weekPlan]);

  if (!weekPlan || taskRows.length === 0) {
    return (
      <HudPanel title="WEEKLY" meta="TASKS" compact>
        <div style={{ color: 'rgba(255,255,255,0.34)', fontSize: '8px' }}>No tasks scheduled</div>
      </HudPanel>
    );
  }

  return (
    <HudPanel
      title="WEEKLY"
      meta="TASKS"
      action={
        <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '9px', letterSpacing: '0.14em' }}>
          {taskStats.completed}/{taskStats.total} TASKS COMPLETED
        </span>
      }
      compact
    >
      <div style={{ minWidth: 0 }}>
        <table
          aria-label="Weekly tasks table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <tbody>
            {taskRows.map((row, index) => {
              const isFirstOfDay = index === 0 || taskRows[index - 1].dayLabel !== row.dayLabel;

              return (
                <tr
                  key={`${row.dayLabel}-${row.dayNum}-${row.taskTitle}`}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {isFirstOfDay && (
                    <td
                      rowSpan={taskRows.filter(
                        (r) =>
                          r.dayLabel === row.dayLabel &&
                          r.dayNum === row.dayNum
                      ).length}
                      style={{
                        padding: '6px 8px 6px 0',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'top',
                        fontWeight: '500',
                      }}
                    >
                      {row.dayLabel} {row.dayNum}
                    </td>
                  )}

                  <td
                    style={{
                      padding: '4px 8px',
                      color: row.isCompleted
                        ? 'rgba(255, 255, 255, 0.5)'
                        : 'rgba(255, 255, 255, 0.72)',
                      fontSize: '10px',
                      textDecoration: row.isCompleted ? 'line-through' : 'none',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleDayTask(row.dayIndex, row.taskId)}
                    >
                      <input
                        type="checkbox"
                        checked={row.isCompleted}
                        readOnly
                        style={{
                          width: '12px',
                          height: '12px',
                          cursor: 'pointer',
                          accentColor: 'rgba(255, 255, 255, 0.6)',
                        }}
                      />
                      <span>{row.taskTitle}</span>
                    </label>
                  </td>

                  <td
                    style={{
                      padding: '4px 0 4px 6px',
                      textAlign: 'right',
                      width: '74px',
                      verticalAlign: 'middle',
                    }}
                  >
                    {!row.isCompleted && <Sparkline points={makeTrend(hashCombine('weekly-tasks', row.rowIndex), clockSeconds)} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </HudPanel>
  );
}
