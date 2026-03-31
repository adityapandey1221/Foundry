import React from 'react';

export type SelectOption = {
  value: string;
  label: string;
};

export type VideoExactSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export const VideoExactSelect = React.forwardRef<HTMLSelectElement, VideoExactSelectProps>(
  (
    {
      value,
      onChange,
      options,
      placeholder,
      disabled = false,
      className,
    },
    ref
  ) => {
    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
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
          appearance: 'none',
          width: '100%',
          boxSizing: 'border-box',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='rgba(255,255,255,0.56)' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 6px center',
          paddingRight: '24px',
          ...(!disabled && {
            cursor: 'pointer',
          }),
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.28)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

VideoExactSelect.displayName = 'VideoExactSelect';
