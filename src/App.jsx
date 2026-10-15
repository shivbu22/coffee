import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Footer from './components/Footer';
import CozyFloatingBeacon from './components/watermelon/CozyFloatingBeacon';
import BuddyAppShell from './components/BuddyAppShell';

// Code-split heavy views to reduce initial bundle footprint
const BuddyFeedView = lazy(() => import('./components/BuddyFeedView'));
const DiscoverView = lazy(() => import('./components/DiscoverView'));
const ChatsView = lazy(() => import('./components/ChatsView'));
const IdentityVaultView = lazy(() => import('./components/IdentityVaultView'));
const BuddyProfileView = lazy(() => import('./components/BuddyProfileView'));
const DashboardView = lazy(() => import('./components/DashboardView'));
const NotificationsView = lazy(() => import('./components/NotificationsView'));
const HelpView = lazy(() => import('./components/HelpView'));
const AdminSecurityGate = lazy(() => import('./components/admin/AdminSecurityGate'));
const AdminPortalView = lazy(() => import('./components/admin/AdminPortalView'));

// Code-split global modals so initial landing payload is ultra-light
const AuthModal = lazy(() => import('./components/AuthModal'));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal'));
const PostRequestModal = lazy(() => import('./components/PostRequestModal'));
const HallmarkTrustModal = lazy(() => import('./components/HallmarkTrustModal'));
const AntigravityAgentModal = lazy(() => import('./components/AntigravityAgentModal'));

function ViewLoader({ message = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 14 }}>
      <div style={{
        width: 38,
        height: 38,
        border: '3px solid var(--border-subtle)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>{message}</span>
    </div>
  );
}

