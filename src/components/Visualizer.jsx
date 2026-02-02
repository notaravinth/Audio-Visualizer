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
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const innerRadius = 162; // Circle radius (320px / 2 = 160px) + border (2px)
        const barCount = 128; // Match frequency data length for better performance
        const angleStep = (Math.PI * 2) / barCount;
        const barWidth = 8; // Wider bars to fill gaps

        for (let i = 0; i < barCount; i++) {
          const angle = i * angleStep - Math.PI / 2;
          // Use direct frequency data index
          const barHeight = (frequencyData[i] / 255) * 150;
          
          const x1 = centerX + Math.cos(angle) * innerRadius;
          const y1 = centerY + Math.sin(angle) * innerRadius;
          const x2 = centerX + Math.cos(angle) * (innerRadius + barHeight);
          const y2 = centerY + Math.sin(angle) * (innerRadius + barHeight);

          // Create gradient for neon effect
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, '#9333ea');
          gradient.addColorStop(1, '#a855f7');

          // Add glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#a855f7';
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = barWidth;
          ctx.lineCap = 'round';
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        
        ctx.shadowBlur = 0;

        // Corner circular flashes based on different frequency ranges
        const quarterLength = Math.floor(frequencyData.length / 4);
        const flashRadius = 480;
        
        // Top-left: Low frequencies (bass) - Deep Purple
        const lowFreq = frequencyData.slice(0, quarterLength).reduce((a, b) => a + b, 0) / quarterLength;
        const lowIntensity = (lowFreq / 255) * 1.8;
        const gradientTL = ctx.createRadialGradient(0, 0, 0, 0, 0, flashRadius);
        gradientTL.addColorStop(0, `rgba(147, 51, 234, ${lowIntensity})`);
        gradientTL.addColorStop(0.4, `rgba(147, 51, 234, ${lowIntensity * 0.6})`);
        gradientTL.addColorStop(1, 'rgba(147, 51, 234, 0)');
        ctx.fillStyle = gradientTL;
        ctx.fillRect(0, 0, flashRadius, flashRadius);
        
        // Top-right: Low-mid frequencies - Blue
        const lowMidFreq = frequencyData.slice(quarterLength, quarterLength * 2).reduce((a, b) => a + b, 0) / quarterLength;
        const lowMidIntensity = (lowMidFreq / 255) * 1.8;
        const gradientTR = ctx.createRadialGradient(canvas.width, 0, 0, canvas.width, 0, flashRadius);
        gradientTR.addColorStop(0, `rgba(59, 130, 246, ${lowMidIntensity})`);
        gradientTR.addColorStop(0.4, `rgba(59, 130, 246, ${lowMidIntensity * 0.6})`);
        gradientTR.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = gradientTR;
        ctx.fillRect(canvas.width - flashRadius, 0, flashRadius, flashRadius);
        
        // Bottom-left: High-mid frequencies - Pink/Magenta
        const highMidFreq = frequencyData.slice(quarterLength * 2, quarterLength * 3).reduce((a, b) => a + b, 0) / quarterLength;
        const highMidIntensity = (highMidFreq / 255) * 1.8;
        const gradientBL = ctx.createRadialGradient(0, canvas.height, 0, 0, canvas.height, flashRadius);
        gradientBL.addColorStop(0, `rgba(236, 72, 153, ${highMidIntensity})`);
        gradientBL.addColorStop(0.4, `rgba(236, 72, 153, ${highMidIntensity * 0.6})`);
        gradientBL.addColorStop(1, 'rgba(236, 72, 153, 0)');
        ctx.fillStyle = gradientBL;
        ctx.fillRect(0, canvas.height - flashRadius, flashRadius, flashRadius);
        
        // Bottom-right: High frequencies (treble) - Cyan
        const highFreq = frequencyData.slice(quarterLength * 3).reduce((a, b) => a + b, 0) / quarterLength;
        const highIntensity = (highFreq / 255) * 1.8;
        const gradientBR = ctx.createRadialGradient(canvas.width, canvas.height, 0, canvas.width, canvas.height, flashRadius);
        gradientBR.addColorStop(0, `rgba(34, 211, 238, ${highIntensity})`);
        gradientBR.addColorStop(0.4, `rgba(34, 211, 238, ${highIntensity * 0.6})`);
        gradientBR.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = gradientBR;
        ctx.fillRect(canvas.width - flashRadius, canvas.height - flashRadius, flashRadius, flashRadius);
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
