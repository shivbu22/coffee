import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Gift, Sparkles, QrCode } from 'lucide-react';

export default function ShareInviteModal({ isOpen, onClose, userProfile, onShowToast }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const referralCode = userProfile?.id ? `FND-${userProfile.id.slice(0, 6).toUpperCase()}` : 'FINDCO-VIP';
  const inviteUrl = `https://findco.in/?ref=${referralCode}`;
  const shareMessage = `Join me on FindCo — India's verified social companionship platform! Connect for coffee meetups, workout spotters, and city walks with dual-handshake escrow protection. Use invite code ${referralCode} to get ₹200 bonus credit: ${inviteUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    if (onShowToast) onShowToast('Invite link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FindCo Companion Invite',
          text: shareMessage,
          url: inviteUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

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
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-invite-title"
        style={{
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--text-main, #0f172a)',
          width: '100%',
          maxWidth: '520px',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
              <Gift size={20} />
            </div>
            <div>
              <h2 id="share-invite-title" style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Invite Friends to FindCo
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                Share your invite link & earn ₹200 companion credits
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
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', textAlign: 'center' }}>
          {/* Stylized QR Code Visual */}
          <div
            style={{
              width: 150,
              height: 150,
              margin: '0 auto 18px auto',
              padding: 12,
              background: '#ffffff',
              borderRadius: 16,
              border: '2px dashed var(--border-subtle, #cbd5e1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <QrCode size={100} color="#0f172a" />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#fa6e5e', marginTop: 4 }}>
              SCAN TO JOIN
            </span>
          </div>

          <div
            style={{
              background: '#fff1ef',
              border: '1px solid #ffdcd6',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: '#c2410c',
              marginBottom: 18,
              lineHeight: 1.45
            }}
          >
            <strong>Dual Reward:</strong> When a friend joins with your link and completes their first meetup, both of you unlock <strong>₹200 in escrow credits</strong>!
          </div>

          {/* Referral Code Box */}
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Personal Invite Link
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 6,
                background: 'var(--bg-elevated, #f1f5f9)',
                border: '1px solid var(--border-subtle, #cbd5e1)',
                borderRadius: 10,
                padding: '6px 8px'
              }}
            >
              <input
                type="text"
                readOnly
                value={inviteUrl}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main, #0f172a)',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: copied ? '#10b981' : '#fa6e5e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={handleWhatsAppShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                padding: '11px',
                borderRadius: 10,
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <MessageCircle size={16} />
              WhatsApp
            </button>

            <button
              onClick={handleNativeShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'var(--text-main, #0f172a)',
                color: 'var(--bg-card, #ffffff)',
                border: 'none',
                padding: '11px',
                borderRadius: 10,
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Share2 size={16} />
              Share Anywhere
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

