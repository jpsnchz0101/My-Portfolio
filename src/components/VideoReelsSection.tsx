import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  UploadCloud,
  Film,
  Sparkles,
  Loader2,
} from 'lucide-react';

export interface ReelSlot {
  index: number; // 1 to 6
  id: string;
  defaultTitle: string;
  defaultCaption: string;
  tags: string[];
}

export const REEL_SLOTS: ReelSlot[] = [
  {
    index: 1,
    id: 'reel-1',
    defaultTitle: 'Ae Breakdown | ASCII Motion',
    defaultCaption: 'After Effects VFX breakdown featuring threshold extract, halftone character matrix mapping, and dynamic typography animation.',
    tags: ['AFTER EFFECTS', 'ASCII MOTION', 'VFX BREAKDOWN', '9:16'],
  },
  {
    index: 2,
    id: 'reel-2',
    defaultTitle: 'Visual Rhythm & Pacing',
    defaultCaption: 'High-retention short-form video edit synchronized to dynamic audio transients with beat-matched cuts.',
    tags: ['PACING', 'BEAT SYNC', 'MOTION GRAPHICS', '9:16'],
  },
  {
    index: 3,
    id: 'reel-3',
    defaultTitle: 'Cinematic Visual Transitions',
    defaultCaption: 'Seamless visual whip pans, match cuts, and atmospheric lighting composition designed for mobile viewports.',
    tags: ['TRANSITIONS', 'CINEMATIC', 'COLOR GRADING', '9:16'],
  },
  {
    index: 4,
    id: 'reel-4',
    defaultTitle: 'Feralde | Commercial Product Reel',
    defaultCaption: 'Commercial product showcase featuring minimalist stone podium staging, fluid caustics, and luxury branding rhythm.',
    tags: ['PRODUCT REEL', 'FERALDE', 'COMMERCIAL', '9:16'],
  },
  {
    index: 5,
    id: 'reel-5',
    defaultTitle: 'Kinetic Typography & Audio Flow',
    defaultCaption: 'Expressive typography animation synchronized with vocal tracks and rhythmic percussive hits.',
    tags: ['TYPOGRAPHY', 'AUDIO SYNC', 'SOUND DESIGN', '9:16'],
  },
  {
    index: 6,
    id: 'reel-6',
    defaultTitle: 'Multimedia Showcase Reel',
    defaultCaption: 'Comprehensive motion design and video editing reel demonstrating high-retention visual storytelling.',
    tags: ['SHOWCASE', 'PORTFOLIO', 'DIRECTION', '9:16'],
  },
];

// Eagerly resolve any bundled static video assets if placed in src/assets/video/
const bundledVideos: Record<string, string> = (import.meta as unknown as {
  glob: (pattern: string, options: { eager: boolean; query?: string; import?: string }) => Record<string, string>;
}).glob?.(
  '/src/assets/video/*.{mp4,mov,webm,MP4,MOV,WEBM}',
  { eager: true, query: '?url', import: 'default' }
) || {};

