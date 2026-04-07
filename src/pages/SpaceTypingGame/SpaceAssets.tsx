
export const SpaceshipSvg = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="shipHull" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f1f5f9" />
                <stop offset="1" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="cockpitGlass" x1="50" y1="40" x2="50" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7dd3fc" />
                <stop offset="1" stopColor="#0ea5e9" />
            </linearGradient>
            <filter id="engineGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Engine Flames */}
        <path d="M42 85 L50 98 L58 85 Z" fill="#f59e0b" className="engine-flame-core" filter="url(#engineGlow)" />
        <path d="M38 85 L50 105 L62 85 Z" fill="#ef4444" className="engine-flame-outer" opacity="0.6" filter="url(#engineGlow)" />

        {/* Main Wings */}
        <path d="M50 15 L20 80 L50 75 L80 80 Z" fill="url(#shipHull)" stroke="#475569" strokeWidth="1" />
        <path d="M20 80 L10 65 L20 50 Z" fill="#64748b" />
        <path d="M80 80 L90 65 L80 50 Z" fill="#64748b" />

        {/* Body Details */}
        <path d="M50 15 L35 75 L50 85 L65 75 Z" fill="#e2e8f0" opacity="0.5" />

        {/* Cockpit */}
        <path d="M50 45 L40 65 L50 70 L60 65 Z" fill="url(#cockpitGlass)" />

        {/* Weapon Mounts */}
        <rect x="25" y="60" width="4" height="15" fill="#334155" rx="1" />
        <rect x="71" y="60" width="4" height="15" fill="#334155" rx="1" />
    </svg>
);

export const AsteroidSvg = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="asteroidGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(40 40) rotate(90) scale(60)">
                <stop stopColor="#64748b" />
                <stop offset="1" stopColor="#1e293b" />
            </radialGradient>
            <filter id="rockRoughness">
                <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="2" result="noise" />
                <feDiffuseLighting in="noise" lightingColor="#cbd5e1" surfaceScale="1">
                    <feDistantLight azimuth="45" elevation="60" />
                </feDiffuseLighting>
                <feComposite operator="in" in2="SourceGraphic" />
            </filter>
        </defs>
        <g filter="url(#rockRoughness)">
            <path d="M50 15 L75 25 L85 50 L75 80 L50 90 L25 80 L15 50 L25 25 Z" fill="url(#asteroidGradient)" stroke="#334155" strokeWidth="1" />
        </g>
        {/* Craters */}
        <ellipse cx="35" cy="40" rx="6" ry="4" fill="#0f172a" opacity="0.3" transform="rotate(-15 35 40)" />
        <circle cx="65" cy="65" r="8" fill="#0f172a" opacity="0.3" />
        <circle cx="60" cy="30" r="4" fill="#0f172a" opacity="0.3" />
    </svg>
);

export const PlanetSaturnSvg = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="saturnBody" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fde68a" />
                <stop offset="0.5" stopColor="#d97706" />
                <stop offset="1" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="ringGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#fef3c7" stopOpacity="0.8" />
                <stop offset="0.5" stopColor="#d97706" stopOpacity="0.9" />
                <stop offset="1" stopColor="#78350f" stopOpacity="0" />
            </linearGradient>
        </defs>

        {/* Rings Back */}
        <ellipse cx="50" cy="50" rx="48" ry="14" fill="none" stroke="url(#ringGradient)" strokeWidth="8" transform="rotate(-25 50 50)" opacity="0.7" />

        {/* Planet Body */}
        <circle cx="50" cy="50" r="26" fill="url(#saturnBody)" />
        <path d="M25 40 Q50 60 75 40" fill="none" stroke="#b45309" strokeWidth="2" opacity="0.3" />

        {/* Rings Front (Masked by body logically, but drawn over for simple 3D effect) */}
        <path d="M 10 70 Q 50 90 90 30" fill="none" stroke="url(#ringGradient)" strokeWidth="8" transform="rotate(-25 50 50)" strokeLinecap="round" opacity="0.9" clipPath="inset(0 0 50% 0)" />
    </svg>
);

export const PlanetEarthSvg = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="earthOcean" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(35 35) scale(60)">
                <stop stopColor="#ffb44d" />
                <stop offset="1" stopColor="#cc7800" />
            </radialGradient>
            <filter id="atmosphereGlow">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="glow" in2="SourceGraphic" operator="out" result="outerGlow" />
            </filter>
        </defs>
        <circle cx="50" cy="50" r="32" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.3" filter="url(#atmosphereGlow)" />
        <circle cx="50" cy="50" r="30" fill="url(#earthOcean)" />
        {/* Continents */}
        <path d="M35 30 Q45 20 60 35 T70 55 T50 70 T30 55 T35 30" fill="#22c55e" opacity="0.8" />
        <path d="M65 25 Q75 25 75 35 T65 40" fill="#22c55e" opacity="0.6" />
        {/* Clouds */}
        <path d="M25 45 Q35 40 45 45 T55 40" stroke="white" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
        <path d="M50 65 Q60 60 70 65" stroke="white" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
    </svg>
);

export const PlanetRedSvg = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="marsSurface" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(40 40) scale(60)">
                <stop stopColor="#fca5a5" />
                <stop offset="1" stopColor="#7f1d1d" />
            </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="28" fill="url(#marsSurface)" />
        {/* Craters/Canyons */}
        <ellipse cx="65" cy="45" rx="10" ry="6" fill="#450a0a" opacity="0.2" />
        <ellipse cx="40" cy="60" rx="8" ry="4" fill="#450a0a" opacity="0.2" />
        <path d="M30 35 Q40 45 30 55" stroke="#450a0a" strokeWidth="2" opacity="0.1" fill="none" />
    </svg>
);

export const PlanetIceSvg = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="iceGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(30 30) scale(70)">
                <stop stopColor="#cffafe" />
                <stop offset="1" stopColor="#0891b2" />
            </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="29" fill="url(#iceGradient)" />
        <path d="M20 50 Q50 20 80 50" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
        <path d="M25 60 Q50 30 75 60" fill="none" stroke="white" strokeWidth="1" opacity="0.2" />
        <circle cx="40" cy="35" r="4" fill="white" opacity="0.4" />
    </svg>
);

export const StarSvg = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10 C50 10 55 45 90 50 C55 55 50 90 50 90 C50 90 45 55 10 50 C45 45 50 10 50 10 Z" fill="white" />
        <circle cx="50" cy="50" r="10" fill="white" opacity="0.8" filter="blur(2px)" />
    </svg>
);
