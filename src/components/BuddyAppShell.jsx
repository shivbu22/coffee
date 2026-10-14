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
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  X,
  Bot,
  Award
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function BuddyAppShell({
  activeTab,
  setActiveTab,
  role,
  setRole,
  hasActiveSub = false,
  unreadCount,
  notificationCount: externalNotificationCount,
  setNotificationCount: externalSetNotificationCount,
  onOpenSubscribe,
  onUnlockSubscription,
  onOpenPostRequest,
  buddyProfile,
  onOpenAdminPortal,
  onLogout,
  onShowToast,
  onOpenAntigravityAgent,
  onOpenHallmark,
  children
}) {
  const [internalNotificationCount, setInternalNotificationCount] = useState(2);
  const notificationCount = externalNotificationCount !== undefined ? externalNotificationCount : internalNotificationCount;
  const setNotificationCount = externalSetNotificationCount || setInternalNotificationCount;
  const [showPwaPrompt, setShowPwaPrompt] = useState(true);

  const userName = buddyProfile?.name || 'Shiv Y';
  const userAvatar = buddyProfile?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=faces';
  const roleDisplay = role === 'buddy' ? '✦ Buddy' : '✦ Client';

  const navItems = [
    {
      group: 'EXPLORE',
      items: [
        {
          id: 'feed',
          label: 'Hire',
          icon: Radio,
          badge: null,
          isPaid: true
        },
        {
          id: 'discover',
          label: 'Find',
          icon: Compass,
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
          id: 'hallmark',
          label: 'Hallmark Trust',
          icon: Award,
          badge: 'AUDITED',
          onClick: () => onOpenHallmark ? onOpenHallmark(buddyProfile) : null
        },
        {
          id: 'subscriptions',
          label: 'Membership',
          icon: Star,
          badge: null,
          onClick: onOpenSubscribe
        },
        {
          id: 'vault',
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
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: '#ffffff',
        borderRight: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 14px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxShadow: '1px 0 3px rgba(0, 0, 0, 0.02)'
      }}>
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
            {navItems.map((group) => (
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {group.items.map((item) => {
                    const IconComp = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.onClick) {
                            item.onClick();
                          } else {
                            setActiveTab(item.id);
                          }
                        }}
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
                          {item.isPaid && (
                            hasActiveSub ? (
                              <span style={{
                                background: '#ecfdf5',
                                color: '#059669',
                                fontSize: '0.6rem',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: 9999,
                                border: '1px solid #a7f3d0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                letterSpacing: '0.04em'
                              }}>
                                ACTIVE
                              </span>
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
                                PAID
                              </span>
                            )
                          )}

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
            ))}
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
            <img
              src={userAvatar}
              alt={userName}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
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
        <main style={{ 
          flex: 1, 
          padding: activeTab === 'chats' ? '14px 18px 40px 18px' : '24px 28px', 
          maxWidth: activeTab === 'chats' ? '100%' : 1100, 
          width: '100%', 
          margin: '0 auto' 
        }}>
          {children}
        </main>
      </div>

      {/* Floating PWA Card matching BuddySearch Screenshot */}
      {showPwaPrompt && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 350,
          background: '#ffffff',
          borderRadius: 20,
          padding: 18,
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          zIndex: 90,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          animation: 'fadeInScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 18,
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(225, 29, 72, 0.25)'
            }}>
              <Search size={20} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                Add FindCo to your Home Screen
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                Faster access, offline support & chat notifications
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setShowPwaPrompt(false)}
              aria-label="Dismiss banner"
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
            >
              <X size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowPwaPrompt(false);
              if (onShowToast) onShowToast('FindCo shortcut added to your device home screen!', 'success');
            }}
            style={{
              padding: '10px',
              borderRadius: 10,
              background: '#e11d48',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)'
            }}
          >
            Add to Home Screen
          </button>
          
          <button
            type="button"
            onClick={() => {
              setShowPwaPrompt(false);
              if (onShowToast) onShowToast('Chat & session push notifications enabled.', 'info');
            }}
            style={{
              padding: '8px',
              borderRadius: 8,
              background: '#fff1f2',
              color: '#e11d48',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Enable Notifications Only
          </button>
          
          <button
            type="button"
            onClick={() => setShowPwaPrompt(false)}
            style={{
              textAlign: 'center',
              fontSize: '0.74rem',
              color: '#94a3b8',
              cursor: 'pointer',
              border: 'none',
              background: 'none'
            }}
          >
            Not Now
          </button>
        </div>
      )}

    </div>
  );
}
