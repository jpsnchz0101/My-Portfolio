import React, { useState } from 'react';
import { PERSONAL_INFO, CORE_TECH_STACK, AI_TOOLS } from '../data/portfolioData';
import { Github, Instagram, ArrowUpRight, Mail } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="about" className="pt-2 pb-12 font-mono scroll-mt-20">
      {/* Section Number Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">
          <span className="text-[var(--accent-code)] font-bold">01 —</span> about
        </h2>
        <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" aria-hidden="true" />
      </div>

      {/* Hero Header: Avatar + Meta */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
        {/* Profile Avatar Frame */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-1 shadow-sm">
          {!imgError ? (
            <img
              src="/profile.png"
              alt="Portrait of John Paulo Sanchez"
              className="w-full h-full object-cover grayscale contrast-110 hover:grayscale-0 transition-all duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--accent-code)] font-bold text-lg">
              JPS
            </div>
          )}
          {/* Status pip indicator */}
          <span
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--accent-code)] border-2 border-[var(--bg-primary)] shadow-[0_0_6px_rgba(16,185,129,0.8)]"
            title="Available for projects & roles"
          />
        </div>

        {/* Identity & Headline */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {PERSONAL_INFO.name}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--accent-secondary)] mt-1 font-medium">
            {PERSONAL_INFO.roleSubtitle}
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-[var(--text-muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
            <span>{PERSONAL_INFO.location}</span>
          </div>
        </div>
      </div>

      {/* Intro Bio Paragraphs */}
      <div className="text-xs sm:text-[13px] leading-relaxed text-[var(--text-secondary)] space-y-3 mb-7 border-l-2 border-[var(--border-subtle)] pl-3.5">
        <p>{PERSONAL_INFO.bio}</p>
        <p>{PERSONAL_INFO.secondaryBio}</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {PERSONAL_INFO.stats.map((stat, i) => (
          <div
            key={i}
            className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-colors text-center sm:text-left"
          >
            <div className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {stat.value}
            </div>
            <div className="text-[10px] sm:text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Social & Action Links */}
      <div className="flex flex-wrap items-center gap-2.5 mb-9 text-xs">
        <a
          href="https://github.com/jpsnchz0101"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)] transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub</span>
          <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)]" />
        </a>

        <a
          href="https://www.instagram.com/snchz_pauuu/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)] transition-colors"
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>Instagram</span>
          <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)]" />
        </a>

        <a
          href="#contacts"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--accent-code)] text-[var(--accent-code)] hover:bg-[var(--accent-code)] hover:text-black transition-colors ml-auto"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Get in touch</span>
        </a>
      </div>

      {/* Primary Stack & Arsenal */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-[var(--text-primary)] tracking-wide flex items-center gap-1.5">
            <span className="text-[var(--accent-code)]">&gt;</span> Primary Stack &amp; Tools Arsenal
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">[ 14 core tools ]</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CORE_TECH_STACK.map((tech) => (
            <span
              key={tech.name}
              className="text-[11px] px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors"
            >
              {tech.name}
            </span>
          ))}
        </div>
      </div>

      {/* AI Models & Intelligent Tools */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-[var(--text-primary)] tracking-wide flex items-center gap-1.5">
            <span className="text-[var(--accent-cyan)]">&gt;</span> AI Models &amp; Intelligent Tools
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">[ augmentation ]</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {AI_TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col"
            >
              <span className="text-xs font-semibold text-[var(--text-primary)]">{tool.name}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{tool.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
