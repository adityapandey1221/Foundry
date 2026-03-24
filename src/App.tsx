import { useState, useMemo, Suspense, lazy } from 'react';
import { StatusBar } from './components/layout/StatusBar';
import { TabNav } from './components/layout/TabNav';
import { MonthlyDashboard } from './components/monthly/MonthlyDashboard';
import { WeeklyTracker } from './components/weekly/WeeklyTracker';
import { WeeklyPlannerView } from './components/weekly-planner/WeeklyPlannerView';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { AtmosphericGlow } from './components/effects/AtmosphericGlow';
import { useHabitStore } from './hooks/useHabitStore';
import { useCurrentDate } from './hooks/useCurrentDate';

const AmbientParticles = lazy(() => import('./components/effects/AmbientParticles').then(m => ({ default: m.AmbientParticles })));

function App() {
  const [activeTab, setActiveTab] = useState('monthly');
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
    <div className="min-h-screen bg-void flex flex-col relative">
      {/* Atmospheric effects layer behind content */}
      <AtmosphericGlow completionPercent={todayPct} />
      <Suspense fallback={null}>
        <AmbientParticles completionPercent={todayPct} />
      </Suspense>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10 }} className="flex flex-col h-screen">
        <StatusBar date={currentDate} habits={store.habits} completions={store.completions} />
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 overflow-auto">
        {activeTab === 'monthly' && (
          <MonthlyDashboard
            habits={store.habits}
            completions={store.completions}
            toggleHabitCompletion={store.toggleHabitCompletion}
            currentDate={currentDate}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyTracker
            habits={store.habits}
            completions={store.completions}
            toggleHabitCompletion={store.toggleHabitCompletion}
            currentDate={currentDate}
          />
        )}

        {activeTab === 'planner' && (
          <WeeklyPlannerView currentDate={currentDate} />
        )}

        {activeTab === 'settings' && <SettingsPanel store={store} />}
        </div>
      </div>
    </div>
  );
}

export default App;
