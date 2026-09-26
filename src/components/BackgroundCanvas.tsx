import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { NodePhysicsMode } from '../types';

interface Particle {
  x: number;
  y: number;
  baseVx: number;
  baseVy: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulsePhase: number;
  hueType: 'primary' | 'accent' | 'cyan';
  hasHalo: boolean;
  isCustom?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

interface BackgroundCanvasProps {
  physicsMode?: NodePhysicsMode;
  onModeChange?: (mode: NodePhysicsMode) => void;
  showTelemetry?: boolean;
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({
  physicsMode = 'constellation',
  onModeChange,
  showTelemetry = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  const [currentMode, setCurrentMode] = useState<NodePhysicsMode>(physicsMode);
  const [nodeCount, setNodeCount] = useState<number>(75);
  const [fps, setFps] = useState<number>(60);
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);

  // Sync prop changes
  useEffect(() => {
    setCurrentMode(physicsMode);
  }, [physicsMode]);

  const handleModeSelect = useCallback((mode: NodePhysicsMode) => {
    setCurrentMode(mode);
    if (onModeChange) onModeChange(mode);
  }, [onModeChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const particles: Particle[] = [];
    const ripples: Ripple[] = [];

    // Mouse tracking with lerp & speed
    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      prevX: -2000,
      prevY: -2000,
      vx: 0,
      vy: 0,
      active: false,
      isDown: false,
    };

    function initParticles() {
      particles.length = 0;
      const count = width > 900 ? 75 : 45;
      setNodeCount(count);

      for (let i = 0; i < count; i++) {
        let bVx = (Math.random() - 0.5) * 0.32;
        let bVy = (Math.random() - 0.5) * 0.32;
        if (Math.abs(bVx) < 0.08) bVx = bVx >= 0 ? 0.12 : -0.12;
        if (Math.abs(bVy) < 0.08) bVy = bVy >= 0 ? 0.12 : -0.12;

        const rand = Math.random();
        const hueType: Particle['hueType'] = rand > 0.82 ? 'accent' : rand > 0.68 ? 'cyan' : 'primary';
        const radius = Math.random() * 1.3 + 1.1;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseVx: bVx,
          baseVy: bVy,
          vx: bVx,
          vy: bVy,
          radius,
          baseAlpha: Math.random() * 0.3 + 0.22,
          pulsePhase: Math.random() * Math.PI * 2,
          hueType,
          hasHalo: radius > 1.7,
        });
      }
    }

    function setCanvasSize() {
      const oldW = width || window.innerWidth;
      const oldH = height || window.innerHeight;

      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      if (particles.length > 0 && oldW > 0 && oldH > 0) {
        const rx = width / oldW;
        const ry = height / oldH;
        for (let i = 0; i < particles.length; i++) {
          particles[i].x *= rx;
          particles[i].y *= ry;
        }
      } else {
        initParticles();
      }
    }

    setCanvasSize();

