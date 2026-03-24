export const TabNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'monthly', label: 'MONTHLY DASHBOARD' },
    { id: 'weekly', label: 'WEEKLY TRACKER' },
    { id: 'settings', label: 'SETTINGS' },
  ];

  return (
    <div className="bg-surface border-b border-border-subtle px-6 py-3 flex gap-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`font-display text-h2 uppercase tracking-wider transition-colors duration-200 ${
            activeTab === tab.id
              ? 'text-text-accent border-b-2 border-accent-3'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
