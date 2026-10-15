import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Award, 
  X, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Smartphone, 
  Lock,
  ArrowRight,
  MessageSquare,
  Heart,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SUBSCRIPTION_PLANS } from '../data/mockData';

export default function SubscriptionModal({ 
  isOpen, 
  onClose, 
  onUnlockSubscription, 
  onShowToast,
  defaultTier = 'premium',
  initialMode = 'buddysearch_hero'
}) {
  const [modalMode, setModalMode] = useState(initialMode); // 'buddysearch_hero' | 'select_plan' | 'checkout' | 'success'
  const [selectedTier, setSelectedTier] = useState(defaultTier); // default to ₹599 (12 Months, Most Popular)
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in percent
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultTier) setSelectedTier(defaultTier);
      if (initialMode) setModalMode(initialMode);
    }
  }, [isOpen, defaultTier, initialMode]);

  // Accessibility: Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activePlan = SUBSCRIPTION_PLANS.find(p => p.tier === selectedTier || (selectedTier === 'star' && p.tier === 'star_member')) || SUBSCRIPTION_PLANS[2];
  const finalPrice = Math.max(1, Math.round(activePlan.price * (1 - appliedDiscount / 100)));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'BUDDY50' || code === 'BUDDYSEARCH50' || code === 'FINDCO50') {
      setAppliedDiscount(50);
      onShowToast('Coupon applied! 50% discount activated.', 'success');
    } else if (code === 'FINDCO100' || code === 'FREEPASS') {
      setAppliedDiscount(100);
      onShowToast('VIP Pass applied! 100% Free Access.', 'success');
    } else {
      onShowToast('Invalid or expired coupon code. Try "BUDDY50"', 'error');
    }
  };

  const handleCompletePayment = () => {
    setIsProcessingRazorpay(true);
    setTimeout(() => {
      setIsProcessingRazorpay(false);
      setModalMode('success');

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      onUnlockSubscription(activePlan.tier);
      onShowToast(`Payment verified! ${activePlan.name} is now active on your account.`, 'success');
    }, 1200);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: 16
    }}>
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-modal-title"
        className="modal-enter"
        style={{
          width: '100%',
          maxWidth: modalMode === 'select_plan' ? 680 : 440,
          background: 'var(--bg-card, #ffffff)',
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal dialog"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: modalMode === 'buddysearch_hero' ? 'rgba(0, 0, 0, 0.2)' : 'var(--bg-elevated, #f1f5f9)',
            border: 'none',
            color: modalMode === 'buddysearch_hero' ? '#ffffff' : 'var(--text-secondary, #64748b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background var(--transition-fast)'
          }}
        >
          <X size={17} />
        </button>

        {/* ==================================================== */}
        {/* 1. EXACT BUDDYSEARCH HERO MODAL (From User Screenshot) */}
        {/* ==================================================== */}
        {modalMode === 'buddysearch_hero' && (
          <div>
            {/* Top Curved Coral Gradient Header */}
            <div style={{
              background: 'linear-gradient(145deg, #f43f5e 0%, #e11d48 55%, #fb7185 100%)',
              padding: '36px 28px 30px 28px',
              textAlign: 'center',
              color: '#ffffff',
              position: 'relative'
            }}>
              {/* Lock Icon Pill */}
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <Lock size={20} color="#ffffff" />
              </div>

              {/* Members Only Badge */}
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.95)',
                marginBottom: 8
              }}>
                MEMBERS ONLY
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                lineHeight: 1.25,
                margin: '0 0 8px 0',
                color: '#ffffff',
                letterSpacing: '-0.02em'
              }}>
                Your next buddy is one tap away.
              </h2>

              {/* Subtitle */}
              <p style={{
                fontSize: '0.84rem',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
                lineHeight: 1.45,
                maxWidth: 320,
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Unlock this to see who's already interested in meeting you.
              </p>
            </div>

            {/* Modal Body with 3 Key Features */}
            <div style={{ padding: '24px 28px 28px 28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                
                {/* Feature 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: '#fff1f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MessageSquare size={18} color="#e11d48" />
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
                    Hire nearby buddy, instantly
                  </div>
                </div>

                {/* Feature 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: '#fff1f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Heart size={18} color="#e11d48" />
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
                    Unlimited connections, every day
                  </div>
                </div>

                {/* Feature 3 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: '#fff1f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ShieldCheck size={18} color="#e11d48" />
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
                    Priority for verified profiles
                  </div>
                </div>

              </div>

              {/* Social Proof Pill (Overlapping Avatars) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: 'var(--bg-elevated, #f8fafc)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                padding: '8px 16px',
                borderRadius: 9999,
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                    alt="Member"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: '2px solid #ffffff',
                      objectFit: 'cover'
                    }}
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                    alt="Member"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: '2px solid #ffffff',
                      marginLeft: -8,
                      objectFit: 'cover'
                    }}
                  />
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces"
                    alt="Member"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: '2px solid #ffffff',
                      marginLeft: -8,
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #475569)' }}>
                  <strong>1M+</strong> buddies are already members
                </span>
              </div>

              {/* Big Coral Red CTA Button */}
              <button
                type="button"
                onClick={() => setModalMode('select_plan')}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: 9999,
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px -4px rgba(225, 29, 72, 0.4)',
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px -4px rgba(225, 29, 72, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(225, 29, 72, 0.4)';
                }}
              >
                Unlock Full Access
              </button>

              {/* Starts at Pricing Subtext */}
              <div style={{
                textAlign: 'center',
                marginTop: 10,
                fontSize: '0.78rem',
                color: 'var(--text-muted, #94a3b8)'
              }}>
                Starts at <strong style={{ color: 'var(--text-main, #334155)' }}>₹299 (3 Months)</strong> · Premium from <strong>₹50/mo</strong> · Star Member <strong>₹799 Lifetime</strong>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 2. CHOOSE PLAN VIEW (BuddySearch 4 Tiers: Basic, Standard, Premium, Star) */}
        {/* ==================================================== */}
        {modalMode === 'select_plan' && (
          <div style={{ padding: '28px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#fff1f2',
                color: '#e11d48',
                padding: '3px 12px',
                borderRadius: 9999,
                fontSize: '0.72rem',
                fontWeight: 800,
                marginBottom: 8
              }}>
                <Award size={12} />
                SELECT YOUR MEMBERSHIP PASS
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                Choose Your Pass
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Instant access to verified companion chats, requests, and direct proposals.
              </p>
            </div>

            {/* Plans List (4 BuddySearch Tiers) */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(136px, 1fr))', 
              gap: 10, 
              marginBottom: 20 
            }}>
              {SUBSCRIPTION_PLANS.map(p => {
                const isSelected = p.tier === selectedTier;
                const isStar = p.tier === 'star_member';
                return (
                  <div
                    key={p.tier}
                    onClick={() => setSelectedTier(p.tier)}
                    style={{
                      border: isSelected ? '2px solid #e11d48' : '1px solid var(--border-subtle)',
                      background: isSelected ? '#fff1f2' : (isStar ? 'rgba(217, 119, 6, 0.04)' : 'var(--bg-elevated)'),
                      borderRadius: 16,
                      padding: '16px 10px 14px 10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition-fast)',
                      boxShadow: isSelected ? '0 8px 20px -6px rgba(225, 29, 72, 0.25)' : 'none'
                    }}
                  >
                    {(p.popular || isStar) && (
                      <span style={{
                        position: 'absolute',
                        top: -9,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: p.popular ? '#e11d48' : '#d97706',
                        color: '#ffffff',
                        fontSize: '0.56rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 9999,
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.04em'
                      }}>
                        {p.popular ? 'MOST POPULAR' : 'LIFETIME VIP'}
                      </span>
                    )}

                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                        {p.validity}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 900, color: p.popular ? '#e11d48' : (isStar ? '#d97706' : '#0f172a') }} className="tabular-nums">
                          ₹{p.price}
                        </span>
                        <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.72rem' }} className="tabular-nums">
                          ₹{p.originalPrice}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        color: isSelected ? '#be123c' : '#475569',
                        background: isSelected ? '#ffe4e6' : '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: 6
                      }}>
                        {p.monthlyBreakdown}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: '#059669', fontWeight: 700 }}>
                        Save {p.discountPercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input
                type="text"
                placeholder='Coupon code (Try "BUDDY50")'
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-elevated)',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '9px 16px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: 'var(--text-main)'
                }}
              >
                Apply
              </button>
            </form>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setModalMode('buddysearch_hero')}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: 9999,
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setModalMode('checkout')}
                style={{
                  flex: 2,
                  padding: '11px 20px',
                  borderRadius: 9999,
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(225, 29, 72, 0.35)'
                }}
              >
                Proceed to Pay ₹{finalPrice}
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 3. RAZORPAY / UPI CHECKOUT SIMULATOR */}
        {/* ==================================================== */}
        {modalMode === 'checkout' && (
          <div style={{ padding: '28px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto'
              }}>
                <CreditCard size={20} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                Razorpay Secure Checkout
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                256-Bit Encrypted Payment Gateway · NPCI Approved
              </p>
            </div>

            <div style={{
              background: 'var(--bg-elevated)',
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Selected Plan:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{activePlan.name} ({activePlan.validity})</span>
              </div>
              {appliedDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#059669' }}>
                  <span>Discount Applied ({appliedDiscount}%):</span>
                  <span>-₹{activePlan.price - finalPrice}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Total Payable:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#e11d48' }} className="tabular-nums">
                  ₹{finalPrice}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={isProcessingRazorpay}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 9999,
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: isProcessingRazorpay ? 'not-allowed' : 'pointer',
                  opacity: isProcessingRazorpay ? 0.7 : 1,
                  boxShadow: '0 6px 20px rgba(225, 29, 72, 0.35)'
                }}
              >
                {isProcessingRazorpay ? 'Verifying with Bank...' : `Pay ₹${finalPrice} via UPI / Card`}
              </button>

              <button
                type="button"
                onClick={() => setModalMode('select_plan')}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 9999,
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Change Plan
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 4. SUCCESS CELEBRATION */}
        {/* ==================================================== */}
        {modalMode === 'success' && (
          <div style={{ padding: '36px 28px', textAlign: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Check size={28} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              Membership Unlocked!
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24 }}>
              Your <strong>{activePlan.name}</strong> is now active. You have full access to chat with nearby verified companions, post requests, and connect instantly.
            </p>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 9999,
                background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              Start Exploring Buddies
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
