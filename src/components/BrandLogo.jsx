import React from 'react';

/**
 * Authentic FindCo Companion Heart Mascot (Vector SVG)
 * Two friendly companions hugging to form a heart, with baseball caps and blush cheeks.
 * Directly sourced from FindCo's official brand design assets.
 */
export function FindCoLogoMark({ size = 36, className = '', style = {} }) {
  const uniqueId = `findco-grad-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div 
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        style={{ 
          display: 'block', 
          width: '100%', 
          height: '100%',
          filter: 'drop-shadow(0 2px 6px rgba(245, 90, 74, 0.25))'
        }}
      >
        <defs>
          <linearGradient id={`${uniqueId}-coral`} x1="10" y1="20" x2="60" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7A6C" />
            <stop offset="1" stopColor="#F55A4A" />
          </linearGradient>
          <linearGradient id={`${uniqueId}-peach`} x1="40" y1="25" x2="95" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDBF74" />
            <stop offset="1" stopColor="#F79F3E" />
          </linearGradient>
          <linearGradient id={`${uniqueId}-mint`} x1="40" y1="40" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#55D4BB" />
            <stop offset="1" stopColor="#36B39C" />
          </linearGradient>
        </defs>

        {/* Left Coral Companion Body */}
        <path d="M 50 89 C 32 82 12 68 12 48 C 12 34 22 24 35 24 C 42 24 47 27 50 32 C 48 37 45 42 45 48 C 45 62 50 74 50 89 Z" fill={`url(#${uniqueId}-coral)`} />

        {/* Right Peach Companion Body */}
        <path d="M 50 89 C 50 74 55 62 55 48 C 55 42 52 37 50 32 C 53 27 58 24 65 24 C 78 24 88 34 88 48 C 88 68 68 82 50 89 Z" fill={`url(#${uniqueId}-peach)`} />

        {/* Teal Sleeve Wrap */}
        <path d="M 78 58 C 84 66 75 78 62 84 C 58 86 52 88 50 89 C 54 83 60 76 68 68 C 73 63 76 60 78 58 Z" fill={`url(#${uniqueId}-mint)`} />

        {/* Inner Heart Cutout */}
        <path d="M 50 44 C 45 35 34 35 29 42 C 23 50 28 62 40 72 C 45 76 48 78 50 80 C 52 78 55 76 60 72 C 72 62 77 50 71 42 C 66 35 55 35 50 44 Z" fill="#FFFFFF" />

        {/* Left Head */}
        <circle cx="34" cy="26" r="14" fill="#FF7A6C" />
        <path d="M 24 22 C 24 16 31 12 38 12 C 45 12 48 16 48 22 Z" fill="#F8A84E" />
        <circle cx="38" cy="12" r="2" fill="#48C9B0" />
        <path d="M 24 23 C 20 23 18 26 20 28 C 24 29 30 27 32 24 Z" fill="#48C9B0" />
        <ellipse cx="32" cy="27" rx="1.6" ry="2.2" fill="#2C3647" />
        <ellipse cx="40" cy="27" rx="1.6" ry="2.2" fill="#2C3647" />
        <path d="M 34 31 Q 36 33 38 31" stroke="#2C3647" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <ellipse cx="28" cy="29" rx="2.5" ry="1.6" fill="#FFA399" />
        <ellipse cx="44" cy="29" rx="2.5" ry="1.6" fill="#FFA399" />

        {/* Right Head */}
        <circle cx="67" cy="32" r="13" fill="#FDBF74" />
        <path d="M 58 28 C 58 22 64 19 70 19 C 76 19 79 22 79 28 Z" fill="#48C9B0" />
        <circle cx="70" cy="19" r="1.8" fill="#FF7A6C" />
        <path d="M 58 29 C 54 29 53 32 55 33.5 C 58 34 63 32.5 65 30 Z" fill="#FF7A6C" />
        <ellipse cx="64.5" cy="32.5" rx="1.5" ry="2" fill="#2C3647" />
        <ellipse cx="71.5" cy="32.5" rx="1.5" ry="2" fill="#2C3647" />
        <path d="M 66.5 36 Q 68 37.5 69.5 36" stroke="#2C3647" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        <ellipse cx="61" cy="34.5" rx="2.2" ry="1.4" fill="#F8A84E" opacity="0.8" />
        <ellipse cx="75" cy="34.5" rx="2.2" ry="1.4" fill="#F8A84E" opacity="0.8" />
      </svg>
    </div>
  );
}

// Backwards-compatible aliases
export const FindCoMascotMark = FindCoLogoMark;
export const BuddySearchLogoMark = FindCoLogoMark;
export const BuddyMascotMark = FindCoLogoMark;

/**
 * Main Brand Logo Component for FindCo
 * Supports:
 * - variant="navbar": Companion Mascot + FindCo Wordmark with heart-dotted 'i'
 * - variant="full": Complete brand lockup with "a companion platform" tagline
 * - variant="image": Renders the exact official brand logo graphic file
 * - variant="icon": Mascot icon only
 */
export default function BrandLogo({ 
  variant = 'navbar', 
  size = 'md', // 'sm' | 'md' | 'lg' | 'hero'
  showTagline = false,
  onClick,
  style = {}
}) {
  const sizeMap = {
    sm: { mark: 30, text: '1.22rem', sub: '0.62rem', gap: 9 },
    md: { mark: 38, text: '1.45rem', sub: '0.72rem', gap: 11 },
    lg: { mark: 48, text: '1.85rem', sub: '0.84rem', gap: 13 },
    hero: { mark: 64, text: '2.45rem', sub: '0.96rem', gap: 16 }
  };

  const cfg = sizeMap[size] || sizeMap.md;

  if (variant === 'image') {
    return (
      <img 
        src="/findco-brand-logo.jpg" 
        alt="FindCo — a companion platform" 
        onClick={onClick}
        style={{
          height: cfg.mark * 1.1,
          width: 'auto',
          objectFit: 'contain',
          cursor: onClick ? 'pointer' : 'default',
          ...style
        }}
      />
    );
  }

  return (
    <div 
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: cfg.gap,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        textDecoration: 'none',
        ...style
      }}
    >
      {/* Official Companion Heart Mascot */}
      <FindCoLogoMark size={cfg.mark} />

      {/* Typography Lockup: FindCo with Heart Dot on 'i' */}
      {variant !== 'icon' && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
            fontWeight: 800,
            fontSize: cfg.text,
            letterSpacing: '-0.025em',
            color: 'var(--text-main, #242c3d)'
          }}>
            <span>F</span>
            {/* Letter 'i' with signature FindCo heart dot */}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              ı
              <span style={{
                position: 'absolute',
                top: '-0.24em',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'var(--color-primary, #fa6e5e)',
                fontSize: '0.48em',
                lineHeight: 1
              }}>
                ♥
              </span>
            </span>
            <span>nd</span>
            <span style={{ 
              color: 'var(--color-primary, #fa6e5e)',
              fontWeight: 800
            }}>
              Co
            </span>
          </div>

          {(showTagline || variant === 'full') && (
            <span style={{
              fontSize: cfg.sub,
              color: 'var(--text-secondary, #64748b)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginTop: 3,
              fontFamily: 'var(--font-body, "Inter", sans-serif)'
            }}>
              a companion platform
            </span>
          )}
        </div>
      )}
    </div>
  );
}
