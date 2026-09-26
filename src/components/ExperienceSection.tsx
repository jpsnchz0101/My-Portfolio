import React from 'react';
import { EXPERIENCES } from '../data/portfolioData';
import { Briefcase, Calendar, MapPin } from 'lucide-react';

export const ExperienceSection: React.FC = () => {
  return (
    <section id="experience" className="py-10 font-mono scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">
          <span className="text-[var(--accent-code)] font-bold">02 —</span> experience
        </h2>
        <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" aria-hidden="true" />
      </div>

      <div className="space-y-6">
        {EXPERIENCES.map((exp) => (
          <article
            key={exp.id}
            className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-all relative group"
          >
            {/* Top Bar: Role & Period */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-code)] transition-colors">
                {exp.role}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[var(--accent-secondary)]">
                <Calendar className="w-3 h-3" />
                <span>{exp.period}</span>
              </div>
            </div>

            {/* Sub-header: Company & Location */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] mb-3">
              <div className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                <span>{exp.company}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{exp.location}</span>
              </div>
              <span>•</span>
              <span className="text-[11px] text-[var(--accent-cyan)]">{exp.type}</span>
            </div>

            {/* Description */}
            <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
              {exp.description}
            </p>

            {/* Bullets */}
            <ul className="space-y-1.5 mb-4 text-xs text-[var(--text-secondary)]">
              {exp.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[var(--accent-code)] font-bold select-none">&gt;</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Tech Tags */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
              {exp.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
