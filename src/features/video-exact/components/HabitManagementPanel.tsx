import React, { useState } from 'react';
import { VideoExactInput } from './VideoExactInput';
import { VideoExactSelect, type SelectOption } from './VideoExactSelect';
import { VideoExactButton } from './VideoExactButton';
import { VideoExactConfirm } from './VideoExactConfirm';
import { getCategories, isValidHabitName } from '../../../utils/habitCategories';

export type HabitManagementPanelProps = {
  habits: Array<{
    id: string;
    name: string;
    category: string;
    isActive: boolean;
  }>;
  onAddHabit: (name: string, category: string) => void;
  onUpdateHabit: (habitId: string, updates: { name?: string; category?: string }) => void;
  onRemoveHabit: (habitId: string) => void;
};

export const HabitManagementPanel: React.FC<HabitManagementPanelProps> = ({
  habits,
  onAddHabit,
  onUpdateHabit,
  onRemoveHabit,
}) => {
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('custom');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [addError, setAddError] = useState('');

  const categories: SelectOption[] = getCategories();
  const activeHabits = habits.filter((h) => h.isActive);

  const handleAddHabit = () => {
    setAddError('');

    if (!isValidHabitName(newHabitName)) {
      setAddError('Habit name required (max 100 chars)');
      return;
    }

    onAddHabit(newHabitName.trim(), newHabitCategory);
    setNewHabitName('');
    setNewHabitCategory('custom');
    setIsAddingHabit(false);
  };

  const handleStartEdit = (habit: (typeof activeHabits)[0]) => {
    setEditingHabitId(habit.id);
    setEditName(habit.name);
    setEditCategory(habit.category);
  };

  const handleSaveEdit = () => {
    if (!isValidHabitName(editName)) {
      return;
    }

    onUpdateHabit(editingHabitId!, {
      name: editName.trim(),
      category: editCategory,
    });
    setEditingHabitId(null);
  };

  const handleConfirmDelete = () => {
    if (deletingHabitId) {
      onRemoveHabit(deletingHabitId);
      setDeletingHabitId(null);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Habit list */}
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {activeHabits.length === 0 ? (
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.34)',
              fontSize: '9px',
              textAlign: 'center',
              padding: '16px 8px',
            }}
          >
            No active habits
          </div>
        ) : (
          activeHabits.map((habit) =>
            editingHabitId === habit.id ? (
              <div
                key={habit.id}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '2px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <VideoExactInput
                  value={editName}
                  onChange={setEditName}
                  placeholder="Habit name"
                  autoFocus
                />
                <VideoExactSelect
                  value={editCategory}
                  onChange={setEditCategory}
                  options={categories}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <VideoExactButton
                      variant="filled"
                      size="sm"
                      onClick={handleSaveEdit}
                    >
                      SAVE
                    </VideoExactButton>
                  </div>
                  <div style={{ flex: 1 }}>
                    <VideoExactButton
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingHabitId(null)}
                    >
                      CANCEL
                    </VideoExactButton>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={habit.id}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '2px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: 'rgba(255, 255, 255, 0.88)',
                      fontSize: '9px',
                      letterSpacing: '0.08em',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {habit.name}
                  </div>
                  <div
                    style={{
                      color: 'rgba(255, 255, 255, 0.38)',
                      fontSize: '8px',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {habit.category}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <VideoExactButton
                    variant="text"
                    size="sm"
                    onClick={() => handleStartEdit(habit)}
                  >
                    EDIT
                  </VideoExactButton>
                  <VideoExactButton
                    variant="text"
                    size="sm"
                    onClick={() => setDeletingHabitId(habit.id)}
                  >
                    DELETE
                  </VideoExactButton>
                </div>
              </div>
            )
          )
        )}
      </div>

      {/* Delete confirmation */}
      {deletingHabitId && (
        <VideoExactConfirm
          message={`Delete habit "${
            activeHabits.find((h) => h.id === deletingHabitId)?.name || 'Unknown'
          }"?`}
          isOpen={!!deletingHabitId}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingHabitId(null)}
          confirmLabel="DELETE"
          cancelLabel="CANCEL"
        />
      )}

      {/* Add habit section */}
      {!isAddingHabit ? (
        <VideoExactButton
          variant="outline"
          size="md"
          onClick={() => setIsAddingHabit(true)}
        >
          + ADD HABIT
        </VideoExactButton>
      ) : (
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '2px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <VideoExactInput
            value={newHabitName}
            onChange={setNewHabitName}
            placeholder="Habit name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddHabit();
              if (e.key === 'Escape') setIsAddingHabit(false);
            }}
          />
          <VideoExactSelect
            value={newHabitCategory}
            onChange={setNewHabitCategory}
            options={categories}
          />
          {addError && (
            <div
              style={{
                color: 'rgba(255, 100, 100, 0.8)',
                fontSize: '8px',
                letterSpacing: '0.08em',
              }}
            >
              {addError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ flex: 1 }}>
              <VideoExactButton
                variant="filled"
                size="sm"
                onClick={handleAddHabit}
              >
                ADD
              </VideoExactButton>
            </div>
            <div style={{ flex: 1 }}>
              <VideoExactButton
                variant="outline"
                size="sm"
                onClick={() => setIsAddingHabit(false)}
              >
                CANCEL
              </VideoExactButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
