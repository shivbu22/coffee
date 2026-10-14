import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Send, 
  MessageSquare, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Tag, 
  Award, 
  Lock, 
  ArrowUpRight, 
  Coins, 
  Plus, 
  Filter,
  CheckCircle2, 
  AlertCircle, 
  Flag, 
  X,
  Search,
  Share2,
  Bookmark,
  Star,
  Coffee,
  Dumbbell,
  Film,
  Compass,
  ShoppingBag,
  Laptop,
  Map,
  Sparkles,
  Calendar,
  Check,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { CITIES } from '../data/mockData';

// Quick category shortcuts with corresponding Lucide icons
const QUICK_CATEGORIES = [
  { id: 'all', label: 'All Activities', icon: Compass },
  { id: 'cafe', label: 'Café & Dining', icon: Coffee },
  { id: 'fitness', label: 'Gym & Fitness', icon: Dumbbell },
  { id: 'movie', label: 'Movies & Concerts', icon: Film },
  { id: 'travel', label: 'Travel & Trips', icon: Map },
  { id: 'shopping', label: 'Shopping & Style', icon: ShoppingBag },
  { id: 'study', label: 'Study & Cowork', icon: Laptop },
];

export default function BuddyFeedView({ 
  requests, 
  setRequests, 
  hasActiveSub, 
  onOpenSubscribe, 
  onUnlockSubscription,
  onOpenPostRequest, 
  onNavigateToChat,
  onShowToast
}) {
  // Navigation & Filter States
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'client' | 'buddy' | 'saved'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'budget_high' | 'popular'
  
  // Interactive UI states
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [savedRequests, setSavedRequests] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  
  // Modal States
  const [proposalModalData, setProposalModalData] = useState(null);
  const [customPrice, setCustomPrice] = useState('');
  const [proposalNote, setProposalNote] = useState('');
  const [reportModalData, setReportModalData] = useState(null);

  // Tab change handler with micro-loading transition
  const handleFilterChange = (tab) => {
    setIsFilterLoading(true);
    setFilterTab(tab);
    setTimeout(() => setIsFilterLoading(false), 140);
  };

  const handleCategoryChange = (catId) => {
    setIsFilterLoading(true);
    setSelectedCategory(catId);
    setTimeout(() => setIsFilterLoading(false), 140);
  };

  // Upvote with micro-interaction
  const handleToggleUpvote = (id) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const nextUpvoted = !req.isUpvoted;
        return {
          ...req,
          isUpvoted: nextUpvoted,
          upvotes: nextUpvoted ? req.upvotes + 1 : Math.max(0, req.upvotes - 1)
        };
      }
      return req;
    }));
  };

  // Bookmark / Save toggle
  const handleToggleSave = (id) => {
    setSavedRequests(prev => {
      const isSaved = !!prev[id];
      const next = { ...prev, [id]: !isSaved };
      if (!isSaved) {
        onShowToast('Request bookmarked to your saved collection.', 'success');
      } else {
        onShowToast('Removed from saved bookmarks.', 'info');
      }
      return next;
    });
  };

  // Share request
  const handleShareRequest = (req) => {
    const url = `${window.location.origin}/#req-${req.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(req.id);
        onShowToast('Share link copied to clipboard!', 'success');
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => {
        onShowToast('Share link: ' + url, 'info');
      });
    } else {
      onShowToast('Share link: ' + url, 'info');
    }
  };

  const toggleReadMore = (id) => {
    setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Connection Request Application
  const handleSendRequest = (req) => {
    if (!hasActiveSub) {
      onOpenSubscribe();
      return;
    }

    if (req.chatStatus === 'accepted') {
      onNavigateToChat(req.roomId || 'room_1');
      return;
    }

    if (req.chatStatus === 'pending') {
      onShowToast('Application already submitted. Author is reviewing your profile.', 'info');
      return;
    }

    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, chatStatus: 'pending' } : r));
    onShowToast(`Hire application sent to ${req.authorName}!`, 'success');
  };

  // Propose Counter-Rate
  const handleOpenProposePrice = (req) => {
    if (!hasActiveSub) {
      onOpenSubscribe();
      return;
    }
    setProposalModalData(req);
    setCustomPrice(req.budget.toString());
    setProposalNote('');
  };

  const handleSubmitProposal = (e) => {
    e.preventDefault();
    if (!customPrice || isNaN(customPrice) || Number(customPrice) <= 0) {
      onShowToast('Please enter a valid rate.', 'error');
      return;
    }

    setRequests(prev => prev.map(r => {
      if (r.id === proposalModalData.id) {
        return {
          ...r,
          myProposal: {
            amount: Number(customPrice),
            note: proposalNote,
            status: 'pending'
          }
        };
      }
      return r;
    }));

    onShowToast(`Custom counter-rate of ₹${customPrice} submitted to ${proposalModalData.authorName}!`, 'success');
    setProposalModalData(null);
  };

  // Filter & Sort Logic
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Filter by Perspective Tab
    if (filterTab === 'client') {
      result = result.filter(r => r.postedAs === 'client');
    } else if (filterTab === 'buddy') {
      result = result.filter(r => r.postedAs === 'buddy');
    } else if (filterTab === 'saved') {
      result = result.filter(r => !!savedRequests[r.id]);
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      const catObj = QUICK_CATEGORIES.find(c => c.id === selectedCategory);
      if (catObj) {
        result = result.filter(r => 
          r.serviceCategory.toLowerCase().includes(catObj.label.toLowerCase().split(' ')[0]) ||
          r.serviceCategory.toLowerCase().includes(selectedCategory)
        );
      }
    }

    // Filter by City
    if (selectedCity !== 'All Cities') {
      result = result.filter(r => r.authorCity.toLowerCase() === selectedCity.toLowerCase());
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.authorName.toLowerCase().includes(q) ||
        r.serviceCategory.toLowerCase().includes(q) ||
        r.authorCity.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'budget_high') {
      result.sort((a, b) => b.budget - a.budget);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.upvotes - a.upvotes);
    } // default is newest (current order)

    return result;
  }, [requests, filterTab, selectedCategory, selectedCity, searchQuery, sortBy, savedRequests]);

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '16px 16px 80px 16px' }}>
      
      {/* 1. HERO COMMAND CENTER / MARKETPLACE HEADER */}
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
        {/* Subtle background ambient blob */}
        <div style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(254, 205, 211, 0.4) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff1f2', color: '#e11d48', padding: '4px 12px', borderRadius: 9999, fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
                <Zap size={13} fill="#e11d48" />
                Live Companion Exchange
              </div>
              <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 6 }}>
                Hire a Buddy for Plans
              </h1>
              <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: 540, lineHeight: 1.5 }}>
                Browse verified companionship gigs, send direct hire applications, or post your own custom hangout plan. Every session is protected by RBI-compliant Escrow.
              </p>
            </div>

            {/* Quick Post Request Button */}
            <button
              type="button"
              onClick={onOpenPostRequest}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 22px',
                borderRadius: 9999,
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(225, 29, 72, 0.32)',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                flexShrink: 0
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(225, 29, 72, 0.42)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(225, 29, 72, 0.32)';
              }}
            >
              <Plus size={16} strokeWidth={2.6} />
              <span>Post a Hire Request</span>
            </button>
          </div>

          {/* Market Pulse Ribbon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            paddingTop: 14,
            borderTop: '1px solid #f1f5f9',
            flexWrap: 'wrap',
            fontSize: '0.8rem',
            color: '#475569'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)' }} />
              <span><strong>1,420+</strong> Companions Active Today</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
              <Clock size={14} color="#f59e0b" />
              <span>Median Match Time: <strong>~4 mins</strong></span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span><strong>100% Aadhaar Verified</strong> Escrow Safety</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIVITY CATEGORY SHORTCUT PILLS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 10,
        marginBottom: 16,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {QUICK_CATEGORIES.map(cat => {
          const IconComponent = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: '0.82rem',
                fontWeight: isSelected ? 700 : 600,
                whiteSpace: 'nowrap',
                border: isSelected ? '1.5px solid #e11d48' : '1px solid #e2e8f0',
                background: isSelected ? '#fff1f2' : '#ffffff',
                color: isSelected ? '#e11d48' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 2px 8px rgba(225, 29, 72, 0.15)' : 'none'
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#ffffff';
                }
              }}
            >
              <IconComponent size={14} color={isSelected ? '#e11d48' : '#64748b'} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. SEARCH & SMART FILTER TOOLBAR */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 18,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '8px 14px',
          flex: '1 1 280px',
          minWidth: 240
        }}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search plans (e.g., 'Indiranagar gym', 'Bandra cafe', 'Coldplay')..."
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
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* City Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <MapPin size={15} color="#e11d48" />
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          >
            {CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <SlidersHorizontal size={14} color="#64748b" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="budget_high">Highest Budget</option>
            <option value="popular">Most Upvoted</option>
          </select>
        </div>
      </div>

      {/* 4. PERSPECTIVE SEGMENTED SUB-TABS */}
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
            { id: 'all', label: 'All Activity', count: requests.length },
            { id: 'client', label: 'Seeking Companion', count: requests.filter(r => r.postedAs === 'client').length },
            { id: 'buddy', label: 'Companion Offers', count: requests.filter(r => r.postedAs === 'buddy').length },
            { id: 'saved', label: 'Bookmarked', count: Object.values(savedRequests).filter(Boolean).length }
          ].map(tab => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleFilterChange(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 15px',
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
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Showing <strong>{filteredRequests.length}</strong> active requests
        </div>
      </div>

      {/* 5. ACTIVE PASS BANNER (WHEN SUBSCRIBED) */}
      {hasActiveSub && (
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          borderRadius: 16,
          padding: '12px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#059669" />
            </div>
            <span>
              <strong>Active Pass Enclave:</strong> Direct hire applications, custom rate proposals, and unblurred companion requests are unlocked.
            </span>
          </div>
          <span style={{
            background: '#059669',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: 9999,
            letterSpacing: '0.04em'
          }}>
            VERIFIED ACCESS
          </span>
        </div>
      )}

      {/* Elegant Membership Notice Banner when !hasActiveSub */}
      {!hasActiveSub && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.06) 0%, rgba(244, 63, 94, 0.02) 100%)',
          border: '1px solid rgba(225, 29, 72, 0.22)',
          borderRadius: 16,
          padding: '16px 22px',
          marginBottom: 24,
          boxShadow: '0 4px 14px rgba(225, 29, 72, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#fff1f2',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(225, 29, 72, 0.15)'
            }}>
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                India's #1 Live Social Companion Exchange
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                Browse companion gig requests freely. Sending hire proposals, custom rate bids, and direct messages requires an active Pass (from ₹9/day).
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenSubscribe}
            style={{
              background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              padding: '10px 20px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Award size={16} />
            <span>Unlock Pass (₹9)</span>
          </button>
        </div>
      )}

      {/* 7. FEED REQUEST CARDS LIST */}
      {isFilterLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                <div className="skeleton-shimmer" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton-shimmer" style={{ width: '30%', height: 16, borderRadius: 6 }} />
                  <div className="skeleton-shimmer" style={{ width: '20%', height: 12, borderRadius: 6 }} />
                </div>
              </div>
              <div className="skeleton-shimmer" style={{ width: '70%', height: 22, borderRadius: 6, marginBottom: 12 }} />
              <div className="skeleton-shimmer" style={{ width: '100%', height: 38, borderRadius: 6, marginBottom: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <div className="skeleton-shimmer" style={{ width: 120, height: 36, borderRadius: 8 }} />
                <div className="skeleton-shimmer" style={{ width: 140, height: 36, borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
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
            <Filter size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            No Matching Hire Requests Found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: 440, margin: '0 auto 20px auto', lineHeight: 1.5 }}>
            No plans match your current search, city, or category filters. Try clearing your filters or post your own custom companion plan!
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <button 
              type="button" 
              onClick={() => {
                setFilterTab('all');
                setSelectedCategory('all');
                setSelectedCity('All Cities');
                setSearchQuery('');
              }} 
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '9px 18px',
                borderRadius: 12,
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset All Filters
            </button>
            <button
              type="button"
              onClick={onOpenPostRequest}
              style={{
                background: '#e11d48',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: 12,
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Post a Plan Now
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          transition: 'all 0.3s ease'
        }}>
          {filteredRequests.map((req) => {
            const isExpanded = expandedDesc[req.id];
            const isSaved = !!savedRequests[req.id];
            const isClientRequest = req.postedAs === 'client';

            return (
              <div 
                key={req.id}
                id={`req-${req.id}`}
                style={{
                  background: '#ffffff',
                  border: isClientRequest ? '1px solid #e2e8f0' : '1px solid #fed7aa',
                  borderRadius: 20,
                  padding: '22px 24px',
                  boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)';
                }}
              >
                {/* CARD HEADER */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={req.authorAvatar} 
                        alt={req.authorName}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isClientRequest ? '2px solid #e2e8f0' : '2px solid #f97316'
                        }}
                      />
                      {/* Live presence indicator */}
                      <span style={{
                        position: 'absolute',
                        bottom: 1,
                        right: 1,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '2px solid #ffffff'
                      }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                          {req.authorName}
                        </span>

                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          background: '#ecfdf5',
                          color: '#059669',
                          padding: '2px 8px',
                          borderRadius: 9999,
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          <ShieldCheck size={12} color="#059669" />
                          <span>Aadhaar Verified</span>
                        </span>

                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          background: isClientRequest ? '#fff7ed' : '#f0fdf4',
                          color: isClientRequest ? '#c2410c' : '#15803d',
                          border: `1px solid ${isClientRequest ? '#ffedd5' : '#bbf7d0'}`,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          {isClientRequest ? 'Seeking Companion' : 'Companion Pro Offer'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} color="#e11d48" />
                          <strong>{req.authorCity}</strong>
                        </span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} />
                          {req.timeAgo}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#f59e0b', fontWeight: 700 }}>
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                          4.9 (Verified)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Action Icons (Save, Share, Report) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleSave(req.id)}
                      style={{
                        background: isSaved ? '#fff1f2' : 'transparent',
                        border: 'none',
                        color: isSaved ? '#e11d48' : '#94a3b8',
                        cursor: 'pointer',
                        padding: 7,
                        borderRadius: 8,
                        transition: 'all 0.15s ease'
                      }}
                      title={isSaved ? "Remove bookmark" : "Save this plan"}
                      aria-label="Bookmark"
                    >
                      <Bookmark size={16} fill={isSaved ? '#e11d48' : 'none'} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareRequest(req)}
                      style={{
                        background: copiedId === req.id ? '#ecfdf5' : 'transparent',
                        border: 'none',
                        color: copiedId === req.id ? '#059669' : '#94a3b8',
                        cursor: 'pointer',
                        padding: 7,
                        borderRadius: 8,
                        transition: 'all 0.15s ease'
                      }}
                      title="Share link"
                      aria-label="Share"
                    >
                      {copiedId === req.id ? <Check size={16} /> : <Share2 size={16} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportModalData(req)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 7,
                        borderRadius: 8
                      }}
                      title="Report request"
                      aria-label="Report"
                    >
                      <Flag size={15} />
                    </button>
                  </div>
                </div>

                {/* METADATA CHIPS (Category, Venue Security, Schedule) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: '0.74rem',
                    fontWeight: 700
                  }}>
                    <Tag size={12} color="#e11d48" />
                    {req.serviceCategory}
                  </span>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: '0.74rem',
                    fontWeight: 600
                  }}>
                    <Calendar size={12} color="#64748b" />
                    Flexible Schedule
                  </span>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                    color: '#166534',
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: '0.74rem',
                    fontWeight: 600
                  }}>
                    <ShieldCheck size={12} color="#16a34a" />
                    Public Venue Safe
                  </span>
                </div>

                {/* TITLE & DESCRIPTION */}
                <h3 style={{
                  fontSize: '1.18rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: 8,
                  lineHeight: 1.35,
                  letterSpacing: '-0.02em'
                }}>
                  {req.title}
                </h3>

                <p style={{
                  color: '#475569',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  marginBottom: 14
                }}>
                  {isExpanded ? req.description : `${req.description.slice(0, 160)}${req.description.length > 160 ? '...' : ''}`}
                  {req.description.length > 160 && (
                    <button
                      type="button"
                      onClick={() => toggleReadMore(req.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e11d48',
                        cursor: 'pointer',
                        fontWeight: 700,
                        marginLeft: 6,
                        fontSize: '0.84rem'
                      }}
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </p>

                {/* COUNTER-PROPOSAL PINNED BANNER IF ANY */}
                {req.myProposal && (
                  <div style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="#059669" />
                      <span>
                        Your Proposed Counter-Offer: <strong>₹{req.myProposal.amount}</strong>
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: 9999, fontWeight: 800 }}>
                      AWAITING AUTHOR
                    </span>
                  </div>
                )}

                {/* FOOTER ACTIONS (BUDGET + UPVOTE + PROPOSE + PRIMARY CTA) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  borderTop: '1px solid #f1f5f9',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  {/* Financial Enclave */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#f8fafc',
                    padding: '8px 16px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {isClientRequest ? 'Offered Budget' : 'Companion Rate'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                          ₹{req.budget}
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                          /{req.billingType === 'hourly' ? 'hr' : 'trip'}
                        </span>
                      </div>
                    </div>
                    <div style={{ width: 1, height: 26, background: '#cbd5e1', margin: '0 4px' }} />
                    <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={11} color="#059669" />
                      Escrow Vault Locked
                    </span>
                  </div>

                  {/* Interactive CTAs */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Upvote Button with Micro-Interaction */}
                    <button
                      type="button"
                      onClick={() => handleToggleUpvote(req.id)}
                      style={{
                        background: req.isUpvoted ? '#ffe4e6' : '#ffffff',
                        border: `1px solid ${req.isUpvoted ? '#fda4af' : '#e2e8f0'}`,
                        color: req.isUpvoted ? '#e11d48' : '#64748b',
                        padding: '8px 14px',
                        borderRadius: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        if (!req.isUpvoted) {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!req.isUpvoted) {
                          e.currentTarget.style.background = '#ffffff';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }
                      }}
                    >
                      <Heart size={15} fill={req.isUpvoted ? '#e11d48' : 'none'} color={req.isUpvoted ? '#e11d48' : '#94a3b8'} />
                      <span>{req.upvotes}</span>
                    </button>

                    {/* Propose Custom Counter-Rate */}
                    <button
                      type="button"
                      onClick={() => handleOpenProposePrice(req)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                        padding: '9px 15px',
                        borderRadius: 12,
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <Coins size={15} color="#e11d48" />
                      <span>Propose Rate</span>
                    </button>

                    {/* Main Application CTA */}
                    <button
                      type="button"
                      onClick={() => handleSendRequest(req)}
                      style={{
                        padding: '9px 20px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        borderRadius: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        cursor: req.chatStatus === 'pending' ? 'not-allowed' : 'pointer',
                        border: 'none',
                        background: req.chatStatus === 'accepted' 
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : req.chatStatus === 'pending'
                          ? '#f1f5f9'
                          : 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
                        color: req.chatStatus === 'pending' ? '#94a3b8' : '#ffffff',
                        boxShadow: req.chatStatus === 'pending' 
                          ? 'none' 
                          : req.chatStatus === 'accepted'
                          ? '0 4px 14px rgba(16, 185, 129, 0.3)'
                          : '0 4px 14px rgba(225, 29, 72, 0.32)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {req.chatStatus === 'accepted' ? (
                        <>
                          <MessageSquare size={15} />
                          <span>Open Chat</span>
                        </>
                      ) : req.chatStatus === 'pending' ? (
                        <>
                          <Clock size={15} />
                          <span>Applied • Pending</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Hire / Connect</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 8. PROPOSE PRICE / COUNTER-OFFER MODAL */}
      {proposalModalData && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', zIndex: 110 }}>
          <div className="modal-box modal-enter" style={{
            width: '100%',
            maxWidth: 500,
            padding: 30,
            borderRadius: 24,
            border: '1.5px solid #fecdd3',
            background: '#ffffff',
            boxShadow: '0 25px 60px -15px rgba(225, 29, 72, 0.25)'
          }}>
            <button
              type="button"
              onClick={() => setProposalModalData(null)}
              style={{
                position: 'absolute',
                top: 22,
                right: 22,
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Modal Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: '#fff1f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e11d48'
              }}>
                <Coins size={22} color="#e11d48" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Propose Custom Counter-Rate
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Negotiate directly with {proposalModalData.authorName} under Escrow Vault protection.
                </p>
              </div>
            </div>

            {/* Original Budget Reference */}
            <div style={{
              background: '#f8fafc',
              padding: '14px 18px',
              borderRadius: 14,
              marginBottom: 18,
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>
                Author's Listed Rate:
              </span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                ₹{proposalModalData.budget} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>/{proposalModalData.billingType === 'hourly' ? 'hr' : 'trip'}</span>
              </span>
            </div>

            <form onSubmit={handleSubmitProposal}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Your Proposed Rate (INR)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 800,
                    color: '#e11d48',
                    fontSize: '1.1rem'
                  }}>₹</span>
                  <input 
                    type="number"
                    value={customPrice}
                    onChange={e => setCustomPrice(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '13px 16px 13px 38px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 12,
                      color: '#0f172a',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Quick adjustments */}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  {[-100, 100, 250].map(delta => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => setCustomPrice(prev => Math.max(100, (Number(prev) || 0) + delta).toString())}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {delta > 0 ? `+₹${delta}` : `-₹${Math.abs(delta)}`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomPrice(proposalModalData.budget.toString())}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Match Listed
                  </button>
                </div>
              </div>

              {/* Escrow 0% cut breakdown */}
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: '#065f46',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <CheckCircle2 size={16} color="#059669" flexShrink={0} />
                <span>
                  <strong>0% Platform Commission:</strong> Companions receive 100% of agreed funds directly to their bank account via instant UPI.
                </span>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Proposal Pitch & Availability (Optional)
                </label>
                <textarea 
                  rows={3}
                  value={proposalNote}
                  onChange={e => setProposalNote(e.target.value)}
                  placeholder="e.g. Free this Saturday afternoon. Can meet near Indiranagar Cult and spot your strength sets..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 12,
                    color: '#0f172a',
                    fontSize: '0.86rem',
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setProposalModalData(null)}
                  style={{
                    flex: 1,
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    padding: '12px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1.5,
                    background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
                  }}
                >
                  Submit Counter-Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. REPORT CONTENT SAFETY MODAL */}
      {reportModalData && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', zIndex: 110 }}>
          <div className="modal-box modal-enter" style={{
            width: '100%',
            maxWidth: 460,
            padding: 26,
            borderRadius: 24,
            border: '1px solid #fecdd3',
            background: '#ffffff'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={20} color="#e11d48" />
              Report Inappropriate Content
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: 18, lineHeight: 1.5 }}>
              FindCo enforces strict zero-tolerance policies for commercial solicitations, harassment, and off-platform fraudulent schemes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                'Commercial or Escort Solicitation',
                'Harassment or Offensive Language',
                'Spam or Duplicate Post',
                'Fake / Suspicious Identity',
                'Unsafe Location or Terms'
              ].map(reason => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    onShowToast(`Report submitted for review. Thank you for keeping FindCo safe.`, 'success');
                    setReportModalData(null);
                  }}
                  style={{
                    textAlign: 'left',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#334155',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#fff1f2';
                    e.currentTarget.style.borderColor = '#fecdd3';
                    e.currentTarget.style.color = '#e11d48';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setReportModalData(null)}
              style={{
                width: '100%',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '11px',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
