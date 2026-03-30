import { useMemo } from 'react';
import { formatLocalDate } from '../../utils/timezone';

interface AlertsPanelProps {
  habits: any[];
  completions: any;
  currentDate: any;
  theme: 'matrix' | 'jarvis';
}

interface HabitStatus {
  habit: any;
  status: 'nominal' | 'at-risk' | 'offline';
  streak: number;
}

export const AlertsPanel = ({
  habits,
  completions,
  currentDate,
  theme,
}: AlertsPanelProps) => {
  const accentColor = theme === 'jarvis' ? '#00FFFF' : '#39FF14';
  const warningColor = '#FFD700';
  const criticalColor = '#FF4444';

  const habitStatuses = useMemo(() => {
    const today = currentDate.today;
    const yesterday = new Date(today + 'T00:00:00');
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const statuses: HabitStatus[] = habits
      .filter(h => h.isActive)
      .map(habit => {
        const completedToday = (completions[today] || []).includes(habit.id);
        const completedYesterday = (completions[yesterdayStr] || []).includes(habit.id);

        // Calculate streak for this habit
        let streak = 0;
        const todayDate = new Date(today + 'T00:00:00');
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(todayDate);
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
          if ((completions[dateStr] || []).includes(habit.id)) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }

        let status: 'nominal' | 'at-risk' | 'offline';
        if (completedToday) {
          status = 'nominal';
        } else if (completedYesterday) {
          status = 'at-risk';
        } else {
          status = 'offline';
        }

        return { habit, status, streak };
      });

    return statuses;
  }, [habits, completions, currentDate]);

  const nominal = habitStatuses.filter(h => h.status === 'nominal');
  const atRisk = habitStatuses.filter(h => h.status === 'at-risk');
  const offline = habitStatuses.filter(h => h.status === 'offline');

  const allNominal = atRisk.length === 0 && offline.length === 0;

  const StatusRow = ({
    habit,
    status,
    streak,
    color,
    icon,
  }: {
    habit: any;
    status: string;
    streak: number;
    color: string;
    icon: string;
  }) => (
    <div
      className="alert-row flex items-center justify-between py-1 px-2"
      style={{ borderLeft: `3px solid ${color}80` }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color, fontSize: '12px' }}>{icon}</span>
        <span className="text-xs font-mono" style={{ color }}>
          {habit.name}
        </span>
      </div>
      <span className="text-xs font-mono" style={{ color: '#666' }}>
        {streak}d
      </span>
    </div>
  );

  const StatusSection = ({
    title,
    habits: sectionHabits,
    color,
    icon,
  }: {
    title: string;
    habits: HabitStatus[];
    color: string;
    icon: string;
  }) => {
    if (sectionHabits.length === 0) return null;
    return (
      <div className="mb-3 last:mb-0">
        <div
          className="text-xs uppercase tracking-widest font-bold mb-1"
          style={{ color, textShadow: `0 0 6px ${color}40` }}
        >
          {icon} {title} ({sectionHabits.length})
        </div>
        <div className="space-y-0.5">
          {sectionHabits.map(({ habit, streak }) => (
            <StatusRow
              key={habit.id}
              habit={habit}
              status={title}
              streak={streak}
              color={color}
              icon={icon}
            />
          ))}
        </div>
      </div>
    );
  };

  if (allNominal) {
    return (
      <div className="flex items-center justify-center py-4">
        <div
          className="text-sm uppercase tracking-widest font-bold"
          style={{
            color: accentColor,
            textShadow: `0 0 12px ${accentColor}60`,
          }}
        >
          ● ALL SYSTEMS NOMINAL
        </div>
      </div>
    );
  }

  return (
    <div>
      <StatusSection
        title="NOMINAL"
        habits={nominal}
        color={accentColor}
        icon="●"
      />
      <StatusSection title="AT RISK" habits={atRisk} color={warningColor} icon="⚠" />
      <StatusSection
        title="OFFLINE"
        habits={offline}
        color={criticalColor}
        icon="✗"
      />
    </div>
  );
};