function resolveSlotVideo(slotNum: number, customUrl?: string | null): string {
  if (customUrl) return customUrl;

  for (const [path, url] of Object.entries(bundledVideos)) {
    const filename = path.split('/').pop() || '';
    const baseName = filename.split('.')[0].toLowerCase();
    if (baseName === String(slotNum) || baseName === `reel_${slotNum}` || baseName === `video_${slotNum}`) {
      return url as string;
    }
  }

  // Fallback to static public folder direct URL
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}video/${slotNum}.mp4`;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

interface ReelCardProps {
  slot: ReelSlot;
  isPlaying: boolean;
  onTogglePlay: (id: string) => void;
  onOpenModal: (slot: ReelSlot) => void;
  customSrc: string | null;
  onSelectCustomFile: (slotIndex: number, blobUrl: string) => void;
}

/**
 * Isolated ReelCard component:
 * - Completely local progress & scrubber updates (does not re-render neighbor cards).
 * - Butter-smooth 120fps 3D tilt via CSS custom variables in requestAnimationFrame.
 * - preload="metadata" to eliminate network bottlenecks; buffers on hover or play.
 * - Race-safe play/pause promises to avoid unhandled AbortErrors.
 * - Automatic pause on scroll out of viewport via IntersectionObserver.
 */
const ReelCardComponent: React.FC<ReelCardProps> = ({
  slot,
  isPlaying,
  onTogglePlay,
  onOpenModal,
  customSrc,
  onSelectCustomFile,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const rafTiltRef = useRef<number | null>(null);

  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const posterUrl = `${cleanBase}video/posters/${slot.index}_poster.jpg`;
  const currentVideoSrc = resolveSlotVideo(slot.index, customSrc);

  // Synchronize playing state with safety against browser AbortError
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      setIsBuffering(video.readyState < 3);
      const promise = video.play();
      if (promise !== undefined) {
        playPromiseRef.current = promise;
        promise
          .then(() => {
            playPromiseRef.current = null;
            setIsBuffering(false);
          })
          .catch((err) => {
            playPromiseRef.current = null;
            setIsBuffering(false);
            if (err.name === 'NotAllowedError') {
              // Autoplay with audio was blocked by browser; force mute & retry
              video.muted = true;
              setIsMuted(true);
              video.play().catch((e) => console.warn('Muted retry notice:', e));
            } else if (err.name !== 'AbortError') {
              console.warn('Video playback warning:', err);
            }
          });
      }
    } else {
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            if (videoRef.current && !isPlaying) {
              videoRef.current.pause();
            }
          })
          .catch(() => {
            if (videoRef.current) videoRef.current.pause();
          });
      } else {
        video.pause();
      }
      setIsBuffering(false);
    }
  }, [isPlaying]);

  // Pause card if it scrolls significantly out of viewport
  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && isPlaying) {
            onTogglePlay(slot.id);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(cardEl);
    return () => observer.disconnect();
  }, [isPlaying, onTogglePlay, slot.id]);

  // Video event handlers
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const cur = video.currentTime;
    const dur = video.duration || duration || 0;
    setCurrentTime(cur);
    if (dur > 0) {
      setProgress((cur / dur) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
    setHasError(false);
  };

  // High-performance direct CSS variable 3D tilt tracking (0 React re-renders)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -3.8;
    const ry = ((x - cx) / cx) * 3.8;
    const gx = Math.round((x / rect.width) * 100);
    const gy = Math.round((y / rect.height) * 100);

    if (rafTiltRef.current) cancelAnimationFrame(rafTiltRef.current);
    rafTiltRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      cardRef.current.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      cardRef.current.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      cardRef.current.style.setProperty('--glare-x', `${gx}%`);
      cardRef.current.style.setProperty('--glare-y', `${gy}%`);
      cardRef.current.style.setProperty('--glare-opacity', '1');
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (rafTiltRef.current) cancelAnimationFrame(rafTiltRef.current);
    if (cardRef.current) {
      cardRef.current.style.setProperty('--rx', '0deg');
      cardRef.current.style.setProperty('--ry', '0deg');
      cardRef.current.style.setProperty('--glare-opacity', '0');
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const cyclePlaybackRate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    video.playbackRate = nextRate;
    if ('preservesPitch' in video) {
      (video as HTMLVideoElement & { preservesPitch: boolean }).preservesPitch = true;
    }
    setPlaybackRate(nextRate);
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const seekTime = (clickX / rect.width) * duration;

    video.currentTime = seekTime;
    setCurrentTime(seekTime);
    setProgress((seekTime / duration) * 100);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onTogglePlay(slot.id)}
      style={{
        transform: 'perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.35s ease-out',
        willChange: 'transform',
      }}
      className={`relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group select-none transition-shadow duration-300 border bg-[#0d1017] ${
        isPlaying
          ? 'border-[var(--accent-code)] shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(16,185,129,0.25)] ring-1 ring-[var(--accent-code)]/40'
          : 'border-white/15 hover:border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.65)]'
      }`}
      role="region"
      aria-label={`Video Reel 0${slot.index}: ${slot.defaultTitle}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTogglePlay(slot.id);
        }
      }}
    >
      {/* Hidden File Input for Custom Video Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const blobUrl = URL.createObjectURL(file);
            onSelectCustomFile(slot.index, blobUrl);
          }
        }}
      />

      {/* 1. Direct CSS Specular Glare (Hardware-accelerated, zero React re-render overhead) */}
      <div
        className="absolute inset-0 pointer-events-none z-20 rounded-2xl transition-opacity duration-150"
        style={{
          opacity: 'var(--glare-opacity, 0)',
          background:
            'radial-gradient(circle 280px at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.04) 40%, transparent 70%)',
        }}
      />

      {/* 2. Glass Rim Subtle Sheen */}
      <div className="absolute inset-0 pointer-events-none z-10 rounded-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),inset_0_-1px_1.5px_rgba(0,0,0,0.5)]" />

      {/* 3. HTML5 Video Element */}
      {!hasError ? (
        <>
          <video
            ref={videoRef}
            src={currentVideoSrc}
            poster={posterUrl}
            className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-300 group-hover:scale-[1.015]"
            playsInline
            loop
            preload={isHovered || isPlaying ? 'auto' : 'metadata'}
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
            onError={() => setHasError(true)}
          />

          {/* Buffering Indicator */}
          {isBuffering && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-25 bg-black/35 backdrop-blur-[2px]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 border border-white/20 text-white text-[11px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-code)]" />
                <span>Buffering...</span>
              </div>
            </div>
          )}

          {/* Center Play/Pause Disc Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 pointer-events-none z-20 ${
              isPlaying
                ? 'opacity-0 scale-90 group-hover:opacity-90 group-hover:scale-100'
                : 'opacity-95 scale-100'
            }`}
          >
            <div className="w-13 h-13 rounded-full bg-black/60 backdrop-blur-md border border-white/35 flex items-center justify-center text-white shadow-[0_8px_25px_rgba(0,0,0,0.6)]">
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </div>
          </div>
        </>
      ) : (
        /* Fallback State */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black/60 z-10">
          <div className="w-12 h-12 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center mb-3 text-[var(--accent-code)]">
            <Film className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white mb-1">
            Reel 0{slot.index}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-lg transition-colors cursor-pointer mt-2"
          >
            <UploadCloud className="w-3 h-3" />
            <span>Select Local Video</span>
          </button>
        </div>
      )}

      {/* TOP FLOATING HEADER TRAY */}
      <div className="relative z-30 flex items-center justify-between p-3 pointer-events-auto">
        {/* Slot Number & Aspect Ratio Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-[10px] shadow-sm">
          <span className="text-[var(--accent-code)] font-bold">0{slot.index}</span>
          <span className="text-white/40">·</span>
          <span className="text-white/80 font-medium">9:16</span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          {/* Speed Toggle */}
          <button
            type="button"
            onClick={cyclePlaybackRate}
            className="px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 hover:border-white/50 text-white text-[9px] font-semibold transition-colors cursor-pointer"
            title="Cycle playback speed"
          >
            {playbackRate}x
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 hover:border-white/50 text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? (
              <VolumeX className="w-3 h-3 text-red-400" />
            ) : (
              <Volume2 className="w-3 h-3 text-[var(--accent-code)]" />
            )}
          </button>

          {/* Lightbox / Expand */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(slot);
            }}
            className="p-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 hover:border-white/50 text-white transition-colors cursor-pointer"
            title="Inspect in lightbox modal"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* BOTTOM SCRUBBER & TITLE TRAY */}
      <div className="relative z-30 p-3 pt-6 bg-gradient-to-t from-black/95 via-black/75 to-transparent text-white pointer-events-auto">
        {/* Interactive Scrubber Bar */}
        <div className="mb-2">
          <div
            onClick={handleScrubberClick}
            className="w-full h-2 rounded-full bg-white/20 relative cursor-pointer group/scrub overflow-hidden border border-white/10"
            title="Click or drag to seek"
          >
            <div
              className="h-full bg-gradient-to-r from-[var(--accent-code)] via-emerald-400 to-[var(--accent-cyan)] rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-white/80 mt-1">
            <span>
              {formatTime(currentTime)} / {formatTime(duration || 15)}
            </span>
            <span
              className={`font-semibold ${
                isPlaying ? 'text-[var(--accent-code)]' : 'text-white/50'
              }`}
            >
              {isPlaying ? '● PLAYING' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Clean Title */}
        <h4 className="text-[12px] font-bold tracking-tight text-white line-clamp-1 mb-0.5">
          {slot.defaultTitle}
        </h4>
        <p className="text-[10px] text-white/70 line-clamp-1">
          {slot.defaultCaption}
        </p>
      </div>
    </div>
  );
};

