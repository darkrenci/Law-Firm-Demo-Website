import React, { useState, useEffect, useRef } from 'react';
import { LalusisLogoMark } from '../brand/Logo';
import { Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OpeningLoadingScreenProps {
  /**
   * Whether the loading screen is currently open
   */
  isOpen: boolean;
  /**
   * Callback fired once loading finishes or user enters
   */
  onComplete: () => void;
  /**
   * Total duration in milliseconds for the natural intro sequence (default: 2200ms)
   */
  durationMs?: number;
}

const STATUS_STAGES = [
  { at: 0, text: 'Accessing Lalusis Law Chambers...' },
  { at: 28, text: 'Verifying Counsel & Practice Registry...' },
  { at: 62, text: 'Calibrating Official Legal Portals...' },
  { at: 88, text: 'Chambers Initialized · Welcome...' },
  { at: 100, text: 'Entering Lalusis & Partners' },
];

export const OpeningLoadingScreen: React.FC<OpeningLoadingScreenProps> = ({
  isOpen,
  onComplete,
  durationMs = 2100,
}) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);
  const hasFinishedRef = useRef(false);

  // Sync rendered state with isOpen
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsExiting(false);
      setProgress(0);
      hasFinishedRef.current = false;
    }
  }, [isOpen]);

  // Smooth progress accumulation
  useEffect(() => {
    if (!isOpen || isExiting) return;

    const startTime = performance.now();
    let animationFrameId: number;

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawPct = Math.min(100, Math.floor((elapsed / durationMs) * 100));

      setProgress(rawPct);

      if (rawPct < 100) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        if (!hasFinishedRef.current) {
          hasFinishedRef.current = true;
          // Hold 100% briefly before gracefully dissolving out
          setTimeout(() => {
            handleExit();
          }, 350);
        }
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, durationMs, isExiting]);

  const handleExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    // After transition completes, notify parent and unmount
    setTimeout(() => {
      setIsRendered(false);
      onComplete();
    }, 700);
  };

  if (!isRendered) return null;

  // Determine current status message
  const currentStage =
    [...STATUS_STAGES].reverse().find((stage) => progress >= stage.at) ||
    STATUS_STAGES[0];

  return (
    <div
      role="dialog"
      aria-label="Welcome to Lalusis & Partners"
      aria-modal="true"
      onClick={handleExit}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07070a] select-none cursor-pointer overflow-hidden transition-all duration-700 ease-out ${
        isExiting
          ? 'opacity-0 scale-[1.02] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Architectural Glow & Radial Vignette */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central Warm Gold Ambient Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] sm:w-[48rem] h-[34rem] sm:h-[48rem] rounded-full bg-[radial-gradient(circle,rgba(197,155,99,0.14)_0%,rgba(197,155,99,0.03)_50%,transparent_75%)] blur-2xl" />

        {/* Subtle executive geometric corner brackets */}
        <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#c59b63]/50 pointer-events-none" />
        <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#c59b63]/50 pointer-events-none" />
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#c59b63]/50 pointer-events-none" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#c59b63]/50 pointer-events-none" />

        {/* Delicate background crosshair lines */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#c59b63]/10 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-[#c59b63]/10 to-transparent pointer-events-none" />
      </div>

      {/* Top Bar Quick Skip / Enter Chambers Button */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleExit();
          }}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-[#121218]/90 border border-[#c59b63]/40 hover:border-[#c59b63] text-[#c59b63] hover:text-[#f7e1b5] transition-all duration-300 text-xs font-cinzel font-medium uppercase tracking-[0.2em] shadow-lg cursor-pointer backdrop-blur-sm"
        >
          <span>Enter Chambers</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Main Center Content Box */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Emblem Presentation with Radial Backlight */}
        <div className="relative mb-6 sm:mb-8 group">
          {/* Breathing golden back aura */}
          <div className="absolute -inset-6 rounded-full bg-[#c59b63]/20 blur-xl animate-pulse" />

          {/* Golden Rings */}
          <div className="absolute -inset-3 rounded-full border border-[#c59b63]/30 animate-[spin_24s_linear_infinite]" />
          <div className="absolute -inset-1.5 rounded-full border border-dashed border-[#dfb277]/25 animate-[spin_36s_linear_infinite_reverse]" />

          {/* Insignia Mark */}
          <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#0d0d12] border border-[#c59b63]/60 shadow-[0_0_30px_rgba(197,155,99,0.25)] p-3">
            <LalusisLogoMark className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(197,155,99,0.4)]" />
          </div>
        </div>

        {/* Firm Title */}
        <h1 className="font-cinzel text-2xl sm:text-3xl tracking-[0.2em] uppercase font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f7ecd5] via-[#dfb277] to-[#c59b63] drop-shadow-md">
          Lalusis &amp; Partners
        </h1>

        {/* Ornamental Flanked Subtitle */}
        <div className="mt-3 flex items-center justify-center gap-3 w-full">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#c59b63]/60 to-[#c59b63]" />
          <span className="font-cinzel text-[11px] sm:text-xs tracking-[0.35em] text-[#d4af7a] uppercase font-semibold whitespace-nowrap">
            Attorneys at Law · Est. 2012
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#c59b63]/60 to-[#c59b63]" />
        </div>

        {/* Latin Chamber Motto */}
        <p className="mt-2 text-[10px] font-cinzel tracking-[0.3em] text-[#8e877e] uppercase">
          Integritas · Aequitas · Iustitia
        </p>

        {/* Progress Bar & Status Section */}
        <div className="w-full mt-8 sm:mt-10 space-y-3">
          {/* Elegant Gold Progress Line */}
          <div className="relative w-full h-[3px] bg-[#1a1a24] overflow-hidden rounded-full border border-[#2b2b38]/50">
            {/* Active Gold Bar */}
            <div
              className="h-full bg-gradient-to-r from-[#9e733c] via-[#c59b63] to-[#faecd2] transition-all duration-100 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Glowing leading head */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#faecd2] shadow-[0_0_10px_#faecd2] blur-[1px]" />
            </div>
          </div>

          {/* Status & Numeric Percentage Readout */}
          <div className="flex items-center justify-between text-xs text-[#a39c91]">
            <div className="flex items-center gap-2 min-w-0">
              {progress >= 100 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#c59b63] shrink-0 animate-scale" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-[#c59b63] animate-ping shrink-0" />
              )}
              <span className="font-sans text-[11px] tracking-wide text-[#b5ada0] truncate">
                {currentStage.text}
              </span>
            </div>

            <span className="font-mono text-xs font-semibold text-[#c59b63] tabular-nums shrink-0 ml-3">
              {progress}%
            </span>
          </div>
        </div>

        {/* Click to enter hint */}
        <div className="mt-6 pt-2 border-t border-[#1c1c26]/60 w-full flex items-center justify-center">
          <button
            onClick={handleExit}
            className="text-[11px] font-cinzel uppercase tracking-[0.25em] text-[#8e877e] hover:text-[#c59b63] transition-colors duration-200 cursor-pointer flex items-center gap-1.5 py-1"
          >
            <span>Click anywhere to enter chambers</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
