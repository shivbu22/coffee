import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Calendar, 
  Coins, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Check, 
  X
} from 'lucide-react';

export default function NotificationsView({ 
  notifications = [], 
  setNotifications, 
  _notificationCount = 0, 
  setNotificationCount, 
  onNavigate, 
  onShowToast 
}) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unread' | 'bookings' | 'escrow' | 'security'

  // Mark single notification as read/unread
  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(notif => {
      if (notif.id === id) {
        const nextRead = !notif.isRead;
        if (nextRead) {
          onShowToast('Marked as read', 'info');
        }
        return { ...notif, isRead: nextRead };
      }
      return notif;
    }));
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (setNotificationCount) setNotificationCount(0);
    onShowToast('All notifications marked as read.', 'success');
  };

  // Clear / Delete single notification
  const handleDismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    onShowToast('Notification dismissed', 'info');
  };

  // Clear all
  const handleClearAll = () => {
    setNotifications([]);
    if (setNotificationCount) setNotificationCount(0);
    onShowToast('Cleared all notifications.', 'info');
  };

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];
    if (filterTab === 'unread') {
      result = result.filter(n => !n.isRead);
    } else if (filterTab === 'bookings') {
      result = result.filter(n => n.type === 'booking');
    } else if (filterTab === 'escrow') {
      result = result.filter(n => n.type === 'escrow');
    } else if (filterTab === 'security') {
      result = result.filter(n => n.type === 'security');
    }
    return result;
  }, [notifications, filterTab]);

  const unreadTotal = notifications.filter(n => !n.isRead).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'booking':
        return { icon: Calendar, bg: '#fff1f2', color: '#e11d48' };
      case 'escrow':
        return { icon: Coins, bg: '#ecfdf5', color: '#059669' };
      case 'chat':
        return { icon: MessageSquare, bg: '#f0f9ff', color: '#0284c7' };
      case 'security':
        return { icon: ShieldCheck, bg: '#fefce8', color: '#ca8a04' };
      default:
        return { icon: Bell, bg: '#f8fafc', color: '#64748b' };
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '16px 16px 80px 16px' }}>
      
      {/* 1. NOTIFICATIONS HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fffbfb 100%)',
        border: '1px solid #f1e5e5',
        borderRadius: 24,
        padding: '24px 28px',
        marginBottom: 20,
        boxShadow: '0 8px 30px -8px rgba(225, 29, 72, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fff1f2',
              color: '#e11d48',
              padding: '4px 12px',
              borderRadius: 9999,
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 8
            }}>
              <Bell size={13} fill="#e11d48" />
              <span>Activity & Notification Feed</span>
            </div>
            
            <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 6 }}>
              Notifications & Alerts
            </h1>
            
            <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: 540, lineHeight: 1.5 }}>
              Live updates on companion booking requests, dual-handshake PIN verifications, escrow releases, and Aadhaar security logs.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadTotal === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: unreadTotal > 0 ? '#ffffff' : '#f8fafc',
                border: `1px solid ${unreadTotal > 0 ? '#cbd5e1' : '#e2e8f0'}`,
                color: unreadTotal > 0 ? '#334155' : '#94a3b8',
                padding: '8px 16px',
                borderRadius: 12,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: unreadTotal > 0 ? 'pointer' : 'not-allowed',
                boxShadow: unreadTotal > 0 ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <CheckCheck size={16} color={unreadTotal > 0 ? '#e11d48' : '#94a3b8'} />
              <span>Mark all as read</span>
            </button>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'transparent',
                  border: '1px solid #fecdd3',
                  color: '#e11d48',
                  padding: '8px 14px',
                  borderRadius: 12,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Trash2 size={15} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time sync ribbon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          paddingTop: 14,
          marginTop: 16,
          borderTop: '1px solid #f1f5f9',
          flexWrap: 'wrap',
          fontSize: '0.8rem',
          color: '#475569'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)' }} />
            <span>Real-Time WebSocket Sync Active</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
            <ShieldCheck size={14} color="#059669" />
            <span>UIDAI Cold Storage Enclave Verified</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
            <Coins size={14} color="#f59e0b" />
            <span>Instant UPI Settlement Notifications</span>
          </div>
        </div>
      </div>

      {/* 2. SEGMENTED FILTER TABS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 12,
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#f1f5f9',
          padding: 4,
          borderRadius: 14,
          gap: 4
        }}>
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadTotal },
            { id: 'bookings', label: 'Bookings & PINs', count: notifications.filter(n => n.type === 'booking').length },
            { id: 'escrow', label: 'Escrow & Payouts', count: notifications.filter(n => n.type === 'escrow').length },
            { id: 'security', label: 'Security Vault', count: notifications.filter(n => n.type === 'security').length }
          ].map(tab => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 600,
                  border: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#0f172a' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  background: isActive ? '#ffe4e6' : '#e2e8f0',
                  color: isActive ? '#e11d48' : '#64748b',
                  padding: '1px 6px',
                  borderRadius: 9999,
                  fontSize: '0.68rem',
                  fontWeight: 800
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Showing <strong>{filteredNotifications.length}</strong> updates
        </div>
      </div>

      {/* 3. NOTIFICATIONS LIST */}
      {filteredNotifications.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 24px',
          borderRadius: 20,
          background: '#ffffff',
          border: '1.5px dashed #cbd5e1'
        }}>
          <div style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: '#fff1f2',
            color: '#e11d48',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <Bell size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            All Caught Up!
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: 420, margin: '0 auto 20px auto', lineHeight: 1.5 }}>
            {filterTab === 'unread' 
              ? 'You have zero unread notifications. New booking invites and escrow pings will appear here.'
              : 'There are no notifications under this category. Switch to all activity or explore current plans!'}
          </p>
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '9px 18px',
              borderRadius: 12,
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Show All Notifications
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredNotifications.map((notif) => {
            const { icon: TypeIcon, bg: typeBg, color: typeColor } = getTypeIcon(notif.type);

            return (
              <div
                key={notif.id}
                style={{
                  background: notif.isRead ? 'var(--bg-card)' : 'var(--color-primary-bg)',
                  borderRadius: 'var(--radius-lg)',
                  border: notif.isRead ? '1px solid var(--border-subtle)' : '1px solid rgba(250, 110, 94, 0.3)',
                  padding: '18px 22px',
                  boxShadow: notif.isRead ? 'var(--shadow-sm)' : '0 4px 14px var(--color-primary-glow)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = notif.isRead ? '0 2px 6px rgba(0,0,0,0.02)' : '0 4px 16px -2px rgba(225, 29, 72, 0.08)';
                }}
              >
                {/* Left Icon Badge or Actor Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {notif.actorAvatar ? (
                    <img
                      src={notif.actorAvatar}
                      alt={notif.actorName || 'User'}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #e2e8f0'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: typeBg,
                      color: typeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <TypeIcon size={20} color={typeColor} />
                    </div>
                  )}

                  {/* Tiny Type Sub-icon over Avatar */}
                  {notif.actorAvatar && (
                    <div style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: typeBg,
                      border: '2px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <TypeIcon size={11} color={typeColor} />
                    </div>
                  )}
                </div>

                {/* Center Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <h3 style={{
                      fontSize: '0.96rem',
                      fontWeight: notif.isRead ? 700 : 800,
                      color: '#0f172a',
                      letterSpacing: '-0.015em'
                    }}>
                      {notif.title}
                    </h3>

                    {notif.badge && (
                      <span style={{
                        background: notif.isRead ? '#f1f5f9' : '#fff1f2',
                        color: notif.isRead ? '#475569' : '#e11d48',
                        padding: '2px 8px',
                        borderRadius: 9999,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em'
                      }}>
                        {notif.badge}
                      </span>
                    )}

                    {!notif.isRead && (
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#e11d48',
                        display: 'inline-block'
                      }} />
                    )}
                  </div>

                  <p style={{
                    fontSize: '0.86rem',
                    color: '#475569',
                    lineHeight: 1.5,
                    marginBottom: 10
                  }}>
                    {notif.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', color: '#94a3b8' }}>
                      <Clock size={12} />
                      <span>{notif.timeAgo}</span>
                      <span>•</span>
                      <span>{notif.timestamp}</span>
                    </div>

                    {/* Direct Action Link */}
                    {notif.actionLabel && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!notif.isRead) {
                            handleToggleRead(notif.id);
                          }
                          if (onNavigate) {
                            onNavigate(notif.targetTab, notif.targetRoomId);
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: 'none',
                          border: 'none',
                          color: '#e11d48',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        <span>{notif.actionLabel}</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Controls (Toggle Read, Dismiss) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleToggleRead(notif.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: notif.isRead ? '#94a3b8' : '#059669',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={notif.isRead ? "Mark as unread" : "Mark as read"}
                    aria-label="Toggle read state"
                  >
                    <Check size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDismiss(notif.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Dismiss"
                    aria-label="Dismiss notification"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. FOOTER SECURITY NOTICE */}
      <div style={{
        marginTop: 32,
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={15} color="#e11d48" />
          </div>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
              Instant WebPush & Encrypted SMS Relay
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Safety check-in alerts and SOS notifications are relayed in real-time under UIDAI protocol.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onNavigate) onNavigate('vault');
          }}
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            padding: '7px 14px',
            borderRadius: 10,
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Manage Safety Settings
        </button>
      </div>

    </div>
  );
}
