import { useEffect, useRef } from 'react';
import RainChar from 'rain-char';

interface AmbientParticlesProps {
  completionPercent?: number;
}

export const AmbientParticles = ({ completionPercent = 50 }: AmbientParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rainRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize rain-char with terminal green theme
    const rain = new RainChar(canvasRef.current, {
      fg: '#39FF14',                    // Terminal green
      bg: '#000000',                    // Black background
      density: 0.02 + (completionPercent / 100) * 0.03,  // Scales with completion
      charRange: '日月火水木金土年ﾊﾐﾆﾏﾒﾊﾐﾆﾏﾒ0123456789',  // Matrix chars
      trailDecay: 0.08,                 // Trail fade
      charSize: [14, 20],               // Font size range
      fps: 24,                          // Smooth animation
    });

    rain.start();
    rainRef.current = rain;

    return () => {
      if (rainRef.current) {
        rainRef.current.destroy();
      }
    };
  }, [completionPercent]);

  // Update density based on completion
  useEffect(() => {
    if (rainRef.current) {
      rainRef.current.updateSetting('density', 0.02 + (completionPercent / 100) * 0.03);
    }
  }, [completionPercent]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  );
};
