import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import BuddyFeedView from './components/BuddyFeedView';
import DiscoverView from './components/DiscoverView';
import ChatsView from './components/ChatsView';
import IdentityVaultView from './components/IdentityVaultView';
import BuddyProfileView from './components/BuddyProfileView';
import DashboardView from './components/DashboardView';
import NotificationsView from './components/NotificationsView';
import SubscriptionModal from './components/SubscriptionModal';
import PostRequestModal from './components/PostRequestModal';
import Footer from './components/Footer';
import AdminSecurityGate from './components/admin/AdminSecurityGate';
import AdminPortalView from './components/admin/AdminPortalView';
import CozyFloatingBeacon from './components/watermelon/CozyFloatingBeacon';
import BuddyAppShell from './components/BuddyAppShell';
import AuthModal from './components/AuthModal';
import HallmarkTrustModal from './components/HallmarkTrustModal';
import AntigravityAgentModal from './components/AntigravityAgentModal';
import { StorageEngine } from './utils/storageEngine';
import { getCompanionHallmark } from './utils/hallmarkProvenance';
import { 
  INITIAL_COMPANIONS, 
  INITIAL_REQUESTS, 
  INITIAL_CHATS, 
  INITIAL_KYC_REQUESTS,
  INITIAL_DASHBOARD_DATA,
  INITIAL_NOTIFICATIONS,
  SUBSCRIPTION_PLANS,
  DEFAULT_BUDDY_PROFILE
} from './data/mockData';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  // Top-level architecture separation: 'consumer' vs 'admin'
  const [siteMode, setSiteMode] = useState('consumer'); // 'consumer' | 'admin'
  const [adminAuth, setAdminAuth] = useState(null); // null if not logged in

  const [activeTab, setActiveTab] = useState('landing'); // 'landing' | 'feed' | 'discover' | 'chats' | 'vault' | 'subscriptions'
  const [role, setRole] = useState('client'); // 'client' | 'buddy'
  
  // Persistent Membership state from AntiVibe StorageEngine
  const [hasActiveSub, setHasActiveSub] = useState(() => StorageEngine.getMembership().hasActiveSub);
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

  // Modals
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
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
    StorageEngine.setMembership({ hasActiveSub, tier: hasActiveSub ? 'weekly_basic' : null });
  }, [hasActiveSub]);

  // Toast System
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleUnlockSubscription = (tier) => {
    setHasActiveSub(true);
    showToast(`Membership active! All platform features and feed requests unlocked.`, 'success');
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

  const handleAddNewRequest = (newRequest) => {
    setRequests(prev => [newRequest, ...prev]);
    setActiveTab('feed');
  };

  const handleOpenAuth = (roleIntent = 'client') => {
    setAuthDefaultRole(roleIntent);
    setIsAuthModalOpen(true);
  };

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
    // Once signed in, land directly in the member dashboard & connections
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    StorageEngine.clearUserSession();
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

  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // ==========================================
  // ISOLATED PROTECTED ADMIN PORTAL
  // ==========================================
  if (siteMode === 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#f8fafc' }}>
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

        {/* Global Toast Notification */}
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
    );
  }

  // ==========================================
  // CONSUMER FACING BUDDYSEARCH WEBSITE
  // ==========================================
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Consumer Shell Selection: Landing View vs In-App BuddySearch Shell */}
      {activeTab === 'landing' ? (
        <>
          {/* Top Navigation for Landing */}
          <Navbar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            role={role}
            setRole={setRole}
            hasActiveSub={hasActiveSub}
            onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
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
          <main style={{ flex: 1 }}>
            <LandingPage 
              setActiveTab={(tab) => {
                if (['dashboard', 'chats', 'profile', 'vault'].includes(tab) && !isLoggedIn) {
                  showToast('Please sign in or create an account to access ' + (tab === 'dashboard' ? 'your dashboard' : tab) + '.', 'info');
                  handleOpenAuth(tab === 'profile' ? 'buddy' : 'client');
                } else {
                  setActiveTab(tab);
                }
              }}
              setCityFilter={setCityFilter}
              onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
              onOpenPostRequest={handlePostRequestClick}
              onOpenAuth={handleOpenAuth}
              isLoggedIn={isLoggedIn}
              onOpenAntigravityAgent={handleOpenAntigravityAgent}
              onOpenHallmark={handleOpenHallmark}
            />
          </main>

          {/* Footer for Landing */}
          <Footer 
            setActiveTab={setActiveTab}
            onOpenAdminPortal={() => setSiteMode('admin')}
            onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
            onOpenPostRequest={handlePostRequestClick}
          />
        </>
      ) : (
        /* In-App BuddySearch Workspace with Left Sidebar Navigation */
        <BuddyAppShell
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (['dashboard', 'chats', 'profile', 'vault', 'notifications'].includes(tab) && !isLoggedIn) {
              handleOpenAuth(tab === 'profile' ? 'buddy' : 'client');
            } else {
              setActiveTab(tab);
            }
          }}
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
              onAddBooking={(newBooking) => {
                setDashboardData(prev => ({
                  ...prev,
                  upcomingBookings: [newBooking, ...(prev.upcomingBookings || [])]
                }));
                StorageEngine.addBooking(newBooking);
              }}
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
            <div style={{ maxWidth: 980, margin: '0 auto', padding: '20px 0 80px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <h1 style={{ fontSize: '2.2rem', marginBottom: 8, fontWeight: 800, letterSpacing: '-0.025em' }}>FindCo Membership Passes</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', maxWidth: 620, margin: '0 auto' }}>
                  Friendship-first transparent pricing. Start with our <strong>₹9 / Day</strong> micro-pass or grab the popular <strong>₹49 / Week</strong> pass.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
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
                      border: p.popular ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      background: p.popular ? 'var(--color-primary-bg)' : 'var(--bg-card)'
                    }}
                  >
                    {p.popular && (
                      <div style={{
                        position: 'absolute',
                        top: -12,
                        right: 18,
                        background: 'var(--color-primary)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        MOST POPULAR
                      </div>
                    )}

                    <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>{p.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                      Valid for {p.validity}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
                      <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-primary)' }} className="tabular-nums">
                        ₹{p.price}
                      </span>
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }} className="tabular-nums">
                        ₹{p.originalPrice}
                      </span>
                    </div>

                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 28, flex: 1 }}>
                      {p.features.map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span className="pass-feature-bullet" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => setIsSubscribeModalOpen(true)}
                      className={p.popular ? 'btn-primary' : 'btn-secondary'}
                      style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
                    >
                      Unlock Pass (₹{p.price})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </BuddyAppShell>
      )}

      {/* Global Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onShowToast={showToast}
        defaultRole={authDefaultRole}
      />

      <SubscriptionModal 
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        onUnlockSubscription={handleUnlockSubscription}
        onShowToast={showToast}
      />

      <PostRequestModal 
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmitRequest={handleAddNewRequest}
        role={role}
        onShowToast={showToast}
      />

      {/* FindCo Hallmark Trust & Cryptographic Verification Modal */}
      <HallmarkTrustModal 
        isOpen={isHallmarkModalOpen}
        onClose={() => setIsHallmarkModalOpen(false)}
        hallmarkData={selectedHallmarkData}
        onShowToast={showToast}
      />

      {/* FindCo Antigravity Intelligent AI Concierge Modal */}
      <AntigravityAgentModal 
        isOpen={isAntigravityModalOpen}
        onClose={() => setIsAntigravityModalOpen(false)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onStartChat={handleStartChatWithCompanion}
        onOpenHallmark={handleOpenHallmark}
        onShowToast={showToast}
      />

      {/* Watermelon-inspired Cozy Companion Floating Beacon */}
      {siteMode === 'consumer' && (
        <CozyFloatingBeacon 
          onOpenFeed={() => setActiveTab('feed')}
          onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
          onOpenAntigravityAgent={handleOpenAntigravityAgent}
          onOpenHallmark={() => handleOpenHallmark({ id: 'comp_1', name: 'Priya Sharma', city: 'Bengaluru' })}
        />
      )}

      {/* Global Toast Notification */}
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
  );
}
