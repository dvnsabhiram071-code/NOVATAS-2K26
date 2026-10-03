import React, { useState, useEffect } from 'react';
import { ParticleCanvas } from './ParticleCanvas';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LetterConfig {
  char: string;
  color: string;
  glowClass: string;
  name: string;
  effect: string;
}

const LETTERS: LetterConfig[] = [
  { char: 'N', color: '#00E5FF', glowClass: 'neon-glow-cyan', name: 'Electric Cyan', effect: 'scale-up' },
  { char: 'O', color: '#2979FF', glowClass: 'neon-glow-blue', name: 'Electric Blue', effect: 'light-streak' },
  { char: 'V', color: '#7C4DFF', glowClass: 'neon-glow-violet', name: 'Violet', effect: 'slight-rotate' },
  { char: 'A', color: '#FF2BD6', glowClass: 'neon-glow-magenta', name: 'Neon Magenta', effect: 'particle-burst' },
  { char: 'T', color: '#FF3D71', glowClass: 'neon-glow-pink', name: 'Hot Pink / Red', effect: 'light-sweep' },
  { char: 'A', color: '#FF7A00', glowClass: 'neon-glow-orange', name: 'Electric Orange', effect: 'sparks' },
  { char: 'S', color: '#FFE600', glowClass: 'neon-glow-yellow', name: 'Neon Yellow', effect: 'strong-burst' },
];

const YEAR_LETTERS = [
  { char: '2', color: '#00E5FF', glowClass: 'neon-glow-cyan' },
  { char: 'K', color: '#7C4DFF', glowClass: 'neon-glow-violet' },
  { char: '2', color: '#FF2BD6', glowClass: 'neon-glow-magenta' },
  { char: '6', color: '#FFE600', glowClass: 'neon-glow-yellow' },
];

