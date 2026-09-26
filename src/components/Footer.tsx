import React from 'react';
import { ArrowUp, Terminal, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full pt-8 pb-14 mt-14 border-t border-[var(--border-subtle)] font-mono text-xs text-[var(--text-muted)]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-center sm:text-left text-[11px]">
          <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
            <Terminal className="w-3.5 h-3.5 text-[var(--accent-code)]" />
            <span>John Paulo Sanchez</span>
          </span>
          <span className="text-[var(--border-subtle)]">•</span>
          <span>© 2026</span>
          <span className="text-[var(--border-subtle)]">•</span>
          <span className="inline-flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-2.5 h-2.5 text-red-500 fill-current" />
            <span>&amp; TypeScript</span>
          </span>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-code)] text-[var(--text-primary)] hover:text-[var(--accent-code)] transition-colors rounded text-[11px] cursor-pointer"
          aria-label="Back to top of page"
        >
          <ArrowUp className="w-3 h-3 text-[var(--accent-code)]" />
          <span>[ back to top ↑ ]</span>
        </button>
      </div>
    </footer>
  );
};
