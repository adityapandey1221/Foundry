import { useMemo } from 'react';

interface AtmosphericGlowProps {
  completionPercent?: number;
}

export const AtmosphericGlow = ({ completionPercent = 50 }: AtmosphericGlowProps) => {
  const intensity = useMemo(() => {
    // Base opacity scales with completion: 0% = 0.3, 100% = 0.6
    return 0.3 + (completionPercent / 100) * 0.3;
  }, [completionPercent]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: `radial-gradient(ellipse at 50% 50%, rgba(57, 255, 20, 0.04) 0%, transparent 70%)`,
        opacity: intensity,
      }}
      className="pulse-glow"
    />
  );
};
