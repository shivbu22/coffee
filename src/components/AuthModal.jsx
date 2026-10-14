import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Lock, 
  CheckCircle2, 
  User, 
  Sparkles,
  Zap,
  ChevronRight,
  Shield
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowToast,
  defaultRole = 'client'
}) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('9876543210');
  const [role, setRole] = useState(defaultRole);
  const [fullName, setFullName] = useState('Shiv Y');
  const [otp, setOtp] = useState(['4', '8', '9', '2']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Sync role when modal opens with a specific default role
  useEffect(() => {
    if (isOpen) {
      setRole(defaultRole || 'client');
      setStep('phone');
      if (defaultRole === 'buddy') {
        setFullName('Priya Sharma');
        setPhone('9876543210');
      } else {
        setFullName('Shiv Y');
        setPhone('9811234567');
      }
    }
  }, [isOpen, defaultRole]);

  useEffect(() => {
    let interval;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      if (onShowToast) onShowToast('Please enter a valid 10-digit Indian mobile number.', 'error');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
      setResendTimer(30);
      if (onShowToast) onShowToast(`OTP sent to +91 ${phone}! (Demo Code: 4892)`, 'info');
    }, 450);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredCode = otp.join('');
    if (enteredCode.length !== 4) {
      if (onShowToast) onShowToast('Please enter the 4-digit code.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const isBuddy = role === 'buddy';
      const userProfile = {
        name: fullName || (isBuddy ? 'Priya Sharma' : 'Shiv Y'),
        phone: `+91 ${phone}`,
        city: 'Bengaluru',
        role: role,
        avatar: isBuddy 
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=faces'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=faces',
        isAadhaarVerified: true
      };

      onLoginSuccess(userProfile);
      onClose();
      if (onShowToast) onShowToast(`Welcome back, ${userProfile.name}!`, 'success');
    }, 600);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance focus
    if (value && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handlePasteOtp = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 4);
    if (pasteData) {
      const newOtp = [...otp];
      for (let i = 0; i < pasteData.length; i++) {
        newOtp[i] = pasteData[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pasteData.length, 3);
      otpInputRefs[nextIndex].current?.focus();
    }
  };

  const handleQuickDemoLogin = (demoRole) => {
    const isBuddy = demoRole === 'buddy';
    const userProfile = {
      name: isBuddy ? 'Priya Sharma' : 'Shiv Y',
      phone: isBuddy ? '+91 98765 43210' : '+91 98112 34567',
      city: 'Bengaluru',
      role: demoRole,
      avatar: isBuddy 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=faces'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=faces',
      isAadhaarVerified: true
    };
    onLoginSuccess(userProfile);
    onClose();
    if (onShowToast) onShowToast(`Logged in as ${userProfile.name} (${demoRole === 'buddy' ? 'Companion Buddy' : 'Client'})`, 'success');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.68)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        padding: 16
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="modal-enter"
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#ffffff',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(226, 232, 240, 0.85)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Subtle Brand Accent Bar */}
        <div style={{
          height: 4,
          width: '100%',
          background: 'linear-gradient(90deg, #f43f5e 0%, #fa6e5e 50%, #f8a84e 100%)'
        }} />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: 10,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f1f5f9';
            e.currentTarget.style.color = '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <X size={16} />
        </button>

        {/* Header Section */}
        <div style={{
          padding: '28px 28px 20px 28px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafaf9 100%)',
          borderBottom: '1px solid #f1f5f9'
        }}>
          {/* Logo Brand Mark */}
          <div style={{ display: 'inline-flex', marginBottom: 12 }}>
            <BrandLogo variant="navbar" size="md" />
          </div>

          {/* Trust Chip */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 9999,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            margin: '0 auto 12px auto'
          }}>
            <ShieldCheck size={13} color="#16a34a" />
            <span>UIDAI Cold-Storage & DPDP Compliant</span>
          </div>

          <h2 style={{
            fontSize: '1.42rem',
            fontWeight: 800,
            margin: '0 0 6px 0',
            color: '#0f172a',
            letterSpacing: '-0.025em',
            fontFamily: 'var(--font-heading, "Outfit", sans-serif)'
          }}>
            {step === 'phone' ? 'Sign in to FindCo' : 'Verify Mobile OTP'}
          </h2>

          <p style={{
            fontSize: '0.84rem',
            color: '#64748b',
            margin: 0,
            lineHeight: 1.5,
            maxWidth: 340,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {step === 'phone' 
              ? 'Enter your mobile number for secure, passwordless access to verified buddies.'
              : `Enter the 4-digit code sent via SMS to +91 ${phone}`}
          </p>
        </div>

        {/* Modal Form Body */}
        <div style={{ padding: '24px 28px' }}>
          
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp}>
              {/* Role Selection Segmented Control */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: 8 
                }}>
                  <label style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: '#475569', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>
                    I am joining as
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Toggle account mode
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  background: '#f8fafc',
                  padding: 4,
                  borderRadius: 14,
                  border: '1px solid #e2e8f0'
                }}>
                  {/* Option 1: Client */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('client');
                      if (fullName === 'Priya Sharma') setFullName('Shiv Y');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: role === 'client' ? '1.5px solid #e11d48' : '1.5px solid transparent',
                      background: role === 'client' ? '#ffffff' : 'transparent',
                      boxShadow: role === 'client' ? '0 2px 6px rgba(225, 29, 72, 0.08)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <User size={14} color={role === 'client' ? '#e11d48' : '#64748b'} />
                      <span style={{ 
                        fontSize: '0.82rem', 
                        fontWeight: 800, 
                        color: role === 'client' ? '#0f172a' : '#64748b' 
                      }}>
                        Hire a Buddy
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Client seeking plans
                    </span>
                  </button>

                  {/* Option 2: Companion */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('buddy');
                      if (fullName === 'Shiv Y') setFullName('Priya Sharma');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: role === 'buddy' ? '1.5px solid #e11d48' : '1.5px solid transparent',
                      background: role === 'buddy' ? '#ffffff' : 'transparent',
                      boxShadow: role === 'buddy' ? '0 2px 6px rgba(225, 29, 72, 0.08)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Sparkles size={14} color={role === 'buddy' ? '#e11d48' : '#64748b'} />
                      <span style={{ 
                        fontSize: '0.82rem', 
                        fontWeight: 800, 
                        color: role === 'buddy' ? '#0f172a' : '#64748b' 
                      }}>
                        Companion
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Earn ₹800–₹2,500/hr
                    </span>
                  </button>
                </div>
              </div>

              {/* Full Legal Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.76rem', 
                  fontWeight: 700, 
                  color: '#334155', 
                  marginBottom: 6 
                }}>
                  Full Name
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: focusedInput === 'name' ? '1.5px solid #e11d48' : '1px solid #cbd5e1',
                  borderRadius: 12,
                  padding: '0 12px',
                  boxShadow: focusedInput === 'name' ? '0 0 0 3px rgba(225, 29, 72, 0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}>
                  <User size={16} color={focusedInput === 'name' ? '#e11d48' : '#94a3b8'} style={{ flexShrink: 0, marginRight: 8 }} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="Enter your name"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 0',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.76rem', 
                  fontWeight: 700, 
                  color: '#334155', 
                  marginBottom: 6 
                }}>
                  Mobile Phone Number
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: focusedInput === 'phone' ? '1.5px solid #e11d48' : '1px solid #cbd5e1',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: focusedInput === 'phone' ? '0 0 0 3px rgba(225, 29, 72, 0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}>
                  {/* Country Code Pill */}
                  <div style={{
                    padding: '11px 14px',
                    background: '#f8fafc',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#334155',
                    userSelect: 'none'
                  }}>
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>🇮🇳</span>
                    <span>+91</span>
                  </div>

                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onFocus={() => setFocusedInput('phone')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="98765 43210"
                    maxLength={10}
                    required
                    style={{
                      flex: 1,
                      padding: '11px 12px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.94rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      letterSpacing: '0.04em',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, fontSize: '0.7rem', color: '#94a3b8' }}>
                  <Lock size={11} color="#94a3b8" />
                  <span>We protect your number. Never shared without mutual consent.</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.8 : 1,
                  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <span>{isSubmitting ? 'Sending Security Code...' : 'Get OTP Code'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              {/* Back Link to Edit Phone */}
              <div style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#e11d48'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  <ArrowLeft size={14} />
                  <span>Edit phone number (+91 {phone})</span>
                </button>
              </div>

              {/* 4 Digit OTP Inputs */}
              <div style={{ marginBottom: 18 }} onPaste={handlePasteOtp}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>
                    Enter 4-Digit Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(['4', '8', '9', '2']);
                      if (onShowToast) onShowToast('Demo code 4892 filled!', 'info');
                    }}
                    style={{
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      color: '#e11d48',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: 6,
                      padding: '2px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    Quick Autofill: 4892
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpInputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      style={{
                        width: 58,
                        height: 60,
                        borderRadius: 14,
                        border: digit ? '2px solid #e11d48' : '1.5px solid #cbd5e1',
                        background: digit ? '#fff1f2' : '#ffffff',
                        fontSize: '1.6rem',
                        fontWeight: 900,
                        textAlign: 'center',
                        color: '#0f172a',
                        outline: 'none',
                        boxShadow: digit ? '0 2px 8px rgba(225, 29, 72, 0.12)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#e11d48';
                        e.target.style.boxShadow = '0 0 0 3px rgba(225, 29, 72, 0.15)';
                      }}
                      onBlur={(e) => {
                        if (!digit) {
                          e.target.style.borderColor = '#cbd5e1';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Resend Timer */}
              <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', marginBottom: 20 }}>
                {resendTimer > 0 ? (
                  <span>Resend SMS OTP in <strong style={{ color: '#0f172a' }}>00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setResendTimer(30);
                      if (onShowToast) onShowToast('New SMS OTP sent! Code: 4892', 'info');
                    }}
                    style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Resend OTP via SMS
                  </button>
                )}
              </div>

              {/* Confirm Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <span>{isSubmitting ? 'Verifying Credentials...' : 'Verify & Enter Dashboard'}</span>
                <CheckCircle2 size={16} />
              </button>
            </form>
          )}

          {/* Quick Demo Fast-Pass / Curated Profile Switcher */}
          <div style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8, 
              marginBottom: 12 
            }}>
              <div style={{ height: 1, flex: 1, background: '#e2e8f0' }} />
              <span style={{ 
                fontSize: '0.68rem', 
                color: '#94a3b8', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em' 
              }}>
                1-Click Instant Demo Login
              </span>
              <div style={{ height: 1, flex: 1, background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Demo Account 1: Shiv (Client) */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('client')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                  alt="Shiv Y"
                  style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Shiv Y</span>
                  </div>
                  <span style={{ 
                    display: 'inline-block',
                    fontSize: '0.66rem', 
                    fontWeight: 700, 
                    color: '#64748b'
                  }}>
                    Client (Hiring)
                  </span>
                </div>
              </button>

              {/* Demo Account 2: Priya (Companion) */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('buddy')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid #fecdd3',
                  background: '#fff1f2',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f43f5e';
                  e.currentTarget.style.background = '#ffe4e6';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#fecdd3';
                  e.currentTarget.style.background = '#fff1f2';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces"
                  alt="Priya Sharma"
                  style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9f1239' }}>Priya S</span>
                    <span style={{ fontSize: '0.62rem', background: '#e11d48', color: '#fff', padding: '1px 4px', borderRadius: 4, fontWeight: 800 }}>PRO</span>
                  </div>
                  <span style={{ 
                    display: 'inline-block',
                    fontSize: '0.66rem', 
                    fontWeight: 700, 
                    color: '#be123c'
                  }}>
                    Companion Buddy
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer Security Note */}
          <div style={{
            marginTop: 18,
            textAlign: 'center',
            fontSize: '0.7rem',
            color: '#94a3b8',
            lineHeight: 1.45
          }}>
            By proceeding, you agree to FindCo’s{' '}
            <span style={{ color: '#64748b', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Terms</span>
            {' & '}
            <span style={{ color: '#64748b', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
            Protected by UIDAI & IT Act, 2000.
          </div>

        </div>
      </div>
    </div>
  );
}
