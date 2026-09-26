import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface PosHistory {
  x: number;
  y: number;
  time: number;
}

export const PixelPetPlayground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [cursorStyle, setCursorStyle] = useState<'default' | 'grab' | 'grabbing'>('default');
  const [activeSpeech, setActiveSpeech] = useState<{ text: string; x: number; y: number } | null>(null);

  // Gentle 8-bit retro sound
  const playRetroSound = useCallback((type: 'bounce' | 'swat' | 'bark' | 'meow' | 'catch') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'bounce') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'swat') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'bark') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'meow') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.22);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'catch') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.setValueAtTime(320, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch {
      // AudioContext unavailable
    }
  }, [soundEnabled]);

  // Master Game State - slowed down & calm pacing
  const stateRef = useRef({
    width: 320,
    height: 110,
    groundY: 92,

    // Gentle Ball physics
    ball: {
      x: 160,
      y: 40,
      vx: 1.5,
      vy: -1.2,
      radius: 6,
      rotation: 0,
      isDragging: false,
      heldBy: null as 'dog' | null,
      isHovered: false,
    },

    mouse: {
      x: 0,
      y: 0,
      isDown: false,
      history: [] as PosHistory[],
    },

    // Pixel Dog: gentle trotting
    dog: {
      x: 60,
      y: 92,
      vx: 0,
      facing: 1 as 1 | -1,
      width: 24,
      height: 18,
      state: 'idle' as 'idle' | 'run' | 'carry' | 'pant',
      frame: 0,
      tailAngle: 0,
      cooldown: 0,
    },

    // Pixel Cat: slow stealthy stroll
    cat: {
      x: 250,
      y: 92,
      vx: 0,
      facing: -1 as 1 | -1,
      width: 22,
      height: 17,
      state: 'idle' as 'idle' | 'stalk' | 'swat' | 'sit',
      frame: 0,
      tailSway: 0,
      cooldown: 0,
    },

    particles: [] as Particle[],
  });

  const resetBall = useCallback(() => {
    const s = stateRef.current;
    s.ball.x = s.width * 0.5;
    s.ball.y = 25;
    s.ball.vx = (Math.random() - 0.5) * 3;
    s.ball.vy = -1.5;
    s.ball.heldBy = null;
    s.ball.isDragging = false;
    playRetroSound('bounce');
    setActiveSpeech({ text: 'BALL READY', x: s.width * 0.5, y: 22 });
    setTimeout(() => setActiveSpeech(null), 1200);
  }, [playRetroSound]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(rect.width);
      const h = 110;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;

      stateRef.current.width = w;
      stateRef.current.height = h;
      stateRef.current.groundY = h - 18;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const pRect = (x: number, y: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
    };

    // Compact Pixel Dog (Slate/Monochrome & brand blue collar)
    const drawDog = (dog: typeof stateRef.current.dog, groundY: number) => {
      const x = Math.floor(dog.x);
      const y = Math.floor(groundY - dog.height);
      const f = dog.facing;
      const anim = Math.floor(dog.frame / 7) % 2;
      const tailY = Math.sin(dog.tailAngle) * 3;

      ctx.save();
      ctx.translate(x + 12, y + 9);
      ctx.scale(f, 1);

      const cBody = '#94a3b8';
      const cDark = '#475569';
      const cHighlight = '#cbd5e1';
      const cCollar = '#7aa2f7';
      const cEye = '#0f172a';

      // Body
      pRect(-9, -3, 15, 8, cBody);
      pRect(-8, 5, 12, 2, cDark);

      // Tail
      pRect(-11, -5 + tailY, 3, 4, cDark);
      pRect(-13, -7 + tailY, 2, 3, cHighlight);

      // Head
      pRect(3, -9, 9, 9, cBody);
      pRect(9, -5, 4, 5, cHighlight);
      pRect(12, -5, 2, 2, cEye); // nose

      // Ear
      pRect(2, -10, 3, 7, cDark);

      // Eye
      pRect(7, -7, 2, 2, cEye);

      // Collar
      pRect(3, -1, 3, 2, cCollar);

      // Trot legs (slow leg movement)
      if (dog.state === 'run' || dog.state === 'carry') {
        const shift = anim === 0 ? 2 : -2;
        pRect(-7 + shift, 5, 3, 5, cDark);
        pRect(3 - shift, 5, 3, 5, cDark);
      } else {
        pRect(-7, 5, 3, 5, cDark);
        pRect(3, 5, 3, 5, cDark);
      }

      // Ball in mouth
      if (dog.state === 'carry') {
        pRect(13, -3, 5, 5, '#7aa2f7');
        pRect(14, -2, 3, 3, '#93c5fd');
      }

      ctx.restore();
    };

    // Compact Pixel Cat (Charcoal & bright cyan eyes)
    const drawCat = (cat: typeof stateRef.current.cat, groundY: number) => {
      const x = Math.floor(cat.x);
      const y = Math.floor(groundY - cat.height);
      const f = cat.facing;
      const anim = Math.floor(cat.frame / 8) % 2;
      const tailY = Math.sin(cat.tailSway) * 3;

      ctx.save();
      ctx.translate(x + 11, y + 8);
      ctx.scale(f, 1);

      const cBody = '#334155';
      const cDark = '#1e293b';
      const cHighlight = '#64748b';
      const cEye = '#38bdf8';
      const cNose = '#f472b6';

      // Body
      pRect(-8, -2, 13, 8, cBody);
      pRect(-6, 4, 10, 2, cHighlight);

      // Head
      pRect(3, -8, 8, 8, cBody);
      // Pointy ears
      pRect(3, -11, 2, 3, cDark);
      pRect(8, -11, 2, 3, cDark);

      // Eye & nose
      pRect(7, -6, 2, 2, cEye);
      pRect(10, -4, 1, 1, cNose);

      // Swatting paw or legs
      if (cat.state === 'swat') {
        pRect(10, -3, 5, 4, cHighlight);
      } else if (cat.state === 'stalk') {
        const shift = anim === 0 ? 1.5 : -1.5;
        pRect(-6 + shift, 5, 2, 4, cDark);
        pRect(3 - shift, 5, 2, 4, cDark);
      } else {
        pRect(-6, 5, 2, 4, cDark);
        pRect(3, 5, 2, 4, cDark);
      }

      // Tail
      pRect(-11, -5 + tailY, 3, 5, cDark);
      pRect(-9, -8 + tailY, 2, 4, cHighlight);

      ctx.restore();
    };

    // Compact Pixel Ball
    const drawBall = (ball: typeof stateRef.current.ball) => {
      const bx = Math.floor(ball.x);
      const by = Math.floor(ball.y);
      const r = ball.radius;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(ball.rotation);

      if (ball.isHovered || ball.isDragging) {
        ctx.strokeStyle = 'rgba(122, 162, 247, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Pixel Ball Body
      ctx.fillStyle = '#7aa2f7';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Seam & highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(-0.5, 0, r - 1.5, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();

      pRect(-1, -2, 1.5, 1.5, '#ffffff');

      ctx.restore();
    };

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const s = stateRef.current;
      const { ball, dog, cat, groundY, width, height } = s;

      ctx.clearRect(0, 0, width, height);

      // Minimalist Baseline Ground
      ctx.strokeStyle = 'rgba(122, 162, 247, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 1);
      ctx.lineTo(width, groundY + 1);
      ctx.stroke();

      // Subtle ground ticks
      ctx.fillStyle = 'rgba(122, 162, 247, 0.15)';
      for (let tx = 14; tx < width; tx += 28) {
        ctx.fillRect(tx, groundY + 2, 2, 3);
      }

      // 1. GENTLE BALL PHYSICS
      if (ball.isDragging) {
        ball.vx = 0;
        ball.vy = 0;
        ball.heldBy = null;
      } else if (ball.heldBy === 'dog') {
        ball.x = dog.x + (dog.facing === 1 ? 16 : -16);
        ball.y = groundY - 10;
        ball.vx = 0;
        ball.vy = 0;
      } else {
        // Soft gravity
        ball.vy += 15 * dt;
        ball.x += ball.vx * 45 * dt;
        ball.y += ball.vy * 45 * dt;

        // Ground Bounce (soft damping)
        if (ball.y + ball.radius >= groundY) {
          ball.y = groundY - ball.radius;
          if (Math.abs(ball.vy) > 0.8) {
            ball.vy = -ball.vy * 0.58; // soft elasticity
            ball.vx *= 0.92;
            playRetroSound('bounce');
          } else {
            ball.vy = 0;
            ball.vx *= 0.92; // gentle friction
            if (Math.abs(ball.vx) < 0.08) ball.vx = 0;
          }
        }

        // Ceiling
        if (ball.y - ball.radius <= 6) {
          ball.y = 6 + ball.radius;
          ball.vy = Math.abs(ball.vy) * 0.6;
          playRetroSound('bounce');
        }

        // Left / Right Walls
        if (ball.x - ball.radius <= 8) {
          ball.x = 8 + ball.radius;
          ball.vx = Math.abs(ball.vx) * 0.65;
          playRetroSound('bounce');
        } else if (ball.x + ball.radius >= width - 8) {
          ball.x = width - 8 - ball.radius;
          ball.vx = -Math.abs(ball.vx) * 0.65;
          playRetroSound('bounce');
        }

        ball.rotation += ball.vx * 0.06;
      }

      // 2. CALM DOG AI (Slow trotting & patient fetching)
      dog.frame++;
      dog.tailAngle += 0.12; // slow tail wag
      if (dog.cooldown > 0) dog.cooldown -= dt;

      if (ball.heldBy === 'dog') {
        dog.state = 'carry';
        dog.facing = -1;
        dog.x -= 34 * dt; // gentle carry trot

        if (dog.x <= width * 0.28) {
          ball.heldBy = null;
          ball.vx = 1.6;
          ball.vy = -2.2;
          dog.state = 'pant';
          dog.cooldown = 2.4; // relaxed pause
          playRetroSound('bark');
          setActiveSpeech({ text: 'WOOF! FETCH!', x: dog.x, y: groundY - 32 });
          setTimeout(() => setActiveSpeech(null), 1200);
        }
      } else if (!ball.isDragging && dog.cooldown <= 0) {
        const dx = ball.x - dog.x;
        const dist = Math.abs(dx);

        if (dist > 15) {
          dog.facing = dx > 0 ? 1 : -1;
          dog.x += (dx > 0 ? 1 : -1) * Math.min(46, dist * 1.3) * dt; // calm speed
          dog.state = 'run';
        } else {
          if (ball.y >= groundY - 14 && Math.abs(ball.vy) < 3) {
            ball.heldBy = 'dog';
            dog.state = 'carry';
            playRetroSound('catch');
          } else {
            dog.state = 'idle';
          }
        }
      }

      dog.x = Math.max(12, Math.min(width - 32, dog.x));

      // 3. CALM CAT AI (Slow stalking & relaxed swatting)
      cat.frame++;
      cat.tailSway += 0.05; // slow tail sway
      if (cat.cooldown > 0) cat.cooldown -= dt;

      if (!ball.isDragging && cat.cooldown <= 0 && ball.heldBy !== 'dog') {
        const cdx = ball.x - cat.x;
        const cdist = Math.abs(cdx);

        if (cdist > 28) {
          cat.facing = cdx > 0 ? 1 : -1;
          cat.x += (cdx > 0 ? 1 : -1) * 30 * dt; // slow stealthy stroll
          cat.state = 'stalk';
        } else if (cdist <= 28) {
          cat.facing = cdx > 0 ? 1 : -1;
          cat.state = 'swat';
          cat.cooldown = 2.0; // relaxed cooldown

          ball.heldBy = null;
          const swatDir = cat.facing;
          ball.vx = swatDir * (2.6 + Math.random() * 1.6);
          ball.vy = -(2.2 + Math.random() * 1.4);

          playRetroSound('swat');
          playRetroSound('meow');
          setActiveSpeech({ text: 'MEOW~', x: cat.x, y: groundY - 32 });
          setTimeout(() => setActiveSpeech(null), 1200);

          // Gentle sparks
          for (let p = 0; p < 3; p++) {
            s.particles.push({
              x: ball.x,
              y: ball.y,
              vx: (Math.random() - 0.5) * 3,
              vy: -Math.random() * 2.5,
              color: '#38bdf8',
              size: 2,
              life: 0,
              maxLife: 0.3,
            });
          }
        } else {
          cat.state = 'sit';
        }
      }

      cat.x = Math.max(12, Math.min(width - 32, cat.x));

      // 4. DRAW PETS & BALL
      drawDog(dog, groundY);
      drawCat(cat, groundY);
      drawBall(ball);

      // 5. PARTICLES
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.life += dt;
        if (p.life >= p.maxLife) {
          s.particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * 40 * dt;
        p.y += p.vy * 40 * dt;
        pRect(p.x, p.y, p.size, p.size, p.color);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [playRetroSound]);

  // Pointer interactions (Gentle Grab & Throw)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = stateRef.current;
    s.mouse.isDown = true;
    s.mouse.x = x;
    s.mouse.y = y;
    s.mouse.history = [{ x, y, time: performance.now() }];

    const distToBall = Math.hypot(x - s.ball.x, y - s.ball.y);

    if (distToBall <= s.ball.radius * 2.6) {
      s.ball.isDragging = true;
      s.ball.heldBy = null;
      s.ball.vx = 0;
      s.ball.vy = 0;
      setCursorStyle('grabbing');
    } else {
      // Gentle pitch to clicked point
      s.ball.heldBy = null;
      s.ball.x = x;
      s.ball.y = Math.min(y, s.groundY - 8);
      s.ball.vx = (Math.random() - 0.5) * 3;
      s.ball.vy = -2.4;
      playRetroSound('bounce');
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = stateRef.current;
    s.mouse.x = x;
    s.mouse.y = y;

    s.mouse.history.push({ x, y, time: performance.now() });
    if (s.mouse.history.length > 5) s.mouse.history.shift();

    if (s.ball.isDragging) {
      s.ball.x = Math.max(10, Math.min(s.width - 10, x));
      s.ball.y = Math.max(10, Math.min(s.groundY - s.ball.radius, y));
      setCursorStyle('grabbing');
    } else {
      const distToBall = Math.hypot(x - s.ball.x, y - s.ball.y);
      const isNear = distToBall <= s.ball.radius * 2.6;
      s.ball.isHovered = isNear;
      setCursorStyle(isNear ? 'grab' : 'default');
    }
  };

  const handlePointerUp = () => {
    const s = stateRef.current;
    if (s.ball.isDragging) {
      s.ball.isDragging = false;

      if (s.mouse.history.length >= 2) {
        const oldest = s.mouse.history[0];
        const latest = s.mouse.history[s.mouse.history.length - 1];
        const dt = Math.max((latest.time - oldest.time) / 1000, 0.02);
        const dx = latest.x - oldest.x;
        const dy = latest.y - oldest.y;

        // Gentle release multiplier (slow and controlled)
        s.ball.vx = Math.max(-6, Math.min(6, (dx / dt) * 0.009));
        s.ball.vy = Math.max(-6, Math.min(4, (dy / dt) * 0.009));
        playRetroSound('bounce');
      }

      setCursorStyle('default');
    }
    s.mouse.isDown = false;
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#0a0b0d] border-2 border-[#7aa2f7] rounded-lg overflow-hidden relative shadow-[0_0_15px_rgba(122,162,247,0.12)] font-mono select-none"
    >
      {/* Minimized Header Bar */}
      <div className="flex items-center justify-between px-2.5 py-1 border-b border-[#7aa2f7]/30 bg-[#111317]/80 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7aa2f7] animate-pulse" />
          <span className="text-[#7aa2f7] font-bold tracking-wider uppercase text-[10px]">
            PET.EXE
          </span>
          <span className="text-[9px] text-[var(--text-muted)]">
            [ grab &amp; throw ball ]
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={resetBall}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-[#171a20] border border-[#7aa2f7]/40 hover:border-[#7aa2f7] text-[#f0f2f5] hover:text-[#7aa2f7] rounded text-[9px] transition-colors cursor-pointer"
            title="Toss ball"
          >
            <RotateCcw className="w-2.5 h-2.5 text-[#7aa2f7]" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-1 border rounded transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-[#7aa2f7]/20 border-[#7aa2f7] text-[#7aa2f7]'
                : 'bg-[#171a20] border-[#7aa2f7]/30 text-[var(--text-muted)]'
            }`}
            title="Toggle 8-bit Sound"
          >
            {soundEnabled ? <Volume2 className="w-2.5 h-2.5" /> : <VolumeX className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>

      {/* Minimized 110px Canvas Area */}
      <div className="relative w-full h-[110px] touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ cursor: cursorStyle }}
          className="w-full h-full block"
        />

        {/* Speech Bubble */}
        {activeSpeech && (
          <div
            className="absolute px-1.5 py-0.5 bg-black/90 border border-[#7aa2f7] text-[#7aa2f7] text-[9px] rounded font-mono pointer-events-none transform -translate-x-1/2 -translate-y-full shadow-md"
            style={{ left: activeSpeech.x, top: activeSpeech.y }}
          >
            {activeSpeech.text}
          </div>
        )}
      </div>
    </div>
  );
};
