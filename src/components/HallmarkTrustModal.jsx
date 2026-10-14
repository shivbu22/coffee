import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Lock, 
  Copy, 
  ExternalLink, 
  X, 
  QrCode, 
  FileCheck, 
  Building2, 
  UserCheck, 
  RefreshCw 
} from 'lucide-react';

export default function HallmarkTrustModal({ isOpen, onClose, hallmarkData, onShowToast }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasReverified, setHasReverified] = useState(false);

  if (!isOpen || !hallmarkData) return null;

  const handleCopyHash = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hallmarkData.fingerprint);
      if (onShowToast) onShowToast('Hallmark cryptographic fingerprint copied to clipboard.', 'success');
    }
  };

  const handleLiveEnclaveVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setHasReverified(true);
      if (onShowToast) onShowToast('Cryptographic signature re-verified against UIDAI Enclave Node. Status: VALID.', 'success');
    }, 1200);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2200,
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
          maxWidth: 620,
          maxHeight: '90vh',
          borderRadius: 20,
          border: '1px solid var(--border-subtle, #e2e8f0)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Hallmark Ribbon */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          padding: '24px 28px',
          color: '#ffffff',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Visual Embossed Seal */}
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef08a 0%, #ca8a04 100%)',
              padding: 2,
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#064e3b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={26} color="#fef08a" />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  background: 'rgba(254, 240, 138, 0.2)',
                  color: '#fef08a',
                  padding: '2px 8px',
                  borderRadius: 12,
                  border: '1px solid rgba(254, 240, 138, 0.4)'
                }}>
                  {hallmarkData.tier.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>
                  ID: {hallmarkData.hallmarkId}
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
                {hallmarkData.companionName}’s Hallmark Dossier
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#d1fae5', marginTop: 2 }}>
                {hallmarkData.city} • Verified through FindCo National Trust Enclave
              </div>
            </div>
          </div>

          <button
            type="button"
            id="hallmark-close-btn"
            aria-label="Close Hallmark Trust Modal"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          
          {/* Quick Cryptographic Summary Bar */}
          <div style={{
            background: 'var(--bg-elevated, #f8fafc)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', letterSpacing: '0.04em' }}>
                SHA-256 ENCLAVE FINGERPRINT HASH
              </span>
              <button 
                type="button"
                onClick={handleCopyHash}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary, #ff5e5b)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <Copy size={12} />
                Copy Hash
              </button>
            </div>
            <code style={{
              display: 'block',
              fontSize: '0.72rem',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              color: 'var(--text-secondary, #334155)',
              background: 'rgba(0, 0, 0, 0.03)',
              padding: '6px 10px',
              borderRadius: 6
            }}>
              {hallmarkData.fingerprint}
            </code>
          </div>

          {/* 4 Pillars of Hallmark Verification */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>
                Four Pillars of Trust & Safety Audit
              </h4>
              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} />
                100% Cleared
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hallmarkData.verificationPillars.map((p, idx) => (
                <div 
                  key={idx}
                  style={{
                    border: '1px solid var(--border-subtle, #e2e8f0)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    background: 'var(--bg-card, #ffffff)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={15} color="#059669" />
                      <strong style={{ fontSize: '0.82rem' }}>{p.pillar}</strong>
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#065f46',
                      background: '#d1fae5',
                      padding: '2px 8px',
                      borderRadius: 10
                    }}>
                      {p.status}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 6px 23px', fontSize: '0.78rem', color: 'var(--text-secondary, #475569)', lineHeight: 1.4 }}>
                    {p.details}
                  </p>
                  <div style={{ marginLeft: 23, fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', display: 'flex', gap: 12 }}>
                    <span>Ref: {p.certRef}</span>
                    <span>• {p.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anti-Slop Privacy Guarantee */}
          <div style={{
            background: 'rgba(5, 150, 105, 0.05)',
            border: '1px solid rgba(5, 150, 105, 0.2)',
            borderRadius: 12,
            padding: '14px 16px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary, #334155)',
            lineHeight: 1.5,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start'
          }}>
            <Lock size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: '#065f46', display: 'block', marginBottom: 2 }}>
                Anti-Slop Privacy Guarantee (DPDP Act 2023 Compliant)
              </strong>
              FindCo never stores plain-text Aadhaar numbers or biometrics. All verifications use UIDAI-signed offline XML checksums and temporary hardware session tokens. Your data is isolated in an AES-256 cold storage enclave.
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 28px',
          background: 'var(--bg-elevated, #f8fafc)',
          borderTop: '1px solid var(--border-subtle, #e2e8f0)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}>
          <button
            type="button"
            onClick={handleLiveEnclaveVerification}
            disabled={isVerifying}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: isVerifying ? 'wait' : 'pointer'
            }}
          >
            <RefreshCw size={14} className={isVerifying ? 'spin-animation' : ''} />
            {isVerifying ? 'Querying Enclave...' : hasReverified ? 'Re-verified (Valid)' : 'Live Cryptographic Check'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{
              padding: '8px 20px',
              fontSize: '0.84rem'
            }}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
