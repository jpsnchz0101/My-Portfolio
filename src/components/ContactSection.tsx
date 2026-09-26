import React, { useState } from 'react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { Mail, Copy, Check, Send, Github, Instagram } from 'lucide-react';
import { PixelPetPlayground } from './PixelPetPlayground';

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [formStatus, setFormStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(PERSONAL_INFO.email).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormStatus({
        type: 'error',
        message: 'Please complete all required fields (Name, Email, Message).',
      });
      return;
    }

    setFormStatus({
      type: 'success',
      message: `Thank you, ${name}! Preparing email client dispatch...`,
    });

    const topic = subject.trim() || 'Portfolio Collaboration Inquiry';
    const mailtoSubject = encodeURIComponent(`[Portfolio] ${topic} — from ${name}`);
    const mailtoBody = encodeURIComponent(
      `Hello John Paulo,\n\n${message}\n\n---\nSender: ${name}\nEmail: ${email}`
    );
    const mailtoUrl = `mailto:${PERSONAL_INFO.email}?subject=${mailtoSubject}&body=${mailtoBody}`;

    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 600);
  };

  return (
    <section id="contacts" className="py-10 font-mono scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">
          <span className="text-[var(--accent-code)] font-bold">07 —</span> contacts
        </h2>
        <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Direct Info & Socials */}
        <div className="space-y-5">
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">
              Direct Inquiries
            </span>
            <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] break-all mb-3">
              {PERSONAL_INFO.email}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-code)] text-xs text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--accent-code)]" />
                    <span className="text-[var(--accent-code)] font-semibold">Copied to clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>Copy email</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${PERSONAL_INFO.email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--accent-code)] text-xs text-[var(--accent-code)] hover:bg-[var(--accent-code)] hover:text-black transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open mail client</span>
              </a>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block mb-2">
              Connect Across Platforms
            </span>
            <div className="space-y-2 text-xs">
              <a
                href="https://github.com/jpsnchz0101"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Github className="w-3.5 h-3.5" />
                  <span>github.com/jpsnchz0101</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">[ profile ↗ ]</span>
              </a>

              <a
                href="https://www.instagram.com/snchz_pauuu/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Instagram className="w-3.5 h-3.5" />
                  <span>instagram.com/snchz_pauuu</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">[ follow ↗ ]</span>
              </a>
            </div>

            {/* Minimized Pixel Pet Playground placed below Connect Across Platforms */}
            <div className="mt-3.5 pt-3 border-t border-[var(--border-subtle)]">
              <PixelPetPlayground />
            </div>
          </div>
        </div>

        {/* Right Column: Send a Message Form */}
        <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
            Send me a message
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Have a project, role, or collaboration idea? Drop a line below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs" noValidate>
            <div>
              <label htmlFor="name" className="block text-[11px] text-[var(--text-muted)] mb-1">
                Your Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Uno"
                className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-code)]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[11px] text-[var(--text-muted)] mb-1">
                Your Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@example.com"
                className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-code)]"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-[11px] text-[var(--text-muted)] mb-1">
                Topic / Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Web Engineering / Creative Project"
                className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-code)]"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-[11px] text-[var(--text-muted)] mb-1">
                Message *
              </label>
              <textarea
                id="message"
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me about your project, timeline, or idea..."
                className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-code)] resize-none"
              />
            </div>

            {formStatus.type !== 'idle' && (
              <div
                className={`p-2 text-[11px] border ${
                  formStatus.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/40 text-red-400'
                }`}
              >
                {formStatus.message}
              </div>
            )}

            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-[var(--accent-code)] text-black font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer mt-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
