import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Filter, 
  MessageSquare, 
  CheckCircle2,
  Award
} from 'lucide-react';
import { CITIES, CATEGORIES } from '../data/mockData';

export default function DiscoverView({ 
  companions, 
  cityFilter, 
  setCityFilter, 
  onStartChatWithCompanion, 
  hasActiveSub, 
  isLoggedIn,
  onOpenAuth,
  onOpenSubscribe,
  _onUnlockSubscription,
  onOpenHallmark
}) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [maxHourlyRate, setMaxHourlyRate] = useState(1500);
  const [starOnly, setStarOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized filter calculation for instant slider & search responsiveness
  const filteredCompanions = useMemo(() => {
    return companions.filter(comp => {
      if (cityFilter && cityFilter !== 'All Cities' && comp.city !== cityFilter) return false;
      if (selectedCategory !== 'All Categories' && !comp.services.includes(selectedCategory)) return false;
      if (comp.hourlyRate > maxHourlyRate) return false;
      if (starOnly && !comp.isStar) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = comp.name?.toLowerCase().includes(q);
        const matchBio = comp.bio?.toLowerCase().includes(q);
        const matchArea = comp.area?.toLowerCase().includes(q);
        if (!matchName && !matchBio && !matchArea) return false;
      }
      return true;
    });
  }, [companions, cityFilter, selectedCategory, maxHourlyRate, starOnly, searchQuery]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 80px 20px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>
          Discover Verified Companions Across India
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem' }}>
          Browse trusted, Aadhaar-audited buddies offering companionship for dining, workouts, travel, and events.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Top search & quick select */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          
          {/* Keyword Search */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              id="companion-search-input"
              aria-label="Search companions by name, hobby, or area"
              type="text"
              placeholder="Search by name, hobby, neighborhood..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                minHeight: 44,
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-glow)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* City Selector */}
          <div style={{ flex: '0 1 190px' }}>
            <select
              id="companion-city-filter"
              aria-label="Filter companions by city"
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                minHeight: 44,
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Category Selector */}
          <div style={{ flex: '0 1 240px' }}>
            <select
              id="companion-category-filter"
              aria-label="Filter companions by activity category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                minHeight: 44,
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <option value="All Categories">All Categories</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

        </div>

        {/* Quick Filter Pills (Hick's Law chunking) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 4 }}>
            Quick Filters:
          </span>
          <button
            type="button"
            onClick={() => {
              setStarOnly(false);
              setSelectedCategory('All Categories');
              setMaxHourlyRate(2000);
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: !starOnly && selectedCategory === 'All Categories' && maxHourlyRate === 2000 ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              background: !starOnly && selectedCategory === 'All Categories' && maxHourlyRate === 2000 ? 'var(--color-primary-bg)' : 'var(--bg-card)',
              color: !starOnly && selectedCategory === 'All Categories' && maxHourlyRate === 2000 ? 'var(--color-primary-text)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            All Buddies
          </button>
          <button
            type="button"
            onClick={() => setStarOnly(!starOnly)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: starOnly ? '1px solid var(--color-gold)' : '1px solid var(--border-subtle)',
              background: starOnly ? 'var(--color-gold-bg)' : 'var(--bg-card)',
              color: starOnly ? '#b45309' : 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              transition: 'all 0.15s ease'
            }}
          >
            <Star size={13} color="var(--color-gold)" fill={starOnly ? "var(--color-gold)" : "none"} />
            <span>Star Members Only</span>
          </button>
          <button
            type="button"
            onClick={() => setMaxHourlyRate(maxHourlyRate === 800 ? 2000 : 800)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: maxHourlyRate === 800 ? '1px solid var(--color-mint)' : '1px solid var(--border-subtle)',
              background: maxHourlyRate === 800 ? 'var(--color-mint-bg)' : 'var(--bg-card)',
              color: maxHourlyRate === 800 ? 'var(--color-mint-text)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            ⚡ Budget-Friendly (≤ ₹800)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory(selectedCategory === 'Specialty Coffee & Talks' ? 'All Categories' : 'Specialty Coffee & Talks')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedCategory === 'Specialty Coffee & Talks' ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              background: selectedCategory === 'Specialty Coffee & Talks' ? 'var(--color-primary-bg)' : 'var(--bg-card)',
              color: selectedCategory === 'Specialty Coffee & Talks' ? 'var(--color-primary-text)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            ☕ Coffee & Conversations
          </button>
        </div>

        {/* Second Row: Sliders & Toggles */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          paddingTop: 16,
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Rate Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Max Hourly Budget: <strong className="tabular-nums" style={{ color: 'var(--color-primary)' }}>₹{maxHourlyRate}/hr</strong>
            </span>
            <input 
              id="companion-rate-slider"
              aria-label="Maximum hourly rate filter"
              type="range" 
              min="300" 
              max="2000" 
              step="50"
              value={maxHourlyRate}
              onChange={e => setMaxHourlyRate(Number(e.target.value))}
              style={{ accentColor: 'var(--color-primary)', cursor: 'pointer', width: 140 }}
            />
          </div>

          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Showing <strong className="tabular-nums" style={{ color: 'var(--text-main)' }}>{filteredCompanions.length}</strong> vetted companions
          </div>
        </div>

      </div>

      {/* Companions Workspace with Paywall Gating */}
      <div style={{ position: 'relative' }}>
        {/* Active Pass Banner when subscribed */}
        {hasActiveSub && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: 14,
            padding: '12px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: '0.86rem',
            fontWeight: 600
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>You have an Active Membership Pass — All companion portfolios & direct chats are fully unlocked!</span>
            </div>
            <span style={{
              background: '#059669',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 9999,
              letterSpacing: '0.04em'
            }}>
              ACTIVE
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
                  Explore 14,200+ Verified Companions Across India
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                  Browse portfolios freely. Direct 1-on-1 private messaging and escrow hangouts require an active FindCo Membership (from ₹50/mo or ₹799 Lifetime).
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
              <span>Unlock Membership Plans</span>
            </button>
          </div>
        )}

        {/* Grid of Companions (Freely Accessible & Unblurred) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
          transition: 'all 0.3s ease'
        }}>
        {filteredCompanions.map(comp => (
          <div 
            key={comp.id}
            className="glass-panel"
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--border-accent)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            {/* Top Image Banner - Radius math formula: child radius matches parent */}
            <div style={{ position: 'relative', height: 230, width: '100%', borderRadius: '15px 15px 0 0', overflow: 'hidden' }}>
              <img 
                src={comp.avatar} 
                alt={comp.name}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />

              {/* Status Pills */}
              <div style={{
                position: 'absolute',
                top: 14,
                left: 14,
                display: 'flex',
                gap: 6
              }}>
                {comp.isStar && (
                  <span className="badge-tag-gold" style={{ fontSize: '0.72rem' }}>
                    <Star size={12} color="var(--color-gold)" fill="var(--color-gold)" />
                    STAR
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenHallmark) onOpenHallmark(comp);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(6, 78, 59, 0.92)',
                    backdropFilter: 'blur(8px)',
                    color: '#a7f3d0',
                    border: '1px solid rgba(167, 243, 208, 0.5)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  title="Click to view verified Hallmark Cryptographic Dossier"
                >
                  <Award size={12} color="#fef08a" />
                  <span>HALLMARK VERIFIED</span>
                </button>
              </div>

              {/* Live Presence Beacon */}
              <div style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(15, 23, 42, 0.78)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.72rem',
                color: comp.isOnline ? '#34d399' : 'var(--text-muted)',
                fontWeight: 600
              }}>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: comp.isOnline ? '#10b981' : 'var(--text-dim)',
                  display: 'inline-block',
                  boxShadow: comp.isOnline ? '0 0 8px rgba(16, 185, 129, 0.8)' : 'none'
                }} />
                {comp.isOnline ? 'Online now' : 'Offline'}
              </div>

              {/* Rates Tag with Tabular Numerals */}
              <div style={{
                position: 'absolute',
                bottom: 12,
                right: 14,
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-md)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 4
              }}>
                <span className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ₹{comp.hourlyRate}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>/ hr</span>
              </div>
            </div>

            {/* Profile Content */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.015em' }}>{comp.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-gold)', fontSize: '0.88rem', fontWeight: 700 }}>
                  <Star size={15} fill="var(--color-gold)" />
                  <span className="tabular-nums">{comp.rating}</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.78rem' }} className="tabular-nums">
                    ({comp.reviewsCount})
                  </span>
                </div>
              </div>

              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                <MapPin size={14} color="var(--color-primary)" />
                <span>{comp.city} • {comp.area}</span>
              </div>

              {/* Bio */}
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16, flex: 1 }}>
                {comp.bio}
              </p>

              {/* Category tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {comp.services.map(s => (
                  <span key={s} className="badge-tag-amber" style={{ fontSize: '0.7rem' }}>
                    {s}
                  </span>
                ))}
              </div>

              {/* Languages */}
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 18 }}>
                Languages: <strong style={{ color: 'var(--text-secondary)' }}>{comp.languages.join(', ')}</strong>
              </div>

              {/* Action Buttons Row with 44px touch targets & hover physics */}
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenHallmark) onOpenHallmark(comp);
                  }}
                  className="btn-secondary"
                  style={{
                    flex: '0 0 auto',
                    padding: '10px 14px',
                    minHeight: 44,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    borderRadius: 'var(--radius-md)',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  title="Audit Hallmark Trust Credentials"
                >
                  <Award size={15} color="#059669" />
                  <span>Hallmark</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) {
                      if (onOpenAuth) onOpenAuth('client');
                    } else if (!hasActiveSub) {
                      if (onOpenSubscribe) onOpenSubscribe();
                    } else {
                      onStartChatWithCompanion(comp);
                    }
                  }}
                  className="btn-primary"
                  style={{ 
                    flex: 1, 
                    padding: '10px 16px', 
                    minHeight: 44,
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <MessageSquare size={16} />
                  <span>Connect & Chat</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredCompanions.length === 0 && (
          <div className="glass-panel" style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-subtle)',
            background: 'var(--bg-card)'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-primary-bg)',
              color: 'var(--color-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Filter size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>No matching companions found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 460, margin: '0 auto 20px auto' }}>
              We couldn't find any verified companions matching your active filters. Try broadening your budget or resetting city selection.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Categories');
                setCityFilter('All Cities');
                setMaxHourlyRate(1500);
                setStarOnly(false);
              }}
              className="btn-secondary"
              style={{ padding: '10px 22px', fontSize: '0.88rem' }}
            >
              Clear All Filters
            </button>
          </div>
        )}
        </div>
      </div>

    </div>
  );
}