// Memoize ReelCard so updates to one video don't re-render the other 5 cards
export const ReelCard = memo(ReelCardComponent);

export const VideoReelsSection: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeModalSlot, setActiveModalSlot] = useState<ReelSlot | null>(null);
  const [customSources, setCustomSources] = useState<Record<number, string | null>>({});

  const togglePlay = useCallback((id: string) => {
    setPlayingId((prev) => (prev === id ? null : id));
  }, []);

  const handleOpenModal = useCallback((slot: ReelSlot) => {
    // Pause background grid playing video when lightbox opens
    setPlayingId(null);
    setActiveModalSlot(slot);
  }, []);

  const handleSelectCustomFile = useCallback((slotIndex: number, blobUrl: string) => {
    setCustomSources((prev) => ({ ...prev, [slotIndex]: blobUrl }));
  }, []);

  return (
    <section id="multimedia" className="py-12 font-mono scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">
          <span className="text-[var(--accent-code)] font-bold">04 —</span> video reels &amp; multimedia
        </h2>
        <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" aria-hidden="true" />
      </div>

      {/* Responsive 6-Slot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REEL_SLOTS.map((slot) => (
          <ReelCard
            key={slot.id}
            slot={slot}
            isPlaying={playingId === slot.id}
            onTogglePlay={togglePlay}
            onOpenModal={handleOpenModal}
            customSrc={customSources[slot.index] || null}
            onSelectCustomFile={handleSelectCustomFile}
          />
        ))}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {activeModalSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveModalSlot(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[420px] aspect-[9/16] rounded-3xl overflow-hidden border border-white/25 bg-black shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.25)] flex flex-col justify-between p-4"
          >
            {/* Modal Video Element */}
            <video
              src={resolveSlotVideo(activeModalSlot.index, customSources[activeModalSlot.index])}
              poster={`${import.meta.env.BASE_URL || '/'}video/posters/${activeModalSlot.index}_poster.jpg`}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              controls
              playsInline
              loop
            />

            {/* Top Modal Controls */}
            <div className="relative z-30 flex items-center justify-between text-white pointer-events-auto">
              <div className="flex items-center gap-2 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/20 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-code)]" />
                <span className="font-bold">Reel 0{activeModalSlot.index}</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalSlot(null)}
                className="p-2 rounded-full bg-black/70 backdrop-blur-md border border-white/20 hover:border-white/50 text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Modal Metadata */}
            <div className="relative z-30 p-3.5 bg-black/80 backdrop-blur-md rounded-2xl border border-white/15 text-white pointer-events-auto">
              <h3 className="text-sm font-bold mb-1">{activeModalSlot.defaultTitle}</h3>
              <p className="text-xs text-white/70">{activeModalSlot.defaultCaption}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeModalSlot.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
