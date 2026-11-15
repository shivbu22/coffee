import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Phone, 
  Mail,
  ArrowRight, 
  ArrowLeft,
  Lock, 
  CheckCircle2, 
  User, 
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { 
  SupabaseAuthService, 
  isSupabaseConfigured as initialSupabaseConfigured, 
  formatSupabaseUserProfile
} from '../lib/supabaseClient';
import { AuthEngine } from '../utils/authEngine';
import { validateEmail, validatePassword, validatePhoneIN, normalizePhoneIN } from '../utils/validate';
import { CITIES } from '../data/mockData';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowToast,
  defaultRole = 'client'
}) {
  const [isCloudActive, setIsCloudActive] = useState(initialSupabaseConfigured);

  // Auth Modes: 'email' (Email/Password) | 'phone' (Mobile OTP)
  const [authMethod, setAuthMethod] = useState('email'); 
  // For Email method: 'signin' | 'signup'
  const [emailMode, setEmailMode] = useState('signin'); 

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [city, setCity] = useState('Bengaluru');

  // Phone OTP Flow states
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);

  // Status & Error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Reset & sync state when opening
  useEffect(() => {
    if (isOpen) {
      setRole(defaultRole || 'client');
      setErrorMessage(null);
      setSuccessNotice(null);
      setOtpStep('phone');
      setFullName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setOtp(['', '', '', '', '', '']);
    }
  }, [isOpen, defaultRole]);

  // Accessibility: Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval;
    if (authMethod === 'phone' && otpStep === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMethod, otpStep, resendTimer]);

  if (!isOpen) return null;

  // --- 1. EMAIL SIGN IN & SIGN UP (CLOUDFLARE AUTH) ---
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const emailErr = validateEmail(email || '');
    if (emailErr) { setErrorMessage(emailErr); return; }
    if (!password) { setErrorMessage('Please enter your password.'); return; }
    // Enforce the 8-char minimum on sign-up; sign-in keeps server as authority.
    if (emailMode === 'signup') {
      const pwErr = validatePassword(password);
      if (pwErr) { setErrorMessage(pwErr); return; }
    } else if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCloudActive) {
        if (emailMode === 'signup') {
          // Live Cloudflare Cloud Sign Up
          const data = await SupabaseAuthService.signUpWithEmail({
            email,
            password,
            fullName: fullName || (role === 'buddy' ? 'New Companion' : 'New Member'),
            role,
            phone,
            city
          });

          if (data?.user) {
            const profile = formatSupabaseUserProfile(data.user, role);
            if (data.session) {
              onLoginSuccess(profile);
              onClose();
              if (onShowToast) onShowToast(`Welcome to FindCo, ${profile.name}! (Cloudflare Auth)`, 'success');
            } else {
              setSuccessNotice('Account registered in Cloudflare! If confirmation email was enabled, please verify your inbox.');
              if (onShowToast) onShowToast('Cloudflare account registered!', 'info');
            }
          }
        } else {
          // Live Cloudflare Cloud Sign In
          const data = await SupabaseAuthService.signInWithEmail(email, password);
          if (data?.user) {
            const profile = formatSupabaseUserProfile(data.user, role);
            onLoginSuccess(profile);
            onClose();
            if (onShowToast) onShowToast(`Welcome back, ${profile.name}! (Cloudflare Auth)`, 'success');
          }
        }
      } else {
        // Real Cryptographic Authentication (Salted SHA-256 Hashing, Accounts DB, and Password Verification)
        if (emailMode === 'signup') {
          const { user } = await AuthEngine.register({
            email,
            password,
            fullName: fullName || (role === 'buddy' ? 'New Companion' : 'FindCo Member'),
            role,
            city,
            phone
          });
          onLoginSuccess(user);
          onClose();
          if (onShowToast) onShowToast(`Account created successfully! Welcome, ${user.name}.`, 'success');
        } else {
          const { user } = await AuthEngine.login({
            email,
            password
          });
          onLoginSuccess(user);
          onClose();
          if (onShowToast) onShowToast(`Welcome back, ${user.name}!`, 'success');
        }
      }
    } catch (err) {
      console.error('[Auth Error]', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 2. MOBILE OTP FLOW (CLOUDFLARE / OTP) ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanPhone = normalizePhoneIN(phone) || '';
    if (validatePhoneIN(phone)) {
      setErrorMessage(validatePhoneIN(phone));
      return;
    }

    setIsSubmitting(true);
    try {
      if (isCloudActive) {
        try {
          await SupabaseAuthService.signInWithOtp(`+91${cleanPhone}`);
          if (onShowToast) onShowToast(`SMS OTP sent via Cloudflare Auth to +91 ${cleanPhone}!`, 'info');
        } catch (supaErr) {
          console.warn('[Cloudflare SMS Note]', supaErr.message);
          await AuthEngine.requestPhoneOtp(cleanPhone);
          if (onShowToast) onShowToast(`Verification code sent to +91 ${cleanPhone}`, 'info');
        }
      } else {
        await AuthEngine.requestPhoneOtp(cleanPhone);
        if (onShowToast) onShowToast(`Verification code sent to +91 ${cleanPhone}`, 'info');
      }
      setOtpStep('otp');
      setResendTimer(30);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send OTP code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage(null);
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    const enteredCode = otp.join('');
    if (enteredCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code in the boxes below.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');

      if (isCloudActive) {
        try {
          const res = await SupabaseAuthService.verifyOtp({
            phoneOrEmail: `+91${cleanPhone}`,
            token: enteredCode,
            type: 'sms'
          });
          if (res?.user) {
            const profile = formatSupabaseUserProfile(res.user, role);
            onLoginSuccess(profile);
            onClose();
            if (onShowToast) onShowToast(`Verified via Cloudflare Phone Auth!`, 'success');
            return;
          }
        } catch (supaErr) {
          console.warn('[Cloudflare Verify Note]', supaErr.message);
        }
      }

      // Real Cryptographic OTP Verification
      const { user } = await AuthEngine.verifyPhoneOtp(cleanPhone, enteredCode);
      onLoginSuccess(user);
      onClose();
      if (onShowToast) onShowToast(`Phone verified! Welcome back, ${user.name}.`, 'success');
    } catch (err) {
      setErrorMessage(err.message || 'OTP verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. GOOGLE OAUTH ---
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    if (!isCloudActive) {
      setErrorMessage('Google OAuth requires Cloudflare Cloud authentication.');
      return;
    }
    try {
      await SupabaseAuthService.signInWithGoogle();
    } catch (err) {
      setErrorMessage(err.message || 'Google OAuth failed to initialize.');
    }
  };

  // OTP Input handlers
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = (otp && otp.length === 6) ? [...otp] : ['', '', '', '', '', ''];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpInputRefs[index + 1]?.current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs[index - 1]?.current?.focus();
    }
  };

  const handlePasteOtp = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < pasteData.length; i++) newOtp[i] = pasteData[i];
      setOtp(newOtp);
      const nextIndex = Math.min(pasteData.length, 5);
      otpInputRefs[nextIndex]?.current?.focus();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.72)',
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="modal-enter"
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#ffffff',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(226, 232, 240, 0.85)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Subtle Brand Accent Top Bar */}
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
          padding: '24px 28px 16px 28px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafaf9 100%)',
          borderBottom: '1px solid #f1f5f9'
        }}>
          {/* Logo Brand Mark */}
          <div style={{ display: 'inline-flex', marginBottom: 10 }}>
            <BrandLogo variant="navbar" size="md" />
          </div>

          <h2 id="auth-modal-title" style={{
            fontSize: '1.38rem',
            fontWeight: 800,
            margin: '0 0 4px 0',
            color: '#0f172a',
            letterSpacing: '-0.025em',
            fontFamily: 'var(--font-heading, "Outfit", sans-serif)'
          }}>
            {authMethod === 'email' 
              ? (emailMode === 'signup' ? 'Create FindCo Account' : 'Welcome to FindCo')
              : (otpStep === 'phone' ? 'Mobile Verification' : 'Enter SMS Code')}
          </h2>

          {(authMethod === 'email' || otpStep !== 'phone') && (
            <p style={{
              fontSize: '0.82rem',
              color: '#64748b',
              margin: 0,
              lineHeight: 1.45
            }}>
              {authMethod === 'email'
                ? (emailMode === 'signup' 
                    ? 'Sign up with Cloudflare to connect with verified companions across India.' 
                    : 'Sign in to access your bookings, chat quotes, and escrow wallet.')
                : `Enter the 6-digit verification code sent to +91 ${phone}`}
            </p>
          )}

          {/* Auth Method Switcher Tabs */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: 10,
            padding: 3,
            marginTop: 14,
            gap: 4
          }}>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '7px 10px',
                borderRadius: 8,
                border: 'none',
                background: authMethod === 'email' ? '#ffffff' : 'transparent',
                color: authMethod === 'email' ? '#0f172a' : '#64748b',
                fontWeight: authMethod === 'email' ? 700 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: authMethod === 'email' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Mail size={14} color={authMethod === 'email' ? '#fa6e5e' : '#64748b'} />
              <span>Email & Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '7px 10px',
                borderRadius: 8,
                border: 'none',
                background: authMethod === 'phone' ? '#ffffff' : 'transparent',
                color: authMethod === 'phone' ? '#0f172a' : '#64748b',
                fontWeight: authMethod === 'phone' ? 700 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: authMethod === 'phone' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Phone size={14} color={authMethod === 'phone' ? '#fa6e5e' : '#64748b'} />
              <span>Mobile OTP</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div style={{ padding: '20px 28px' }}>
          
          {/* Error & Success Feedback Alerts */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 10,
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              fontSize: '0.78rem',
              lineHeight: 1.45,
              marginBottom: 14
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 10,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              fontSize: '0.78rem',
              lineHeight: 1.45,
              marginBottom: 14
            }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{successNotice}</span>
            </div>
          )}

          {/* METHOD 1: EMAIL & PASSWORD (CLOUDFLARE AUTH) */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailAuth}>
              
              {/* Sign In vs Sign Up Toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14
              }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {emailMode === 'signin' ? 'Sign In' : 'New Registration'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode(emailMode === 'signin' ? 'signup' : 'signin');
                    setErrorMessage(null);
                    setSuccessNotice(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#fa6e5e',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {emailMode === 'signin' ? "Don't have an account? Sign Up" : 'Already registered? Sign In'}
                </button>
              </div>

              {/* Role Picker (Visible during Sign Up) */}
              {emailMode === 'signup' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    I want to join as:
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    background: '#f8fafc',
                    padding: 4,
                    borderRadius: 12,
                    border: '1px solid #e2e8f0'
                  }}>
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: role === 'client' ? '1.5px solid #fa6e5e' : '1px solid transparent',
                        background: role === 'client' ? '#ffffff' : 'transparent',
                        color: role === 'client' ? '#0f172a' : '#64748b',
                        fontWeight: role === 'client' ? 800 : 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={13} color={role === 'client' ? '#fa6e5e' : '#64748b'} />
                        <span>Hire a Buddy</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('buddy')}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: role === 'buddy' ? '1.5px solid #fa6e5e' : '1px solid transparent',
                        background: role === 'buddy' ? '#ffffff' : 'transparent',
                        color: role === 'buddy' ? '#0f172a' : '#64748b',
                        fontWeight: role === 'buddy' ? 800 : 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={13} color={role === 'buddy' ? '#fa6e5e' : '#64748b'} />
                        <span>Be a Companion</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name & City (Sign Up Only) */}
              {emailMode === 'signup' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        outline: 'none',
                        color: '#0f172a'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      City
                    </label>
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 8px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        outline: 'none',
                        color: '#0f172a',
                        background: '#ffffff'
                      }}
                    >
                      {CITIES.slice(1, 9).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Email Address
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: focusedInput === 'email' ? '1.5px solid #fa6e5e' : '1px solid #cbd5e1',
                  borderRadius: 10,
                  padding: '0 12px',
                  boxShadow: focusedInput === 'email' ? '0 0 0 3px rgba(250, 110, 94, 0.12)' : 'none',
                  transition: 'all 0.15s ease'
                }}>
                  <Mail size={15} color={focusedInput === 'email' ? '#fa6e5e' : '#94a3b8'} style={{ marginRight: 8, flexShrink: 0 }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="name@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
                    Password
                  </label>
                  {emailMode === 'signin' && (
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Min. 8 characters</span>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: focusedInput === 'password' ? '1.5px solid #fa6e5e' : '1px solid #cbd5e1',
                  borderRadius: 10,
                  padding: '0 12px',
                  boxShadow: focusedInput === 'password' ? '0 0 0 3px rgba(250, 110, 94, 0.12)' : 'none',
                  transition: 'all 0.15s ease'
                }}>
                  <Lock size={15} color={focusedInput === 'password' ? '#fa6e5e' : '#94a3b8'} style={{ marginRight: 8, flexShrink: 0 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="Enter account password"
                    required
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
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
                  background: 'linear-gradient(135deg, #fa6e5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.8 : 1,
                  boxShadow: '0 4px 14px rgba(250, 110, 94, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.18s ease'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{emailMode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* METHOD 2: PHONE OTP FLOW */}
          {authMethod === 'phone' && (
            otpStep === 'phone' ? (
              /* STEP 1: PHONE NUMBER INPUT & VERIFY BUTTON */
              <form onSubmit={handleSendOtp}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Mobile Phone Number
                  </label>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#ffffff',
                    border: focusedInput === 'phone' ? '1.5px solid #fa6e5e' : '1px solid #cbd5e1',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: focusedInput === 'phone' ? '0 0 0 3px rgba(250, 110, 94, 0.12)' : 'none',
                    transition: 'all 0.15s ease'
                  }}>
                    <div style={{
                      padding: '11px 14px',
                      background: '#f8fafc',
                      borderRight: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#334155'
                    }}>
                      <span>🇮🇳</span>
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
                      autoFocus
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
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #fa6e5e 0%, #e11d48 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(250, 110, 94, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Mobile & Get OTP</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: 6-DIGIT OTP FILLING OPTIONS (REVEALED AFTER CLICKING VERIFY) */
              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom: 14 }}>
                  <button
                    type="button"
                    onClick={() => setOtpStep('phone')}
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
                  >
                    <ArrowLeft size={14} />
                    <span>Change mobile number (+91 {phone})</span>
                  </button>
                </div>

                <div style={{ marginBottom: 18 }} onPaste={handlePasteOtp}>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>
                      Enter 6-Digit Security Code
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {[0, 1, 2, 3, 4, 5].map((idx) => {
                      const digit = otp[idx] || '';
                      return (
                        <input
                          key={idx}
                          ref={otpInputRefs[idx]}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          aria-label={`Digit ${idx + 1} of 6`}
                          autoComplete={idx === 0 ? "one-time-code" : "off"}
                          value={digit}
                          onChange={e => handleOtpChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                          style={{
                            width: 44,
                            height: 52,
                            borderRadius: 10,
                            border: digit ? '2px solid #fa6e5e' : '1.5px solid #cbd5e1',
                            background: digit ? '#fff1ef' : '#ffffff',
                            fontSize: '1.35rem',
                            fontWeight: 900,
                            textAlign: 'center',
                            color: '#0f172a',
                            outline: 'none',
                            boxShadow: digit ? '0 0 0 2px rgba(250, 110, 94, 0.18)' : 'none'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', marginBottom: 18 }}>
                  {resendTimer > 0 ? (
                    <span>Resend code in <strong style={{ color: '#0f172a' }}>00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      style={{ background: 'none', border: 'none', color: '#fa6e5e', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Resend SMS OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #fa6e5e 0%, #e11d48 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(250, 110, 94, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Verify & Enter Dashboard</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )
          )}

          {/* Social / OAuth Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            margin: '18px 0 12px 0'
          }}>
            <div style={{ height: 1, flex: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Or Continue With
            </span>
            <div style={{ height: 1, flex: 1, background: '#e2e8f0' }} />
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 12,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#1e293b',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#94a3b8';
              e.currentTarget.style.background = '#f8fafc';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>




        </div>
      </div>
    </div>
  );
}
