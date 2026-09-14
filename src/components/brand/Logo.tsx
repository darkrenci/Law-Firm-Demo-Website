import React from 'react';

interface LogoProps {
  variant?: 'full' | 'horizontal' | 'mark' | 'hero' | 'compact';
  className?: string;
  markClassName?: string;
  textClassName?: string;
  goldTone?: 'standard' | 'bright' | 'muted';
}

/**
 * Official Lalusis & Partners Insignia Mark
 * Recreated with geometric precision from the official firm brand reference.
 * Features:
 * - Bespoke architectural serif "L" with hollow fluted stem and upward sweeping terminal
 * - Integrated Scales of Justice with arched balance beam and 3-point hanging cords
 * - Faceted central dagger pillar with diamond apex finial and ricasso bevels
 * - Brushed warm bronze / metallic gold chiaroscuro gradients
 */
export const LalusisLogoMark: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-12 h-12',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      width={size}
      height={size}
      aria-label="Lalusis & Partners Official Insignia"
    >
      <defs>
        {/* Primary Warm Bronze-Gold Metallic Gradient */}
        <linearGradient id="lpGoldGrad" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#f7e1b5" />
          <stop offset="18%" stopColor="#dfb277" />
          <stop offset="42%" stopColor="#c59b63" />
          <stop offset="70%" stopColor="#9e733c" />
          <stop offset="90%" stopColor="#c59b63" />
          <stop offset="100%" stopColor="#7a5528" />
        </linearGradient>

        {/* Highlighted Facet (Left side of blade & beam) */}
        <linearGradient id="lpGoldLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#faecd2" />
          <stop offset="35%" stopColor="#dfb277" />
          <stop offset="75%" stopColor="#c59b63" />
          <stop offset="100%" stopColor="#966e38" />
        </linearGradient>

        {/* Shadowed Facet (Right side of blade & inner bevels) */}
        <linearGradient id="lpGoldDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b58a4e" />
          <stop offset="40%" stopColor="#875e29" />
          <stop offset="80%" stopColor="#694519" />
          <stop offset="100%" stopColor="#4d3210" />
        </linearGradient>

        {/* Scale Bowl Radial Metallic Gradient */}
        <radialGradient id="lpBowlGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ecd5aa" />
          <stop offset="45%" stopColor="#c59b63" />
          <stop offset="85%" stopColor="#875e29" />
          <stop offset="100%" stopColor="#573812" />
        </radialGradient>

        {/* Sheen along the top serifs and horizontal beam */}
        <linearGradient id="lpSheen" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#966e38" />
          <stop offset="30%" stopColor="#faecd2" />
          <stop offset="50%" stopColor="#f2d7a2" />
          <stop offset="70%" stopColor="#c59b63" />
          <stop offset="100%" stopColor="#7a5528" />
        </linearGradient>

        {/* Subtle Drop Shadow */}
        <filter id="lpShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter="url(#lpShadow)">
        {/* ============================================================ */}
        {/* 1. THE CAPITAL "L" MONOGRAM                                  */}
        {/* ============================================================ */}

        {/* Top Bracketed Serif of "L" */}
        <path
          d="M 68 60 
             C 86 61, 91 75, 91 85
             L 125 85
             C 125 75, 130 61, 163 60
             C 142 62, 110 61.5, 68 60 Z"
          fill="url(#lpSheen)"
        />

        {/* Outer Left Vertical Border Stroke */}
        <path
          d="M 86 85 
             L 91 85
             L 91 350
             L 86 350 Z"
          fill="url(#lpGoldLight)"
        />

        {/* Main Solid Vertical Column of "L" */}
        <path
          d="M 107 85 
             L 125 85
             L 125 350
             L 107 350 Z"
          fill="url(#lpGoldGrad)"
        />

        {/* Bottom Left Corner Serif Bracket */}
        <path
          d="M 68 380 
             C 86 379, 91 365, 91 350
             L 145 350
             L 145 362
             L 91 362
             C 91 372, 85 379, 68 380 Z"
          fill="url(#lpGoldGrad)"
        />

        {/* Bottom Horizontal Base of "L" (Upper Bar & Hollow Groove) */}
        <path
          d="M 145 362 
             L 328 362
             L 328 367
             L 145 367 Z"
          fill="url(#lpGoldDark)"
        />
        <path
          d="M 145 375 
             L 328 375
             L 328 380
             L 68 380
             L 68 375 Z"
          fill="url(#lpGoldGrad)"
        />

        {/* Upward Sweeping Triangular Finial at Right of "L" */}
        <path
          d="M 328 380 
             L 328 322
             C 328 345, 310 360, 275 362
             L 328 362 Z"
          fill="url(#lpGoldLight)"
        />

        {/* ============================================================ */}
        {/* 2. CENTRAL PILLAR & DAGGER OF JUSTICE                        */}
        {/* ============================================================ */}

        {/* Diamond Finial Apex at Top (Four-pointed Star) */}
        {/* Top Point (Left Highlight Facet) */}
        <polygon points="200,52 180,108 200,114" fill="url(#lpGoldLight)" />
        {/* Top Point (Right Shadow Facet) */}
        <polygon points="200,52 220,108 200,114" fill="url(#lpGoldDark)" />

        {/* Ricasso / Shoulder Notches below the Crossbeam */}
        <polygon points="200,114 180,114 175,155 200,155" fill="url(#lpGoldLight)" />
        <polygon points="200,114 220,114 225,155 200,155" fill="url(#lpGoldDark)" />

        {/* Center Diamond / Notched Step */}
        <polygon points="175,155 180,165 200,160 200,155" fill="url(#lpGoldDark)" />
        <polygon points="225,155 220,165 200,160 200,155" fill="url(#lpGoldLight)" />

        {/* Long Tapered Dagger Blade (Extending to base of L) */}
        {/* Left Illuminated Facet */}
        <polygon points="200,160 180,165 190,320 200,358" fill="url(#lpGoldLight)" />
        {/* Right Shadowed Facet */}
        <polygon points="200,160 220,165 210,320 200,358" fill="url(#lpGoldDark)" />

        {/* Razor Center Ridge Highlight */}
        <line x1="200" y1="52" x2="200" y2="358" stroke="#faecd2" strokeWidth="1.2" opacity="0.85" />

        {/* ============================================================ */}
        {/* 3. HORIZONTAL BALANCE BEAM                                   */}
        {/* ============================================================ */}

        {/* Left Arm of Balance Beam (Arched) */}
        <path
          d="M 180 112 
             C 145 112, 100 118, 84 126
             L 84 131
             C 102 123, 145 117, 180 117 Z"
          fill="url(#lpGoldLight)"
        />

        {/* Left Hook Finial */}
        <path
          d="M 84 126 
             C 80 126, 78 132, 84 135
             C 88 132, 88 126, 84 126 Z"
          fill="url(#lpSheen)"
        />

        {/* Right Arm of Balance Beam (Arched) */}
        <path
          d="M 220 112 
             C 255 112, 300 118, 316 126
             L 316 131
             C 298 123, 255 117, 220 117 Z"
          fill="url(#lpGoldDark)"
        />

        {/* Right Hook Finial */}
        <path
          d="M 316 126 
             C 312 126, 310 132, 316 135
             C 320 132, 320 126, 316 126 Z"
          fill="url(#lpSheen)"
        />

        {/* ============================================================ */}
        {/* 4. SUSPENDED SCALES (LEFT & RIGHT)                           */}
        {/* ============================================================ */}

        {/* --- LEFT SCALE --- */}
        {/* 3 Hanging Chains/Cords */}
        <line x1="84" y1="133" x2="43" y2="240" stroke="url(#lpGoldLight)" strokeWidth="1.7" />
        <line x1="84" y1="133" x2="84" y2="240" stroke="url(#lpGoldGrad)" strokeWidth="1.7" />
        <line x1="84" y1="133" x2="125" y2="240" stroke="url(#lpGoldDark)" strokeWidth="1.7" />

        {/* Left Scale Pan Bowl */}
        <path
          d="M 38 240 
             C 38 274, 130 274, 130 240 
             Z"
          fill="url(#lpBowlGrad)"
          stroke="url(#lpGoldLight)"
          strokeWidth="1.8"
        />
        {/* Left Pan Rim Highlight */}
        <line x1="37" y1="240" x2="131" y2="240" stroke="#faecd2" strokeWidth="2.2" />

        {/* --- RIGHT SCALE --- */}
        {/* 3 Hanging Chains/Cords */}
        <line x1="316" y1="133" x2="275" y2="240" stroke="url(#lpGoldLight)" strokeWidth="1.7" />
        <line x1="316" y1="133" x2="316" y2="240" stroke="url(#lpGoldGrad)" strokeWidth="1.7" />
        <line x1="316" y1="133" x2="357" y2="240" stroke="url(#lpGoldDark)" strokeWidth="1.7" />

        {/* Right Scale Pan Bowl */}
        <path
          d="M 270 240 
             C 270 274, 362 274, 362 240 
             Z"
          fill="url(#lpBowlGrad)"
          stroke="url(#lpGoldLight)"
          strokeWidth="1.8"
        />
        {/* Right Pan Rim Highlight */}
        <line x1="269" y1="240" x2="363" y2="240" stroke="#faecd2" strokeWidth="2.2" />
      </g>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  className = '',
  markClassName = '',
  textClassName = '',
}) => {
  if (variant === 'mark') {
    return <LalusisLogoMark className={markClassName || 'w-10 h-10'} />;
  }

  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {/* Emblem */}
        <div className="relative mb-6">
          <div className="absolute -inset-6 rounded-full bg-[#c59b63]/10 blur-2xl"></div>
          <LalusisLogoMark className={`relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 ${markClassName}`} />
        </div>

        {/* Wordmark */}
        <div className={`flex flex-col items-center tracking-[0.14em] ${textClassName}`}>
          <span className="font-cinzel text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-[#f4e6d0] uppercase leading-tight drop-shadow-sm">
            Lalusis
          </span>
          <span className="font-cinzel text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#f4e6d0] uppercase leading-tight tracking-[0.18em]">
            &amp; Partners
          </span>
        </div>

        {/* Flanked Subtitle */}
        <div className="mt-4 flex items-center justify-center gap-4 w-full max-w-md">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#c59b63]/60 to-[#c59b63]"></div>
          <span className="font-cinzel text-xs sm:text-sm tracking-[0.35em] text-[#d4af7a] uppercase font-medium whitespace-nowrap">
            Attorneys at Law
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#c59b63]/60 to-[#c59b63]"></div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 flex-shrink-0 whitespace-nowrap select-none ${className}`}>
        <LalusisLogoMark className={`w-8 h-8 flex-shrink-0 ${markClassName}`} />
        <div className="flex flex-col leading-none">
          <span className="font-cinzel text-sm font-semibold tracking-[0.12em] text-[#f4e6d0] uppercase whitespace-nowrap">
            Lalusis &amp; Partners
          </span>
          <span className="font-cinzel text-[9px] tracking-[0.25em] text-[#c59b63] uppercase mt-1 whitespace-nowrap">
            Attorneys at Law
          </span>
        </div>
      </div>
    );
  }

  // Default 'horizontal' or 'full'
  return (
    <div className={`flex items-center gap-3.5 group cursor-pointer flex-shrink-0 whitespace-nowrap select-none ${className}`}>
      <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.03]">
        <LalusisLogoMark className={`w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 ${markClassName}`} />
      </div>
      <div className="flex flex-col flex-shrink-0">
        <span className="font-cinzel text-base sm:text-lg md:text-xl font-medium tracking-[0.14em] text-[#f4e6d0] uppercase leading-none group-hover:text-white transition-colors whitespace-nowrap">
          Lalusis &amp; Partners
        </span>
        <div className="flex items-center gap-2 mt-1.5 whitespace-nowrap">
          <div className="h-[1px] w-3 bg-[#c59b63]/70 hidden sm:block flex-shrink-0"></div>
          <span className="font-cinzel text-[9px] sm:text-[10px] tracking-[0.3em] text-[#c59b63] uppercase font-medium whitespace-nowrap">
            Attorneys at Law
          </span>
          <div className="h-[1px] w-3 bg-[#c59b63]/70 hidden sm:block flex-shrink-0"></div>
        </div>
      </div>
    </div>
  );
};
