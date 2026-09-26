import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ScrollProgressIndicator } from './components/ScrollProgressIndicator';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ProjectsSection } from './components/ProjectsSection';
import { VideoReelsSection } from './components/VideoReelsSection';
import { WorkflowSection } from './components/WorkflowSection';
import { SkillsSection } from './components/SkillsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { TerminalModal } from './components/TerminalModal';
import { NodePhysicsMode } from './types';

export function AppContent() {
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true);
  const [nodePhysicsMode, setNodePhysicsMode] = useState<NodePhysicsMode>('constellation');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative selection:bg-[var(--accent-code)] selection:text-black">
      {/* Subtle Horizontal Reading Progress Indicator at top of viewport */}
      <ScrollProgressIndicator />

      {/* Interactive Background Canvas (Smooth High-DPI Constellation Nodes) */}
      <BackgroundCanvas
        physicsMode={nodePhysicsMode}
        onModeChange={setNodePhysicsMode}
        showTelemetry={showTelemetry}
      />

      {/* Main Responsive Container (Strict single-column layout, max-w ~760px) */}
      <div className="container max-w-[760px] mx-auto px-4 sm:px-6 relative z-10">
        <Navbar
          onOpenTerminal={() => setIsTerminalOpen(true)}
          onToggleTelemetry={() => setShowTelemetry((prev) => !prev)}
          telemetryActive={showTelemetry}
        />

        <main className="space-y-4">
          <HeroSection />
          <ExperienceSection />
          <ProjectsSection />
          <VideoReelsSection />
          <WorkflowSection />
          <SkillsSection />
          <ContactSection />
        </main>

        <Footer />
      </div>

      {/* Retro Interactive Terminal CLI Modal */}
      <TerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onSetNodeMode={setNodePhysicsMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
