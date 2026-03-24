export const TabNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'monthly', label: 'MONTHLY DASHBOARD' },
    { id: 'weekly', label: 'WEEKLY TRACKER' },
    { id: 'planner', label: 'WEEKLY PLANNER' },
    { id: 'settings', label: 'SETTINGS' },
  ];

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
            borderBottomColor: activeTab === tab.id ? '#39FF14' : 'transparent',
            color: activeTab === tab.id ? '#39FF14' : undefined,
            textShadow: activeTab === tab.id ? '0 0 8px rgba(57, 255, 20, 0.3)' : 'none'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
