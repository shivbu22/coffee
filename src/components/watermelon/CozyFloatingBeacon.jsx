import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight } from 'lucide-react';
import { FindCoLogoMark } from '../BrandLogo';

export default function CozyFloatingBeacon({ onOpenFeed, onOpenSubscribe }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 99,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 12
    }}>
      {/* Expanded Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{
              width: 310,
              padding: '18px 18px 14px 18px',
              borderRadius: 16,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close companion beacon"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={14} />
            </button>

            {/* Header with Mascot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'var(--color-primary-bg)',
                border: '1px solid rgba(250, 110, 94, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FindCoLogoMark size={32} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-emerald)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-emerald)' }} />
                  <span>Live Companions Active</span>
                </div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Looking for a Co-Activity?
                </h4>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 16 }}>
              <strong>14 Aadhaar-audited companions</strong> in your city are available for coffee runs, workouts, and events today.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenFeed) onOpenFeed();
                }}
                className="btn-primary"
                style={{ flex: 1, padding: '9px 12px', fontSize: '0.8rem', borderRadius: 9999 }}
              >
                <span>Find Someone</span>
                <ArrowRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenSubscribe) onOpenSubscribe();
                }}
                className="btn-secondary"
                style={{ padding: '9px 12px', fontSize: '0.8rem', borderRadius: 9999 }}
              >
                <span>VIP Plans</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Trigger */}
      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open companion activity beacon"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 18px 10px 14px',
          borderRadius: 9999,
          background: 'var(--color-primary)',
          color: '#ffffff',
          border: '1px solid var(--color-primary-hover)',
          boxShadow: 'var(--shadow-md)',
          cursor: 'pointer'
        }}
      >
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FindCoLogoMark size={20} iconSize={12} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, lineHeight: 1.1 }}>
            Find Companions
          </div>
          <div style={{ fontSize: '0.66rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} />
            <span>14 active now</span>
          </div>
        </div>
      </motion.button>
    </div>
  );
}
