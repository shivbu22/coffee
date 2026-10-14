import React, { useState } from 'react';
import BrandLogo from './BrandLogo';
import { 
  Compass, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Coffee, 
  Dumbbell, 
  Moon, 
  Film, 
  ShoppingBag, 
  Laptop, 
  CheckCircle2, 
  Heart, 
  Users, 
  Lock, 
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  Camera,
  Flame,
  Briefcase,
  Car,
  Bot,
  Fingerprint,
  Zap,
  Cpu
} from 'lucide-react';
import { CATEGORIES, CITIES, INITIAL_COMPANIONS, PLATFORM_STATS, TESTIMONIALS } from '../data/mockData';
import CozyCarouselSlider from './watermelon/CozyCarouselSlider';
import CozyActivitiesCard from './watermelon/CozyActivitiesCard';

export default function LandingPage({ 
  setActiveTab, 
  setCityFilter, 
  onOpenSubscribe, 
  onOpenPostRequest,
  onOpenAuth,
  isLoggedIn = false,
  onOpenAntigravityAgent,
  onOpenHallmark
}) {
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [stepperMode, setStepperMode] = useState('client'); // 'client' | 'buddy'

  const iconMap = {
    Coffee: Coffee,
    Compass: Compass,
    Dumbbell: Dumbbell,
    Moon: Moon,
    Film: Film,
    MapPin: MapPin,
    ShoppingBag: ShoppingBag,
    Laptop: Laptop,
    Sparkles: Sparkles,
    Camera: Camera,
    Flame: Flame,
    Briefcase: Briefcase,
    Users: Users,
    Car: Car
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '50px 20px 70px 20px',
        overflow: 'hidden',
        background: 'var(--bg-dark)'
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', textAlign: 'center' }}>
          
          {/* Live Activity & Presence Ticker */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: 20
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--color-emerald, #059669)',
              boxShadow: '0 0 8px rgba(5, 150, 105, 0.6)',
              animation: 'pulse 1.8s infinite'
            }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }} className="tabular-nums">
              {PLATFORM_STATS.onlineBuddies.toLocaleString('en-IN')}+ Buddies Online Right Now
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>• India’s #1 Platform</span>
          </div>

          {/* Main Hero Headline */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.4rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.035em',
            marginBottom: 16,
            fontWeight: 800,
            color: 'var(--text-main)',
            maxWidth: 920,
            margin: '0 auto 16px auto'
          }}>
            Hire a Buddy or Become One.
          </h1>

          <div style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            fontWeight: 700,
            color: 'var(--color-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 18
          }}>
            Find your people. Hire for your plans. Make it happen.
          </div>

          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            color: 'var(--text-secondary)',
            maxWidth: 780,
            margin: '0 auto 34px auto',
            lineHeight: 1.65
          }}>
            India’s dedicated social companion platform to find, hire, or connect with verified companions for every plan. From cafés and concerts to road trips and fitness. FindCo makes social experiences effortless, while giving companions the opportunity to earn up to <strong>₹2,000/hr</strong> along the way.
          </p>

          {/* Dual Action CTAs + Antigravity AI Concierge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="btn-primary"
                  style={{ padding: '13px 32px', fontSize: '1rem', fontWeight: 700 }}
                >
                  Go to Member Dashboard
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('feed')}
                  className="btn-secondary"
                  style={{ padding: '13px 26px', fontSize: '1rem', fontWeight: 700 }}
                >
                  Browse Companion Feed
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAuth ? onOpenAuth('client') : setActiveTab('feed')}
                  className="btn-primary"
                  style={{ padding: '13px 30px', fontSize: '1rem', fontWeight: 700 }}
                >
                  Hire a Buddy
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth ? onOpenAuth('buddy') : setActiveTab('profile')}
                  className="btn-secondary"
                  style={{ padding: '13px 26px', fontSize: '1rem', fontWeight: 700, borderColor: 'var(--border-accent)' }}
                >
                  <TrendingUp size={17} color="var(--color-primary)" />
                  Become a Buddy — Earn ₹2,000/hr
                </button>
              </>
            )}
          </div>

          {/* Quick City Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            flexWrap: 'wrap',
            maxWidth: 900,
            margin: '0 auto'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: 4 }}>
              Active Metros:
            </span>
            {CITIES.slice(1, 9).map(city => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSelectedCity(city);
                  if (setCityFilter) setCityFilter(city);
                  setActiveTab('discover');
                }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '5px 13px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Social Proof Counter Bar */}
          <div style={{
            marginTop: 40,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 20,
            padding: '12px 26px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Users size={16} color="var(--color-primary)" />
              <strong style={{ color: 'var(--text-main)', fontSize: '0.86rem' }}>{PLATFORM_STATS.totalBuddies}</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Active Buddies</span>
            </div>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-subtle)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <TrendingUp size={16} color="var(--color-emerald)" />
              <strong style={{ color: 'var(--text-main)', fontSize: '0.86rem' }}>{PLATFORM_STATS.connectionsMade}</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Connections Made</span>
            </div>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-subtle)' }} />
            <div className="tabular-nums" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={15} fill="var(--color-gold)" color="var(--color-gold)" />
              <strong style={{ color: 'var(--text-main)', fontSize: '0.86rem' }}>{PLATFORM_STATS.trustRating}</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Trust Score</span>
            </div>
          </div>

        </div>
      </section>

      {/* Watermelon UI Cozy Interactive Showcase */}
      <section style={{
        padding: '30px 20px 60px 20px',
        maxWidth: 1140,
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: 8, fontWeight: 800, letterSpacing: '-0.025em' }}>
            Real Companions, Real Adventures
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', maxWidth: 620, margin: '0 auto' }}>
            Authentic moments from coffee trails to heritage walks. Explore verified buddy activities in your city.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 36,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Watermelon Cozy Polaroid Carousel */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CozyCarouselSlider onSelectCompanion={() => setActiveTab('discover')} />
          </div>

          {/* Watermelon Cozy Activities Expandable Card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CozyActivitiesCard onSelectPlan={() => setActiveTab('feed')} />
          </div>
        </div>
      </section>

      {/* 16 Activity Categories Grid (BuddySearch Full Categories) */}
      <section style={{ padding: '60px 20px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: 10, fontWeight: 800, letterSpacing: '-0.025em' }}>
            What kind of buddy are you looking for?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 640, margin: '0 auto' }}>
            16 social companionship categories tailored for plans, hobbies, and everyday outings. Transparent hourly rates.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 18
        }}>
          {CATEGORIES.map(cat => {
            const IconComp = iconMap[cat.icon] || Compass;
            return (
              <div
                key={cat.id}
                onClick={() => setActiveTab('discover')}
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  padding: '22px',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(245, 158, 11, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComp size={22} color="var(--color-primary)" />
                    </div>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)'
                    }} className="tabular-nums">
                      {cat.rate}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.08rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                    {cat.name}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                    {cat.desc}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <span className="tabular-nums">{cat.count} Buddies Available</span>
                  <ChevronRight size={15} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Verified Companions */}
      <section style={{
        padding: '60px 20px',
        background: 'var(--bg-elevated)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: 6, fontWeight: 800, letterSpacing: '-0.025em' }}>
                Meet Verified Buddies Near You
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Vetted companions ready for coffee trails, gym spots, movies, and city walks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('discover')}
              className="btn-secondary"
              style={{ fontSize: '0.88rem' }}
            >
              Browse All Buddies
              <ArrowRight size={16} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24
          }}>
            {INITIAL_COMPANIONS.slice(0, 3).map(comp => (
              <div 
                key={comp.id}
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ position: 'relative', height: 220 }}>
                  <img 
                    src={comp.avatar} 
                    alt={comp.name} 
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    display: 'flex',
                    gap: 6
                  }}>
                    {comp.isStar && (
                      <span className="badge-tag-gold" style={{ fontSize: '0.7rem' }}>
                        <Star size={12} color="var(--color-gold)" fill="var(--color-gold)" />
                        STAR MEMBER
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenHallmark) onOpenHallmark(comp);
                      }}
                      className="badge-tag-emerald"
                      style={{ fontSize: '0.7rem', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                      title="Inspect Hallmark Sovereign Credential & Enclave Verification"
                    >
                      <ShieldCheck size={12} />
                      HALLMARK VERIFIED
                    </button>
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 14,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
                    fontSize: '0.85rem'
                  }}>
                    ₹{comp.hourlyRate} <span style={{ fontSize: '0.7rem', fontWeight: 400 }}>/ hr</span>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <h3 style={{ fontSize: '1.25rem' }}>{comp.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-gold)', fontSize: '0.88rem', fontWeight: 700 }}>
                      <Star size={15} fill="var(--color-gold)" />
                      {comp.rating} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({comp.reviewsCount})</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    <MapPin size={13} color="var(--color-primary)" />
                    <span>{comp.city} • {comp.area}</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                    {comp.bio.slice(0, 110)}...
                  </p>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                    {comp.services.slice(0, 2).map(s => (
                      <span key={s} className="badge-tag-amber" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('chats')}
                      className="btn-primary"
                      style={{ flex: 1, padding: '10px', fontSize: '0.88rem' }}
                    >
                      Connect & Book
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenHallmark && onOpenHallmark(comp)}
                      className="btn-secondary"
                      style={{ 
                        padding: '10px 14px', 
                        fontSize: '0.82rem', 
                        borderColor: 'var(--color-emerald)', 
                        color: 'var(--color-emerald)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="Inspect Hallmark Trust Seal & Police Clearance"
                    >
                      <Fingerprint size={15} />
                      <span>Audit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Stepper (BuddySearch Dual Flow) */}
      <section style={{ padding: '80px 20px', maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.3rem', marginBottom: 12, fontWeight: 800, letterSpacing: '-0.025em' }}>
          How FindCo Works
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 600, margin: '0 auto 36px auto' }}>
          Whether you're hiring someone for an outing or looking to earn on your free time, the process is simple and safe.
        </p>

        {/* Dual Tab Switch */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-card)',
          padding: 4,
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 44
        }}>
          <button
            type="button"
            onClick={() => setStepperMode('client')}
            style={{
              padding: '9px 26px',
              borderRadius: 'var(--radius-full)',
              background: stepperMode === 'client' ? 'var(--color-primary)' : 'transparent',
              color: stepperMode === 'client' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            I Need a Buddy (Client)
          </button>
          <button
            type="button"
            onClick={() => setStepperMode('buddy')}
            style={{
              padding: '9px 26px',
              borderRadius: 'var(--radius-full)',
              background: stepperMode === 'buddy' ? 'var(--color-rose)' : 'transparent',
              color: stepperMode === 'buddy' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            I Want to Be a Buddy (Earn Money)
          </button>
        </div>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          textAlign: 'left'
        }}>
          {stepperMode === 'client' ? [
            { step: '01', title: 'Post Your Plan', desc: 'Choose from 16 categories, state your timing, venue, and proposed budget in under a minute.' },
            { step: '02', title: 'Get Matched', desc: 'Verified local companions apply with custom bids or browse nearby profiles sorted by distance.' },
            { step: '03', title: 'Chat & Confirm Quote', desc: 'Confirm terms in secure private chat. Safety Handshake PIN is generated automatically.' },
            { step: '04', title: 'Meet in Public & Enjoy', desc: 'Meet safely in public spots with escrow protection. Funds released only after verification.' }
          ].map(s => (
            <div key={s.step} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-heading)',
                marginBottom: 10
              }}>
                {s.step}
              </div>
              <h3 style={{ fontSize: '1.12rem', marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          )) : [
            { step: '01', title: 'Quick Aadhaar KYC', desc: 'Submit your ID to our encrypted Identity Vault. Rapid 2-hour manual audit guarantees trust.' },
            { step: '02', title: 'Set Services & Rates', desc: 'Pick your activity specialties and set your rates from ₹300 to ₹2,000/hr on your terms.' },
            { step: '03', title: 'Accept Requests Near You', desc: 'Submit counter-quotes on client feed requests or accept direct hangout invitations.' },
            { step: '04', title: 'Instant UPI Payouts', desc: 'Get paid directly to your bank account with zero commission under our Star Member plan.' }
          ].map(s => (
            <div key={s.step} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--color-rose)',
                fontFamily: 'var(--font-heading)',
                marginBottom: 10
              }}>
                {s.step}
              </div>
              <h3 style={{ fontSize: '1.12rem', marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Real Indian Member Stories (Testimonials) */}
      <section style={{
        padding: '70px 20px',
        background: 'var(--bg-elevated)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: 10, fontWeight: 800, letterSpacing: '-0.025em' }}>
              What Our Members Say
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem' }}>
              Over 200,000 real social connections made across Indian metros.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20
          }}>
            {TESTIMONIALS.map(t => (
              <div 
                key={t.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-gold)', marginBottom: 12 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="var(--color-gold)" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: 18, fontStyle: 'italic' }}>
                    "{t.text}"
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                  <img
                    src={t.avatar}
                    alt={t.name}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 'var(--radius-full)',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Identity Vault Section */}
      <section style={{
        padding: '70px 20px',
        background: 'var(--bg-dark)'
      }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.4rem', marginBottom: 16, fontWeight: 800, letterSpacing: '-0.025em' }}>
            Friendship-First with Bank-Grade Safety
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', maxWidth: 680, margin: '0 auto 40px auto' }}>
            We maintain India's strictest companionship vetting system to ensure zero harassment and genuine platonic experiences.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            textAlign: 'left'
          }}>
            <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
              <ShieldCheck size={32} color="var(--color-emerald)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>100% Aadhaar Verification</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Every buddy must submit government Aadhaar verification. Documents are stored in an encrypted administrative vault and never exposed publicly.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
              <Lock size={32} color="var(--color-primary)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Strict Platonic Policy</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Strict AI moderation scans chat channels for commercial or escort solicitation. Offenses result in immediate permanent account suspension.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
              <Award size={32} color="var(--color-sky)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>RBI-Compliant Escrow</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Meeting funds are held in secure escrow and released only after both parties verify their Dual-Handshake PIN at the hangout.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Pricing CTA Banner */}
      <section style={{ padding: '80px 20px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{
          borderRadius: 'var(--radius-lg)',
          padding: '48px 36px',
          textAlign: 'center',
          border: '1px solid var(--border-accent)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h2 style={{ fontSize: '2.4rem', marginBottom: 12 }}>
            Start Connecting with Companions from <span style={{ color: 'var(--color-primary)' }} className="tabular-nums">₹50 / Month</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 620, margin: '0 auto 28px auto', fontSize: '1rem', lineHeight: 1.6 }}>
            Transparent BuddySearch-inspired multi-month memberships and Lifetime Star passes. Unlock verified companion chat privileges, request hangouts, and explore together safely.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onOpenSubscribe}
              className="btn-primary"
              style={{ padding: '14px 34px', fontSize: '1.05rem' }}
            >
              <Award size={18} />
              Explore Membership Plans
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('feed')}
              className="btn-secondary"
              style={{ padding: '14px 28px', fontSize: '1.05rem' }}
            >
              Check Live Feed First
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
