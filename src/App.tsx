import { useState, useMemo, Suspense, lazy } from 'react';
import { StatusBar } from './components/layout/StatusBar';
import { TabNav } from './components/layout/TabNav';
import { LiveMetricsBar } from './components/layout/LiveMetricsBar';
import { MonthlyDashboard } from './components/monthly/MonthlyDashboard';
import { WeeklyTracker } from './components/weekly/WeeklyTracker';
import { WeeklyPlannerView } from './components/weekly-planner/WeeklyPlannerView';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { AtmosphericGlow } from './components/effects/AtmosphericGlow';
import { useHabitStore } from './hooks/useHabitStore';
import { useCurrentDate } from './hooks/useCurrentDate';
import { getWeekStart } from './utils/dates';

const AmbientParticles = lazy(() => import('./components/effects/AmbientParticles').then(m => ({ default: m.AmbientParticles })));

function App() {
  const [activeTab, setActiveTab] = useState('monthly');
  const [showMatrixEffect, setShowMatrixEffect] = useState(true);
  const [theme, setTheme] = useState<'matrix' | 'jarvis' | 'tactical'>('matrix');
  const store = useHabitStore();
  const currentDate = useCurrentDate();

  // Calculate today's completion percentage
  const todayPct = useMemo(() => {
    const activeHabits = store.habits.filter(h => h.isActive);
    if (activeHabits.length === 0) return 0;

    const todayCompletions = (store.completions[currentDate.today] || []).filter(id =>
      activeHabits.some(h => h.id === id)
    );

    return Math.round((todayCompletions.length / activeHabits.length) * 100);
  }, [store.habits, store.completions, currentDate.today]);

  return (
    <div
      className="min-h-screen bg-void flex flex-col relative"
      data-theme={theme !== 'matrix' ? theme : undefined}
    >
      {/* Atmospheric effects layer behind content */}
      {theme === 'matrix' && <AtmosphericGlow completionPercent={todayPct} />}
      {theme === 'matrix' && showMatrixEffect && (
        <Suspense fallback={null}>
          <AmbientParticles completionPercent={todayPct} />
        </Suspense>
      )}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10 }} className="flex flex-col h-screen">
        <StatusBar date={currentDate} habits={store.habits} completions={store.completions} theme={theme} />
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />
        <LiveMetricsBar
          habits={store.habits}
          completions={store.completions}
          currentDate={currentDate}
          weekStart={getWeekStart(currentDate.today)}
          theme={theme}
        />

        <div className="flex-1 overflow-auto">
        {activeTab === 'monthly' && (
          <MonthlyDashboard
            habits={store.habits}
            completions={store.completions}
            toggleHabitCompletion={store.toggleHabitCompletion}
            updateHabit={store.updateHabit}
            removeHabit={store.removeHabit}
            currentDate={currentDate}
            theme={theme}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyTracker
            habits={store.habits}
            completions={store.completions}
            toggleHabitCompletion={store.toggleHabitCompletion}
            updateHabit={store.updateHabit}
            removeHabit={store.removeHabit}
            currentDate={currentDate}
          />
        )}

        {activeTab === 'planner' && (
          <WeeklyPlannerView currentDate={currentDate} />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            store={store}
            showMatrixEffect={showMatrixEffect}
            onToggleMatrixEffect={setShowMatrixEffect}
            theme={theme}
            onThemeChange={setTheme}
          />
        )}
        </div>
      </div>
    </div>
  );
}

export default App;
