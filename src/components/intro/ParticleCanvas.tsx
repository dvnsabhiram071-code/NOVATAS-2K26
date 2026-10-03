import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
  fade: number;
}

export const ParticleCanvas: React.FC<{ burstColor?: string; triggerBurst?: number }> = ({ 
  burstColor, 
  triggerBurst 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const colors = ['#00E5FF', '#2979FF', '#7C4DFF', '#FF2BD6', '#FF3D71', '#FF7A00', '#FFE600'];

    // Initial ambient particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.5 + 0.2,
        fade: 0.003
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap or fade ambient
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Handle electric burst when letter pops
  useEffect(() => {
    if (!triggerBurst || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Small spark burst in the center
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const color = burstColor || '#00E5FF';

    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 3 + 2;
      const radius = Math.random() * 2 + 1;
      
      let alpha = 0.9;
      let x = cx;
      let y = cy;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const sparkInterval = setInterval(() => {
        if (!canvasRef.current) {
          clearInterval(sparkInterval);
          return;
        }
        x += vx;
        y += vy;
        alpha -= 0.05;

        if (alpha <= 0) {
          clearInterval(sparkInterval);
          return;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fill();
        ctx.restore();
      }, 20);
    }
  }, [triggerBurst, burstColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0" 
    />
  );
};
