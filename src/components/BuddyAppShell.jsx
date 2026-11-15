import React, { useState } from 'react';
import { 
  Radio, 
  Compass, 
  MessageSquare, 
  Bell, 
  ListOrdered, 
  User, 
  Star, 
  HelpCircle, 
  LogOut, 
  Search, 
  Plus, 
  CheckCircle2,
  Lock,
  Share2,
  X,
  LogIn
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import SafeAvatar from './SafeAvatar';

export default function BuddyAppShell({
  activeTab,
  setActiveTab,
  role,
  setRole,
  hasActiveSub = false,
  unreadCount,
  notificationCount: externalNotificationCount,
  setNotificationCount: _externalSetNotificationCount,
  onOpenSubscribe,
  onOpenShareInvite,
  onUnlockSubscription: _onUnlockSubscription,
  onOpenPostRequest,
  buddyProfile,
  currentUser = null,
  isLoggedIn = false,
  onOpenAuth,
  onOpenAdminPortal: _onOpenAdminPortal,
  onLogout,
  onShowToast,
  onOpenAntigravityAgent: _onOpenAntigravityAgent,
  onOpenHallmark: _onOpenHallmark,
  children
}) {
  const [internalNotificationCount] = useState(2);
  const notificationCount = externalNotificationCount !== undefined ? externalNotificationCount : internalNotificationCount;
  const [showPwaPrompt, setShowPwaPrompt] = useState(() => {
    try {
      return !localStorage.getItem('findco_pwa_dismissed');
    } catch {
      return false;
    }
  });

  const userName = isLoggedIn ? (currentUser?.name || buddyProfile?.name || 'Member') : 'Guest Visitor';
  const userAvatar = isLoggedIn ? (currentUser?.avatar || buddyProfile?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=faces') : null;
  const roleDisplay = isLoggedIn ? (role === 'buddy' ? '✦ Buddy' : '✦ Client') : 'Not Signed In';

  const handleTabClick = (item) => {
    if (item.onClick) {
      item.onClick();
      return;
    }
    if (!isLoggedIn && ['chats', 'notifications', 'dashboard', 'profile', 'vault'].includes(item.id)) {
      if (onOpenAuth) {
        onOpenAuth('client', item.id);
      } else {
        setActiveTab(item.id);
      }
      return;
    }
    setActiveTab(item.id);
  };

  const navItems = [
    {
      group: 'EXPLORE',
      items: [
        {
          id: 'feed',
          label: 'Hire',
          subtitle: 'Live Gigs',
          icon: Radio,
          accentColor: '#e11d48',
          iconBg: 'rgba(225, 29, 72, 0.1)',
          gradient: 'linear-gradient(90deg, rgba(225, 29, 72, 0.08) 0%, rgba(225, 29, 72, 0.01) 100%)',
          borderColor: 'rgba(225, 29, 72, 0.16)',
          badge: null,
          isPaid: true
        },
        {
          id: 'discover',
          label: 'Find',
          subtitle: 'Directory',
          icon: Compass,
          accentColor: '#0284c7',
          iconBg: 'rgba(2, 132, 199, 0.1)',
          gradient: 'linear-gradient(90deg, rgba(2, 132, 199, 0.08) 0%, rgba(2, 132, 199, 0.01) 100%)',
          borderColor: 'rgba(2, 132, 199, 0.16)',
          badge: null,
          isPaid: true
        }
      ]
    },
    {
      group: 'COMMUNICATION',
      items: [
        {
          id: 'chats',
          label: 'Messages',
          icon: MessageSquare,
          badge: unreadCount > 0 ? unreadCount : null
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          badge: notificationCount > 0 ? notificationCount : null
        }
      ]
    },

    {
      group: 'COMMUNITY',
      items: [
        {
          id: 'dashboard',
          label: 'Connections',
          icon: ListOrdered,
          badge: null
        }
      ]
    },
    {
      group: 'ACCOUNT',
      items: [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          badge: null
        },
        {
          id: 'subscriptions',
          label: 'Membership',
          icon: Star,
          badge: null,
          onClick: onOpenSubscribe
        },
        {
          id: 'share_invite',
          label: 'Invite & Earn',
          icon: Share2,
          badge: '₹200',
          onClick: onOpenShareInvite
        },
        {
          id: 'help',
          label: 'Help',
          icon: HelpCircle,
          badge: null
        }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main, #f8fafc)' }}>
      
      {/* ========================================================= */}
      {/* LEFT SIDEBAR (Pixel-perfect match to BuddySearch screenshot) */}
      {/* ========================================================= */}
      <aside className="app-shell-sidebar">
        <div>
          {/* Top Brand Logo with Mascot */}
          <div 
            style={{ 
              marginBottom: 24,
              paddingLeft: 4
            }}
          >
            <BrandLogo 
              variant="navbar" 
              size="sm" 
              onClick={() => setActiveTab('landing')} 
            />
          </div>

          {/* Navigation Groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {navItems.map((group) => {
              const isExploreGroup = group.group === 'EXPLORE';

              return (
                <div key={group.group}>
                  <div style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: '#94a3b8',
                    paddingLeft: 10,
                    marginBottom: 6,
                    textTransform: 'uppercase'
                  }}>
                    {group.group}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: isExploreGroup ? 6 : 3 }}>
                    {group.items.map((item) => {
                      const IconComp = item.icon;
                      const isActive = activeTab === item.id;

                      if (isExploreGroup) {
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleTabClick(item)}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: 12,
                              background: isActive 
                                ? (item.gradient || 'rgba(225, 29, 72, 0.08)') 
                                : 'transparent',
                              color: isActive ? '#0f172a' : '#475569',
                              border: isActive 
                                ? `1px solid ${item.borderColor || 'rgba(225, 29, 72, 0.16)'}` 
                                : '1px solid transparent',
                              boxShadow: isActive ? '0 1px 4px rgba(0, 0, 0, 0.04)' : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                              textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'transparent';
                              }
                            }}
                          >
                            {/* Left vertical active bar */}
                            {isActive && (
                              <span style={{
                                position: 'absolute',
                                left: 0,
                                top: '18%',
                                bottom: '18%',
                                width: 3.5,
                                borderRadius: '0 4px 4px 0',
                                background: item.accentColor || '#e11d48'
                              }} />
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                              <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: 9,
                                background: isActive ? (item.iconBg || 'rgba(225, 29, 72, 0.12)') : '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                border: isActive ? `1px solid ${item.accentColor || '#e11d48'}33` : '1px solid #f1f5f9',
                                transition: 'all 0.18s ease'
                              }}>
                                <IconComp 
                                  size={16} 
                                  color={isActive ? (item.accentColor || '#e11d48') : '#64748b'} 
                                  strokeWidth={isActive ? 2.4 : 1.8} 
                                />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{
                                  fontSize: '0.86rem',
                                  fontWeight: isActive ? 800 : 600,
                                  color: isActive ? '#0f172a' : '#334155',
                                  lineHeight: 1.2
                                }}>
                                  {item.label}
                                </div>
                                {item.subtitle && (
                                  <div style={{
                                    fontSize: '0.67rem',
                                    fontWeight: 600,
                                    color: isActive ? item.accentColor : '#94a3b8',
                                    lineHeight: 1.2,
                                    marginTop: 2,
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {item.subtitle}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              {item.isPaid && (
                                hasActiveSub ? (
                                  item.id === 'feed' ? (
                                    <span style={{
                                      background: '#ecfdf5',
                                      color: '#059669',
                                      fontSize: '0.62rem',
                                      fontWeight: 800,
                                      padding: '2px 7px',
                                      borderRadius: 9999,
                                      border: '1px solid #a7f3d0',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      letterSpacing: '0.04em'
                                    }}>
                                      <span style={{
                                        width: 5,
                                        height: 5,
                                        borderRadius: '50%',
                                        background: '#10b981',
                                        boxShadow: '0 0 5px rgba(16, 185, 129, 0.9)'
                                      }} />
                                      LIVE
                                    </span>
                                  ) : (
                                    <span style={{
                                      background: '#f0fdf4',
                                      color: '#15803d',
                                      fontSize: '0.62rem',
                                      fontWeight: 800,
                                      padding: '2px 7px',
                                      borderRadius: 9999,
                                      border: '1px solid #bbf7d0',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 3,
                                      letterSpacing: '0.04em'
                                    }}>
                                      <CheckCircle2 size={10} strokeWidth={2.4} />
                                      VERIFIED
                                    </span>
                                  )
                                ) : (
                                  <span style={{
                                    background: '#fff1f2',
                                    color: '#e11d48',
                                    fontSize: '0.62rem',
                                    fontWeight: 800,
                                    padding: '2px 7px',
                                    borderRadius: 9999,
                                    border: '1px solid #fecdd3',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    letterSpacing: '0.04em',
                                    boxShadow: '0 1px 2px rgba(225, 29, 72, 0.08)'
                                  }}>
                                    <Lock size={10} strokeWidth={2.4} />
                                    PRO
                                  </span>
                                )
                              )}
                            </div>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleTabClick(item)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 12,
                            background: isActive ? '#fff1f2' : 'transparent',
                            color: isActive ? '#e11d48' : '#475569',
                            border: 'none',
                            fontSize: '0.86rem',
                            fontWeight: isActive ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#0f172a';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#475569';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <IconComp size={17} color={isActive ? '#e11d48' : 'currentColor'} strokeWidth={isActive ? 2.3 : 1.8} />
                            <span>{item.label}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {item.badge !== null && (
                              <span style={{
                                background: '#e11d48',
                                color: '#ffffff',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: 9999
                              }}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div style={{
          paddingTop: 16,
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          {isLoggedIn ? (
            <>
              {/* User Info Tile */}
              <div 
                onClick={() => setActiveTab('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 8px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9'
                }}
              >
                <SafeAvatar
                  src={userAvatar}
                  alt={userName}
                  size={34}
                  style={{ borderRadius: '50%' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {userName}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#e11d48'
                  }}>
                    {roleDisplay}
                  </div>
                </div>
              </div>

              {/* Mode Switch / Sign Out Trigger */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setRole(role === 'buddy' ? 'client' : 'buddy')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: 8,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Switch Mode
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onLogout) {
                      onLogout();
                    } else {
                      setActiveTab('landing');
                    }
                  }}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 8,
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#e11d48',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title="Sign Out & Return to Home"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            /* Unauthenticated Visitor State */
            <div style={{
              padding: '10px 12px',
              borderRadius: 14,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'rgba(225, 29, 72, 0.1)',
                  color: '#e11d48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Lock size={15} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Guest Visitor</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Not signed in</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onOpenAuth) {
                    onOpenAuth('client');
                  } else {
                    setActiveTab('landing');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(225, 29, 72, 0.2)'
                }}
              >
                <LogIn size={13} />
                <span>Sign In / Join</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* RIGHT MAIN WORKSPACE */}
      {/* ========================================================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top App Bar with Search & Post Action */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 80,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #f1f5f9',
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          {/* Search Input Bar (Identical to BuddySearch top search bar) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 9999,
            padding: '4px 14px 4px 6px',
            maxWidth: 580,
            flex: 1
          }}>
            <img
              src={userAvatar}
              alt={userName}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="What kind of buddy are you looking for..."
              onClick={() => {
                if (activeTab !== 'discover' && activeTab !== 'feed') {
                  setActiveTab('discover');
                }
              }}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.84rem',
                color: '#0f172a',
                width: '100%',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Quick Post Request Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={onOpenPostRequest}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)'
              }}
            >
              <Plus size={14} />
              Post Request
            </button>
          </div>
        </header>

        {/* View Content */}
        <div 
          className="shell-main-content"
          role="region"
          aria-label="Workspace content"
          style={{ 
            flex: 1, 
            padding: activeTab === 'chats' ? '14px 18px 40px 18px' : '24px 28px', 
            maxWidth: activeTab === 'chats' ? '100%' : 1100, 
            width: '100%', 
            margin: '0 auto' 
          }}
        >
          {children}
        </div>
      </div>

      {/* Floating PWA Card matching Antinoob UI/UX Design System */}
      {showPwaPrompt && (
        <div style={{
          position: 'fixed',
          bottom: 84,
          right: 24,
          width: 340,
          maxWidth: 'calc(100vw - 32px)',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 90,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          animation: 'fadeInScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-peach))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 4px 12px var(--color-primary-glow)'
            }}>
              <Search size={20} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 2, letterSpacing: '-0.015em' }}>
                Add FindCo App
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Faster access, offline support & live companion alerts.
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => {
                setShowPwaPrompt(false);
                try { localStorage.setItem('findco_pwa_dismissed', 'true'); } catch {}
              }}
              aria-label="Dismiss banner"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setShowPwaPrompt(false);
                try { localStorage.setItem('findco_pwa_dismissed', 'true'); } catch {}
                if (onShowToast) onShowToast('FindCo shortcut added to your device home screen!', 'success');
              }}
              className="btn-primary"
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: '0.85rem',
                minHeight: 40,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>Install to Home Screen</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPwaPrompt(false);
                try { localStorage.setItem('findco_pwa_dismissed', 'true'); } catch {}
              }}
              className="btn-secondary"
              style={{
                padding: '10px 14px',
                fontSize: '0.8rem',
                minHeight: 40,
                borderRadius: 'var(--radius-md)'
              }}
            >
              Later
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
