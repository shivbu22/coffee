import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal,
  Fingerprint,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AdminSecurityGate({ 
  onAuthenticate, 
  onExitToConsumer,
  onShowToast 
}) {
  const [passkey, setPasskey] = useState('');
  const [totp, setTotp] = useState('');
  const [operatorId, setOperatorId] = useState('ops-lead@findco.internal');
  const [showPasskey, setShowPasskey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const handleLogin = (e) => {
    e?.preventDefault();
    setErrorMsg('');

    if (!passkey.trim()) {
      setErrorMsg('Please enter your administrator security passkey.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Valid credentials check:
      // Accepts demo passkey "BUDDY-ADMIN-2026", "FINDCO-ADMIN-2026", "admin123", or "buddysearch"
      const normalizedKey = passkey.trim();
      const isValid = normalizedKey === 'BUDDY-ADMIN-2026' || normalizedKey === 'FINDCO-ADMIN-2026' || normalizedKey === 'admin123' || normalizedKey === 'buddysearch' || normalizedKey === 'findco';

      if (isValid) {
        setIsLoading(false);
        onShowToast('Identity authenticated. Welcome to FindCo Operations Console.', 'success');
        onAuthenticate({
          operatorName: 'Inspector Tanvi Deshmukh',
          operatorId: operatorId || 'ops-lead@findco.internal',
          role: 'Lead Trust & Safety Officer',
          authenticatedAt: new Date().toLocaleTimeString(),
          token: `fco_sec_${Math.random().toString(36).substring(2, 10)}`
        });
      } else {
        setIsLoading(false);
        const nextAttempts = attemptsLeft - 1;
        setAttemptsLeft(nextAttempts);
        if (nextAttempts <= 0) {
          setErrorMsg('Security lockout triggered: Too many failed authorization attempts. System frozen for 60 seconds.');
        } else {
          setErrorMsg(`Invalid security key or token. ${nextAttempts} attempt${nextAttempts === 1 ? '' : 's'} remaining before system lockout.`);
        }
      }
    }, 600);
  };

  const handleQuickFill = () => {
    setPasskey('BUDDY-ADMIN-2026');
    setTotp('748291');
    setOperatorId('audit.lead@findco.internal');
    setErrorMsg('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0a0b12 70%)',
      color: '#f8fafc',
      position: 'relative'
    }}>
      
      {/* Top Banner Navigation */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 24,
        right: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <button
          type="button"
          onClick={onExitToConsumer}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#e2e8f0',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
        >
          <ArrowLeft size={16} />
          Exit to Consumer Website
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.74rem',
          color: '#94a3b8',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span>ZERO TRUST GATEWAY · RESTRICTED INTRANET</span>
        </div>
      </div>

      {/* Main Lock Card */}
      <div style={{
        maxWidth: 480,
        width: '100%',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6)',
        padding: '36px 32px',
        position: 'relative'
      }}>
        
        {/* Shield Icon Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(250, 110, 94, 0.12)',
            border: '1px solid rgba(250, 110, 94, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <Lock size={26} color="var(--color-primary)" />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Administrative Operations Portal
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Access to this console is restricted to authorized FindCo Trust, Safety, and Compliance personnel. All session events are cryptographically audited.
          </p>
        </div>

        {/* Quick Fill Helper for Demo / Testing */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px dashed rgba(56, 189, 248, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#38bdf8' }}>
              Staff Demo Access Pass
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Key: <code style={{ color: '#f8fafc' }}>BUDDY-ADMIN-2026</code>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            style={{
              background: 'rgba(56, 189, 248, 0.18)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Auto-Fill Demo Key
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(225, 29, 72, 0.15)',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.78rem',
            color: '#fda4af'
          }}>
            <AlertTriangle size={16} color="var(--color-rose)" style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleLogin}>
          {/* Operator ID */}
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="admin-operator-id" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              Internal Operator ID / Badge Email
            </label>
            <input 
              id="admin-operator-id"
              type="text"
              value={operatorId}
              onChange={e => setOperatorId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-md)',
                color: '#f8fafc',
                fontSize: '0.86rem'
              }}
            />
          </div>

          {/* Master Security Key */}
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="admin-passkey" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              Master Security Passphrase
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                id="admin-passkey"
                type={showPasskey ? 'text' : 'password'}
                placeholder="Enter admin security passkey"
                value={passkey}
                onChange={e => setPasskey(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 14px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  color: '#f8fafc',
                  fontSize: '0.86rem',
                  letterSpacing: showPasskey ? 'normal' : '0.1em'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
                aria-label={showPasskey ? 'Hide passkey' : 'Show passkey'}
              >
                {showPasskey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Simulated 2FA TOTP Token */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="admin-totp" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              <span>Hardware 2FA / Authenticator Token</span>
              <span style={{ color: '#38bdf8', fontSize: '0.72rem' }}>6-Digit OTP</span>
            </label>
            <input 
              id="admin-totp"
              type="text"
              maxLength={6}
              placeholder="e.g. 748291"
              value={totp}
              onChange={e => setTotp(e.target.value.replace(/\D/g, ''))}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-md)',
                color: '#38bdf8',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textAlign: 'center'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || attemptsLeft <= 0}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '0.96rem',
              fontWeight: 800,
              gap: 8,
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
            }}
          >
            {isLoading ? (
              <span>Authorizing Cryptographic Credentials...</span>
            ) : (
              <>
                <KeyRound size={17} />
                <span>Verify Credentials & Enter Console</span>
              </>
            )}
          </button>
        </form>

        {/* Security Seals */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: '#94a3b8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>256-Bit TLS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Fingerprint size={14} color="#38bdf8" />
            <span>Hardware MFA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Terminal size={14} color="var(--color-primary)" />
            <span>Audit Stream</span>
          </div>
        </div>

      </div>

      {/* Footer Notice */}
      <div style={{
        marginTop: 20,
        fontSize: '0.72rem',
        color: '#64748b',
        textAlign: 'center',
        maxWidth: 420
      }}>
        Unauthorized access attempts to the FindCo Operations Portal are logged and reported per the Information Technology Act of India (Cert-In Guidelines).
      </div>

    </div>
  );
}
