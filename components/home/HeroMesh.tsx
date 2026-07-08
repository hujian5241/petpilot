"use client";

export function HeroMesh() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 560"
        preserveAspectRatio="xMidYMid slice"
        className="absolute left-1/2 top-0 h-full w-[150%] -translate-x-1/2 object-cover"
      >
        <defs>
          <filter id="hero-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
          </filter>
          <linearGradient id="mesh-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b9b9f9" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#533afd" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="mesh-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f96bee" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ea2261" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="mesh-grad-3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#f5e9d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffd6a5" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="mesh-grad-4" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d6e4ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#665efd" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <g filter="url(#hero-blur)">
          <ellipse cx="180" cy="120" rx="360" ry="260" fill="url(#mesh-grad-3)" />
          <ellipse cx="1200" cy="180" rx="420" ry="300" fill="url(#mesh-grad-1)" />
          <ellipse cx="900" cy="420" rx="360" ry="260" fill="url(#mesh-grad-4)" />
          <ellipse cx="420" cy="460" rx="320" ry="220" fill="url(#mesh-grad-2)" />
        </g>
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/40 to-white" />
    </div>
  );
}
