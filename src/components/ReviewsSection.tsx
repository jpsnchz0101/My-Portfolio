import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CUSTOMER_REVIEWS } from '../data/reviewsData';
import { ReviewItem } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  CheckCircle2,
  Play,
  Pause,
  Award,
} from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Filter reviews by category
  const filteredReviews: ReviewItem[] = CUSTOMER_REVIEWS.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.serviceCategory === activeCategory;
  });

  // Clamp index if filtered reviews change
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  const totalReviews = filteredReviews.length;
  const currentReview = filteredReviews[currentIndex] || filteredReviews[0];

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalReviews - 1 : prev - 1));
  }, [totalReviews]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalReviews - 1 ? 0 : prev + 1));
  }, [totalReviews]);

  // Autoplay timer with pause on hover
  useEffect(() => {
    if (!isAutoplay || isHovered || totalReviews <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5500);

    return () => clearInterval(interval);
  }, [isAutoplay, isHovered, handleNext, totalReviews]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  const categories = [
    { id: 'all', label: 'All Reviews' },
    { id: 'web', label: 'Web Development' },
    { id: 'multimedia', label: 'Multimedia & Reels' },
    { id: 'design', label: 'UI/UX & Branding' },
  ];

  return (
    <section
      id="reviews"
      className="py-10 font-mono scroll-mt-20 outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Customer Reviews Section"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">
          <span className="text-[var(--accent-code)] font-bold">07 —</span> customer reviews
        </h2>
        <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" aria-hidden="true" />
      </div>

      {/* Meta Banner: Rating & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 mb-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs">
        <div className="flex items-center gap-2">
          <div className="flex text-[#7aa2f7]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-[#7aa2f7]" />
            ))}
          </div>
          <span className="font-bold text-[var(--text-primary)]">5.0 / 5.0</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--text-secondary)]">
            Verified Client Endorsements ({CUSTOMER_REVIEWS.length})
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <Award className="w-3.5 h-3.5 text-[var(--accent-code)]" />
          <span>100% Client Satisfaction &amp; Timely Delivery</span>
        </div>
      </div>

      {/* Category Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[var(--accent-code)]/15 border-[var(--accent-code)] text-[var(--accent-code)] font-semibold'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              [ {cat.label} ]
            </button>
          ))}
        </div>

        {/* Carousel Pagination & Play/Pause Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoplay((prev) => !prev)}
            className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-code)] text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition-colors cursor-pointer"
            title={isAutoplay ? 'Pause auto-slide' : 'Resume auto-slide'}
          >
            {isAutoplay ? (
              <>
                <Pause className="w-2.5 h-2.5 text-[var(--accent-code)]" />
                <span className="hidden sm:inline">Auto</span>
              </>
            ) : (
              <>
                <Play className="w-2.5 h-2.5 text-[var(--accent-code)]" />
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </button>

          <span className="text-[11px] text-[var(--text-muted)] font-mono px-1">
            <span className="text-[var(--accent-code)] font-bold">0{currentIndex + 1}</span>
            <span> / 0{totalReviews}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-code)] hover:text-[var(--accent-code)] text-[var(--text-primary)] rounded transition-colors cursor-pointer"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-code)] hover:text-[var(--accent-code)] text-[var(--text-primary)] rounded transition-colors cursor-pointer"
              aria-label="Next review"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Carousel Display Box */}
      <div
        className="relative overflow-hidden rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/20 shadow-[0_12px_32px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.2)] p-6 sm:p-7 select-none transition-all"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Subtle Specular Reflection Sheen */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl opacity-40"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)',
          }}
        />

        {/* Autoplay Linear Progress Bar */}
        {isAutoplay && !isHovered && totalReviews > 1 && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden">
            <div
              key={currentIndex}
              className="h-full bg-[var(--accent-code)] transition-all duration-[5500ms] ease-linear w-full animate-[progress_5500ms_linear]"
            />
          </div>
        )}

        {/* Carousel Content */}
        <div className="relative z-10 space-y-5">
          {/* Top Row: Quotation Icon & Star Rating */}
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-code)]/10 border border-[var(--accent-code)]/30 flex items-center justify-center text-[var(--accent-code)]">
              <Quote className="w-4 h-4 fill-current" />
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 border border-white/15">
              <div className="flex text-[#7aa2f7]">
                {[...Array(currentReview.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-[#7aa2f7]" />
                ))}
              </div>
              <span className="text-[10px] text-[var(--accent-code)] font-bold">
                {currentReview.rating}.0
              </span>
            </div>
          </div>

          {/* Testimonial Quote */}
          <blockquote className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed italic font-normal">
            &ldquo;{currentReview.comment}&rdquo;
          </blockquote>

          {/* Project Scope Tag */}
          <div className="pt-2">
            <span className="text-[11px] text-[var(--text-muted)]">
              <strong className="text-[var(--text-secondary)] font-normal">Scope:</strong>{' '}
              <span className="text-[var(--accent-code)]">{currentReview.projectScope}</span>
            </span>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-white/10" />

          {/* Author Details Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              {/* Monospace Avatar */}
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] border border-[var(--accent-code)]/40 flex items-center justify-center text-xs font-bold text-[var(--accent-code)] shadow-inner">
                {currentReview.avatarInitials}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    {currentReview.name}
                  </h4>
                  {currentReview.verified && (
                    <span
                      className="inline-flex items-center text-[10px] text-emerald-400 gap-0.5"
                      title="Verified Client Collaboration"
                    >
                      <CheckCircle2 className="w-3 h-3 fill-emerald-500/20" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {currentReview.role} · <span className="text-[var(--text-secondary)]">{currentReview.company}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center text-[10px] text-[var(--text-muted)]">
              <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10">
                {currentReview.date}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails Navigation Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
        {filteredReviews.map((rev, idx) => (
          <button
            key={rev.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              idx === currentIndex
                ? 'bg-[var(--accent-code)]/15 border-[var(--accent-code)] shadow-[0_0_12px_rgba(122,162,247,0.2)]'
                : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)] opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between text-[9px] text-[var(--text-muted)] mb-1">
              <span>0{idx + 1}</span>
              <span className="text-[var(--accent-code)]">★ 5.0</span>
            </div>
            <div className="text-[11px] font-semibold text-[var(--text-primary)] truncate">
              {rev.name}
            </div>
            <div className="text-[9px] text-[var(--text-muted)] truncate">{rev.company}</div>
          </button>
        ))}
      </div>
    </section>
  );
};
