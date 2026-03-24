import { useState } from 'react';
import { StatusBar } from './components/layout/StatusBar';
import { TabNav } from './components/layout/TabNav';
import { MonthlyDashboard } from './components/monthly/MonthlyDashboard';
import { WeeklyTracker } from './components/weekly/WeeklyTracker';
import { WeeklyPlannerView } from './components/weekly-planner/WeeklyPlannerView';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { useHabitStore } from './hooks/useHabitStore';
import { useCurrentDate } from './hooks/useCurrentDate';

function App() {
  const [activeTab, setActiveTab] = useState('monthly');
  const store = useHabitStore();
  const currentDate = useCurrentDate();

  return (
    <div className="min-h-screen bg-void flex flex-col">
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
  );
}

export default App;
