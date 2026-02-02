import { useRef, useEffect } from 'react';

function Visualizer({ frequencyData }) {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Dark background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (frequencyData && frequencyData.length > 0) {
        const barCount = frequencyData.length;
        const barWidth = canvas.width / barCount;

        for (let i = 0; i < barCount; i++) {
          const barHeight = (frequencyData[i] / 255) * canvas.height * 0.8;
          const x = i * barWidth;
          const y = canvas.height - barHeight;

          // Create gradient for neon effect
          const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
          gradient.addColorStop(0, '#a855f7');
          gradient.addColorStop(0.5, '#9333ea');
          gradient.addColorStop(1, '#6b21a8');

          // Add glow effect
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#a855f7';
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth - 2, barHeight);
          
          // Reset shadow for next iteration
          ctx.shadowBlur = 0;
        }
      }
      
      animationIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [frequencyData]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full"
    />
  );
}

export default Visualizer;
