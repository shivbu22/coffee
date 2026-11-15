import React, { useState } from 'react';

/**
 * Resilient Avatar component with automatic initials fallback
 * when Unsplash or external CDN links fail, are blocked by ad-blockers,
 * or encounter network connectivity drops.
 */
export default function SafeAvatar({
  src,
  alt = 'User',
  size = 40,
  style = {},
  className = '',
  role = 'presentation'
}) {
  const [hasError, setHasError] = useState(false);

  const initials = alt
    ? alt
        .split(' ')
        .map(p => p[0])
        .filter(Boolean)
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  if (!src || hasError) {
    return (
      <div
        role={role}
        aria-label={alt}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: Math.max(11, Math.floor(size * 0.38)),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          userSelect: 'none',
          boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
          ...style
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      loading="lazy"
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        ...style
      }}
    />
  );
}

