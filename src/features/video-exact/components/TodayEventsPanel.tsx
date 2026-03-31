import { HudPanel } from './HudPanel';
import { useCurrentDate } from '../../../hooks/useCurrentDate';
import { useWeeklyPlan } from '../../../hooks/useWeeklyPlan';
import { getWeekStart } from '../../../utils/dates';

export const TodayEventsPanel = () => {
  const currentDate = useCurrentDate();
  const today = currentDate?.today || new Date().toISOString().split('T')[0];
  const weekStart = getWeekStart(today);
  const { weekPlan } = useWeeklyPlan(weekStart);

  const todayData = weekPlan?.days.find((day) => day.date === today);
  const events = todayData?.events || [];

  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
  });

  return (
    <HudPanel title="TODAY">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minHeight: 0,
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px minmax(0, 1fr)',
            gap: '10px',
            paddingBottom: '6px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.48)',
            fontSize: '10px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          <div>TIME</div>
          <div>EVENTS</div>
        </div>

        {sortedEvents.length === 0 ? (
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.34)',
              fontSize: '11px',
              padding: '8px',
            }}
          >
            No events scheduled
          </div>
        ) : (
          sortedEvents.map((event) => (
            <div
              key={event.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px minmax(0, 1fr)',
                gap: '10px',
                alignItems: 'start',
                padding: '6px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.54)',
                  fontSize: '11px',
                  lineHeight: 1.2,
                  letterSpacing: '0.08em',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
              >
                {event.time}
              </div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.82)',
                  fontSize: '11px',
                  lineHeight: 1.25,
                  letterSpacing: '0.08em',
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {event.title}
              </div>
            </div>
          ))
        )}
      </div>
    </HudPanel>
  );
};
