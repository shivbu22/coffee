import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Lock, AlertCircle, Scale, CheckCircle2 } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--text-main, #0f172a)',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle, #e2e8f0)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-elevated, #f8fafc)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#fff1ef',
                color: '#fa6e5e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Scale size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                FindCo Legal & Compliance Hub
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                Statutory disclosures, platform terms, and data protection policies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              color: 'var(--text-muted, #64748b)'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '12px 24px',
            borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
            background: 'var(--bg-card, #ffffff)',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: Lock },
            { id: 'dpdp', label: 'DPDP Act (India)', icon: ShieldCheck },
            { id: 'escrow', label: 'Escrow & Refund Rules', icon: CheckCircle2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #fa6e5e' : '1px solid transparent',
                  background: isActive ? '#fff1ef' : 'transparent',
                  color: isActive ? '#fa6e5e' : 'var(--text-secondary, #475569)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            fontSize: '0.88rem',
            lineHeight: 1.65,
            color: 'var(--text-main, #1e293b)'
          }}
        >
          {activeTab === 'terms' && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>
                1. Platform Terms of Service
              </h3>
              <p>
                Welcome to FindCo ("Platform", "we", "us"). By registering, browsing, or utilizing the services on findco.in, you agree to comply with and be bound by these Terms of Service.
              </p>
              
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
                1.1 Strictly Platonic & Non-Commercial Companionship
              </h4>
              <p>
                FindCo is exclusively a platform for social, activity-based platonic companionship (e.g. coffee conversations, gym spotters, museum tours, city walks, travel partners). 
                <strong> Any form of romantic solicitation, commercial escorting, adult entertainment, sexual services, or harassment is strictly prohibited</strong> and results in an immediate permanent ban, forfeiture of escrow balances, and reporting to law enforcement authorities.
              </p>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
                1.2 Public Venue Requirement
              </h4>
              <p>
                All meetups booked through FindCo must take place in public, well-lit spaces (commercial cafes, shopping malls, public parks, fitness studios). Private residential meetups are strictly forbidden.
              </p>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
                1.3 Dual-Handshake Escrow & Payment Protection
              </h4>
              <p>
                Payment for companion services is collected upfront and held in RBI-compliant escrow. Funds are never released to the companion until both parties physically meet and the client provides their confidential 4-Digit Handshake PIN. Never conduct off-platform cash or personal UPI transfers.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>
                2. Privacy Policy & Data Handling
              </h3>
              <p>
                FindCo prioritizes user anonymity and data minimization. We only collect the bare minimum data required to facilitate safe peer interactions.
              </p>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
                2.1 Aadhaar & Identity Tokenization
              </h4>
              <p>
                FindCo does not store raw government identification numbers (such as full 12-digit Aadhaar cards) on public cloud servers. Identity verification generates an irrecoverable cryptographic hash token ("Hallmark Trust Dossier").
              </p>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
                2.2 Financial & Transaction Privacy
              </h4>
              <p>
                Booking prices, wallet balances, and withdrawal requests are strictly private between the participating parties and our payment gateway. They are never published on public discovery feeds.
              </p>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
                2.3 Zero Third-Party Advertising Data Sharing
              </h4>
              <p>
                FindCo does not monetize, sell, or rent your private messaging, phone numbers, or browsing habits to advertisers or third-party data brokers.
              </p>
            </div>
          )}

          {activeTab === 'dpdp' && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>
                3. Compliance with India DPDP Act 2023
              </h3>
              <p>
                FindCo operates in full compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
              </p>

              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534', fontWeight: 700, marginBottom: 4 }}>
                  <ShieldCheck size={18} />
                  <span>Your Statutory Rights as a Data Principal:</span>
                </div>
                <ul style={{ margin: '8px 0 0 18px', padding: 0, fontSize: '0.84rem', color: '#14532d' }}>
                  <li><strong>Right to Access:</strong> View all summary data, profile information, and booking logs stored by FindCo.</li>
                  <li><strong>Right to Correction & Erasure:</strong> Request instant deletion of your account and unlinking of all verified tokens.</li>
                  <li><strong>Right to Grievance Redressal:</strong> Direct escalation path to our statutory grievance officer with a mandatory 48-hour SLA.</li>
                  <li><strong>Right to Nominate:</strong> Designate a representative in case of incapacity.</li>
                </ul>
              </div>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
                Grievance Redressal Officer
              </h4>
              <p style={{ fontSize: '0.84rem' }}>
                Name: <strong>Officer of Trust & Safety</strong><br />
                Address: FindCo Network Pvt. Ltd., Indiranagar, Bengaluru 560038, Karnataka<br />
                Email: <strong>grievance@findco.in</strong> · Response Time: &lt; 24 Business Hours
              </p>
            </div>
          )}

          {activeTab === 'escrow' && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>
                4. Escrow Handshake & 100% Refund Policy
              </h3>
              <p>
                Our proprietary dual-handshake protocol ensures neither party is exposed to financial fraud:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                <div style={{ border: '1px solid var(--border-subtle, #e2e8f0)', borderRadius: 12, padding: 14 }}>
                  <span style={{ fontWeight: 700, color: '#fa6e5e' }}>Step 1: Escrow Lock</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary, #475569)' }}>
                    When a client books a session, payment is locked in a dedicated vault. The companion cannot withdraw or access funds prior to the physical meetup.
                  </p>
                </div>

                <div style={{ border: '1px solid var(--border-subtle, #e2e8f0)', borderRadius: 12, padding: 14 }}>
                  <span style={{ fontWeight: 700, color: '#38b29c' }}>Step 2: Mutual Handshake PIN</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary, #475569)' }}>
                    Upon meeting at the verified public location, the client shares their unique 4-digit PIN. The companion enters this PIN in their in-app console to trigger escrow release.
                  </p>
                </div>

                <div style={{ border: '1px solid var(--border-subtle, #e2e8f0)', borderRadius: 12, padding: 14 }}>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>Step 3: 100% Automatic Refund on No-Shows</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary, #475569)' }}>
                    If a companion fails to appear, cancels, or attempts to violate terms, the client taps "Report No-Show". Without the PIN, funds are automatically refunded to the client's original payment method within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-elevated, #f8fafc)'
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
            FindCo Platform Standards v2.4 · Updated November 2026
          </span>
          <button
            onClick={onClose}
            style={{
              background: '#fa6e5e',
              color: '#ffffff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
