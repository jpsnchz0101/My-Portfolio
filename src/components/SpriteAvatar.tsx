import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Eye, Sparkles, Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface Particle {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  angle: number;
  vAngle: number;
  scatterTargetX: number;
  scatterTargetY: number;
  burstSpeed: number;
}

interface SpriteAvatarProps {
  realPhotoSrc?: string;
  spriteSrc?: string;
  alt?: string;
  className?: string;
}

export const SpriteAvatar: React.FC<SpriteAvatarProps> = ({
  realPhotoSrc,
  spriteSrc,
  alt = 'John Paulo Sanchez Portrait',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const isHoveredRef = useRef<boolean>(false);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [isDispersed, setIsDispersed] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<boolean>(false);
  const [dispersalIntensity, setDispersalIntensity] = useState<number>(0);

  // Clean base URL for production & GitHub Pages
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const resolvedRealPhoto = realPhotoSrc || `${cleanBase}profile.png`;
  const resolvedSprite = spriteSrc || `${cleanBase}sprite_character.jpg`;

  // Synthesize lightweight 8-bit retro audio blip
  const playRetroSfx = useCallback((type: 'disperse' | 'assemble') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'disperse') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.14);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      }
    } catch {
      // Audio not permitted or supported
    }
  }, [soundEnabled]);

  // Sample the sprite image into 40x40 particle grid
  const initSprite = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const displaySize = 144; // 144x144 px high-density canvas
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // 40x40 sample grid for crisp 16-bit arcade resolution
    const cols = 40;
    const rows = 40;
    const offscreen = document.createElement('canvas');
    offscreen.width = cols;
    offscreen.height = rows;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    offCtx.drawImage(img, 0, 0, cols, rows);
    const imgData = offCtx.getImageData(0, 0, cols, rows).data;

    const particles: Particle[] = [];
    const cellW = displaySize / cols;
    const cellH = displaySize / rows;
    const centerX = displaySize / 2;
    const centerY = displaySize / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = (r * cols + c) * 4;
        const red = imgData[idx];
        const green = imgData[idx + 1];
        const blue = imgData[idx + 2];
        const a = imgData[idx + 3];

        if (a < 15) continue;

        const originX = c * cellW;
        const originY = r * cellH;

        // Radial vector pointing away from center
        const dx = originX + cellW / 2 - centerX;
        const dy = originY + cellH / 2 - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const dirX = dx / dist;
        const dirY = dy / dist;

        // Realistic outward blast trajectory with angular spread
        const scatterDist = 90 + Math.random() * 140;
        const angleSpread = (Math.random() - 0.5) * 1.6;
        const cosA = Math.cos(angleSpread);
        const sinA = Math.sin(angleSpread);
        const spreadDirX = dirX * cosA - dirY * sinA;
        const spreadDirY = dirX * sinA + dirY * cosA;

        particles.push({
          originX,
          originY,
          x: originX,
          y: originY,
          vx: 0,
          vy: 0,
          size: Math.ceil(cellW) + 0.4,
          color: `rgb(${red}, ${green}, ${blue})`,
          alpha: 1,
          angle: 0,
          vAngle: (Math.random() - 0.5) * 0.45,
          scatterTargetX: centerX + spreadDirX * scatterDist,
          scatterTargetY: centerY + spreadDirY * scatterDist,
          burstSpeed: 0.12 + Math.random() * 0.08,
        });
      }
    }

    particlesRef.current = particles;
    setIsLoaded(true);

    // Initial render of assembled pixel-art character
    renderStaticSprite(particles, ctx, displaySize);
  }, []);

  // Render static assembled sprite with CRT scanline details
  const renderStaticSprite = (particles: Particle[], ctx: CanvasRenderingContext2D, size: number) => {
    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.fillStyle = p.color;
      ctx.fillRect(p.originX, p.originY, p.size, p.size);
    }

    // High-tech subtle CRT scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < size; y += 4) {
      ctx.fillRect(0, y, size, 1);
    }
  };

  // High-performance physics loop (60 FPS)
  const startPhysicsLoop = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displaySize = 144;

    const animate = () => {
      ctx.clearRect(0, 0, displaySize, displaySize);

      const isHovered = isHoveredRef.current;
      const mouse = mousePosRef.current;
      const particles = particlesRef.current;
      let totalMotion = 0;

      if (isHovered) {
        // DISPERSAL MODE: Kinetic explosion away from cursor
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          let targetX = p.scatterTargetX;
          let targetY = p.scatterTargetY;

          // Interactive magnetic cursor repulsion vortex
          if (mouse) {
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
            const repelRadius = 95;

            if (mDist < repelRadius) {
              const repelForce = (1 - mDist / repelRadius) * 75;
              targetX += (mdx / mDist) * repelForce;
              targetY += (mdy / mDist) * repelForce;
            }
          }

          // Accelerate outward
          const ax = (targetX - p.x) * p.burstSpeed;
          const ay = (targetY - p.y) * p.burstSpeed;
          p.vx = (p.vx + ax) * 0.82;
          p.vy = (p.vy + ay) * 0.82;

          p.x += p.vx;
          p.y += p.vy;

          // Graceful fade out to uncover the crystal-clear real photo
          p.alpha = Math.max(0, p.alpha - 0.075);
          p.angle += p.vAngle;

          totalMotion += Math.abs(p.vx) + Math.abs(p.vy) + p.alpha;

          if (p.alpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x + p.size / 2, p.y + p.size / 2);
            if (p.angle !== 0) ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
          }
        }
      } else {
        // REASSEMBLE MODE: Elastic spring snapping back into place
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          const ax = (p.originX - p.x) * 0.22;
          const ay = (p.originY - p.y) * 0.22;
          p.vx = (p.vx + ax) * 0.70;
          p.vy = (p.vy + ay) * 0.70;

          p.x += p.vx;
          p.y += p.vy;

          p.alpha = Math.min(1, p.alpha + 0.09);
          p.angle *= 0.75;

          totalMotion += Math.abs(p.originX - p.x) + Math.abs(p.originY - p.y) + Math.abs(1 - p.alpha);

          if (p.alpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.restore();
          }
        }

        // CRT scanline overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let y = 0; y < displaySize; y += 4) {
          ctx.fillRect(0, y, displaySize, 1);
        }
      }

      // Track intensity for UI animations
      setDispersalIntensity(isHovered ? 1 : 0);

      // If fully at rest and assembled, draw clean static sprite & stop animation loop
      if (!isHovered && totalMotion < 0.25) {
        renderStaticSprite(particles, ctx, displaySize);
        animFrameRef.current = null;
        return;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Cursor Enter
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    isHoveredRef.current = true;
    setIsDispersed(true);
    playRetroSfx('disperse');

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: (e.clientX - rect.left) * (144 / rect.width),
        y: (e.clientY - rect.top) * (144 / rect.height),
      };
    }
    startPhysicsLoop();
  };

  // Cursor Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: (e.clientX - rect.left) * (144 / rect.width),
        y: (e.clientY - rect.top) * (144 / rect.height),
      };
    }
    if (!animFrameRef.current) {
      startPhysicsLoop();
    }
  };

  // Cursor Leave
  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    mousePosRef.current = null;
    setIsDispersed(false);
    playRetroSfx('assemble');
    startPhysicsLoop();
  };

  // Touch Support for mobile devices
  const handleTouchToggle = () => {
    const next = !isHoveredRef.current;
    isHoveredRef.current = next;
    setIsDispersed(next);
    playRetroSfx(next ? 'disperse' : 'assemble');

    if (next) {
      mousePosRef.current = { x: 72, y: 72 };
    } else {
      mousePosRef.current = null;
    }
    startPhysicsLoop();
  };

  // Manual Trigger Button
  const handleForceDisperse = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleTouchToggle();
  };

  // Load sprite image on mount
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = resolvedSprite;

    img.onload = () => {
      initSprite(img);
    };

    img.onerror = () => {
      // Fallback: draw pixel grid if file missing
      setIsLoaded(true);
    };

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [resolvedSprite, initSprite]);

  return (
    <div className={`relative flex flex-col items-center sm:items-start select-none ${className}`}>
      {/* Liquid Glass Monospace Bezel Frame */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleTouchToggle}
        className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl p-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/20 hover:border-white/50 shadow-[0_12px_36px_rgba(0,0,0,0.6),inset_0_1.5px_2px_rgba(255,255,255,0.3)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.75),inset_0_1.5px_3px_rgba(255,255,255,0.45)] transition-all duration-300 cursor-pointer group"
        role="button"
        tabIndex={0}
        aria-label="Interactive Sprite Character Avatar. Point cursor to disperse the sprite and view the real portrait"
        title="Point cursor to disperse the sprite character into particles and view the real photo"
      >
        {/* Inner Media Viewport */}
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#0d1117] ring-1 ring-white/10">
          {/* LAYER 1: Full-Color Real Portrait (Only visible when dispersed) */}
          <div
            className={`absolute inset-0 transition-all duration-500 transform ${
              isDispersed
                ? 'opacity-100 scale-100 filter-none'
                : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            {!photoError ? (
              <img
                src={resolvedRealPhoto}
                alt={alt}
                onError={() => setPhotoError(true)}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-tertiary)] text-[var(--accent-code)] font-mono text-xl font-bold">
                JPS
              </div>
            )}
            {/* Cinematic rim vignette on the real photo */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* LAYER 2: Sprite Character Particle Canvas (Disperses outwards on hover) */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              imageRendering: 'pixelated',
            }}
          />

          {/* LAYER 3: Specular Glass Reflection Sheen */}
          <div
            className="absolute inset-0 pointer-events-none z-20 opacity-35 group-hover:opacity-10 transition-opacity duration-300"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.02) 45%, transparent 60%)',
            }}
          />

          {/* Corner Mode Badge */}
          <div
            className={`absolute top-1.5 left-1.5 z-30 transition-opacity duration-200 pointer-events-none ${
              isDispersed ? 'opacity-0' : 'opacity-90'
            }`}
          >
            <span className="text-[8px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-black/80 border border-white/20 text-[var(--accent-cyan)] shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
              <span>SPRITE</span>
            </span>
          </div>

          {/* Dispersed Status Pill */}
          <div
            className={`absolute bottom-1.5 inset-x-1.5 flex items-center justify-center z-30 transition-all duration-200 pointer-events-none ${
              isDispersed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            <span className="text-[8px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-black/85 border border-[var(--accent-code)]/40 text-[var(--accent-code)] shadow-lg flex items-center gap-1">
              <Eye className="w-2.5 h-2.5" />
              <span>REAL PHOTO</span>
            </span>
          </div>
        </div>

        {/* Live Availability Status Pip */}
        <span
          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--accent-code)] border-2 border-[var(--bg-primary)] shadow-[0_0_8px_rgba(16,185,129,0.9)] z-40"
          title="Available for projects & roles"
        />
      </div>

      {/* Monospace Interactive HUD Bar */}
      <div className="flex items-center gap-2 mt-2 font-mono text-[10px]">
        {/* Interaction Prompt Tag */}
        {isDispersed ? (
          <span className="inline-flex items-center gap-1 text-[var(--accent-cyan)] font-semibold animate-pulse">
            <Eye className="w-3 h-3" />
            <span>DISPERSED (REAL VIEW)</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
            <Sparkles className="w-3 h-3 text-[var(--accent-code)] animate-spin-slow" />
            <span>POINT CURSOR TO DISPERSE</span>
          </span>
        )}

        {/* Audio Toggle Pip */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSoundEnabled(!soundEnabled);
          }}
          className={`p-1 rounded border transition-colors ${
            soundEnabled
              ? 'border-[var(--accent-code)] text-[var(--accent-code)] bg-[var(--accent-code)]/10'
              : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-hover)]'
          }`}
          title={soundEnabled ? 'Mute 8-bit particle sound' : 'Enable 8-bit particle sound'}
          aria-label="Toggle 8-bit particle sound"
        >
          {soundEnabled ? <Volume2 className="w-2.5 h-2.5" /> : <VolumeX className="w-2.5 h-2.5" />}
        </button>

        {/* Click / Tap to Trigger Pill for Touch */}
        <button
          type="button"
          onClick={handleForceDisperse}
          className="sm:hidden px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[9px] text-[var(--text-muted)] active:bg-white/10"
          aria-label="Toggle portrait dispersal"
        >
          <RefreshCw className="w-2.5 h-2.5 inline mr-1" />
          <span>Tap</span>
        </button>
      </div>
    </div>
  );
};
