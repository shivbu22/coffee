import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsentBanner({ onOpenPrivacy }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('findco_cookie_consent_v1');
    if (!consent) {
      // Show banner after brief delay
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type) => {
    localStorage.setItem('findco_cookie_consent_v1', JSON.stringify({
      type,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '680px',
        zIndex: 9998,
        background: 'var(--bg-card, #ffffff)',
        color: 'var(--text-main, #0f172a)',
        borderRadius: 16,
        boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--border-subtle, rgba(0,0,0,0.08))',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap'
      }}
      role="alertdialog"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: '260px' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#e6f7f4',
            color: '#38b29c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div style={{ fontSize: '0.82rem', lineHeight: 1.45, color: 'var(--text-secondary, #475569)' }}>
          <strong style={{ color: 'var(--text-main, #0f172a)' }}>Privacy & Session Integrity:</strong> We use strictly essential cookies and encrypted storage tokens to secure your escrow transactions and authenticate sessions. Zero advertising trackers.{' '}
          <button
            onClick={() => {
              if (onOpenPrivacy) onOpenPrivacy();
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#fa6e5e',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 'inherit',
              fontWeight: 600
            }}
          >
            Read DPDP Disclosure
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => handleAccept('essential')}
          style={{
            background: 'var(--bg-elevated, #f1f5f9)',
            color: 'var(--text-main, #0f172a)',
            border: '1px solid var(--border-subtle, #cbd5e1)',
            padding: '7px 14px',
            borderRadius: 8,
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Essential Only
        </button>
        <button
          onClick={() => handleAccept('all')}
          style={{
            background: '#fa6e5e',
            color: '#ffffff',
            border: 'none',
            padding: '7px 16px',
            borderRadius: 8,
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Accept
        </button>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            padding: 4
          }}
          aria-label="Dismiss banner"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
