import { useEffect, useRef } from 'react';

export default function ParticleField() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    // Sharper, more vibrant pink for high-contrast clarity
    const getBrandColor = (alpha) => {
      return `hsla(320, 90%, 55%, ${alpha})`;
    };

    const createParticles = () => {
      // INCREASED FREQUENCY: Calculation adjusted for higher density
      const count = Math.min(120, Math.floor(window.innerWidth / 10));
      const newParticles = [];
      for (let i = 0; i < count; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4, // Slightly faster movement
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2.5 + 1.2,    // LARGER: Increased dot radius
          o: Math.random() * 0.5 + 0.3,    // CLEARER: Increased particle opacity
        });
      }
      return newParticles;
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      particles = createParticles();
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      const mouse = mouseRef.current;
      const lineDist = 160; // INCREASED: Longer connections for a denser web

      particles.forEach((p, i) => {
        p.x += p.vx; 
        p.y += p.vy;

        if (mouse.x !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            p.x += (dx / dist) * force * 2;
            p.y += (dy / dist) * force * 2;
          }
        }

        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;

        // Draw Dot - LARGER AND CLEARER
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = getBrandColor(p.o);
        ctx.fill();

        // Draw Lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < lineDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            
            // CLEARER: Boosted line opacity for better visibility
            const lineOpacity = 0.25 * (1 - dist / lineDist);
            ctx.strokeStyle = getBrandColor(lineOpacity);
            ctx.lineWidth = 1.0; // LARGER: Increased line width
            ctx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[2] bg-transparent"
    />
  );
}