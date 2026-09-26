import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  RotateCcw,
  UploadCloud,
  Film,
  Sparkles,
} from 'lucide-react';

interface ReelSlot {
  index: number; // 1 to 6
  id: string;
  defaultTitle: string;
  defaultCaption: string;
  tags: string[];
}

const REEL_SLOTS: ReelSlot[] = [
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

// Vite glob resolver for static assets in src/assets/video/
const bundledVideos: Record<string, string> = (import.meta as unknown as {
  glob: (pattern: string, options: { eager: boolean; query: string; import: string }) => Record<string, string>;
}).glob?.(
  '/src/assets/video/*.{mp4,mov,webm,MP4,MOV,WEBM}',
  { eager: true, query: '?url', import: 'default' }
) || {};

function getBundledVideo(slotNum: number): string | null {
  for (const [path, url] of Object.entries(bundledVideos)) {
    const filename = path.split('/').pop() || '';
    const baseName = filename.split('.')[0].toLowerCase();
    if (baseName === String(slotNum) || baseName === `reel_${slotNum}` || baseName === `video_${slotNum}`) {
      return url as string;
    }
  }
  return null;
}

export const VideoReelsSection: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({
    'reel-1': true,
    'reel-2': true,
    'reel-3': true,
    'reel-4': true,
    'reel-5': true,
    'reel-6': true,
  });

  // Track active sources for slots 1 through 6
  const [activeSources, setActiveSources] = useState<Record<number, string | null>>(() => {
    const initial: Record<number, string | null> = {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
    };
    for (let i = 1; i <= 6; i++) {
      const bundled = getBundledVideo(i);
      if (bundled) {
        initial[i] = bundled;
      }
    }
    return initial;
  });

  // Playback state per slot
  const [progresses, setProgresses] = useState<Record<number, number>>({});
  const [currentTimes, setCurrentTimes] = useState<Record<number, string>>({});
  const [durations, setDurations] = useState<Record<number, string>>({});
  const [rawDurations, setRawDurations] = useState<Record<number, number>>({});
  const [playbackRates, setPlaybackRates] = useState<Record<number, number>>({
    1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1,
  });

  // 3D Glass tilt & cursor glare tracking
  const [glareStates, setGlareStates] = useState<Record<number, { x: number; y: number; rx: number; ry: number; active: boolean }>>({});

  // Lightbox / Modal inspect state
  const [activeModalSlot, setActiveModalSlot] = useState<ReelSlot | null>(null);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  // Discover video files on server
  const testCandidateUrls = useCallback(async (slotNum: number): Promise<string | null> => {
    const bundled = getBundledVideo(slotNum);
    if (bundled) return bundled;

    const candidates = [
      `/video/${slotNum}.mp4`,
      `/src/assets/video/${slotNum}.mp4`,
      `/assets/video/${slotNum}.mp4`,
      `/video/${slotNum}.mov`,
      `/src/assets/video/${slotNum}.mov`,
      `/assets/video/${slotNum}.mov`,
      `/video/${slotNum}.webm`,
      `/src/assets/video/${slotNum}.webm`,
      `/videos/${slotNum}.mp4`,
    ];

    for (const url of candidates) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && res.status === 200 && !contentType.includes('text/html')) {
          return url;
        }
      } catch {
        // Continue
      }
    }
    return null;
  }, []);

  const scanForVideos = useCallback(async () => {
    for (let i = 1; i <= 6; i++) {
      if (activeSources[i]?.startsWith('blob:')) continue;
      const foundUrl = await testCandidateUrls(i);
      if (foundUrl && foundUrl !== activeSources[i]) {
        setActiveSources((prev) => ({ ...prev, [i]: foundUrl }));
      }
    }
  }, [activeSources, testCandidateUrls]);

  useEffect(() => {
    scanForVideos();
    const interval = setInterval(scanForVideos, 5000);
    return () => clearInterval(interval);
  }, [scanForVideos]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlay = (id: string, slotNum: number) => {
    const video = videoRefs.current[id];
    if (!video || !activeSources[slotNum]) {
      fileInputRefs.current[slotNum]?.click();
      return;
    }

    if (playingId === id) {
      video.pause();
      setPlayingId(null);
    } else {
      // Pause all other videos
      Object.entries(videoRefs.current).forEach(([otherId, otherVideo]) => {
        const otherEl = otherVideo as HTMLVideoElement | null;
        if (otherId !== id && otherEl && !otherEl.paused) {
          otherEl.pause();
        }
      });

      video.play().then(() => {
        setPlayingId(id);
      }).catch((err) => {
        console.warn('Playback notice:', err);
      });
    }
  };

  const toggleMute = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const video = videoRefs.current[id];
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMutedStates((prev) => ({ ...prev, [id]: nextMuted }));
  };

  const cyclePlaybackRate = (e: React.MouseEvent, id: string, slotNum: number) => {
    e.stopPropagation();
    const video = videoRefs.current[id];
    if (!video) return;

    const rates = [1, 1.25, 1.5, 2];
    const current = playbackRates[slotNum] || 1;
    const nextRate = rates[(rates.indexOf(current) + 1) % rates.length];

    video.playbackRate = nextRate;
    setPlaybackRates((prev) => ({ ...prev, [slotNum]: nextRate }));
  };

  const handleTimeUpdate = (slotNum: number, e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration && !isNaN(video.duration)) {
      const prog = (video.currentTime / video.duration) * 100;
      setProgresses((prev) => ({ ...prev, [slotNum]: prog }));
      setCurrentTimes((prev) => ({ ...prev, [slotNum]: formatTime(video.currentTime) }));
    }
  };

  const handleLoadedMetadata = (slotNum: number, e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration && !isNaN(video.duration)) {
      setRawDurations((prev) => ({ ...prev, [slotNum]: video.duration }));
      setDurations((prev) => ({ ...prev, [slotNum]: formatTime(video.duration) }));
    }
  };

  // Interactive scrubber seek
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>, id: string, slotNum: number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const video = videoRefs.current[id];
    if (video && video.duration) {
      video.currentTime = pct * video.duration;
      setProgresses((prev) => ({ ...prev, [slotNum]: pct * 100 }));
    }
  };

  // 3D Liquid Tilt & Glare Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, slotNum: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Subtle 3D tilt (-4 to +4 degrees)
    const rx = ((y - cy) / cy) * -4.5;
    const ry = ((x - cx) / cx) * 4.5;

    setGlareStates((prev) => ({
      ...prev,
      [slotNum]: {
        x: Math.round((x / rect.width) * 100),
        y: Math.round((y / rect.height) * 100),
        rx,
        ry,
        active: true,
      },
    }));
  };

  const handleMouseLeave = (slotNum: number) => {
    setGlareStates((prev) => ({
      ...prev,
      [slotNum]: { x: 50, y: 50, rx: 0, ry: 0, active: false },
    }));
  };

  // Open modal lightbox
  const openModal = (e: React.MouseEvent, slot: ReelSlot) => {
    e.stopPropagation();
    setActiveModalSlot(slot);
  };

  return (
    <section id="multimedia" className="py-12 font-mono scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">
          <span className="text-[var(--accent-code)] font-bold">04 —</span> video reels &amp; multimedia
        </h2>
        <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" aria-hidden="true" />
      </div>

      <div>
        {/* 6-Panel Liquid Glass Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REEL_SLOTS.map((slot) => {
            const isPlaying = playingId === slot.id;
            const isMuted = mutedStates[slot.id] ?? true;
            const currentSrc = activeSources[slot.index];
            const currentProgress = progresses[slot.index] || 0;
            const timeDisplay = `${currentTimes[slot.index] || '0:00'} / ${durations[slot.index] || '0:15'}`;
            const currentRate = playbackRates[slot.index] || 1;
            const posterUrl = `/video/posters/${slot.index}_poster.jpg`;
            const glare = glareStates[slot.index] || { x: 50, y: 50, rx: 0, ry: 0, active: false };

            return (
              <div
                key={slot.id}
                onMouseMove={(e) => handleMouseMove(e, slot.index)}
                onMouseLeave={() => handleMouseLeave(slot.index)}
                onClick={() => togglePlay(slot.id, slot.index)}
                style={{
                  transform: `perspective(900px) rotateX(${glare.rx}deg) rotateY(${glare.ry}deg)`,
                  transition: glare.active ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
                }}
                className={`relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group transition-all duration-300 select-none ${
                  isPlaying
                    ? 'shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_30px_rgba(34,197,94,0.3)] border-white/45'
                    : 'shadow-[0_12px_36px_rgba(0,0,0,0.45)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)] border-white/20 hover:border-white/45'
                } border bg-white/[0.04] backdrop-blur-2xl`}
                role="region"
                aria-label={`Liquid Glass Reel ${slot.index}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    togglePlay(slot.id, slot.index);
                  }
                }}
              >
                {/* Hidden File Input for Direct Local Selection */}
                <input
                  ref={(el) => (fileInputRefs.current[slot.index] = el)}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const blobUrl = URL.createObjectURL(file);
                      setActiveSources((prev) => ({ ...prev, [slot.index]: blobUrl }));
                    }
                  }}
                />

                {/* 1. DYNAMIC SPECULAR GLARE LAYER (tracks mouse cursor on top of video) */}
                <div
                  className="absolute inset-0 pointer-events-none z-20 rounded-2xl transition-opacity duration-150"
                  style={{
                    background: glare.active
                      ? `radial-gradient(circle 260px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.06) 40%, transparent 70%)`
                      : 'transparent',
                  }}
                />

                {/* 2. LIQUID CURVED LENS GLOSS (Apple-style frosted glass sheen) */}
                <div
                  className="absolute inset-0 pointer-events-none z-10 rounded-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.06) 30%, transparent 60%)',
                  }}
                />

                {/* 3. LIQUID DOUBLE-BEVEL INNER RIM HIGHLIGHT */}
                <div className="absolute inset-0 pointer-events-none z-30 rounded-2xl shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),inset_0_-1.5px_2px_rgba(0,0,0,0.6)]" />

                {/* VIDEO ELEMENT IF SOURCE AVAILABLE */}
                {currentSrc ? (
                  <>
                    <video
                      ref={(el) => (videoRefs.current[slot.id] = el)}
                      key={currentSrc}
                      src={currentSrc}
                      poster={posterUrl}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      playsInline
                      loop
                      preload="auto"
                      muted={isMuted}
                      onTimeUpdate={(e) => handleTimeUpdate(slot.index, e)}
                      onLoadedMetadata={(e) => handleLoadedMetadata(slot.index, e)}
                      onEnded={() => setPlayingId(null)}
                    />

                    {/* LIQUID CENTER PLAY/PAUSE DISC */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-200 pointer-events-none z-20 ${
                        isPlaying ? 'opacity-0 scale-90 group-hover:opacity-95 group-hover:scale-100' : 'opacity-95 scale-100'
                      }`}
                    >
                      <div className="w-13 h-13 rounded-full bg-black/50 backdrop-blur-xl border border-white/40 flex items-center justify-center text-white shadow-[0_8px_25px_rgba(0,0,0,0.6),inset_0_1.5px_2px_rgba(255,255,255,0.5)]">
                        {isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Placeholder State */
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black/45 backdrop-blur-xl z-10">
                    <div className="w-12 h-12 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 text-[var(--accent-code)] shadow-inner">
                      <Film className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white mb-1">
                      video/{slot.index}.mp4
                    </span>
                    <span className="text-[10px] text-white/60 mb-3">
                      Slot 0{slot.index}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRefs.current[slot.index]?.click();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <UploadCloud className="w-3 h-3" />
                      <span>Select Video</span>
                    </button>
                  </div>
                )}

                {/* TOP FLOATING LIQUID GLASS HEADER BAR */}
                <div className="relative z-30 flex items-center justify-between p-3 pointer-events-auto">
                  {/* Slot & Ratio Liquid Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-xl border border-white/25 text-white text-[10px] shadow-md">
                    <span className="text-[var(--accent-code)] font-bold">0{slot.index}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/80">9:16</span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Speed Toggle */}
                    {currentSrc && (
                      <button
                        type="button"
                        onClick={(e) => cyclePlaybackRate(e, slot.id, slot.index)}
                        className="px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-xl border border-white/25 hover:border-white/50 text-white text-[9px] transition-colors cursor-pointer"
                        title="Cycle playback speed"
                      >
                        {currentRate}x
                      </button>
                    )}

                    {/* Sound Button */}
                    {currentSrc && (
                      <button
                        type="button"
                        onClick={(e) => toggleMute(e, slot.id)}
                        className="p-1.5 rounded-full bg-black/55 backdrop-blur-xl border border-white/25 hover:border-white/50 text-white transition-colors cursor-pointer"
                        title={isMuted ? 'Unmute audio' : 'Mute audio'}
                      >
                        {isMuted ? (
                          <VolumeX className="w-3 h-3 text-red-400" />
                        ) : (
                          <Volume2 className="w-3 h-3 text-[var(--accent-code)]" />
                        )}
                      </button>
                    )}

                    {/* Lightbox / Expand Button */}
                    {currentSrc && (
                      <button
                        type="button"
                        onClick={(e) => openModal(e, slot)}
                        className="p-1.5 rounded-full bg-black/55 backdrop-blur-xl border border-white/25 hover:border-white/50 text-white transition-colors cursor-pointer"
                        title="Expand liquid view"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* BOTTOM LIQUID GLASS SCRUBBER & TITLE TRAY */}
                <div className="relative z-30 p-3 pt-6 bg-gradient-to-t from-black/95 via-black/75 to-transparent text-white pointer-events-auto">
                  {/* Interactive Liquid Time Scrubber */}
                  {currentSrc && (
                    <div className="mb-2">
                      <div
                        onClick={(e) => handleScrubberClick(e, slot.id, slot.index)}
                        className="w-full h-2 rounded-full bg-white/20 backdrop-blur-sm relative cursor-pointer group/scrub overflow-hidden border border-white/15"
                        title="Click to seek"
                      >
                        <div
                          className="h-full bg-gradient-to-r from-[var(--accent-code)] via-emerald-400 to-[var(--accent-cyan)] rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(34,197,94,0.7)]"
                          style={{ width: `${currentProgress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-white/75 mt-1">
                        <span>{timeDisplay}</span>
                        <span className="text-[var(--accent-code)] font-semibold">
                          {isPlaying ? '● LIVE' : 'PAUSED'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Clean Title */}
                  <h4 className="text-[12px] font-bold tracking-tight text-white line-clamp-1">
                    {slot.defaultTitle}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULLSCREEN LIQUID GLASS LIGHTBOX MODAL */}
      {activeModalSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn"
          onClick={() => setActiveModalSlot(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[420px] aspect-[9/16] rounded-3xl overflow-hidden border border-white/30 bg-black/60 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(34,197,94,0.3)] flex flex-col justify-between p-4"
          >
            {/* Modal Inner Glass Rim */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.6)] z-20" />

            {/* Video Player */}
            {activeSources[activeModalSlot.index] && (
              <video
                ref={modalVideoRef}
                src={activeSources[activeModalSlot.index]!}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                controls
                playsInline
                loop
              />
            )}

            {/* Top Modal Controls */}
            <div className="relative z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-code)]" />
                <span className="font-bold">Reel 0{activeModalSlot.index}</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalSlot(null)}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/50 text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Modal Footer */}
            <div className="relative z-30 p-3 bg-black/70 backdrop-blur-md rounded-2xl border border-white/15 text-white">
              <h3 className="text-sm font-bold">{activeModalSlot.defaultTitle}</h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
