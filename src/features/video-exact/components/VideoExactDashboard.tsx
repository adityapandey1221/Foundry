import type { CSSProperties, ReactNode } from 'react';
import { FlowLadderPanel } from './FlowLadderPanel';
import { FrequencySpectrumPanel } from './FrequencySpectrumPanel';
import { HelixCorePanel } from './HelixCorePanel';
import { MarketLogsPanel } from './MarketLogsPanel';
import { MarketsPanel } from './MarketsPanel';
import { NumericLatticePanel } from './NumericLatticePanel';
import { RadarSweepPanel } from './RadarSweepPanel';
import { RingGaugesPanel } from './RingGaugesPanel';
import { SignalWaveformPanel } from './SignalWaveformPanel';
import { TelemetryStrip, type TelemetryItem } from './TelemetryStrip';
import { useHabitHudData } from '../hooks/useHabitHudData';

type VideoExactDashboardProps = {
  className?: string;
  style?: CSSProperties;
  banner?: ReactNode;
  telemetryItems?: TelemetryItem[];
  leftRail?: ReactNode;
  centerRail?: ReactNode;
  rightRail?: ReactNode;
};

function RailShell({
  title,
  children,
  rows,
}: {
  title: string;
  children: ReactNode;
  rows: string;
}) {
  return (
    <section
      style={{
        display: 'grid',
        gap: '8px',
        gridTemplateRows: rows,
        minHeight: 0,
      }}
    >
      {children}
      <div style={{ display: 'none' }} aria-hidden>
        {title}
      </div>
    </section>
  );
}

export function VideoExactDashboard({
  className,
  style,
  banner,
  telemetryItems,
  leftRail,
  centerRail,
  rightRail,
}: VideoExactDashboardProps) {
  const habitHudData = useHabitHudData();

  return (
    <main
      className={className}
      style={{
        alignItems: 'center',
        background:
          'radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.03), transparent 28%), #020202',
        color: 'rgba(255, 255, 255, 0.88)',
        display: 'flex',
        fontFamily:
          '"IBM Plex Mono", "Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        justifyContent: 'center',
        minHeight: '100vh',
        overflow: 'hidden',
        padding: '8px',
        ...style,
      }}
    >
      <div
        style={{
          aspectRatio: '16 / 9',
          background: '#050505',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.04) inset',
          display: 'grid',
          gridTemplateRows: '36px minmax(0, 1fr)',
          height: 'min(calc(100vh - 16px), calc((100vw - 16px) * 9 / 16))',
          maxWidth: 'calc(100vw - 16px)',
          overflow: 'hidden',
          width: 'min(calc(100vw - 16px), calc((100vh - 16px) * 16 / 9))',
        }}
      >
        <TelemetryStrip banner={banner} items={telemetryItems} />

        <div
          style={{
            display: 'grid',
            gap: '8px',
            gridTemplateColumns: '24fr 45fr 31fr',
            minHeight: 0,
            padding: '8px',
          }}
        >
          <RailShell title="Left Rail" rows="28fr 38fr 34fr">
            {leftRail ?? (
              <>
                <MarketsPanel />
                <FlowLadderPanel />
                <MarketLogsPanel />
              </>
            )}
          </RailShell>

          <RailShell title="Center Rail" rows="40fr 30fr 30fr">
            {centerRail ?? (
              <>
                <HelixCorePanel />
                <SignalWaveformPanel
                  series={habitHudData.monthlyProgressSeries}
                />
                <FrequencySpectrumPanel
                  monthlyChecklistDays={habitHudData.monthlyChecklistDays}
                  monthlyChecklistRows={habitHudData.monthlyChecklistRows}
                  onToggleHabit={(habitId, date) => {
                    habitHudData.toggleHabitCompletion(habitId, date);
                  }}
                />
              </>
            )}
          </RailShell>

          <RailShell title="Right Rail" rows="46fr 31fr 23fr">
            {rightRail ?? (
              <>
                <RadarSweepPanel />
                <NumericLatticePanel
                  heatmapWeeks={habitHudData.heatmapWeeks}
                  todaySummary={habitHudData.todaySummary}
                />
                <RingGaugesPanel />
              </>
            )}
          </RailShell>
        </div>
      </div>
    </main>
  );
}
