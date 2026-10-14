import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Filter, 
  MessageSquare, 
  ChevronDown, 
  CheckCircle2,
  Lock,
  Award
} from 'lucide-react';
import { CITIES, CATEGORIES } from '../data/mockData';

export default function DiscoverView({ 
  companions, 
  cityFilter, 
  setCityFilter, 
  onStartChatWithCompanion, 
  hasActiveSub, 
  onOpenSubscribe,
  onUnlockSubscription,
  onOpenHallmark
}) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [maxHourlyRate, setMaxHourlyRate] = useState(1500);
  const [starOnly, setStarOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter companions
  const filteredCompanions = companions.filter(comp => {
    if (cityFilter && cityFilter !== 'All Cities' && comp.city !== cityFilter) return false;
    if (selectedCategory !== 'All Categories' && !comp.services.includes(selectedCategory)) return false;
    if (comp.hourlyRate > maxHourlyRate) return false;
    if (starOnly && !comp.isStar) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = comp.name.toLowerCase().includes(q);
      const matchBio = comp.bio.toLowerCase().includes(q);
      const matchArea = comp.area.toLowerCase().includes(q);
      if (!matchName && !matchBio && !matchArea) return false;
    }
    return true;
  });

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
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {/* Top search & quick select */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          
          {/* Keyword Search */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              id="companion-search-input"
              aria-label="Search companions by name, hobby, or area"
              type="text"
              placeholder="Search by name, hobby, area..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 16px 11px 40px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.88rem'
              }}
            />
          </div>

          {/* City Selector */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              id="companion-city-filter"
              aria-label="Filter companions by city"
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Category Selector */}
          <div style={{ flex: '0 1 220px' }}>
            <select
              id="companion-category-filter"
              aria-label="Filter companions by activity category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <option value="All Categories">All Categories</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

        </div>

        {/* Second Row: Sliders & Toggles */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          paddingTop: 12,
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Rate Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Max Hourly Rate: <strong style={{ color: 'var(--color-primary)' }}>₹{maxHourlyRate}/hr</strong>
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

          {/* Star Member Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600 }}>
            <input 
              id="companion-star-toggle"
              aria-label="Show star companions only"
              type="checkbox"
              checked={starOnly}
              onChange={e => setStarOnly(e.target.checked)}
              style={{ accentColor: 'var(--color-gold)', width: 16, height: 16 }}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-gold)' }}>
              <Star size={14} color="var(--color-gold)" fill="var(--color-gold)" /> Star Members Only
            </span>
          </label>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Found <strong>{filteredCompanions.length}</strong> matching verified buddies
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

        {/* Floating Coral Paywall Modal Card when !hasActiveSub */}
        {!hasActiveSub && (
          <div style={{
            position: 'sticky',
            top: 20,
            zIndex: 30,
            maxWidth: 580,
            margin: '0 auto 28px auto',
            background: '#ffffff',
            borderRadius: 20,
            border: '1.5px solid #fecdd3',
            boxShadow: '0 20px 45px -10px rgba(225, 29, 72, 0.22), 0 0 0 1px rgba(244, 63, 94, 0.08)',
            padding: '28px 26px',
            textAlign: 'center',
            backdropFilter: 'blur(16px)'
          }}>
            {/* Header Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fff1f2',
              color: '#e11d48',
              border: '1px solid #fecdd3',
              padding: '5px 14px',
              borderRadius: 9999,
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 14
            }}>
              <Lock size={12} strokeWidth={2.5} />
              MEMBERS ONLY DIRECTORY
            </div>

            <h2 style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              lineHeight: 1.3,
              marginBottom: 10
            }}>
              Unlock 14,200+ Verified Companions Across India
            </h2>

            <p style={{
              color: '#64748b',
              fontSize: '0.9rem',
              lineHeight: 1.55,
              maxWidth: 460,
              margin: '0 auto 18px auto'
            }}>
              Browsing unblurred companion dossiers, rates, photos, and initiating 1-on-1 conversations requires an active Membership Pass.
            </p>

            {/* 3 Value Points */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              textAlign: 'left',
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.84rem', color: '#334155', fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#e11d48" style={{ flexShrink: 0 }} />
                <span>Full unblurred companion portfolios, social links & hourly rates</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.84rem', color: '#334155', fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#e11d48" style={{ flexShrink: 0 }} />
                <span>Direct 1-on-1 private messaging with verified buddies</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.84rem', color: '#334155', fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#e11d48" style={{ flexShrink: 0 }} />
                <span>Safety Handshake PIN & bank-grade Aadhaar verification</span>
              </div>
            </div>

            {/* Social proof avatar stack */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ display: 'flex', marginLeft: 8 }}>
                {['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces'
                ].map((src, i) => (
                  <img key={i} src={src} alt="Companion" style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ffffff',
                    marginLeft: -8
                  }} />
                ))}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                4.92 ★ Average Rating from 48,500+ Verified Hangouts
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={onOpenSubscribe}
                style={{
                  background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '13px 24px',
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px -4px rgba(225, 29, 72, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Award size={18} />
                <span>Unlock Membership Pass (from ₹9)</span>
              </button>

              {onUnlockSubscription && (
                <button
                  type="button"
                  onClick={() => onUnlockSubscription('pass_1day')}
                  style={{
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '10px 18px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                  <span>⚡ 1-Click Demo Unlock (FREEPASS)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Grid of Companions (Blurred when !hasActiveSub) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
          filter: !hasActiveSub ? 'blur(7px)' : 'none',
          opacity: !hasActiveSub ? 0.38 : 1,
          pointerEvents: !hasActiveSub ? 'none' : 'auto',
          userSelect: !hasActiveSub ? 'none' : 'auto',
          transition: 'all 0.3s ease'
        }}>
        {filteredCompanions.map(comp => (
          <div 
            key={comp.id}
            className="glass-panel"
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-accent)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Top Image Banner */}
            <div style={{ position: 'relative', height: 230, width: '100%' }}>
              <img 
                src={comp.avatar} 
                alt={comp.name}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(6, 78, 59, 0.9)',
                    backdropFilter: 'blur(6px)',
                    color: '#a7f3d0',
                    border: '1px solid rgba(167, 243, 208, 0.4)',
                    cursor: 'pointer'
                  }}
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
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.72rem',
                color: comp.isOnline ? 'var(--color-emerald)' : 'var(--text-muted)',
                fontWeight: 600
              }}>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: comp.isOnline ? 'var(--color-emerald)' : 'var(--text-dim)',
                  display: 'inline-block'
                }} />
                {comp.isOnline ? 'Online now' : 'Offline'}
              </div>

              {/* Rates Tag */}
              <div style={{
                position: 'absolute',
                bottom: 12,
                right: 14,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-md)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 4
              }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                  ₹{comp.hourlyRate}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/ hour</span>
              </div>
            </div>

            {/* Profile Content */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{comp.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-gold)', fontSize: '0.88rem', fontWeight: 700 }}>
                  <Star size={15} fill="var(--color-gold)" />
                  <span>{comp.rating}</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.78rem' }}>
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

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenHallmark) onOpenHallmark(comp);
                  }}
                  className="btn-secondary"
                  style={{
                    flex: '0 0 auto',
                    padding: '11px 14px',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  title="Audit Hallmark Trust Credentials"
                >
                  <Award size={15} color="#059669" />
                  <span>Hallmark</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!hasActiveSub) {
                      onOpenSubscribe();
                    } else {
                      onStartChatWithCompanion(comp);
                    }
                  }}
                  className="btn-primary"
                  style={{ flex: 1, padding: '11px', fontSize: '0.92rem' }}
                >
                  <MessageSquare size={16} />
                  Connect & Chat
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
