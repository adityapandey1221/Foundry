import React, { useRef, useState } from 'react';
import { HudPanel } from '../components/HudPanel';
import { HabitManagementPanel } from '../components/HabitManagementPanel';
import { VideoExactButton } from '../components/VideoExactButton';

export type ConfigPageProps = {
  store: {
    habits: Array<{
      id: string;
      name: string;
      category: string;
      isActive: boolean;
    }>;
    completions: Record<string, string[]>;
    settings: any;
    addHabit: (name: string, category: string) => void;
    removeHabit: (habitId: string) => void;
    updateHabit: (habitId: string, updates: any) => void;
    clearAllData: () => void;
    importData: (json: string) => boolean;
  };
};

export const ConfigPage: React.FC<ConfigPageProps> = ({ store }) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

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

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const success = store.importData(json);
        if (success) {
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format');
        }
      } catch (err) {
        alert('Error parsing file');
      }
    };
    reader.readAsText(file);

    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
  };

  const handleResetData = () => {
    if (confirm('Are you sure? This will delete all habits and completions.')) {
      store.clearAllData();
      setResetConfirm(false);
      alert('Data reset successfully');
    }
  };

  return (
    <main
      style={{
        background:
          'radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.03), transparent 28%), #020202',
        color: 'rgba(255, 255, 255, 0.88)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
          '"IBM Plex Mono", "Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        padding: '8px',
      }}
    >
      <div
        style={{
          background: '#050505',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.04) inset',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          flex: 1,
          minHeight: 0,
          gap: '8px',
          overflow: 'auto',
          borderRadius: '2px',
          padding: '8px',
        }}
      >
          {/* Habit Management */}
          <HudPanel title="HABIT MANAGER" meta="CONFIG" compact>
            <div style={{ minHeight: 0, overflow: 'auto' }}>
              <HabitManagementPanel
                habits={store.habits}
                onAddHabit={store.addHabit}
                onUpdateHabit={store.updateHabit}
                onRemoveHabit={store.removeHabit}
              />
            </div>
          </HudPanel>

          {/* Data & System Management */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'auto' }}>
            <HudPanel title="DATA MANAGEMENT" meta="EXPORT/IMPORT" compact>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <VideoExactButton
                  variant="filled"
                  size="md"
                  onClick={handleExportData}
                >
                  EXPORT DATA
                </VideoExactButton>
                <VideoExactButton
                  variant="outline"
                  size="md"
                  onClick={() => importInputRef.current?.click()}
                >
                  IMPORT DATA
                </VideoExactButton>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                />
              </div>
            </HudPanel>

            <HudPanel title="SYSTEM" meta="DANGEROUS" compact>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {!resetConfirm ? (
                  <VideoExactButton
                    variant="text"
                    size="md"
                    onClick={() => setResetConfirm(true)}
                  >
                    RESET ALL DATA
                  </VideoExactButton>
                ) : (
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 100, 100, 0.08)',
                      border: '1px solid rgba(255, 100, 100, 0.20)',
                      borderRadius: '2px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        color: 'rgba(255, 100, 100, 0.8)',
                        fontSize: '9px',
                        letterSpacing: '0.08em',
                        lineHeight: 1.4,
                      }}
                    >
                      This will permanently delete all habits and data.
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ flex: 1 }}>
                        <VideoExactButton
                          variant="filled"
                          size="sm"
                          onClick={handleResetData}
                        >
                          RESET
                        </VideoExactButton>
                      </div>
                      <div style={{ flex: 1 }}>
                        <VideoExactButton
                          variant="outline"
                          size="sm"
                          onClick={() => setResetConfirm(false)}
                        >
                          CANCEL
                        </VideoExactButton>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '2px',
                  }}
                >
                  <div
                    style={{
                      color: 'rgba(255, 255, 255, 0.48)',
                      fontSize: '8px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                      fontWeight: 500,
                    }}
                  >
                    Keyboard Shortcuts
                  </div>
                  <div
                    style={{
                      fontSize: '8px',
                      color: 'rgba(255, 255, 255, 0.38)',
                      lineHeight: 1.5,
                      fontFamily: 'monospace',
                    }}
                  >
                    <div>Enter → Add/Save</div>
                    <div>Esc → Cancel</div>
                    <div>Tab → Next field</div>
                  </div>
                </div>
              </div>
            </HudPanel>
          </div>
      </div>
    </main>
  );
};
