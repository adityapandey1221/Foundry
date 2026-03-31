import React, { useState, useRef, useEffect } from 'react';
import { VideoExactInput } from './VideoExactInput';
import { VideoExactButton } from './VideoExactButton';
import { parseTimeString, formatTime } from '../../../utils/habitCategories';

export type InlineEventFormProps = {
  onAddEvent: (time: string, title: string) => void;
  onClose: () => void;
};

export const InlineEventForm: React.FC<InlineEventFormProps> = ({ onAddEvent, onClose }) => {
  const [timeInput, setTimeInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [error, setError] = useState('');
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    timeInputRef.current?.focus();
  }, []);

  const handleAddEvent = () => {
    setError('');

    if (!timeInput.trim()) {
      setError('Time required');
      return;
    }

    if (!titleInput.trim()) {
      setError('Title required');
      return;
    }

    const parsed = parseTimeString(timeInput);
    if (!parsed) {
      setError('Invalid time format (use 9:30 AM or 14:30)');
      return;
    }

    const formattedTime = formatTime(parsed.hours, parsed.minutes, true);
    onAddEvent(formattedTime, titleInput.trim());

    setTimeInput('');
    setTitleInput('');
    timeInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddEvent();
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
      <div style={{ display: 'flex', gap: '6px' }}>
        <div style={{ flex: '0 0 80px' }}>
          <VideoExactInput
            ref={timeInputRef}
            value={timeInput}
            onChange={setTimeInput}
            onKeyDown={handleKeyDown}
            placeholder="Time (9:30 AM)"
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <VideoExactInput
            value={titleInput}
            onChange={setTitleInput}
            onKeyDown={handleKeyDown}
            placeholder="Event title"
          />
        </div>
      </div>
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
            onClick={handleAddEvent}
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
