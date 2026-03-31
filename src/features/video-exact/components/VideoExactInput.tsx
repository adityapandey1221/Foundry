import React from 'react';

export type VideoExactInputProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoFocus?: boolean;
  type?: 'text' | 'number';
  disabled?: boolean;
  className?: string;
};

export const VideoExactInput = React.forwardRef<HTMLInputElement, VideoExactInputProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      placeholder,
      autoFocus = false,
      type = 'text',
      disabled = false,
      className,
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className={className}
        style={{
          fontFamily: '"IBM Plex Mono", "Space Mono", ui-monospace, monospace',
          fontSize: '9px',
          letterSpacing: '0.08em',
          padding: '6px 8px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: disabled ? 'rgba(255, 255, 255, 0.38)' : 'rgba(255, 255, 255, 0.88)',
          outline: 'none',
          transition: 'border-color 150ms ease-out',
          borderRadius: '2px',
          width: '100%',
          boxSizing: 'border-box',
          ...(!disabled && {
            cursor: 'text',
          }),
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.28)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }}
      />
    );
  }
);

VideoExactInput.displayName = 'VideoExactInput';
