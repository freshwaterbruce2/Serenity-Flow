import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export default function ZenBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -100, y: -100, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const colors = ['#3A3A5E', '#1A1A2E', '#9d94ff', '#5a5a8e', '#E0E0E6'];

    const createParticle = (x: number, y: number) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.5;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(13, 13, 18, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (mouse.current.active) {
        for (let i = 0; i < 2; i++) {
          particles.current.push(createParticle(mouse.current.x, mouse.current.y));
        }
      }

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;

        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.life * 4, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 0.3;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouse.current.x = e.touches[0].clientX;
        mouse.current.y = e.touches[0].clientY;
        mouse.current.active = true;
      }
    };

    const handleStop = () => {
      mouse.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleStop);
    window.addEventListener('touchend', handleStop);

    const animationId = animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleStop);
      window.removeEventListener('touchend', handleStop);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-[#0D0D12]"
      style={{ touchAction: 'none' }}
    />
  );
}
