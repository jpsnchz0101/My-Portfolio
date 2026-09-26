import React, { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Terminal, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenTerminal?: () => void;
  onToggleTelemetry?: () => void;
  telemetryActive?: boolean;
}

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'multimedia', label: 'Multimedia' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'skills', label: 'Skills' },
  { id: 'contacts', label: 'Contacts' },
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTerminal,
  onToggleTelemetry,
  telemetryActive = false,
}) => {
  const [activeSection, setActiveSection] = useState<string>('about');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Active section scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;

      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = NAV_ITEMS[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(item.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.history.pushState) {
        window.history.pushState(null, '', `#${id}`);
      }
    }
  };

  return (
    <header className="w-full pt-6 pb-4 mb-8 border-b border-dashed border-[var(--border-subtle)] relative z-20">
      <nav className="flex items-center justify-between gap-4 font-mono" aria-label="Main Navigation">
        {/* Brand / Logo */}
        <a
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('about');
          }}
          className="flex items-center gap-2 text-[var(--text-primary)] hover:opacity-80 transition-opacity flex-shrink-0 group"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent-code)] shadow-[0_0_8px_rgba(16,185,129,0.7)] group-hover:scale-125 transition-transform" />
          <span className="font-semibold text-sm tracking-tight">jpsnchz.dev</span>
        </a>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-5 text-xs text-[var(--text-secondary)] list-none">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className={`py-1 transition-colors relative hover:text-[var(--text-primary)] ${
                    isActive ? 'text-[var(--text-primary)] font-semibold' : ''
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--text-primary)]" />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right Toolbar: Creative Terminal, Telemetry & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Quick Terminal Launcher Button */}
          {onOpenTerminal && (
            <button
              type="button"
              onClick={onOpenTerminal}
              className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Open command palette / terminal (shortcut: ⌘K or ctrl+K)"
            >
              <Terminal className="w-3 h-3 text-[var(--accent-code)]" />
              <span className="text-[10px] text-[var(--text-muted)]">cmd+k</span>
            </button>
          )}

          {/* Nodes Telemetry Toggle */}
          {onToggleTelemetry && (
            <button
              type="button"
              onClick={onToggleTelemetry}
              className={`hidden sm:flex items-center gap-1 px-2 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] text-[11px] transition-colors cursor-pointer ${
                telemetryActive ? 'text-[var(--accent-code)] border-[var(--accent-code)]' : 'text-[var(--text-muted)]'
              }`}
              title="Toggle node network telemetry overlay"
            >
              <span>fx:nodes</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center gap-1 px-2 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--border-hover)] text-xs cursor-pointer"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>[ close ]</span>
              </>
            ) : (
              <>
                <Menu className="w-3.5 h-3.5" />
                <span>[ menu ]</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-xl animate-in fade-in duration-150">
          <ul className="flex flex-col gap-2.5 text-xs text-[var(--text-secondary)] list-none">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className={`block py-1.5 px-2 hover:bg-[var(--bg-card)] transition-colors ${
                    activeSection === item.id
                      ? 'text-[var(--accent-code)] font-semibold border-l-2 border-[var(--accent-code)]'
                      : ''
                  }`}
                >
                  &gt; {item.label}
                </a>
              </li>
            ))}
            {onOpenTerminal && (
              <li className="pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenTerminal();
                  }}
                  className="flex items-center gap-2 w-full text-left py-1.5 px-2 text-[var(--accent-code)] hover:bg-[var(--bg-card)]"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>&gt; Open Terminal CLI</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};
