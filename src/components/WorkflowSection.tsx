import React from 'react';
import { WORKFLOW_PHASES } from '../data/portfolioData';

export const WorkflowSection: React.FC = () => {
  return (
    <section id="workflow" className="py-10 font-mono scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">
          <span className="text-[var(--accent-code)] font-bold">05 —</span> workflow
        </h2>
        <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {WORKFLOW_PHASES.map((phase, idx) => (
          <div
            key={idx}
            className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-[var(--accent-code)] px-1.5 py-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  {phase.phase}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  0{idx + 1} / 04
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">
                {phase.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                {phase.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] space-y-1">
              <span className="block text-[10px] uppercase tracking-wider text-[var(--accent-secondary)]">Deliverables:</span>
              {phase.deliverables.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <span className="text-[var(--accent-code)] font-bold">✓</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
