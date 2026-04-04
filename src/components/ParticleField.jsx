import React, { useEffect, useRef } from 'react';

const ParticleField = ({ isGameMode }) => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null, radius: 120 });
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Game-responsive constants
    const baseCount = isGameMode ? 320 : 90;
    const connectionDistance = isGameMode ? 80 : 150;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y, isSpawned = false) {
        this.reset(x, y);
        if (isSpawned) {
          // Rapid scatter effect when blob splits
          this.vx = (Math.random() - 0.5) * 12;
          this.vy = (Math.random() - 0.5) * 12;
        }
      }

      reset(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        
        // Faster movement in game mode to keep up with the blob
        const speedMult = isGameMode ? 1.2 : 0.4;
        this.vx = (Math.random() - 0.5) * speedMult;
        this.vy = (Math.random() - 0.5) * speedMult;
        
        this.radius = Math.random() * 3 + (isGameMode ? 2 : 4); 
        this.density = (Math.random() * 15) + 5; 
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        if (mouse.current.x !== null) {
          let dx = mouse.current.x - this.x;
          let dy = mouse.current.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          // ABSORPTION LOGIC (Game Mode Only)
          if (isGameMode && distance < 45) {
            window.dispatchEvent(new CustomEvent('particleEaten'));
            this.reset(); // Respawn elsewhere to keep density constant
          }

          if (distance < mouse.current.radius) {
            const force = (mouse.current.radius - distance) / mouse.current.radius;
            
            if (isGameMode) {
              // GRAVITATIONAL PULL: In game mode, particles are sucked into the blob
              this.x += (dx / distance) * force * 4;
              this.y += (dy / distance) * force * 4;
            } else {
              // ORIGINAL SOFT PUSH: Normal site behavior
              const directionX = (dx / distance) * force * this.density * 0.4;
              const directionY = (dy / distance) * force * this.density * 0.4;
              this.x -= directionX;
              this.y -= directionY;
            }
          }
        }

        this.x += this.vx;
        this.y += this.vy;

        // Bounce logic
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 24, 128, ${this.opacity})`;
        ctx.fill();

        if (!isGameMode) {
          ctx.strokeStyle = `rgba(255, 209, 232, ${this.opacity * 0.3})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }

    const init = () => {
      resize();
      // Initialize particles array based on current mode
      particles.current = Array.from({ length: baseCount }, () => new Particle());
    };

    const handleSplit = (e) => {
      const { x, y, count } = e.detail;
      for (let i = 0; i < count; i++) {
        particles.current.push(new Particle(x, y, true));
      }
      // Cap particle count to prevent performance lag (max 600)
      if (particles.current.length > 600) particles.current.splice(0, count);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p, i) => {
        p.update();
        p.draw();

        // Optimized connections: fewer lines in game mode for performance
        const skip = isGameMode ? 3 : 1; 
        if (i % skip === 0) {
          for (let j = i + 1; j < particles.current.length; j += skip) {
            const p2 = particles.current[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(224, 24, 128, ${0.12 * (1 - dist / connectionDistance)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
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

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blobSplit', handleSplit);

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blobSplit', handleSplit);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGameMode]); // Recalculate everything when toggling game mode

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{ opacity: isGameMode ? 1 : 0.8 }}
    />
  );
};

export default ParticleField;