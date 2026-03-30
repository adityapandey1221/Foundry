import { getThemeColor } from '../../utils/theme';

export const TabNav = ({ activeTab, onTabChange, theme = 'matrix' }: { activeTab: string; onTabChange: (tab: string) => void; theme?: 'matrix' | 'jarvis' | 'tactical' }) => {
  const tabs = [
    { id: 'monthly', label: 'MONTHLY DASHBOARD' },
    { id: 'weekly', label: 'DETAILED WEEKLY' },
    { id: 'planner', label: 'WEEKLY PLANNER' },
    { id: 'settings', label: 'SETTINGS' },
  ];

  const accentColor = getThemeColor(theme);
  const glowColor = theme === 'jarvis' ? 'rgba(0, 255, 255, 0.3)' : theme === 'tactical' ? 'rgba(103, 223, 101, 0.3)' : 'rgba(57, 255, 20, 0.3)';

  return (
    <div className="bg-black border-b border-neutral-800 px-6 py-3 flex gap-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`text-sm font-bold uppercase tracking-wider transition-colors duration-100 ${
            activeTab === tab.id
              ? 'text-green-400 border-b-2'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
          style={{
            borderBottomColor: activeTab === tab.id ? accentColor : 'transparent',
            color: activeTab === tab.id ? accentColor : undefined,
            textShadow: activeTab === tab.id ? `0 0 8px ${glowColor}` : 'none'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
