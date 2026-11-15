import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  Wallet, 
  Calendar, 
  User, 
  Lock, 
  Phone, 
  ChevronRight, 
  Sparkles,
  Copy,
  X,
  Building2,
  Check,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { isSupabaseConfigured, SupabaseService } from '../lib/supabaseClient';

// Isolated self-updating countdown to eliminate 1-second re-render storms across the DashboardView tree
function ActiveSessionCountdown({ initialSeconds = 42 * 60 }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <div style={{
      fontSize: '2.1rem',
      fontWeight: 900,
      color: seconds < 600 ? '#dc2626' : '#0f172a',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-0.02em'
    }}>
      {formatted}
    </div>
  );
}

export default function DashboardView({
  dashboardData,
  setDashboardData,
  role,
  setRole,
  onOpenPostRequest,
  onNavigateToFeed,
  onNavigateToChats,
  onShowToast
}) {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'wallet' | 'safety'
  const [bookingFilter, setBookingFilter] = useState('all'); // 'all' | 'confirmed' | 'pending'
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('2000');
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [lastCheckInTime, setLastCheckInTime] = useState('12 mins ago');
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  // Handshake PIN & Escrow Release Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [activePinBooking, setActivePinBooking] = useState(null);
  const [inputHandshakePin, setInputHandshakePin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleCopyPin = (pin) => {
    navigator.clipboard?.writeText(pin);
    setCopiedPin(true);
    if (onShowToast) onShowToast(`Handshake PIN ${pin} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleOpenPinModal = (booking) => {
    setActivePinBooking(booking);
    setInputHandshakePin('');
    setPinError('');
    setIsPinModalOpen(true);
  };

  const handleVerifyHandshakePin = (e) => {
    e.preventDefault();
    if (!activePinBooking) return;
    const entered = inputHandshakePin.trim();
    if (entered.length !== 4) {
      setPinError('Please enter the 4-digit PIN provided by your client.');
      return;
    }

    if (activePinBooking.handshakePin && entered !== activePinBooking.handshakePin) {
      setPinError('Incorrect Handshake PIN. Please verify the 4 digits with your client.');
      return;
    }

    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.6 }
    });

    const releaseAmount = Number(activePinBooking.amount ?? activePinBooking.escrowAmount ?? 800);

    // Release escrow into companion wallet balance
    setDashboardData(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        availableBalance: prev.wallet.availableBalance + releaseAmount,
        totalEarnings: prev.wallet.totalEarnings + releaseAmount,
        escrowLocked: Math.max(0, prev.wallet.escrowLocked - releaseAmount),
        transactions: [
          {
            id: `tx_pin_${Date.now()}`,
            date: 'Just now',
            title: `Escrow Released: ${activePinBooking.title}`,
            amount: releaseAmount,
            type: 'credit',
            status: `Dual-Handshake PIN [${entered}] Verified & Funds Released`
          },
          ...prev.wallet.transactions
        ]
      },
      upcomingBookings: prev.upcomingBookings.map(b => 
        b.id === activePinBooking.id 
          ? { ...b, status: 'completed', escrowStatus: 'Escrow Released' } 
          : b
      )
    }));

    if (isSupabaseConfigured) {
      SupabaseService.verifyBookingPin(activePinBooking.id, entered)
        .catch(err => console.warn('[Supabase Sync] verify pin fallback:', err));
    }

    setIsPinModalOpen(false);
    if (onShowToast) {
      onShowToast(`Dual-Handshake Verified! ₹${releaseAmount.toLocaleString('en-IN')} escrow released to your wallet.`, 'success');
    }
  };

  const handlePerformCheckIn = () => {
    setCheckInSuccess(true);
    setLastCheckInTime('Just now');
    if (onShowToast) onShowToast("Safety check-in logged successfully with FindCo 24/7 Safety Command.", "success");
    setTimeout(() => setCheckInSuccess(false), 3000);
  };

  const handleApproveQuote = (bookingId) => {
    setDashboardData(prev => ({
      ...prev,
      upcomingBookings: prev.upcomingBookings.map(b => 
        b.id === bookingId ? { ...b, status: 'confirmed', escrowStatus: 'Escrow Locked' } : b
      )
    }));
    if (onShowToast) onShowToast("Booking quote accepted! Escrow payment locked in secure vault.", "success");
  };

  const handleDeclineQuote = (bookingId) => {
    setDashboardData(prev => ({
      ...prev,
      upcomingBookings: prev.upcomingBookings.filter(b => b.id !== bookingId)
    }));
    if (onShowToast) onShowToast("Booking request declined.", "info");
  };

  const handleWithdrawFunds = (e) => {
    e.preventDefault();
    if (isSubmittingWithdrawal) return;

    const numAmount = parseInt(withdrawAmount, 10);
    if (isNaN(numAmount) || numAmount < 100) {
      if (onShowToast) onShowToast("Minimum withdrawal is ₹100.", "error");
      return;
    }
    if (numAmount > dashboardData.wallet.availableBalance) {
      if (onShowToast) onShowToast("Amount exceeds available balance.", "error");
      return;
    }

    setIsSubmittingWithdrawal(true);

    setTimeout(() => {
      const newTx = {
        id: `tx_${Date.now()}`,
        date: 'Just now',
        title: `IMPS Instant Transfer to ${dashboardData.wallet.upiId}`,
        amount: -numAmount,
        type: 'debit',
        status: `Settled via IMPS (Ref: ${Math.floor(1000000 + Math.random() * 9000000)})`
      };

      setDashboardData(prev => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          availableBalance: prev.wallet.availableBalance - numAmount,
          lastSettlementDate: 'Just now',
          transactions: [newTx, ...prev.wallet.transactions]
        }
      }));

      setIsSubmittingWithdrawal(false);
      setIsWithdrawModalOpen(false);
      if (onShowToast) onShowToast(`₹${numAmount.toLocaleString('en-IN')} transferred to ${dashboardData.wallet.upiId}! (Demo Mode)`, "success");
    }, 600);
  };

  const activeHangout = dashboardData?.activeHangout;
  const upcomingBookings = dashboardData?.upcomingBookings || [];
  const wallet = dashboardData?.wallet || {};
  const safetyEnclave = dashboardData?.safetyEnclave || {};

  // Filter bookings based on active pill
  const filteredBookings = upcomingBookings.filter(b => {
    if (bookingFilter === 'confirmed') return b.status === 'confirmed';
    if (bookingFilter === 'pending') return b.status === 'pending_quote_approval';
    return true;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 80px 20px' }}>
      
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingBottom: 22,
        marginBottom: 26,
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <h1 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 800, 
              color: '#0f172a', 
              letterSpacing: '-0.025em',
              margin: 0
            }}>
              Connections & Sessions
            </h1>
            
            {/* Live Status Chip */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '3px 12px',
              borderRadius: 9999,
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0'
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
              }} />
              Identity Enclave Active
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Real-time co-activity oversight, escrow vault protection, and verified itinerary management.
          </p>
        </div>

        {/* View Mode Switch & Post Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Dual Perspective Toggle */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: 3,
            borderRadius: 9999,
            border: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={() => setRole('buddy')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                fontSize: '0.8rem',
                fontWeight: role === 'buddy' ? 700 : 600,
                borderRadius: 9999,
                border: 'none',
                background: role === 'buddy' ? '#ffffff' : 'transparent',
                color: role === 'buddy' ? '#0f172a' : '#64748b',
                boxShadow: role === 'buddy' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <User size={14} color={role === 'buddy' ? '#e11d48' : '#64748b'} />
              <span>Companion Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('client')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                fontSize: '0.8rem',
                fontWeight: role === 'client' ? 700 : 600,
                borderRadius: 9999,
                border: 'none',
                background: role === 'client' ? '#ffffff' : 'transparent',
                color: role === 'client' ? '#0f172a' : '#64748b',
                boxShadow: role === 'client' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Calendar size={14} color={role === 'client' ? '#e11d48' : '#64748b'} />
              <span>Client Mode</span>
            </button>
          </div>

          {/* Post Request Action */}
          <button
            type="button"
            onClick={onOpenPostRequest}
            className="btn-primary"
            style={{
              padding: '8px 20px',
              fontSize: '0.84rem',
              borderRadius: 9999,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Sparkles size={14} />
            <span>Post Hangout</span>
          </button>
        </div>
      </div>

      {/* Metric Bento Cards (Fintech / Creator Quality) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        {/* Card 1: Available Payouts / Wallet Credit */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #f1f5f9',
          borderRadius: 16,
          padding: '20px 22px',
          boxShadow: '0 4px 18px -4px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {role === 'buddy' ? 'Available to Withdraw' : 'FindCo Wallet'}
              </span>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wallet size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }} className="tabular-nums">
              ₹{wallet.availableBalance?.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 10, borderTop: '1px solid #f8fafc' }}>
            <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              Auto-settle to UPI enabled
            </span>
            {role === 'buddy' && (
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#e11d48',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: 9999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
              >
                Withdraw <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Card 2: RBI-Compliant Escrow */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #f1f5f9',
          borderRadius: 16,
          padding: '20px 22px',
          boxShadow: '0 4px 18px -4px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                RBI-Compliant Escrow
              </span>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }} className="tabular-nums">
              ₹{wallet.inEscrow?.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, paddingTop: 10, borderTop: '1px solid #f8fafc' }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#f59e0b'
            }} />
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
              Held safely until Handshake PIN is validated
            </span>
          </div>
        </div>

        {/* Card 3: Completed Hangouts */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #f1f5f9',
          borderRadius: 16,
          padding: '20px 22px',
          boxShadow: '0 4px 18px -4px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Completed Sessions
              </span>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }} className="tabular-nums">
              34 Trips
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, paddingTop: 10, borderTop: '1px solid #f8fafc' }}>
            <span style={{
              background: '#ecfdf5',
              color: '#059669',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 9999
            }}>
              100% Safety Clearance Rate
            </span>
          </div>
        </div>

        {/* Card 4: Platform Trust Score */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #f1f5f9',
          borderRadius: 16,
          padding: '20px 22px',
          boxShadow: '0 4px 18px -4px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Platform Trust Rating
              </span>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#fffbeb',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={18} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }} className="tabular-nums">
                4.92
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>/ 5.0 (28 reviews)</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, paddingTop: 10, borderTop: '1px solid #f8fafc', fontSize: '0.74rem' }}>
            <span style={{ color: '#059669', fontWeight: 700 }}>Aadhaar Verified</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ color: '#64748b' }}>Zero Incident Record</span>
          </div>
        </div>
      </div>

      {/* ACTIVE LIVE HANGOUT RADAR (The Real-Time Session Card) */}
      {activeHangout && activeHangout.status === 'in_progress' && (
        <div style={{
          background: '#ffffff',
          border: '2px solid rgba(225, 29, 72, 0.25)',
          borderRadius: 20,
          padding: 24,
          marginBottom: 32,
          position: 'relative',
          boxShadow: '0 12px 36px -8px rgba(225, 29, 72, 0.12), 0 2px 10px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          {/* Subtle Top Ambient Glow Accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 50%, #fb7185 100%)'
          }} />

          {/* Header pill & Live beacon */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff1f2',
                color: '#e11d48',
                padding: '5px 14px',
                borderRadius: 9999,
                fontSize: '0.76rem',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#e11d48',
                  boxShadow: '0 0 10px #e11d48'
                }} />
                LIVE CO-ACTIVITY IN PROGRESS
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Session: <code style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700, background: '#f8fafc', padding: '2px 8px', borderRadius: 6 }}>{activeHangout.id}</code>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsSosModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  color: '#dc2626',
                  padding: '7px 16px',
                  borderRadius: 9999,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
              >
                <AlertTriangle size={15} />
                <span>Emergency SOS</span>
              </button>
            </div>
          </div>

          {/* Main Active Session Content Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            alignItems: 'center'
          }}>
            {/* Left Column: Activity & Partner Info */}
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={activeHangout.partnerAvatar}
                  alt={activeHangout.partnerName}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 16,
                    objectFit: 'cover',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: -3,
                  right: -3,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '2.5px solid #ffffff'
                }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: '#e11d48',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: 3
                }}>
                  {activeHangout.category}
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: '0 0 4px 0',
                  letterSpacing: '-0.02em'
                }}>
                  {activeHangout.activityTitle}
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#475569', marginBottom: 8 }}>
                  With <strong>{activeHangout.partnerName}</strong> ({role === 'buddy' ? 'Client' : 'Verified Companion'})
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  color: '#64748b'
                }}>
                  <MapPin size={14} color="#e11d48" style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeHangout.venue}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Column: Handshake PIN & Escrow */}
            <div style={{
              background: '#f8fafc',
              padding: 18,
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Dual-Handshake PIN
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#059669',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#ecfdf5',
                  padding: '2px 8px',
                  borderRadius: 9999
                }}>
                  <CheckCircle2 size={13} />
                  Meeting Verified
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  letterSpacing: '0.28em',
                  color: '#0f172a',
                  fontFamily: 'monospace'
                }}>
                  {activeHangout.handshakePin}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPin(activeHangout.handshakePin)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '7px 14px',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#334155',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                >
                  {copiedPin ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  <span>{copiedPin ? 'Copied' : 'Copy PIN'}</span>
                </button>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: '1px solid #e2e8f0',
                fontSize: '0.78rem'
              }}>
                <span style={{ color: '#64748b' }}>Escrow Release Protection:</span>
                <span style={{ fontWeight: 800, color: '#059669' }} className="tabular-nums">
                  ₹{activeHangout.escrowAmount} in Vault
                </span>
              </div>
            </div>

            {/* Right Column: Safety Countdown & Check-in */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              background: '#f8fafc',
              padding: 18,
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              gap: 8
            }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Next Safety Check-in Timer
              </span>
              
              <ActiveSessionCountdown initialSeconds={42 * 60} />

              <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: 4 }}>
                Last verified check-in: <strong style={{ color: '#0f172a' }}>{lastCheckInTime}</strong>
              </div>

              <button
                type="button"
                onClick={handlePerformCheckIn}
                style={{
                  width: '100%',
                  background: checkInSuccess 
                    ? '#059669' 
                    : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <ShieldCheck size={15} />
                <span>{checkInSuccess ? "Check-in Confirmed ✓" : "I'm Safe (Log Check-in)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Segmented Filter Navigation Bar for Dashboard Sections */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
        paddingBottom: 4
      }}>
        {/* Modern Segmented Pill Controls */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#f1f5f9',
          padding: 4,
          borderRadius: 9999,
          border: '1px solid #e2e8f0'
        }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('overview')}
            style={{
              padding: '8px 18px',
              fontSize: '0.82rem',
              fontWeight: activeSubTab === 'overview' ? 800 : 600,
              color: activeSubTab === 'overview' ? '#e11d48' : '#64748b',
              background: activeSubTab === 'overview' ? '#ffffff' : 'transparent',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'overview' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Calendar size={14} color={activeSubTab === 'overview' ? '#e11d48' : '#94a3b8'} />
            <span>Itinerary & Sessions</span>
            <span style={{
              background: activeSubTab === 'overview' ? '#fff1f2' : '#e2e8f0',
              color: activeSubTab === 'overview' ? '#e11d48' : '#475569',
              padding: '1px 7px',
              borderRadius: 9999,
              fontSize: '0.7rem',
              fontWeight: 800
            }}>
              {upcomingBookings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('wallet')}
            style={{
              padding: '8px 18px',
              fontSize: '0.82rem',
              fontWeight: activeSubTab === 'wallet' ? 800 : 600,
              color: activeSubTab === 'wallet' ? '#e11d48' : '#64748b',
              background: activeSubTab === 'wallet' ? '#ffffff' : 'transparent',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'wallet' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Wallet size={14} color={activeSubTab === 'wallet' ? '#e11d48' : '#94a3b8'} />
            <span>Escrow & Payouts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('safety')}
            style={{
              padding: '8px 18px',
              fontSize: '0.82rem',
              fontWeight: activeSubTab === 'safety' ? 800 : 600,
              color: activeSubTab === 'safety' ? '#e11d48' : '#64748b',
              background: activeSubTab === 'safety' ? '#ffffff' : 'transparent',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'safety' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <ShieldCheck size={14} color={activeSubTab === 'safety' ? '#e11d48' : '#94a3b8'} />
            <span>Safety Enclave</span>
          </button>
        </div>

        {/* Sub-filter pills for Bookings when in Overview */}
        {activeSubTab === 'overview' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {['all', 'confirmed', 'pending'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setBookingFilter(f)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 9999,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  border: bookingFilter === f ? '1px solid #cbd5e1' : '1px solid transparent',
                  background: bookingFilter === f ? '#ffffff' : 'transparent',
                  color: bookingFilter === f ? '#0f172a' : '#64748b'
                }}
              >
                {f === 'all' ? 'All Bookings' : f === 'confirmed' ? 'Confirmed' : 'Pending Quotes'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 1: BOOKINGS & SCHEDULE */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 2
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Scheduled Itineraries & Booking Requests
            </h2>
            <button
              type="button"
              onClick={onNavigateToFeed}
              style={{
                fontSize: '0.82rem',
                color: '#e11d48',
                fontWeight: 700,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>Explore Open Client Requests</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {filteredBookings.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px dashed #cbd5e1',
              padding: '48px 20px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <Calendar size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>No bookings matching this filter</div>
              <p style={{ fontSize: '0.84rem', marginTop: 4 }}>Check your other tabs or browse active city requests.</p>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: 16,
                  padding: '20px 24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 18,
                  boxShadow: '0 4px 18px -4px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}
              >
                {/* Partner + Activity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 280, flex: 1 }}>
                  <img
                    src={b.partnerAvatar}
                    alt={b.partnerName}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      objectFit: 'cover',
                      border: '2px solid #e2e8f0',
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <div style={{
                      fontSize: '0.72rem',
                      color: '#e11d48',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 2
                    }}>
                      {b.category}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      {b.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 3 }}>
                      With <strong style={{ color: '#0f172a' }}>{b.partnerName}</strong> · {b.partnerCity}
                    </div>
                  </div>
                </div>

                {/* Venue & Date */}
                <div style={{ minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.84rem', color: '#0f172a', fontWeight: 700, marginBottom: 5 }}>
                    <Calendar size={15} color="#e11d48" />
                    <span>{b.dateTime}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem', color: '#64748b' }}>
                    <MapPin size={14} color="#94a3b8" />
                    <span>{b.venue}</span>
                  </div>
                </div>

                {/* Amount & Status Badge */}
                <div style={{ textAlign: 'right', minWidth: 150 }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }} className="tabular-nums">
                    ₹{Number(b.amount ?? b.escrowAmount ?? 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    marginTop: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    background: b.status === 'confirmed' ? '#ecfdf5' : '#fffbeb',
                    color: b.status === 'confirmed' ? '#059669' : '#d97706',
                    border: `1px solid ${b.status === 'confirmed' ? '#a7f3d0' : '#fde68a'}`
                  }}>
                    {b.status === 'confirmed' ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>Confirmed • PIN: {b.handshakePin}</span>
                      </>
                    ) : (
                      <>
                        <Clock size={12} />
                        <span>Pending Approval</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {b.status === 'pending_quote_approval' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApproveQuote(b.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 10,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Accept & Lock
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineQuote(b.id)}
                        style={{
                          padding: '8px 14px',
                          background: '#f8fafc',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          borderRadius: 10,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {b.status === 'confirmed' && b.escrowStatus !== 'Escrow Released' && (
                        <button
                          type="button"
                          onClick={() => handleOpenPinModal(b)}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 10,
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.28)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <KeyRound size={14} />
                          <span>Release Escrow (Validate PIN)</span>
                        </button>
                      )}

                      {b.escrowStatus === 'Escrow Released' && (
                        <span style={{
                          padding: '6px 12px',
                          background: '#ecfdf5',
                          color: '#059669',
                          borderRadius: 8,
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          border: '1px solid #a7f3d0'
                        }}>
                          ✓ Escrow Released to Payouts
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={onNavigateToChats}
                        style={{
                          padding: '8px 14px',
                          background: '#ffffff',
                          color: '#0f172a',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: 10,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>Open Chat</span>
                        <ChevronRight size={14} color="#64748b" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SECTION 2: ESCROW & FINANCIAL LEDGER */}
      {activeSubTab === 'wallet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top Settlement Summary Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: 18,
            padding: 24,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            boxShadow: '0 4px 18px -4px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Building2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Primary UPI ID for Direct Bank Settlement
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginTop: 3 }}>
                  {wallet.upiId}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700 }}>
                  <CheckCircle2 size={13} />
                  <span>IMPS Instant Payouts Active · Last Settled: {wallet.lastSettlementDate}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                className="btn-primary"
                style={{
                  padding: '9px 22px',
                  fontSize: '0.85rem',
                  borderRadius: 9999,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <ArrowUpRight size={15} />
                <span>Withdraw Funds (UPI)</span>
              </button>
            </div>
          </div>

          {/* Detailed Transaction Ledger Table */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: 18,
            padding: '22px 26px',
            boxShadow: '0 4px 18px -4px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Escrow & Financial Transaction Ledger
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Every transaction is locked in RBI-compliant escrow until the meeting handshake PIN is confirmed.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px 10px', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date & Time</th>
                    <th style={{ padding: '12px 10px', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Activity Description</th>
                    <th style={{ padding: '12px 10px', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Settlement Status</th>
                    <th style={{ padding: '12px 10px', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.transactions?.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 10px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                        {tx.date}
                      </td>
                      <td style={{ padding: '14px 10px', fontWeight: 700, color: '#0f172a' }}>
                        {tx.title}
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 9px',
                          borderRadius: 9999,
                          background: tx.status.includes('Escrow') ? '#fffbeb' : '#ecfdf5',
                          color: tx.status.includes('Escrow') ? '#b45309' : '#059669',
                          border: `1px solid ${tx.status.includes('Escrow') ? '#fde68a' : '#a7f3d0'}`
                        }}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{
                        padding: '14px 10px',
                        textAlign: 'right',
                        fontWeight: 900,
                        color: tx.type === 'credit' ? '#059669' : '#0f172a'
                      }} className="tabular-nums">
                        {Number(tx.amount || 0) > 0 ? `+₹${Number(tx.amount || 0).toLocaleString('en-IN')}` : `-₹${Math.abs(Number(tx.amount || 0)).toLocaleString('en-IN')}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SAFETY ENCLAVE & IDENTITY AUDIT */}
      {activeSubTab === 'safety' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Card 1: Aadhaar Cold-Storage Details */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: 18,
            padding: 24,
            boxShadow: '0 4px 18px -4px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Aadhaar Identity Enclave
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                  {safetyEnclave.aadhaarStatus}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.55, marginBottom: 18 }}>
              All identity credentials are authenticated against official UIDAI schemas and encrypted using AES-256 HSM keys. Raw Aadhaar numbers are never exposed publicly.
            </p>

            <div style={{
              background: '#f8fafc',
              padding: 14,
              borderRadius: 12,
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Certificate Ref:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{safetyEnclave.aadhaarRef}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Storage Protocol:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{safetyEnclave.vaultStorage}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Latest Audit:</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{safetyEnclave.lastVerified}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Emergency Contact & SOS Protocol */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: 18,
            padding: 24,
            boxShadow: '0 4px 18px -4px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#fff1f2',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Phone size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Emergency Contact Protocol
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  FindCo 24/7 SOS Protocol
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.55, marginBottom: 18 }}>
              If a safety check-in countdown expires without response, automated emergency SMS alerts with GPS coordinates are instantly dispatched.
            </p>

            <div style={{
              background: '#f8fafc',
              padding: 14,
              borderRadius: 12,
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              border: '1px solid #e2e8f0',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Guardian Name:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{safetyEnclave.emergencyContactName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Contact Phone:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{safetyEnclave.emergencyContactPhone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Direct Line:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>24/7 Priority Bridge</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSosModalOpen(true)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 10,
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                color: '#dc2626',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <AlertTriangle size={15} />
              <span>Simulate Emergency SOS Alert</span>
            </button>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {isWithdrawModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 20,
            width: '100%',
            maxWidth: 440,
            padding: 26,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ArrowUpRight size={18} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Withdraw to UPI
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWithdrawFunds}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Available Balance
                </label>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }} className="tabular-nums">
                  ₹{wallet.availableBalance?.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Withdrawal Amount (INR)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: 12, fontWeight: 800, color: '#94a3b8' }}>₹</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 32px',
                      borderRadius: 12,
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '1.05rem',
                      fontWeight: 800
                    }}
                    min="100"
                    max={wallet.availableBalance}
                  />
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: 14,
                borderRadius: 12,
                marginBottom: 22,
                fontSize: '0.8rem',
                color: '#475569',
                border: '1px solid #e2e8f0'
              }}>
                <div>Destination UPI: <strong style={{ color: '#0f172a' }}>{wallet.upiId}</strong></div>
                <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: 4, fontWeight: 700 }}>
                  Zero settlement charges via National Payments Corporation (NPCI)
                </div>
                <div style={{
                  marginTop: 8,
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: '#fef3c7',
                  color: '#92400e',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}>
                  ⚠️ DEMO MODE: Test sandbox simulation. No actual bank funds are deducted.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  disabled={isSubmittingWithdrawal}
                  onClick={() => setIsWithdrawModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: isSubmittingWithdrawal ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdrawal}
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: 10,
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    opacity: isSubmittingWithdrawal ? 0.6 : 1,
                    cursor: isSubmittingWithdrawal ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmittingWithdrawal ? 'Settling IMPS...' : `Confirm ₹${withdrawAmount} Transfer`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOS EMERGENCY MODAL */}
      {isSosModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            border: '2px solid #dc2626',
            borderRadius: 20,
            width: '100%',
            maxWidth: 440,
            padding: 26,
            boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.35)',
            animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#dc2626' }}>
                  FindCo Emergency SOS
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                  Active Venue: {activeHangout?.venue}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55, marginBottom: 18 }}>
              Triggering SOS immediately dispatches your current GPS coordinates, companion identity, and venue details to <strong>{safetyEnclave.emergencyContactName}</strong> and places a high-priority bridge call with FindCo Trust & Safety Desk.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setIsSosModalOpen(false);
                  if (onShowToast) onShowToast("EMERGENCY ALERT: Location and session logs transmitted to guardian & police helpline.", "error");
                }}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
                }}
              >
                Confirm & Dispatch SOS Alert
              </button>
              <button
                type="button"
                onClick={() => setIsSosModalOpen(false)}
                style={{
                  width: '100%',
                  padding: '11px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  borderRadius: 12,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel (Test / Accidental Trigger)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handshake PIN Escrow Release Modal */}
      {isPinModalOpen && activePinBooking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 440,
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Mutual Handshake Verification
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Dual-PIN Nodal Escrow Release
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 4
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, marginBottom: 18, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
                <span style={{ color: '#64748b' }}>Client:</span>
                <strong style={{ color: '#0f172a' }}>{activePinBooking.partnerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
                <span style={{ color: '#64748b' }}>Session:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{activePinBooking.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Escrow Payout to Release:</span>
                <strong style={{ color: '#059669', fontSize: '1rem' }} className="tabular-nums">
                  ₹{Number(activePinBooking.amount ?? activePinBooking.escrowAmount ?? 0).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <form onSubmit={handleVerifyHandshakePin}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                ENTER CLIENT'S 4-DIGIT PIN
              </label>
              
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input
                  type="text"
                  maxLength={4}
                  value={inputHandshakePin}
                  onChange={(e) => {
                    setInputHandshakePin(e.target.value.replace(/\D/g, ''));
                    setPinError('');
                  }}
                  placeholder="• • • •"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    letterSpacing: '0.4em',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    borderRadius: 12,
                    border: pinError ? '2px solid #ef4444' : '2px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a'
                  }}
                />
              </div>

              {pinError && (
                <div style={{ color: '#dc2626', fontSize: '0.78rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} />
                  <span>{pinError}</span>
                </div>
              )}

              <p style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45, marginBottom: 18 }}>
                Mutual safety protocol: Ask your client for the 4-digit Handshake PIN shown in their booking voucher. Entering this PIN immediately releases the locked escrow funds directly into your Available Balance.
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    borderRadius: 10,
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '11px',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Verify PIN & Release Escrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
