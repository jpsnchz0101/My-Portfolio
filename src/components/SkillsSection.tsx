import React, { useState } from 'react';
import { SKILLS_LIST } from '../data/portfolioData';
import { Search } from 'lucide-react';

export const SkillsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Skills' },
    { id: 'web', label: 'Web Development' },
    { id: 'backend', label: 'Backend & Data' },
    { id: 'multimedia', label: 'Multimedia & Video' },
    { id: 'tools', label: 'Engineering Tools' },
    { id: 'ai', label: 'AI Workflows' },
  ];

  const filteredSkills = SKILLS_LIST.filter((skill) => {
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesQuery = searchQuery === '' ||
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <section id="skills" className="py-10 font-mono scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">
          <span className="text-[var(--accent-code)] font-bold">06 —</span> skills
        </h2>
        <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" aria-hidden="true" />
      </div>

      {/* Controls: Category Filter + Search Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[var(--accent-code)] text-black border-[var(--accent-code)] font-semibold'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="filter skills..."
            className="w-full pl-8 pr-2.5 py-1 text-xs bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-code)]"
          />
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSkills.map((skill, idx) => (
          <div
            key={idx}
            className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {skill.name}
                </span>
                {skill.level && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--accent-cyan)]">
                    {skill.level}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                {skill.description}
              </p>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-[var(--border-subtle)] text-[10px] text-[var(--accent-secondary)]">
              // {skill.categoryLabel}
            </div>
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-8 text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)]">
          No skills matching "{searchQuery}" in this category.
        </div>
      )}
    </section>
  );
};