import { StorageEngine } from './utils/storageEngine';
import { getCompanionHallmark } from './utils/hallmarkProvenance';
import { SUBSCRIPTION_PLANS } from './data/mockData';
import { 
  supabase,
  SupabaseAuthService, 
  SupabaseService, 
  isSupabaseConfigured, 
  formatSupabaseUserProfile 
} from './lib/supabaseClient';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  // Top-level architecture separation: 'consumer' vs 'admin'
  const [siteMode, setSiteMode] = useState('consumer'); // 'consumer' | 'admin'
  const [adminAuth, setAdminAuth] = useState(null); // null if not logged in

  const [activeTab, setActiveTab] = useState('landing'); // 'landing' | 'feed' | 'discover' | 'chats' | 'vault' | 'subscriptions'
  const [role, setRole] = useState('client'); // 'client' | 'buddy'
  
  // Persistent Membership state from AntiVibe StorageEngine
  const [membership, setMembership] = useState(() => StorageEngine.getMembership());
  const hasActiveSub = !!membership?.hasActiveSub;
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [theme, setTheme] = useState('light'); // 'light' is the requested clean UI default

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // AntiVibe Persistent Storage Engine Domain Data
  const [requests, setRequests] = useState(() => StorageEngine.getRequests());
  const [companions, setCompanions] = useState(() => StorageEngine.getCompanions());
  const [chats, setChats] = useState(() => StorageEngine.getChats());
  const [kycRequests, setKycRequests] = useState(() => StorageEngine.getKycRequests());
  const [buddyProfile, setBuddyProfile] = useState(() => StorageEngine.getBuddyProfile());
  const [dashboardData, setDashboardData] = useState(() => StorageEngine.getDashboardData());
  const [notifications, setNotifications] = useState(() => StorageEngine.getNotifications());
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  // Authentication & Consumer Session State
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!StorageEngine.getUserSession());
  const [currentUser, setCurrentUser] = useState(() => StorageEngine.getUserSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState('client');

  // Hallmark & Antigravity Modals
  const [isAntigravityModalOpen, setIsAntigravityModalOpen] = useState(false);
  const [isHallmarkModalOpen, setIsHallmarkModalOpen] = useState(false);
  const [selectedHallmarkData, setSelectedHallmarkData] = useState(null);

  // Modals & Subscription Selection
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [subscribeModalTier, setSubscribeModalTier] = useState('premium');
  const [subscribeModalMode, setSubscribeModalMode] = useState('buddysearch_hero');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState('room_1');

  // Synchronize state changes to StorageEngine
  useEffect(() => {
    StorageEngine.setRequests(requests);
  }, [requests]);

  useEffect(() => {
    StorageEngine.setCompanions(companions);
  }, [companions]);

  useEffect(() => {
    StorageEngine.setChats(chats);
  }, [chats]);

  useEffect(() => {
    StorageEngine.setDashboardData(dashboardData);
  }, [dashboardData]);

  useEffect(() => {
    StorageEngine.setNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    StorageEngine.setBuddyProfile(buddyProfile);
  }, [buddyProfile]);

  useEffect(() => {
    StorageEngine.setMembership(membership);
  }, [membership]);

  // Toast System
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleUnlockSubscription = (tier = 'premium') => {
    const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.tier === tier || (tier === 'star' && p.tier === 'star_member')) || SUBSCRIPTION_PLANS[2];
    const isLifetime = tier === 'star_member' || tier === 'star';
    const durationDays = tier === 'basic' ? 90 : tier === 'standard' ? 180 : 365;
    const expiresAt = isLifetime ? null : Date.now() + durationDays * 86400000;
    const expiryDate = isLifetime 
      ? 'Lifetime VIP Access' 
      : new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const newMembership = {
      hasActiveSub: true,
      tier: selectedPlan.tier,
      planName: selectedPlan.name,
      validity: selectedPlan.validity,
      expiresAt,
      expiryDate
    };
    setMembership(newMembership);
    StorageEngine.setMembership(newMembership);
    showToast(`Membership active! ${selectedPlan.name} (${selectedPlan.validity}) is now active on your account.`, 'success');
  };

  const handleStartChatWithCompanion = (companion) => {
    let existingRoom = chats.find(c => c.participant.name === companion.name);
    if (!existingRoom) {
      existingRoom = {
        id: `room_${Date.now()}`,
        participant: {
          name: companion.name,
          avatar: companion.avatar,
          city: companion.city,
          isOnline: companion.isOnline,
          role: 'buddy'
        },
        unreadCount: 0,
        lastMessageTime: 'Just now',
        messages: [
          {
            id: `m_${Date.now()}`,
            sender: 'other',
            text: `Hi there! I am open for ${companion.services[0]} in ${companion.city}. Let me know what activity you have in mind!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: true
          }
        ]
      };
      setChats(prev => [existingRoom, ...prev]);
    }

    setActiveRoomId(existingRoom.id);
    setActiveTab('chats');
  };

  const handleAddNewRequest = async (newRequest) => {
    setRequests(prev => [newRequest, ...prev]);
    setActiveTab('feed');
    if (isSupabaseConfigured) {
      try {
        const cloudReq = await SupabaseService.createRequest(newRequest);
        if (cloudReq) {
          setRequests(prev => [cloudReq, ...prev.filter(r => r.id !== newRequest.id)]);
        }
      } catch (err) {
        console.warn('[Supabase Create Request]', err);
      }
    }
  };

  // Create booking in Supabase + local state
  const handleAddBooking = async (newBooking) => {
    // Update local dashboard immediately
    setDashboardData(prev => ({
      ...prev,
      upcomingBookings: [newBooking, ...(prev.upcomingBookings || [])]
    }));
    StorageEngine.addBooking(newBooking);

    // Persist to Supabase bookings table
    if (isSupabaseConfigured) {
      try {
        const dbBooking = {
          client_id: newBooking.clientId || currentUser?.id || 'guest',
          client_name: newBooking.clientName || currentUser?.name || 'Member',
          buddy_id: newBooking.buddyId || newBooking.partnerName || '',
          buddy_name: newBooking.partnerName || newBooking.buddyName || 'Companion',
          activity: newBooking.activityTitle || newBooking.activity || 'Hangout',
          date: newBooking.date || new Date().toLocaleDateString('en-IN'),
          time: newBooking.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hours: Number(newBooking.hours) || 2,
          hourly_rate: Number(newBooking.hourlyRate || newBooking.escrowAmount / (newBooking.hours || 2)) || 500,
          total_amount: Number(newBooking.escrowAmount || newBooking.totalAmount) || 1000,
          escrow_status: 'LOCKED',
          handshake_pin: newBooking.handshakePin || String(Math.floor(1000 + Math.random() * 9000))
        };
        await SupabaseService.createBooking(dbBooking);
        console.log('[Supabase] Booking synced to cloud');
      } catch (err) {
        console.warn('[Supabase Create Booking]', err);
      }
    }
  };

  const [pendingTab, setPendingTab] = useState(null);

  const handleOpenAuth = (roleIntent = 'client', targetTab = null) => {
    setAuthDefaultRole(roleIntent);
    if (targetTab) {
      setPendingTab(targetTab);
      const tabLabel = targetTab === 'subscriptions' 
        ? 'Plans' 
        : targetTab === 'chats' 
        ? 'Chats' 
        : targetTab === 'feed' 
        ? 'Feed' 
        : targetTab === 'discover' 
        ? 'Discover' 
        : targetTab === 'profile'
        ? 'Studio'
        : targetTab === 'dashboard'
        ? 'Member Dashboard'
        : targetTab.charAt(0).toUpperCase() + targetTab.slice(1);
      showToast(`Please sign in or create an account to access ${tabLabel}.`, 'info');
    }
    setIsAuthModalOpen(true);
  };

  const navigateWithAuth = (tab, roleIntent = 'client') => {
    if (!isLoggedIn && tab !== 'landing') {
      handleOpenAuth(tab === 'profile' ? 'buddy' : roleIntent, tab);
      return;
    }
    setActiveTab(tab);
  };

  // Enforce access control: non-authenticated users are restricted to landing
  useEffect(() => {
    if (!isLoggedIn && activeTab !== 'landing') {
      setActiveTab('landing');
    }
  }, [isLoggedIn, activeTab]);

  const handleLoginSuccess = (userProfile) => {
    setIsLoggedIn(true);
    setCurrentUser(userProfile);
    setRole(userProfile.role);
    StorageEngine.setUserSession(userProfile);
    setBuddyProfile(prev => ({
      ...prev,
      name: userProfile.name,
      avatar: userProfile.avatar,
      city: userProfile.city || 'Bengaluru',
      isAadhaarVerified: true
    }));
    // Once signed in, land directly in the requested tab or default to feed / profile
    const targetTab = pendingTab || (userProfile.role === 'buddy' ? 'profile' : 'feed');
    setPendingTab(null);
    setActiveTab(targetTab);
    showToast(`Welcome back, ${userProfile.name.split(' ')[0]}!`, 'success');
  };

  // Supabase Cloud Auth & Live Data Synchronizer
  useEffect(() => {
    let realtimeChannel = null;

    // 1. Sync live companions from Supabase if configured
    if (isSupabaseConfigured) {
      SupabaseService.getCompanions().then(cloudCompanions => {
        if (cloudCompanions && cloudCompanions.length > 0) {
          setCompanions(cloudCompanions);
          StorageEngine.setCompanions(cloudCompanions);
        }
      }).catch(e => console.warn('[Supabase Companions Sync]', e));

      SupabaseService.getRequests().then(cloudRequests => {
        if (cloudRequests && cloudRequests.length > 0) {
          setRequests(cloudRequests);
          StorageEngine.setRequests(cloudRequests);
        }
      }).catch(e => console.warn('[Supabase Requests Sync]', e));

      // Sync bookings for the current user
      SupabaseService.getBookings().then(cloudBookings => {
        if (cloudBookings && cloudBookings.length > 0) {
          setDashboardData(prev => ({
            ...prev,
            upcomingBookings: cloudBookings.map(b => ({
              id: b.id,
              partnerName: b.buddy_name,
              activityTitle: b.activity,
              date: b.date,
              time: b.time,
              hours: b.hours,
              escrowAmount: b.total_amount,
              handshakePin: b.handshake_pin,
              escrowStatus: b.escrow_status,
              pinVerified: b.pin_verified
            }))
          }));
        }
      }).catch(e => console.warn('[Supabase Bookings Sync]', e));

      // 1b. Subscribe to REALTIME inserts on activity_requests
      if (supabase) {
        realtimeChannel = supabase
          .channel('findco-activity-feed')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'activity_requests' },
            (payload) => {
              const newReq = payload.new;
              if (newReq) {
                const formatted = {
                  id: newReq.id,
                  clientId: newReq.client_id,
                  clientName: newReq.client_name,
                  clientAvatar: newReq.client_avatar,
                  activity: newReq.activity,
                  city: newReq.city,
                  area: newReq.area,
                  dateTime: newReq.date_time,
                  budget: newReq.budget,
                  duration: newReq.duration,
                  genderPref: newReq.gender_pref,
                  description: newReq.description,
                  status: newReq.status,
                  responsesCount: newReq.responses_count || 0,
                  createdAt: newReq.created_at
                };
                setRequests(prev => {
                  if (prev.some(r => r.id === formatted.id)) return prev;
                  return [formatted, ...prev];
                });
              }
            }
          )
          .subscribe();
      }
    }

    // 2. Check existing active cloud session on mount
    SupabaseAuthService.getSession().then(async (session) => {
      if (session?.user && !isLoggedIn) {
        const profile = formatSupabaseUserProfile(session.user);
        
        // Fetch full profile from profiles table if available
        if (isSupabaseConfigured) {
          try {
            const dbProfile = await SupabaseService.getProfile(session.user.id);
            if (dbProfile) {
              profile.name = dbProfile.full_name || profile.name;
              profile.avatar = dbProfile.avatar_url || profile.avatar;
              profile.city = dbProfile.city || profile.city;
              profile.role = dbProfile.role || profile.role;
              profile.phone = dbProfile.phone || profile.phone;
              profile.isAadhaarVerified = dbProfile.is_aadhaar_verified ?? true;
            }
          } catch (e) {
            console.warn('[Supabase Profile Fetch]', e);
          }
        }

        setIsLoggedIn(true);
        setCurrentUser(profile);
        setRole(profile.role);
        StorageEngine.setUserSession(profile);
      }
    }).catch(e => console.warn('[Supabase Session Check]', e));

    // 3. Subscribe to live auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const unsubscribe = SupabaseAuthService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = formatSupabaseUserProfile(session.user);

        // Enrich with Supabase profiles table data
        if (isSupabaseConfigured) {
          try {
            const dbProfile = await SupabaseService.getProfile(session.user.id);
            if (dbProfile) {
              profile.name = dbProfile.full_name || profile.name;
              profile.avatar = dbProfile.avatar_url || profile.avatar;
              profile.city = dbProfile.city || profile.city;
              profile.role = dbProfile.role || profile.role;
            }
          } catch (e) {
            console.warn('[Supabase Profile Enrich]', e);
          }
        }

        setIsLoggedIn(true);
        setCurrentUser(profile);
        setRole(profile.role);
        StorageEngine.setUserSession(profile);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setCurrentUser(null);
        StorageEngine.clearUserSession();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      if (realtimeChannel && supabase) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    StorageEngine.clearUserSession();
    SupabaseAuthService.signOut();
    setActiveTab('landing');
    showToast('You have signed out of your account.', 'info');
  };

  const handleOpenHallmark = (companion) => {
    const data = getCompanionHallmark(
      companion?.id || 'comp_1', 
      companion?.name || companion?.partnerName || 'Companion', 
      companion?.city || companion?.partnerCity || 'Bengaluru'
    );
    setSelectedHallmarkData(data);
    setIsHallmarkModalOpen(true);
  };

  const handleOpenAntigravityAgent = () => {
    setIsAntigravityModalOpen(true);
  };

  const handlePostRequestClick = () => {
    if (!isLoggedIn) {
      showToast('Please sign in or join to post an activity request.', 'info');
      handleOpenAuth('client');
    } else {
      setIsPostModalOpen(true);
    }
  };

  const totalUnread = isLoggedIn ? chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0) : 0;

  // ==========================================
  // ISOLATED PROTECTED ADMIN PORTAL
  // ==========================================
  if (siteMode === 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#f8fafc' }}>
        <Suspense fallback={<ViewLoader message="Securing operator environment..." />}>
          {!adminAuth ? (
            <AdminSecurityGate 
              onAuthenticate={(authSession) => {
                setAdminAuth(authSession);
                showToast(`Operator Authenticated: ${authSession.operatorName} (${authSession.role})`, 'success');
              }}
              onExitToConsumer={() => setSiteMode('consumer')}
              onShowToast={showToast}
            />
          ) : (
            <AdminPortalView 
              adminAuth={adminAuth}
              kycRequests={kycRequests}
              setKycRequests={setKycRequests}
              companions={companions}
              setCompanions={setCompanions}
              requests={requests}
              setRequests={setRequests}
              onExitToConsumer={() => setSiteMode('consumer')}
              onLogout={() => {
                setAdminAuth(null);
                showToast('Admin security session locked.', 'info');
              }}
              onShowToast={showToast}
            />
          )}
        </Suspense>

        {/* Global Toast Live Region */}
        <div role="status" aria-live="polite" aria-atomic="true">
          {toast && (
            <div style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 9999,
              background: 'var(--bg-card, #131722)',
              border: `1px solid ${toast.type === 'success' ? '#10b981' : toast.type === 'error' ? 'var(--color-rose, #ef4444)' : 'var(--color-primary, #6366f1)'}`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              maxWidth: 420,
              animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
              {toast.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
              {toast.type === 'info' && <Info size={18} color="#6366f1" />}
              
              <div style={{ fontSize: '0.86rem', color: '#f8fafc', flex: 1, fontWeight: 500 }}>
                {toast.message}
              </div>

              <button
                type="button"
                onClick={() => setToast(null)}
                aria-label="Dismiss notification"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 2
                }}
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // CONSUMER FACING BUDDYSEARCH WEBSITE
  // ==========================================
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      {/* Consumer Shell Selection: Landing View vs In-App BuddySearch Shell */}
      {activeTab === 'landing' ? (
        <>
          {/* Top Navigation for Landing */}
          <Navbar 
            activeTab={activeTab}
            setActiveTab={navigateWithAuth}
            role={role}
            setRole={setRole}
            hasActiveSub={hasActiveSub}
            onOpenSubscribe={() => {
              if (!isLoggedIn) {
                handleOpenAuth('client', 'subscriptions');
                return;
              }
              setIsSubscribeModalOpen(true);
            }}
            unreadCount={totalUnread}
            onOpenPostRequest={handlePostRequestClick}
            theme={theme}
            setTheme={setTheme}
            buddyProfile={buddyProfile}
            currentUser={currentUser}
            isLoggedIn={isLoggedIn}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
            onOpenAdminPortal={() => setSiteMode('admin')}
            onOpenAntigravityAgent={handleOpenAntigravityAgent}
          />

          {/* Main Landing Page Content */}
          <main id="main-content" style={{ flex: 1 }}>
            <LandingPage 
              setActiveTab={navigateWithAuth}
              setCityFilter={setCityFilter}
              onOpenSubscribe={() => {
                if (!isLoggedIn) {
                  handleOpenAuth('client', 'subscriptions');
                  return;
                }
                setIsSubscribeModalOpen(true);
              }}
              onOpenPostRequest={handlePostRequestClick}
              onOpenAuth={handleOpenAuth}
              isLoggedIn={isLoggedIn}
              onOpenAntigravityAgent={handleOpenAntigravityAgent}
              onOpenHallmark={handleOpenHallmark}
            />
          </main>

          {/* Footer for Landing */}
          <Footer 
            setActiveTab={navigateWithAuth}
            setCityFilter={setCityFilter}
            onOpenAdminPortal={() => setSiteMode('admin')}
            onOpenSubscribe={() => {
              if (!isLoggedIn) {
                handleOpenAuth('client', 'subscriptions');
                return;
              }
              setIsSubscribeModalOpen(true);
            }}
            onOpenPostRequest={handlePostRequestClick}
            onOpenAuth={handleOpenAuth}
          />
        </>
      ) : (
        /* In-App BuddySearch Workspace with Left Sidebar Navigation */
        <BuddyAppShell
          activeTab={activeTab}
          setActiveTab={navigateWithAuth}
          role={role}
          setRole={setRole}
          hasActiveSub={hasActiveSub}
          unreadCount={totalUnread}
          notificationCount={unreadNotifCount}
          setNotificationCount={(count) => {
            if (count === 0) {
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
          }}
          onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
          onUnlockSubscription={handleUnlockSubscription}
          onOpenPostRequest={handlePostRequestClick}
          buddyProfile={currentUser || buddyProfile}
          onOpenAdminPortal={() => setSiteMode('admin')}
          onLogout={handleLogout}
          onShowToast={showToast}
          onOpenAntigravityAgent={handleOpenAntigravityAgent}
          onOpenHallmark={handleOpenHallmark}
        >
          <main id="main-content" style={{ flex: 1, minWidth: 0, width: '100%' }}>
            <Suspense fallback={<ViewLoader message="Opening view..." />}>
              {activeTab === 'feed' && (
                <BuddyFeedView 
              requests={requests}
              setRequests={setRequests}
              hasActiveSub={hasActiveSub}
              onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
              onUnlockSubscription={handleUnlockSubscription}
              onOpenPostRequest={() => setIsPostModalOpen(true)}
              onNavigateToChat={(roomId) => {
                setActiveRoomId(roomId);
                setActiveTab('chats');
              }}
              onShowToast={showToast}
              onOpenAntigravityAgent={handleOpenAntigravityAgent}
            />
          )}

          {activeTab === 'discover' && (
            <DiscoverView 
              companions={companions}
              cityFilter={cityFilter}
              setCityFilter={setCityFilter}
              onStartChatWithCompanion={handleStartChatWithCompanion}
              hasActiveSub={hasActiveSub}
              isLoggedIn={isLoggedIn}
              onOpenAuth={handleOpenAuth}
              onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
              onUnlockSubscription={handleUnlockSubscription}
              onOpenHallmark={handleOpenHallmark}
              onOpenAntigravityAgent={handleOpenAntigravityAgent}
            />
          )}

          {activeTab === 'chats' && (
            <ChatsView 
              chats={chats}
              setChats={setChats}
              activeRoomId={activeRoomId}
              setActiveRoomId={setActiveRoomId}
              role={role}
              onShowToast={showToast}
              onOpenHallmark={handleOpenHallmark}
              onAddBooking={handleAddBooking}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView 
              notifications={notifications}
              setNotifications={setNotifications}
              notificationCount={unreadNotifCount}
              setNotificationCount={(count) => {
                if (count === 0) {
                  setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                }
              }}
              onNavigate={(tab, roomId) => {
                if (roomId) setActiveRoomId(roomId);
                setActiveTab(tab);
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView 
              dashboardData={dashboardData}
              setDashboardData={setDashboardData}
              role={role}
              setRole={setRole}
              onOpenPostRequest={() => setIsPostModalOpen(true)}
              onNavigateToFeed={() => setActiveTab('feed')}
              onNavigateToChats={() => setActiveTab('chats')}
              onShowToast={showToast}
              onOpenHallmark={handleOpenHallmark}
            />
          )}

          {activeTab === 'vault' && (
            <IdentityVaultView 
              kycRequests={kycRequests}
              setKycRequests={setKycRequests}
              role={role}
              onShowToast={showToast}
              onOpenHallmark={handleOpenHallmark}
            />
          )}

          {activeTab === 'help' && (
            <HelpView 
              onNavigateToTab={navigateWithAuth}
              onOpenAntigravityAgent={handleOpenAntigravityAgent}
              onShowToast={showToast}
              currentUser={currentUser}
              role={role}
            />
          )}

          {activeTab === 'profile' && (
            <BuddyProfileView 
              profile={buddyProfile}
              setProfile={setBuddyProfile}
              onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
              onNavigateToFeed={() => setActiveTab('feed')}
              onNavigateToVault={() => setActiveTab('vault')}
              onShowToast={showToast}
              onOpenHallmark={() => handleOpenHallmark(buddyProfile)}
            />
          )}

          {activeTab === 'subscriptions' && (
            <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 0 80px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <h1 style={{ fontSize: '2.2rem', marginBottom: 8, fontWeight: 800, letterSpacing: '-0.025em' }}>FindCo Membership Passes</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
                  Direct inspiration from <strong>BuddySearch</strong>: transparent multi-month plans starting at just <strong>₹50/month</strong>, or grab the <strong>Star Member Lifetime Pass</strong> for ₹799.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                {SUBSCRIPTION_PLANS.map(p => (
                  <div 
                    key={p.tier}
                    className="glass-panel"
                    style={{
                      padding: '28px 24px',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      border: p.popular ? '2px solid var(--color-primary)' : p.tier === 'star_member' ? '2px solid #d97706' : '1px solid var(--border-subtle)',
                      background: p.popular ? 'var(--color-primary-bg)' : p.tier === 'star_member' ? 'linear-gradient(180deg, rgba(217, 119, 6, 0.05) 0%, var(--bg-card) 100%)' : 'var(--bg-card)',
                      boxShadow: p.popular ? '0 12px 30px -10px rgba(235, 94, 40, 0.25)' : 'none'
                    }}
                  >
                    {p.tag && (
                      <div style={{
                        position: 'absolute',
                        top: -12,
                        right: 18,
                        background: p.tagColor || (p.popular ? 'var(--color-primary)' : '#1e293b'),
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.66rem',
                        letterSpacing: '0.04em',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        {p.tag}
                      </div>
                    )}

                    <h3 style={{ fontSize: '1.25rem', marginBottom: 4, fontWeight: 800 }}>{p.name}</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.validity}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: p.popular ? 'var(--color-primary)' : p.tier === 'star_member' ? '#d97706' : '#059669',
                        background: p.popular ? 'rgba(235, 94, 40, 0.1)' : p.tier === 'star_member' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(16, 185, 129, 0.1)',
                        padding: '2px 8px',
                        borderRadius: 999
                      }}>
                        {p.monthlyBreakdown}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '2.3rem', fontWeight: 900, color: p.popular ? 'var(--color-primary)' : p.tier === 'star_member' ? '#d97706' : 'var(--text-primary)' }} className="tabular-nums">
                        ₹{p.price}
                      </span>
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }} className="tabular-nums">
                        ₹{p.originalPrice}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', marginLeft: 'auto' }}>
                        {p.discountPercent}% OFF
                      </span>
                    </div>

                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '14px 0 16px 0' }} />

                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 28, flex: 1 }}>
                      {p.features.map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.4 }}>
                          <span className="pass-feature-bullet" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => {
                        setSubscribeModalTier(p.tier);
                        setSubscribeModalMode('select_plan');
                        setIsSubscribeModalOpen(true);
                      }}
                      className={p.popular ? 'btn-primary' : 'btn-secondary'}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        fontSize: '0.92rem', 
                        fontWeight: 700,
                        ...(p.tier === 'star_member' ? { background: '#d97706', color: '#fff', borderColor: '#d97706' } : {})
                      }}
                    >
                      Unlock Pass (₹{p.price})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
            </Suspense>
          </main>
        </BuddyAppShell>
      )}

      {/* Global Lazy Modals */}
      <Suspense fallback={null}>
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
            onShowToast={showToast}
            defaultRole={authDefaultRole}
          />
        )}

        {isSubscribeModalOpen && (
          <SubscriptionModal 
            isOpen={isSubscribeModalOpen}
            onClose={() => setIsSubscribeModalOpen(false)}
            onUnlockSubscription={handleUnlockSubscription}
            onShowToast={showToast}
            defaultTier={subscribeModalTier}
            initialMode={subscribeModalMode}
          />
        )}

        {isPostModalOpen && (
          <PostRequestModal 
            isOpen={isPostModalOpen}
            onClose={() => setIsPostModalOpen(false)}
            onSubmitRequest={handleAddNewRequest}
            role={role}
            onShowToast={showToast}
          />
        )}

        {/* FindCo Hallmark Trust & Cryptographic Verification Modal */}
        {isHallmarkModalOpen && (
          <HallmarkTrustModal 
            isOpen={isHallmarkModalOpen}
            onClose={() => setIsHallmarkModalOpen(false)}
            hallmarkData={selectedHallmarkData}
            onShowToast={showToast}
          />
        )}

        {/* FindCo Antigravity Intelligent AI Concierge Modal */}
        {isAntigravityModalOpen && (
          <AntigravityAgentModal 
            isOpen={isAntigravityModalOpen}
            onClose={() => setIsAntigravityModalOpen(false)}
            onNavigateToTab={(tab) => navigateWithAuth(tab)}
            onStartChat={handleStartChatWithCompanion}
            onOpenHallmark={handleOpenHallmark}
            onShowToast={showToast}
          />
        )}
      </Suspense>

      {/* Watermelon-inspired Cozy Companion Floating Beacon */}
      {siteMode === 'consumer' && (
        <CozyFloatingBeacon 
          onOpenFeed={() => navigateWithAuth('feed')}
          onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
          onOpenAntigravityAgent={handleOpenAntigravityAgent}
          onOpenHallmark={() => handleOpenHallmark({ id: 'comp_1', name: 'Priya Sharma', city: 'Bengaluru' })}
        />
      )}

      {/* Global Toast Accessible Live Region */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            zIndex: 3000,
            background: 'var(--bg-card)',
            border: `1px solid ${toast.type === 'success' ? '#10b981' : toast.type === 'error' ? 'var(--color-rose)' : 'var(--color-primary)'}`,
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            maxWidth: 420,
            animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {toast.type === 'success' && <CheckCircle2 size={18} color="#059669" />}
            {toast.type === 'error' && <AlertCircle size={18} color="var(--color-rose)" />}
            {toast.type === 'info' && <Info size={18} color="var(--color-primary)" />}
            
            <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', flex: 1, fontWeight: 500 }}>
              {toast.message}
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 2
              }}
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
