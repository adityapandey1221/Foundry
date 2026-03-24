import { useRef } from 'react';
import { Panel } from '../shared/Panel';
import { HabitManager } from './HabitManager';

export const SettingsPanel = ({ store }) => {
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    const data = {
      habits: store.habits,
      completions: store.completions,
      settings: store.settings,
      exportDate: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);
        if (data.habits && data.completions) {
          store.importData(json);
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format');
        }
      } catch (err) {
        alert('Error parsing file');
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
  };

  const handleResetData = () => {
    if (confirm('Are you sure? This will delete all habits and completions.')) {
      store.clearAllData();
      alert('Data reset successfully');
    }
  };

  return (
    <div className="space-y-4 p-6 overflow-auto">
      <Panel title="MANAGE HABITS">
        <HabitManager
          habits={store.habits}
          onAddHabit={store.addHabit}
          onRemoveHabit={store.removeHabit}
          onUpdateHabit={store.updateHabit}
        />
      </Panel>

      <Panel title="DATA MANAGEMENT">
        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="btn btn-secondary w-full text-body"
          >
            EXPORT DATA
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            className="btn btn-secondary w-full text-body"
          >
            IMPORT DATA
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            onChange={handleImportData}
            style={{ display: 'none' }}
          />
          <button
            onClick={handleResetData}
            className="btn btn-danger w-full text-body"
          >
            RESET ALL DATA
          </button>
        </div>
      </Panel>
    </div>
  );
};