export const OpeningAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [revealedLettersCount, setRevealedLettersCount] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [hasRainbowSweep, setHasRainbowSweep] = useState<boolean>(false);
  const [revealedYearCount, setRevealedYearCount] = useState<number>(0);
  const [showSubtitle, setShowSubtitle] = useState<boolean>(false);
  const [isTransitioningOut, setIsTransitioningOut] = useState<boolean>(false);
  const [currentBurstColor, setCurrentBurstColor] = useState<string>('#00E5FF');
  const [burstTrigger, setBurstTrigger] = useState<number>(0);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    // Timeline based on specification:
    // 0.3s -> N (Cyan)
    // 0.6s -> O (Blue)
    // 0.9s -> V (Violet)
    // 1.2s -> A (Magenta)
    // 1.5s -> T (Pink)
    // 1.8s -> A (Orange)
    // 2.1s -> S (Yellow)
    LETTERS.forEach((item, index) => {
      const delay = 300 + index * 300;
      timeouts.push(
        setTimeout(() => {
          setRevealedLettersCount(index + 1);
          setCurrentBurstColor(item.color);
          setBurstTrigger(Date.now());
        }, delay)
      );
    });

    // 2.5s: Letters smoothly lock together
    timeouts.push(
      setTimeout(() => {
        setIsLocked(true);
      }, 2500)
    );

    // 2.8s: Rainbow light sweep across NOVATAS
    timeouts.push(
      setTimeout(() => {
        setHasRainbowSweep(true);
      }, 2800)
    );

    // 3.0s: 2
    // 3.15s: K
    // 3.30s: 2
    // 3.45s: 6
    YEAR_LETTERS.forEach((item, index) => {
      const delay = 3000 + index * 150;
      timeouts.push(
        setTimeout(() => {
          setRevealedYearCount(index + 1);
          setCurrentBurstColor(item.color);
          setBurstTrigger(Date.now());
        }, delay)
      );
    });

    // 3.8s: Subtitle "VOLUNTEER REGISTRATION"
    timeouts.push(
      setTimeout(() => {
        setShowSubtitle(true);
      }, 3800)
    );

    // 4.3s: Logo transition (hold, moves slightly upward and fades)
    timeouts.push(
      setTimeout(() => {
        setIsTransitioningOut(true);
      }, 4400)
    );

    // 4.9s: Complete and enter homepage
    timeouts.push(
      setTimeout(() => {
        onComplete();
      }, 4900)
    );

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black select-none overflow-hidden transition-all duration-700 ${
        isTransitioningOut ? '-translate-y-8 opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Subtle Particle Canvas */}
      <ParticleCanvas burstColor={currentBurstColor} triggerBurst={burstTrigger} />

      {/* Cyber subtle ambient background radial lights */}
      <div className="absolute w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -top-20 -left-20 animate-pulse" />
      <div className="absolute w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[140px] pointer-events-none -bottom-20 -right-20 animate-pulse" />

      {/* Main Title Container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-5xl mx-auto text-center">
        
        {/* NOVATAS Reveal */}
        <div 
          className={`flex items-center justify-center transition-all duration-700 ease-out ${
            isLocked ? 'tracking-[0.1em] md:tracking-[0.18em]' : 'tracking-[0.4em] md:tracking-[0.6em]'
          }`}
        >
          {LETTERS.map((letter, idx) => {
            const isVisible = idx < revealedLettersCount;
            return (
              <span
                key={letter.char + idx}
                style={{
                  color: letter.color,
                  transitionDelay: `${idx * 40}ms`
                }}
                className={`font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black inline-block transition-all duration-300 transform ${
                  isVisible 
                    ? `opacity-100 scale-100 translate-y-0 ${letter.glowClass} ${
                        letter.effect === 'slight-rotate' ? 'rotate-0' : ''
                      }` 
                    : 'opacity-0 scale-0 translate-y-4 pointer-events-none'
                } ${
                  hasRainbowSweep ? 'filter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]' : ''
                }`}
              >
                {letter.char}
              </span>
            );
          })}
        </div>

        {/* 2K26 Reveal (Brush / Energetic style) */}
        <div className="h-16 md:h-24 flex items-center justify-center mt-2 md:mt-4">
          <div className="flex items-center space-x-2 md:space-x-4">
            {YEAR_LETTERS.map((item, idx) => {
              const isVisible = idx < revealedYearCount;
              return (
                <span
                  key={idx}
                  style={{ color: item.color }}
                  className={`font-brush text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider inline-block transition-all duration-200 transform ${
                    isVisible
                      ? `opacity-100 scale-100 -rotate-2 ${item.glowClass}`
                      : 'opacity-0 scale-150 rotate-12 pointer-events-none'
                  }`}
                >
                  {item.char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Supporting Subtitle: VOLUNTEER REGISTRATION */}
        <div className="h-12 flex items-center justify-center mt-3">
          <div 
            className={`transition-all duration-700 transform ${
              showSubtitle 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="inline-flex items-center space-x-3 px-5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="font-mono-tech uppercase text-xs sm:text-sm tracking-[0.35em] text-cyan-300 font-bold">
                VOLUNTEER REGISTRATION
              </span>
              <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
            </div>
            <p className="text-[11px] font-mono tracking-widest text-slate-400 mt-2">
              CREATE • ORGANIZE • LEAD
            </p>
          </div>
        </div>

      </div>

      {/* Skip / Enter Novatas Button in Bottom Right */}
      <button
        onClick={onComplete}
        className="absolute bottom-6 right-6 z-20 flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono tracking-wider text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 backdrop-blur-md transition-all duration-200 group"
      >
        <span>ENTER NOVATAS</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Sound note / subtle indicator */}
      <div className="absolute bottom-6 left-6 text-[10px] text-slate-600 font-mono tracking-wider hidden sm:block">
        NOVATAS 2K26 • CSE FRESHERS PORTAL
      </div>
    </div>
  );
};
