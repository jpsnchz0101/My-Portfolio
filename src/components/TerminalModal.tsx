import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { NodePhysicsMode } from '../types';
import { X, Terminal as TerminalIcon, CornerDownLeft } from 'lucide-react';

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetNodeMode?: (mode: NodePhysicsMode) => void;
}

interface CommandHistory {
  cmd: string;
  output: React.ReactNode;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({
  isOpen,
  onClose,
  onSetNodeMode,
}) => {
  const { theme, toggleTheme, setExplicitTheme } = useTheme();
  const [inputVal, setInputVal] = useState<string>('');
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      cmd: 'init',
      output: (
        <div>
          Welcome to <span className="text-[var(--accent-code)] font-semibold">jpsnchz.dev</span> interactive CLI.
          Type <span className="text-[var(--accent-secondary)]">help</span> for available commands.
        </div>
      ),
    },
  ]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Global key listener for cmd+k or escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // If closed, trigger open through parent or handle locally
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    const tokens = trimmed.toLowerCase().split(' ');
    const primary = tokens[0];

    let output: React.ReactNode = null;

    switch (primary) {
      case 'help':
        output = (
          <div className="space-y-1 text-[11px] text-[var(--text-secondary)]">
            <div><span className="text-[var(--accent-code)] font-semibold">help</span> — display this command cheat sheet</div>
            <div><span className="text-[var(--accent-code)] font-semibold">theme [toggle|dark|light]</span> — switch theme colors</div>
            <div><span className="text-[var(--accent-code)] font-semibold">nodes [constellation|gravity|repulsion|nebula]</span> — tune interactive background physics</div>
            <div><span className="text-[var(--accent-code)] font-semibold">about</span> — view developer bio summary</div>
            <div><span className="text-[var(--accent-code)] font-semibold">projects</span> — list featured software builds</div>
            <div><span className="text-[var(--accent-code)] font-semibold">contact</span> — navigate to contact form</div>
            <div><span className="text-[var(--accent-code)] font-semibold">clear</span> — wipe terminal screen buffer</div>
            <div><span className="text-[var(--accent-code)] font-semibold">exit</span> — close terminal window</div>
          </div>
        );
        break;

      case 'theme':
        if (tokens[1] === 'light') {
          setExplicitTheme('light');
          output = <span>Switched theme to <span className="text-amber-500 font-bold">LIGHT</span> mode.</span>;
        } else if (tokens[1] === 'dark') {
          setExplicitTheme('dark');
          output = <span>Switched theme to <span className="text-[var(--accent-secondary)] font-bold">DARK</span> mode.</span>;
        } else {
          toggleTheme();
          output = <span>Theme toggled. Current: <span className="font-bold">{theme === 'dark' ? 'light' : 'dark'}</span>.</span>;
        }
        break;

      case 'nodes':
        if (tokens[1] && ['constellation', 'gravity', 'repulsion', 'nebula'].includes(tokens[1])) {
          if (onSetNodeMode) onSetNodeMode(tokens[1] as NodePhysicsMode);
          output = <span>Canvas node physics set to <span className="text-[var(--accent-code)] font-bold">{tokens[1]}</span>.</span>;
        } else {
          output = <span>Usage: nodes [constellation | gravity | repulsion | nebula]</span>;
        }
        break;

      case 'about':
        output = (
          <div className="text-[11px] space-y-1">
            <div className="font-bold text-[var(--text-primary)]">John Paulo Sanchez</div>
            <div>Computer Engineering Student &amp; Full-Stack / Multimedia Builder</div>
            <div className="text-[var(--text-muted)]">Manila, Philippines (Available Remote)</div>
          </div>
        );
        break;

      case 'projects':
        output = (
          <div className="space-y-1 text-[11px]">
            <div>1. <span className="text-[var(--text-primary)] font-bold">LaanBayan</span>: Civic barangay asset &amp; service management portal</div>
            <div>2. <span className="text-[var(--text-primary)] font-bold">Balai</span>: Room rental &amp; boarding house ledger system</div>
            <div>3. <span className="text-[var(--text-primary)] font-bold">Short-Form Kinetic Edits</span>: High-retention video storytelling</div>
          </div>
        );
        break;

      case 'contact':
        output = <span>Navigating to contact section...</span>;
        setTimeout(() => {
          onClose();
          document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' });
        }, 400);
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      case 'exit':
      case 'quit':
        onClose();
        return;

      default:
        output = (
          <span className="text-red-400">
            command not found: {trimmed}. Type <span className="underline">help</span> for assistance.
          </span>
        );
        break;
    }

    setHistory((prev) => [...prev, { cmd: trimmed, output }]);
    setInputVal('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] select-none">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-3.5 h-3.5 text-[var(--accent-code)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              jpsnchz-terminal v2.1
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">[ esc to close ]</span>
            <button
              type="button"
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 cursor-pointer"
              aria-label="Close terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Output Screen */}
        <div ref={scrollRef} className="p-4 overflow-y-auto space-y-3 text-xs flex-1 min-h-[220px]">
          {history.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-1.5 text-[var(--accent-code)]">
                <span>visitor@jpsnchz:~$</span>
                <span className="text-[var(--text-primary)] font-medium">{item.cmd}</span>
              </div>
              <div className="pl-4 text-[var(--text-secondary)] leading-relaxed">
                {item.output}
              </div>
            </div>
          ))}
        </div>

        {/* Input Line */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(inputVal);
          }}
          className="flex items-center gap-2 px-3 py-2.5 bg-[var(--bg-card)] border-t border-[var(--border-subtle)]"
        >
          <span className="text-[var(--accent-code)] font-bold text-xs select-none">
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="type a command (e.g. help, theme, nodes gravity)..."
            className="flex-1 bg-transparent border-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
          <button
            type="submit"
            className="text-[var(--text-muted)] hover:text-[var(--accent-code)] p-1 cursor-pointer"
            title="Execute command"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
