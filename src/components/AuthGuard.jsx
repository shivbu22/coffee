import React from 'react';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';

/**
 * Synchronous Route Authorization Guard.
 * Completely prevents unauthorized mounting, network requests,
 * or rendering of private views (chats, dashboard, vault, notifications)
 * for unauthenticated visitors.
 */
export default function AuthGuard({
  isLoggedIn,
  onRequireAuth,
  targetTab = 'chats',
  targetTitle = 'Private Area',
  children
}) {
  if (!isLoggedIn) {
    const tabLabels = {
      chats: { title: 'Encrypted Messages & Escrow Chats', desc: 'Sign in to access your direct conversations, negotiate activity terms, and unlock safety handshake PINs.' },
      dashboard: { title: 'Member & Companion Dashboard', desc: 'Sign in to manage your active bookings, view wallet escrow balances, and track safety check-ins.' },
      vault: { title: 'Identity Verification Vault', desc: 'Sign in to view cryptographic KYC credentials and verify UIDAI government records.' },
      notifications: { title: 'Security & Meetup Notifications', desc: 'Sign in to review real-time booking alerts, quote acceptances, and companion check-ins.' },
      profile: { title: 'Companion Studio & Settings', desc: 'Sign in to customize your companion profile, pricing rates, and availability schedule.' }
    };

    const info = tabLabels[targetTab] || { title: targetTitle, desc: 'Sign in or create a verified FindCo account to continue.' };

    return (
      <div
        style={{
          maxWidth: 480,
          margin: '60px auto',
          padding: '40px 28px',
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-subtle, #e2e8f0)',
          borderRadius: 24,
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: 'rgba(225, 29, 72, 0.1)',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto'
          }}
        >
          <Lock size={26} />
        </div>

        <h3
          style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: 'var(--text-main, #0f172a)',
            marginBottom: 8,
            letterSpacing: '-0.02em'
          }}
        >
          {info.title}
        </h3>

        <p
          style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary, #64748b)',
            lineHeight: 1.55,
            marginBottom: 24
          }}
        >
          {info.desc}
        </p>

        <button
          type="button"
          onClick={() => onRequireAuth('client', targetTab)}
          style={{
            width: '100%',
            padding: '13px 24px',
            background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 12,
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(225, 29, 72, 0.25)'
          }}
        >
          <span>Sign In / Create Account</span>
          <ArrowRight size={16} />
        </button>

        <div
          style={{
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: '0.74rem',
            color: '#059669',
            fontWeight: 600
          }}
        >
          <ShieldCheck size={14} />
          <span>Protected by FindCo Dual-Handshake Escrow & DPDP Act 2023</span>
        </div>
      </div>
    );
  }

  return children;
}
