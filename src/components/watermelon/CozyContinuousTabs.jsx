import React, { useState, useEffect } from 'react';
import { motion, LayoutGroup } from 'motion/react';

export default function CozyContinuousTabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'coral' // 'coral' | 'neutral'
}) {
  const [active, setActive] = useState(activeTab || (tabs[0]?.id || ''));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (activeTab && activeTab !== active) {
      setActive(activeTab);
    }
  }, [activeTab]);

  const handleSelect = (id) => {
    setActive(id);
    if (onChange) onChange(id);
  };

  if (!isMounted) return null;

  return (
    <LayoutGroup id="cozy-tabs-group">
      <nav
        role="tablist"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: 4,
          borderRadius: 9999,
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.06)'
        }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => handleSelect(tab.id)}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 9999,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                outline: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {/* Active Sliding Spring Pill (Watermelon UI signature) */}
              {isActive && (
                <motion.div
                  layoutId="watermelon-active-pill"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                    mass: 0.9,
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 9999,
                    background: variant === 'coral'
                      ? 'var(--color-primary)'
                      : 'var(--bg-elevated)',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border-accent)'
                  }}
                />
              )}

              {/* Icon & Label */}
              {Icon && (
                <span
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    color: isActive
                      ? '#ffffff'
                      : 'var(--text-muted)'
                  }}
                >
                  <Icon size={14} />
                </span>
              )}

              <motion.span
                layout="position"
                style={{
                  position: 'relative',
                  zIndex: 2,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: isActive
                    ? '#ffffff'
                    : 'var(--text-secondary)',
                  transition: 'color 0.2s ease'
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span style={{
                    marginLeft: 6,
                    fontSize: '0.72rem',
                    opacity: isActive ? 0.95 : 0.6
                  }}>
                    ({tab.count})
                  </span>
                )}
              </motion.span>
            </button>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
