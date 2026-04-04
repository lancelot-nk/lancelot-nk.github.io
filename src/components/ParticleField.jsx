import React, { useEffect, useRef } from 'react';

const ParticleField = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null, radius: 180 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    // Config
    const particleCount = 75; 
    const connectionDistance = 160;
    const brandPink = '#E01880';

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y) {
        this.reset(x, y);
      }

      reset(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        
        // MAINTAINING BIGGER SIZE
        this.radius = Math.random() * 3 + 4; 
        this.density = (Math.random() * 30) + 10;
        this.opacity = Math.random() * 0.6 + 0.2;
      }

      update() {
        // Interactivity: Mouse Repulsion
        if (mouse.current.x !== null) {
          let dx = mouse.current.x - this.x;
          let dy = mouse.current.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let maxDistance = mouse.current.radius;
          let force = (maxDistance - distance) / maxDistance;
          let directionX = forceDirectionX * force * this.density;
          let directionY = forceDirectionY * force * this.density;

          if (distance < mouse.current.radius) {
            this.x -= directionX;
            this.y -= directionY;
          }
        }

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 24, 128, ${this.opacity})`;
        ctx.fill();

        // Glow ring
        ctx.strokeStyle = `rgba(255, 209, 232, ${this.opacity * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    const init = () => {
      resize();
      particles = Array.from({ length: particleCount }, () => new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.update();
        p.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            // Dynamic opacity based on distance
            ctx.strokeStyle = `rgba(224, 24, 128, ${0.2 * (1 - dist / connectionDistance)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.current.x = null;
      mouse.current.y = null;
    };

    const handleClick = (e) => {
      // Spawn new big particles on click
      for(let i = 0; i < 5; i++) {
        particles.push(new Particle(e.clientX, e.clientY));
        if (particles.length > 100) particles.shift();
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[2]"
    />
  );
};

export default ParticleField;