import { useState } from 'react';
import { CATEGORIES } from '../../utils/constants';

interface HabitEditModalProps {
  habit: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitId: string, updates: any) => void;
  onDelete: (habitId: string) => void;
}

export const HabitEditModal = ({ habit, isOpen, onClose, onSave, onDelete }: HabitEditModalProps) => {
  const [name, setName] = useState(habit.name);
  const [category, setCategory] = useState(habit.category);
  const [isActive, setIsActive] = useState(habit.isActive);

  const handleSave = () => {
    if (name.trim()) {
      onSave(habit.id, { name: name.trim(), category, isActive });
      onClose();
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete habit "${habit.name}"? This action cannot be undone.`)) {
      onDelete(habit.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-neutral-950 border border-neutral-800 rounded-md p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-bold mb-4" style={{ color: '#39FF14' }}>
          EDIT HABIT
        </h2>

        {/* Habit Name */}
        <div className="mb-4">
          <label className="block text-xs uppercase mb-2" style={{ color: '#22AA44' }}>
            Habit Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
            placeholder="Habit name"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-xs uppercase mb-2" style={{ color: '#22AA44' }}>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neutral-500"
          >
            {Object.values(CATEGORIES).map((cat: any) => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Status */}
        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-xs uppercase" style={{ color: '#22AA44' }}>
            Active
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded font-bold uppercase text-xs transition"
            style={{
              backgroundColor: 'rgba(57, 255, 20, 0.1)',
              color: '#39FF14',
              border: '1px solid #39FF14',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.1)')}
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded font-bold uppercase text-xs transition"
            style={{
              backgroundColor: 'rgba(100, 100, 100, 0.1)',
              color: '#888888',
              border: '1px solid #555555',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(100, 100, 100, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(100, 100, 100, 0.1)')}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded font-bold uppercase text-xs transition"
            style={{
              backgroundColor: 'rgba(255, 100, 100, 0.1)',
              color: '#FF6464',
              border: '1px solid #FF6464',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.1)')}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
