import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

export const ThemeToggle: React.FC<{ variant?: 'minimal' | 'full' }> = ({ variant = 'minimal' }) => {
  const { theme, isSystemDefault, toggleTheme, resetToSystemTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)] transition-colors text-[var(--text-primary)] cursor-pointer"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Current mode: ${theme} (Click to toggle)`}
      >
        {theme === 'dark' ? (
          <>
            <Moon className="w-3.5 h-3.5 text-[var(--accent-secondary)]" aria-hidden="true" />
            <span className="text-[11px] font-mono tracking-tight hidden sm:inline">[ dark ]</span>
          </>
        ) : (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            <span className="text-[11px] font-mono tracking-tight hidden sm:inline">[ light ]</span>
          </>
        )}
      </button>

      {/* System preference reset button if user has manually overridden */}
      {!isSystemDefault && (
        <button
          type="button"
          onClick={resetToSystemTheme}
          className="p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          title="Reset to system color scheme"
          aria-label="Reset theme to system preference"
        >
          <Laptop className="w-3 h-3" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
