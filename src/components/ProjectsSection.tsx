import React, { useState } from 'react';
import { PROJECTS } from '../data/portfolioData';
import { Github, ExternalLink, Code2 } from 'lucide-react';

export const ProjectsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Full-Stack Web Application', 'Property Management Utility', 'Multimedia & Video Production'];

  const filteredProjects = selectedCategory === 'all'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === selectedCategory);

  return (
    <section id="projects" className="py-10 font-mono scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">
          <span className="text-[var(--accent-code)] font-bold">03 —</span> projects
        </h2>
        <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" aria-hidden="true" />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 border transition-colors cursor-pointer text-[11px] ${
              selectedCategory === cat
                ? 'bg-[var(--accent-code)] text-black border-[var(--accent-code)] font-semibold'
                : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
            }`}
          >
            {cat === 'all' ? '[ all projects ]' : cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        {filteredProjects.map((project) => (
          <article
            key={project.id}
            className="p-5 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/20 hover:border-white/40 shadow-[0_12px_32px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.2)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_1.5px_rgba(255,255,255,0.3)] transition-all group relative overflow-hidden"
          >
            {/* Top Bar: Number + Category */}
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
              <span className="text-[var(--accent-code)] font-semibold">
                PROJECT {project.number}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[var(--accent-cyan)]">
                {project.category}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)] transition-colors mb-1">
              {project.title}
            </h3>
            <p className="text-xs text-[var(--accent-secondary)] font-medium mb-3">
              {project.subtitle}
            </p>

            {/* Description */}
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
              {project.description}
            </p>

            {/* Highlights */}
            <div className="mb-4 rounded-lg bg-black/35 backdrop-blur-md border border-white/10 p-3 shadow-inner">
              <div className="text-[11px] font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[var(--accent-code)]" />
                <span>Key Architectural Highlights</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                {project.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[var(--accent-code)] font-bold select-none">&gt;</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Bar: Tech Stack & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] px-2 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-muted)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-2 text-xs flex-shrink-0">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    <span>Code</span>
                  </a>
                )}
                {project.liveUrl && project.liveUrl !== '#' && (
                  <a
                    href={project.liveUrl}
                    className="flex items-center gap-1 px-2.5 py-1 border border-[var(--accent-code)] text-[var(--accent-code)] hover:bg-[var(--accent-code)] hover:text-black transition-colors"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