    // Resize handler
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setCanvasSize, 120);
    };
    window.addEventListener('resize', handleResize);

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      if (!mouse.active) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -2000;
      mouse.targetY = -2000;
    };

    const handleMouseDown = () => {
      mouse.isDown = true;
    };

    const handleMouseUp = () => {
      mouse.isDown = false;
    };

    // Click to add ripple & push particles or spawn node
    const handleClick = (e: MouseEvent) => {
      // Don't trigger if clicked on interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, textarea, video, .interactive-card, [role="button"]')) {
        return;
      }

      // Add shockwave ripple
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: Math.min(width, height) * 0.24 + 40,
        alpha: 0.65,
        speed: 3.4,
      });

      // Spawn custom interconnected star node at click point
      if (particles.length < 120) {
        const bVx = (Math.random() - 0.5) * 0.4;
        const bVy = (Math.random() - 0.5) * 0.4;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          baseVx: bVx,
          baseVy: bVy,
          vx: bVx * 3,
          vy: bVy * 3,
          radius: 2.2,
          baseAlpha: 0.6,
          pulsePhase: 0,
          hueType: 'accent',
          hasHalo: true,
          isCustom: true,
        });
        setNodeCount(particles.length);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);

    // Color definitions based on theme
    const isDark = theme === 'dark';

    const getColors = () => {
      if (isDark) {
        return {
          primary: '165, 180, 252',  // Lavender / Indigo
          accent: '16, 185, 129',   // Emerald
          cyan: '56, 189, 248',     // Cyan
          line: '165, 180, 252',
          tether: '16, 185, 129',
        };
      }
      return {
        primary: '79, 70, 229',    // Indigo (High contrast on paper)
        accent: '5, 150, 105',     // Emerald
        cyan: '2, 132, 199',       // Slate Cyan
        line: '99, 102, 241',
        tether: '5, 150, 105',
      };
    };

    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    function render(currentTime: number) {
      const dt = Math.min((currentTime - lastTime) / 16.667, 2.0);
      lastTime = currentTime;

      // FPS calculation
      frameCount++;
      if (currentTime - lastFpsUpdate >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }

      ctx.clearRect(0, 0, width, height);
      const colors = getColors();

      // 1. Mouse coordinate lerp & cursor wind speed
      if (mouse.active) {
        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;
        mouse.x += (mouse.targetX - mouse.x) * 0.14;
        mouse.y += (mouse.targetY - mouse.y) * 0.14;
        mouse.vx = (mouse.x - mouse.prevX) * 0.2;
        mouse.vy = (mouse.y - mouse.prevY) * 0.2;
      }

      // 2. Ripples rendering
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed * dt;
        r.alpha -= 0.015 * dt;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${colors.accent}, ${Math.max(0, r.alpha).toFixed(3)})`;
        ctx.lineWidth = 1.3;
        ctx.stroke();

        if (r.radius > 18) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.68, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${colors.cyan}, ${Math.max(0, r.alpha * 0.45).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.restore();

        // Push nearby nodes outward
        for (let j = 0; j < particles.length; j++) {
          const p = particles[j];
          const rdx = p.x - r.x;
          const rdy = p.y - r.y;
          const rdist = Math.hypot(rdx, rdy);
          if (Math.abs(rdist - r.radius) < 26 && rdist > 2) {
            const push = 0.05 * (1 - r.radius / r.maxRadius);
            p.vx += (rdx / rdist) * push;
            p.vy += (rdy / rdist) * push;
          }
        }
      }

      // 3. Update Particle Physics based on mode
      const pad = 30;
      const mouseDistThreshold = currentMode === 'gravity' ? 240 : currentMode === 'repulsion' ? 180 : 150;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Harmonic drift
        const waveX = Math.sin(currentTime * 0.0007 + p.pulsePhase) * 0.07;
        const waveY = Math.cos(currentTime * 0.0007 + p.pulsePhase) * 0.07;

        p.x += (p.vx + waveX) * dt;
        p.y += (p.vy + waveY) * dt;

        // Wrap around smoothly
        if (p.x < -pad) p.x = width + pad;
        else if (p.x > width + pad) p.x = -pad;
        if (p.y < -pad) p.y = height + pad;
        else if (p.y > height + pad) p.y = -pad;

        // Cursor wind / vortex push
        if (mouse.active && (Math.abs(mouse.vx) > 0.4 || Math.abs(mouse.vy) > 0.4)) {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < 160 && mdist > 2) {
            const windInfluence = (1 - mdist / 160) * 0.035;
            p.vx += mouse.vx * windInfluence;
            p.vy += mouse.vy * windInfluence;
          }
        }

        // Mode-specific mouse interaction
        if (mouse.active) {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mdist = Math.hypot(mdx, mdy);

          if (mdist < mouseDistThreshold && mdist > 2) {
            const norm = 1 - mdist / mouseDistThreshold;

            if (currentMode === 'repulsion') {
              // Push nodes away like a magnetic shield
              const pushForce = norm * 0.08 * (mouse.isDown ? 2.5 : 1);
              p.vx -= (mdx / mdist) * pushForce;
              p.vy -= (mdy / mdist) * pushForce;
            } else if (currentMode === 'gravity') {
              // Orbit / swirl around cursor
              const pullForce = norm * 0.06 * (mouse.isDown ? 2.2 : 1);
              p.vx += (mdx / mdist) * pullForce;
              p.vy += (mdy / mdist) * pullForce;
              // Add slight tangential spin
              p.vx += -(mdy / mdist) * 0.04;
              p.vy += (mdx / mdist) * 0.04;
            } else {
              // Standard constellation gentle attraction
              const attractForce = norm * (mouse.isDown ? 0.08 : 0.032);
              p.vx += (mdx / mdist) * attractForce;
              p.vy += (mdy / mdist) * attractForce;

              // Draw soft tether to mouse
              const tetherAlpha = Math.pow(norm, 1.8) * (isDark ? 0.32 : 0.24);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(${colors.tether}, ${tetherAlpha.toFixed(3)})`;
              ctx.lineWidth = 0.75;
              ctx.stroke();
            }
          }
        }

        // Return smoothly to baseline velocity with friction damping
        p.vx = p.vx * 0.955 + p.baseVx * 0.045;
        p.vy = p.vy * 0.955 + p.baseVy * 0.045;
      }

      // 4. Draw Connecting Lines
      const maxLineDist = currentMode === 'nebula' ? 120 : 92;
      const maxLineDistSq = maxLineDist * maxLineDist;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;

          if (Math.abs(dx) > maxLineDist || Math.abs(dy) > maxLineDist) continue;

          const distSq = dx * dx + dy * dy;
          if (distSq < maxLineDistSq) {
            const dist = Math.sqrt(distSq);
            const ratio = 1 - dist / maxLineDist;
            const lineOpacity = (ratio * ratio * (isDark ? 0.17 : 0.13)).toFixed(3);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${colors.line}, ${lineOpacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // 5. Draw Anti-Aliased Nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pulse = Math.sin(currentTime * 0.0022 + p.pulsePhase) * 0.08;
        const currentAlpha = Math.max(0.12, Math.min(0.85, p.baseAlpha + pulse));
        const colorRgb = colors[p.hueType];

        // Glow halo for larger or custom nodes
        if (p.hasHalo || p.isCustom) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colorRgb}, ${(currentAlpha * 0.18).toFixed(3)})`;
          ctx.fill();
        }

        // Node core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorRgb}, ${currentAlpha.toFixed(3)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
    };
  }, [theme, currentMode]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-85 transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Creative Node Telemetry & Physics Controls Widget */}
      {showTelemetry && (
        <div className="fixed bottom-4 left-4 z-40 font-mono text-[11px] select-none">
          <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-2.5 py-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-code)] animate-pulse" />
            <span className="text-[var(--text-muted)]">nodes:</span>
            <span className="text-[var(--text-primary)] font-semibold">{nodeCount}</span>
            <span className="text-[var(--border-subtle)]">|</span>
            <span className="text-[var(--text-muted)]">{fps}fps</span>
            <span className="text-[var(--border-subtle)]">|</span>
            <button
              type="button"
              onClick={() => setIsControlsOpen(!isControlsOpen)}
              className="text-[var(--accent-code)] hover:underline cursor-pointer ml-1"
              title="Toggle node physics settings"
            >
              [{currentMode}]
            </button>
          </div>

          {/* Interactive Mode Dropdown */}
          {isControlsOpen && (
            <div className="mt-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-2 shadow-xl flex flex-col gap-1 w-44">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                // physics mode
              </span>
              {(['constellation', 'gravity', 'repulsion', 'nebula'] as NodePhysicsMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    handleModeSelect(mode);
                    setIsControlsOpen(false);
                  }}
                  className={`text-left px-2 py-1 transition-colors cursor-pointer text-[11px] ${
                    currentMode === mode
                      ? 'bg-[var(--accent-code)] text-black font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                  }`}
                >
                  &gt; {mode}
                </button>
              ))}
              <div className="border-t border-[var(--border-subtle)] pt-1 mt-1 text-[10px] text-[var(--text-muted)]">
                Click empty space to pulse &amp; spawn star nodes.
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
