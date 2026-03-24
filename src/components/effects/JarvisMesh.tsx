import { useEffect, useRef } from 'react';

interface JarvisMeshProps {
  completionPercent?: number;
}

export const JarvisMesh = ({ completionPercent = 50 }: JarvisMeshProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const cellSize = 60;

    const animate = () => {
      timeRef.current += 1;
      const time = timeRef.current * 0.01;

      // Clear canvas completely
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const opacity = 0.3;
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 1.5;

      // Draw horizontal lines with spacetime warping
      for (let y = 0; y < canvas.height; y += cellSize) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 8) {
          // Simple sine wave distortion
          const warp = Math.sin(x * 0.005 + time * 0.5) * 20 +
                       Math.sin(y * 0.008 + time * 0.3) * 15 +
                       Math.sin((x + y) * 0.003 + time * 0.4) * 10;

          const yPos = y + warp;

          if (x === 0) {
            ctx.moveTo(x, yPos);
          } else {
            ctx.lineTo(x, yPos);
          }
        }
        ctx.stroke();
      }

      // Draw vertical lines with spacetime warping
      for (let x = 0; x < canvas.width; x += cellSize) {
        ctx.beginPath();
        for (let y = 0; y <= canvas.height; y += 8) {
          // Simple sine wave distortion
          const warp = Math.sin(x * 0.008 + time * 0.3) * 15 +
                       Math.sin(y * 0.005 + time * 0.5) * 20 +
                       Math.sin((x + y) * 0.003 + time * 0.4) * 10;

          const xPos = x + warp;

          if (y === 0) {
            ctx.moveTo(xPos, y);
          } else {
            ctx.lineTo(xPos, y);
          }
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

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
