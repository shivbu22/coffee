import React, { useState, useRef, useEffect } from 'react';
import BrandLogo from './BrandLogo';
import { 
  Compass, 
  Rss, 
  Search, 
  PlusCircle, 
  MessageSquare, 
  ShieldCheck, 
  CreditCard, 
  Award,
  ChevronDown,
  CheckCircle2,
  User,
  Star,
  Lock,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  Bot,
  HelpCircle
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  role, 
  setRole, 
  hasActiveSub, 
  onOpenSubscribe, 
  unreadCount,
  onOpenPostRequest,
  buddyProfile,
  onOpenAdminPortal,
  isLoggedIn = false,
  currentUser = null,
  onOpenAuth,
  onLogout,
  onOpenAntigravityAgent
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const userName = currentUser?.name || buddyProfile?.name || 'Priya Sharma';
  const userAvatar = currentUser?.avatar || buddyProfile?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=faces';
  const userCity = currentUser?.city || buddyProfile?.city || 'Bengaluru';

  const handleProtectedTab = (tabId, targetRole = 'client') => {
    if (!isLoggedIn) {
      if (onOpenAuth) {
        onOpenAuth(targetRole, tabId);
      }
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      transition: 'var(--transition-smooth)'
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Brand Logo */}
        <div style={{ flexShrink: 0 }}>
          <BrandLogo 
            variant="navbar" 
            size="md" 
            onClick={() => setActiveTab('landing')} 
          />
        </div>

        {/* Center Streamlined Navigation */}
        <nav 
          aria-label="Main Navigation"
          className="nav-scroll-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: 'var(--bg-elevated)',
            padding: '3px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
            flexShrink: 0
          }}
        >
          {/* Feed */}
          <button 
            type="button"
            onClick={() => handleProtectedTab('feed')}
            title={!isLoggedIn ? 'Sign in to access Feed' : undefined}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'feed' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'feed' ? 'var(--text-main)' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: activeTab === 'feed' ? 700 : 600,
              cursor: 'pointer',
              boxShadow: activeTab === 'feed' ? '0 1px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
              transition: 'var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
          >
            <Rss size={14} color={activeTab === 'feed' ? 'var(--color-primary-hover)' : 'currentColor'} />
            <span>Feed</span>
          </button>

          {/* Discover */}
          <button 
            type="button"
            onClick={() => handleProtectedTab('discover')}
            title={!isLoggedIn ? 'Sign in to access Discover' : undefined}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'discover' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'discover' ? 'var(--text-main)' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: activeTab === 'discover' ? 700 : 600,
              cursor: 'pointer',
              boxShadow: activeTab === 'discover' ? '0 1px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
              transition: 'var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
          >
            <Search size={14} color={activeTab === 'discover' ? 'var(--color-primary-hover)' : 'currentColor'} />
            <span>Discover</span>
          </button>

          {/* Chats */}
          <button 
            type="button"
            onClick={() => handleProtectedTab('chats')}
            title={!isLoggedIn ? 'Sign in to access Chats' : undefined}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'chats' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'chats' ? 'var(--text-main)' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: activeTab === 'chats' ? 700 : 600,
              cursor: 'pointer',
              boxShadow: activeTab === 'chats' ? '0 1px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
              transition: 'var(--transition-fast)',
              position: 'relative',
              whiteSpace: 'nowrap'
            }}
          >
            <MessageSquare size={14} color={activeTab === 'chats' ? 'var(--color-primary-hover)' : 'currentColor'} />
            <span>Chats</span>
            {unreadCount > 0 && isLoggedIn && (
              <span style={{
                background: 'var(--color-rose)',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: 'var(--radius-full)',
                lineHeight: 1.2
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Companion Profile / Studio Tab (Active in companion mode) */}
          {role === 'buddy' && (
            <button 
              type="button"
              onClick={() => handleProtectedTab('profile', 'buddy')}
              title={!isLoggedIn ? 'Sign in to access Studio' : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-full)',
                background: activeTab === 'profile' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--text-main)' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: activeTab === 'profile' ? 700 : 600,
                cursor: 'pointer',
                boxShadow: activeTab === 'profile' ? '0 1px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
                transition: 'var(--transition-fast)',
                whiteSpace: 'nowrap'
              }}
            >
              <User size={14} color={activeTab === 'profile' ? 'var(--color-primary-hover)' : 'currentColor'} />
              <span>Studio</span>
            </button>
          )}

          {/* Plans */}
          <button 
            type="button"
            onClick={() => handleProtectedTab('subscriptions')}
            title={!isLoggedIn ? 'Sign in to access Plans' : undefined}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'subscriptions' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'subscriptions' ? 'var(--text-main)' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: activeTab === 'subscriptions' ? 700 : 600,
              cursor: 'pointer',
              boxShadow: activeTab === 'subscriptions' ? '0 1px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
              transition: 'var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
          >
            <CreditCard size={14} color={activeTab === 'subscriptions' ? 'var(--color-primary-hover)' : 'currentColor'} />
            <span>Plans</span>
          </button>
        </nav>

        {/* Right Action Suite */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0
        }}>


          {!isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button 
                type="button"
                onClick={() => onOpenAuth ? onOpenAuth('client') : setActiveTab('feed')}
                style={{ 
                  padding: '7px 16px', 
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Sign In
              </button>

              <button 
                type="button"
                onClick={() => onOpenAuth ? onOpenAuth('client') : setActiveTab('feed')}
                className="btn-primary"
                style={{ 
                  padding: '7px 18px', 
                  fontSize: '0.84rem',
                  borderRadius: 'var(--radius-full)',
                  gap: 6
                }}
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <>
              {/* Post Request Quick Button */}
              <button 
                type="button"
                onClick={onOpenPostRequest}
                className="btn-primary"
                style={{ 
                  padding: '7px 14px', 
                  fontSize: '0.82rem',
                  borderRadius: 'var(--radius-full)',
                  gap: 6
                }}
              >
                <PlusCircle size={15} />
                Post Request
              </button>

              {/* Membership Pass Pill */}
              {hasActiveSub ? (
                <div 
                  onClick={() => setActiveTab('subscriptions')}
                  className="badge-tag-gold"
                  style={{ 
                    cursor: 'pointer', 
                    padding: '6px 11px',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700
                  }}
                >
                  <Award size={13} />
                  <span>PRO ACTIVE</span>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={onOpenSubscribe}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--color-primary-text)',
                    background: 'var(--color-primary-bg)',
                    border: '1px solid var(--border-accent)',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px var(--color-primary-glow)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Award size={13} color="var(--color-gold)" />
                  <span>VIP Plans</span>
                </button>
              )}

              {/* User Profile Pill & Dropdown Hub */}
              <div style={{ position: 'relative' }} ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '3px 8px 3px 4px',
                    borderRadius: 'var(--radius-full)',
                    background: isProfileOpen ? 'var(--bg-elevated)' : 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
              <div style={{ position: 'relative' }}>
                <img 
                  src={userAvatar}
                  alt={userName}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 'var(--radius-full)',
                    objectFit: 'cover'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 9,
                  height: 9,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-emerald)',
                  border: '1.5px solid var(--bg-card)'
                }} />
              </div>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                maxWidth: 70,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {userName.split(' ')[0]}
              </span>
              <ChevronDown size={13} color="var(--text-muted)" style={{
                transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform var(--transition-fast)'
              }} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 270,
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-xl)',
                padding: 12,
                zIndex: 1000,
                animation: 'fadeInScale 0.16s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}>
                {/* User Info Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--border-subtle)'
                }}>
                  <img 
                    src={userAvatar}
                    alt={userName}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 'var(--radius-full)',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {userName}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.72rem',
                      color: 'var(--color-emerald)',
                      fontWeight: 600,
                      marginTop: 1
                    }}>
                      <CheckCircle2 size={12} />
                      Aadhaar Verified · {userCity}
                    </div>
                  </div>
                </div>

                {/* Switch Mode Controls in Dropdown */}
                <div style={{ margin: '10px 0 12px 0' }}>
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    Switch Mode
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 2,
                    gap: 2
                  }}>
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      style={{
                        flex: 1,
                        background: role === 'client' ? 'var(--bg-card)' : 'transparent',
                        color: role === 'client' ? 'var(--color-primary-text)' : 'var(--text-muted)',
                        border: 'none',
                        boxShadow: role === 'client' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                        padding: '6px 4px',
                        borderRadius: 6,
                        fontSize: '0.74rem',
                        fontWeight: role === 'client' ? 700 : 600,
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      Client
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('buddy')}
                      style={{
                        flex: 1,
                        background: role === 'buddy' ? 'var(--bg-card)' : 'transparent',
                        color: role === 'buddy' ? 'var(--color-rose)' : 'var(--text-muted)',
                        border: 'none',
                        boxShadow: role === 'buddy' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                        padding: '6px 4px',
                        borderRadius: 6,
                        fontSize: '0.74rem',
                        fontWeight: role === 'buddy' ? 700 : 600,
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      Companion
                    </button>
                  </div>
                </div>

                {/* Quick Menu Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsProfileOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: activeTab === 'dashboard' ? 'var(--bg-elevated)' : 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'dashboard' ? 'var(--bg-elevated)' : 'transparent'}
                  >
                    <LayoutDashboard size={15} color="var(--color-primary)" />
                    <span>Member Dashboard & Escrow</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('profile');
                      setIsProfileOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: activeTab === 'profile' ? 'var(--bg-elevated)' : 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'profile' ? 'var(--bg-elevated)' : 'transparent'}
                  >
                    <User size={15} color="var(--color-primary)" />
                    <span>My Companion Profile & Rates</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('vault');
                      setIsProfileOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <ShieldCheck size={15} color="var(--color-emerald)" />
                    <span>Aadhaar KYC Verification</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('subscriptions');
                      setIsProfileOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: activeTab === 'subscriptions' ? 'var(--bg-elevated)' : 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'subscriptions' ? 'var(--bg-elevated)' : 'transparent'}
                  >
                    <Award size={15} color="var(--color-gold)" />
                    <span>Passes & Membership</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('help');
                      setIsProfileOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: activeTab === 'help' ? 'var(--bg-elevated)' : 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'help' ? 'var(--bg-elevated)' : 'transparent'}
                  >
                    <HelpCircle size={15} color="var(--color-primary)" />
                    <span>Help & Escrow FAQ</span>
                  </button>

                  {/* Protected Admin Access Discrete Option */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAdminPortal) onOpenAdminPortal();
                      setIsProfileOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: 6,
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Lock size={13} color="var(--color-primary)" />
                      <span>Trust & Safety Portal</span>
                    </span>
                    <span style={{
                      fontSize: '0.62rem',
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--color-gold)',
                      fontWeight: 800
                    }}>
                      STAFF
                    </span>
                  </button>

                  {/* Sign Out Action */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onLogout) onLogout();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-rose, #e11d48)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: 4,
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fff1f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <LogOut size={13} color="var(--color-rose, #e11d48)" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Footer Info */}
                <div style={{
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.68rem',
                  color: 'var(--text-dim)'
                }}>
                  <span>FindCo Platform v2.4</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={11} /> Aadhaar Encrypted
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  </div>
</header>
  );
}
