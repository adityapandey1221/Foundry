import React, { useState, useRef, useEffect } from 'react';
import { VideoExactInput } from './VideoExactInput';
import { VideoExactButton } from './VideoExactButton';
import { isValidHabitName } from '../../../utils/habitCategories';

export type InlineTaskFormProps = {
  onAddTask: (title: string) => void;
  onClose: () => void;
};

export const InlineTaskForm: React.FC<InlineTaskFormProps> = ({ onAddTask, onClose }) => {
  const [titleInput, setTitleInput] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAddTask = () => {
    setError('');

    if (!isValidHabitName(titleInput)) {
      setError('Task title required (max 100 chars)');
      return;
    }

    onAddTask(titleInput.trim());
    setTitleInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '2px',
        padding: '8px',
        marginTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <VideoExactInput
        ref={inputRef}
        value={titleInput}
        onChange={setTitleInput}
        onKeyDown={handleKeyDown}
        placeholder="Task title"
      />
      {error && (
        <div
          style={{
            color: 'rgba(255, 100, 100, 0.8)',
            fontSize: '10px',
            letterSpacing: '0.08em',
          }}
        >
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px' }}>
        <div style={{ flex: 1 }}>
          <VideoExactButton
            variant="filled"
            size="sm"
            onClick={handleAddTask}
          >
            ADD
          </VideoExactButton>
        </div>
        <div style={{ flex: 1 }}>
          <VideoExactButton
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            CANCEL
          </VideoExactButton>
        </div>
      </div>
    </div>
  );
};
