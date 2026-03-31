import React from 'react';
import { VideoExactButton } from './VideoExactButton';

export type VideoExactConfirmProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
};

export const VideoExactConfirm: React.FC<VideoExactConfirmProps> = ({
  message,
  onConfirm,
  onCancel,
  isOpen,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
}) => {
  React.useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') onConfirm();
        if (e.key === 'Escape') onCancel();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '2px',
        padding: '8px 12px',
        marginTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div
        style={{
          color: 'rgba(255, 255, 255, 0.68)',
          fontSize: '9px',
          letterSpacing: '0.08em',
          lineHeight: 1.4,
        }}
      >
        {message}
      </div>
      <div
        style={{
          display: 'flex',
          gap: '6px',
        }}
      >
        <div style={{ flex: 1 }}>
          <VideoExactButton
            variant="filled"
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </VideoExactButton>
        </div>
        <div style={{ flex: 1 }}>
          <VideoExactButton
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            {cancelLabel}
          </VideoExactButton>
        </div>
      </div>
    </div>
  );
};

VideoExactConfirm.displayName = 'VideoExactConfirm';
