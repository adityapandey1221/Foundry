import type { ReactNode } from 'react';
import '../styles/videoExact.css';

export type HudPanelProps = {
  title?: string;
  meta?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
  compact?: boolean;
  muted?: boolean;
};

export function HudPanel({
  title,
  meta,
  action,
  children,
  className = '',
  bodyClassName = '',
  compact = false,
  muted = false,
}: HudPanelProps) {
  const rootClassName = [
    'video-exact-panel',
    compact ? 'video-exact-panel--compact' : '',
    muted ? 'video-exact-panel--muted' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={rootClassName}>
      {(title || meta || action) && (
        <header className="video-exact-panel__chrome">
          <div className="video-exact-panel__heading">
            {title && <h2 className="video-exact-panel__title">{title}</h2>}
            {meta && <span className="video-exact-panel__meta">{meta}</span>}
          </div>
          {action ? <div className="video-exact-panel__action">{action}</div> : null}
        </header>
      )}

      <div
        className={[
          'video-exact-panel__body',
          compact ? 'video-exact-panel__body--compact' : '',
          bodyClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </section>
  );
}
