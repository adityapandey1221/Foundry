import { useState, useEffect } from 'react';
import { VideoExactDashboard, ConfigPage, VideoExactWeeklyPlanner } from './features/video-exact';
import { useHabitStore } from './hooks/useHabitStore';

const NavTabs = ({ currentView, onViewChange }: { currentView: string; onViewChange: (view: 'dashboard' | 'planner' | 'config') => void }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', gap: '0', padding: '0', height: '36px', alignItems: 'center', backgroundColor: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
      {/* Left - Navigation tabs */}
      <div style={{ display: 'flex', gap: '1px', padding: '4px' }}>
        <button
          onClick={() => onViewChange('dashboard')}
          style={{
            padding: '4px 10px',
            backgroundColor: currentView === 'dashboard' ? 'rgba(0,102,255,0.8)' : 'transparent',
            color: currentView === 'dashboard' ? '#fff' : 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            fontSize: '10px',
            letterSpacing: '0.05em',
            transition: 'all 150ms ease-out',
          }}
        >
          DASH
        </button>
        <button
          onClick={() => onViewChange('planner')}
          style={{
            padding: '4px 10px',
            backgroundColor: currentView === 'planner' ? 'rgba(0,102,255,0.8)' : 'transparent',
            color: currentView === 'planner' ? '#fff' : 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            fontSize: '10px',
            letterSpacing: '0.05em',
            transition: 'all 150ms ease-out',
          }}
        >
          PLAN
        </button>
        <button
          onClick={() => onViewChange('config')}
          style={{
            padding: '4px 10px',
            backgroundColor: currentView === 'config' ? 'rgba(0,102,255,0.8)' : 'transparent',
            color: currentView === 'config' ? '#fff' : 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            fontSize: '10px',
            letterSpacing: '0.05em',
            transition: 'all 150ms ease-out',
          }}
        >
          CONFIG
        </button>
      </div>

      {/* Center - Title */}
      <div style={{ position: 'absolute', left: 'calc(44% + 35px)', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.9)', fontSize: '18px', letterSpacing: '0.12em', fontWeight: 600, textShadow: '0 0 12px rgba(255,255,255,0.4), 0 0 24px rgba(100,200,255,0.2)' }}>
        FOUNDRY
      </div>

      {/* Right - Timer */}
      <div style={{ padding: '0 12px', color: 'rgba(255,255,255,0.6)', fontSize: '10px', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
        {currentTime || '00:00:00'}
      </div>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'planner' | 'config'>('dashboard');
  const store = useHabitStore();

  const navTabs = <NavTabs currentView={currentView} onViewChange={setCurrentView} />;

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {currentView === 'dashboard' && <VideoExactDashboard navTabs={navTabs} />}
      {currentView === 'planner' && (
        <>
          {navTabs}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <VideoExactWeeklyPlanner />
          </div>
        </>
      )}
      {currentView === 'config' && (
        <>
          {navTabs}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <ConfigPage store={store} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
