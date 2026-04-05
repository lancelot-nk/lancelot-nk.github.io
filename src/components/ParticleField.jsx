import React, { useEffect, useRef } from 'react';

const ParticleField = ({ isGameMode }) => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null, radius: 120 });
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const getMobile = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
    const isMob = getMobile();

    // Reduce particle count heavily on mobile for performance
    const baseCount = isGameMode
      ? (isMob ? 80 : 320)
      : (isMob ? 40 : 90);
    const connectionDistance = isGameMode ? (isMob ? 50 : 80) : 150;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y, isSpawned = false) {
        this.reset(x, y);
        if (isSpawned) {
          this.vx = (Math.random() - 0.5) * 12;
          this.vy = (Math.random() - 0.5) * 12;
        }
      }

      reset(x, y) {
        this.x = x ?? Math.random() * canvas.width;
        this.y = y ?? Math.random() * canvas.height;

        const speedMult = isGameMode ? (isMob ? 0.9 : 1.2) : 0.4;
        this.vx = (Math.random() - 0.5) * speedMult;
        this.vy = (Math.random() - 0.5) * speedMult;

        this.radius = Math.random() * 3 + (isGameMode ? (isMob ? 1.5 : 2) : 4);
        this.density = (Math.random() * 15) + 5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      respawnAtEdge() {
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0)      { this.x = Math.random() * canvas.width;  this.y = -20; }
        else if (edge === 1) { this.x = canvas.width + 20;              this.y = Math.random() * canvas.height; }
        else if (edge === 2) { this.x = Math.random() * canvas.width;  this.y = canvas.height + 20; }
        else                 { this.x = -20;                            this.y = Math.random() * canvas.height; }

        const speed = isGameMode ? (isMob ? 1.0 : 1.5) : 0.5;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
      }

      update() {
        // ── Player absorption ────────────────────────────────────────────────
        if (mouse.current.x !== null) {
          const dx = mouse.current.x - this.x;
          const dy = mouse.current.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Absorption zone — matches BlobGame player radius feel
          if (isGameMode && distance < 45) {
            window.dispatchEvent(new CustomEvent('particleCollected'));
            this.respawnAtEdge();
            return;
          }

          if (distance < mouse.current.radius) {
            const force = (mouse.current.radius - distance) / mouse.current.radius;
            if (isGameMode) {
              // Gravitational pull toward player blob
              this.x += (dx / distance) * force * (isMob ? 3.5 : 5);
              this.y += (dy / distance) * force * (isMob ? 3.5 : 5);
            } else {
              const directionX = (dx / distance) * force * this.density * 0.4;
              const directionY = (dy / distance) * force * this.density * 0.4;
              this.x -= directionX;
              this.y -= directionY;
            }
          }
        }

        // ── Enemy absorption ─────────────────────────────────────────────────
        // EnemyPositions are broadcast each frame from BlobGame via a shared ref
        // We read from window.__blobEnemies which BlobGame writes every loop tick
        if (isGameMode) {
          const enemies = window.__blobEnemies;
          if (enemies && enemies.length > 0) {
            // Only check a subset each frame for performance (every 3rd particle vs all enemies)
            const pullRadius = 90;
            const eatRadius = 38;
            for (let ei = 0; ei < enemies.length; ei++) {
              const e = enemies[ei];
              if (!e || e.type === 'saturn') continue; // saturn doesn't eat particles
              const dx = e.x - this.x;
              const dy = e.y - this.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < eatRadius) {
                // Enemy eats this particle — dispatch so BlobGame can grow the enemy
                window.dispatchEvent(new CustomEvent('enemyParticleCollected', {
                  detail: { enemyId: e.id }
                }));
                this.respawnAtEdge();
                return;
              }

              if (dist < pullRadius && dist > 0) {
                const force = (pullRadius - dist) / pullRadius;
                this.x += (dx / dist) * force * (isMob ? 2.5 : 4);
                this.y += (dy / dist) * force * (isMob ? 2.5 : 4);
              }
            }
          }
        }

        this.x += this.vx;
        this.y += this.vy;

        // Bounce to stay on screen
        if (this.x < -30 || this.x > canvas.width + 30)  this.vx *= -1;
        if (this.y < -30 || this.y > canvas.height + 30)  this.vy *= -1;
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
      particles.current = Array.from({ length: baseCount }, () => new Particle());
    };

    const handleSplit = (e) => {
      const { x, y, count } = e.detail;
      for (let i = 0; i < count; i++) {
        particles.current.push(new Particle(x, y, true));
      }
      const cap = isMob ? 200 : 500;
      if (particles.current.length > cap) {
        particles.current.splice(0, particles.current.length - cap);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p, i) => {
        p.update();
        p.draw();

        // Skip connections on mobile in game mode entirely for perf
        if (isMob && isGameMode) return;

        const skip = isGameMode ? 4 : 1;
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

    // ── Input tracking ────────────────────────────────────────────────────────
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.current.x = null;
      mouse.current.y = null;
    };

    // Track touch position so mobile player blob also pulls/eats particles
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouse.current.x = e.touches[0].clientX;
        mouse.current.y = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      // Don't null out on touchend — player blob stays at last position
      // so particles keep getting pulled. Only null on true leave.
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('blobSplit', handleSplit);

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('blobSplit', handleSplit);
      cancelAnimationFrame(animationFrameId);
      // Clean up shared enemy position array when unmounting
      if (!isGameMode) window.__blobEnemies = null;
    };
  }, [isGameMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{
        opacity: isGameMode ? 1 : 0.8,
        transition: 'opacity 0.5s ease-in-out',
        // Use normal blend in game mode so anime mode difference blend on BlobGame canvas
        // doesn't compound with this layer unexpectedly
        mixBlendMode: 'normal',
      }}
    />
  );
};

export default ParticleField;