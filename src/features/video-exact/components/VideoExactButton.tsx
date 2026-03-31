import React from 'react';

export type VideoExactButtonVariant = 'text' | 'outline' | 'filled';
export type VideoExactButtonSize = 'sm' | 'md' | 'lg';

export type VideoExactButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  variant?: VideoExactButtonVariant;
  size?: VideoExactButtonSize;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

const sizeStyles: Record<VideoExactButtonSize, { padding: string; fontSize: string }> = {
  sm: { padding: '4px 8px', fontSize: '8px' },
  md: { padding: '6px 12px', fontSize: '9px' },
  lg: { padding: '8px 16px', fontSize: '10px' },
};

export const VideoExactButton = React.forwardRef<HTMLButtonElement, VideoExactButtonProps>(
  (
    {
      children,
      onClick,
      variant = 'text',
      size = 'md',
      disabled = false,
      className,
      type = 'button',
    },
    ref
  ) => {
    const sizeStyle = sizeStyles[size];

    const baseStyle: React.CSSProperties = {
      fontFamily: '"IBM Plex Mono", "Space Mono", ui-monospace, monospace',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontWeight: 500,
      borderRadius: '2px',
      outline: 'none',
      transition: 'all 150ms ease-out',
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: '100%',
      ...sizeStyle,
    };

    const variantStyles: Record<VideoExactButtonVariant, React.CSSProperties> = {
      text: {
        ...baseStyle,
        border: 'none',
        backgroundColor: 'transparent',
        color: disabled ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.72)',
      },
      outline: {
        ...baseStyle,
        border: `1px solid ${disabled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.20)'}`,
        backgroundColor: 'transparent',
        color: disabled ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.72)',
      },
      filled: {
        ...baseStyle,
        border: 'none',
        backgroundColor: disabled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.12)',
        color: disabled ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.88)',
      },
    };

    const style = variantStyles[variant];

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
        style={style}
        onMouseEnter={(e) => {
          if (!disabled) {
            const el = e.currentTarget;
            if (variant === 'text') {
              el.style.color = 'rgba(255, 255, 255, 0.88)';
            } else if (variant === 'outline') {
              el.style.borderColor = 'rgba(255, 255, 255, 0.28)';
              el.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
            } else if (variant === 'filled') {
              el.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            const el = e.currentTarget;
            if (variant === 'text') {
              el.style.color = 'rgba(255, 255, 255, 0.72)';
            } else if (variant === 'outline') {
              el.style.borderColor = 'rgba(255, 255, 255, 0.20)';
              el.style.backgroundColor = 'transparent';
            } else if (variant === 'filled') {
              el.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            }
          }
        }}
      >
        {children}
      </button>
    );
  }
);

VideoExactButton.displayName = 'VideoExactButton';
