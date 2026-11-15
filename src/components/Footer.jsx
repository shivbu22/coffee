import React from 'react';
import BrandLogo from './BrandLogo';
import { 
  ShieldCheck, 
  Lock, 
  Heart, 
  ArrowRight,
  ChevronRight,
  CheckCircle2, 
  Sparkles,
  MapPin,
  Building2,
  Mail,
  Shield,
  Radio
} from 'lucide-react';
import { CITIES } from '../data/mockData';

export default function Footer({ 
  setActiveTab, 
  setCityFilter,
  onOpenAdminPortal, 
  onOpenSubscribe, 
  onOpenPostRequest,
  onOpenAuth,
  onOpenLegal
}) {
  const activeMetros = CITIES.slice(1, 9); // Bengaluru, Mumbai, Delhi NCR, Pune, Hyderabad, Goa, Kolkata, Chennai

  const handleCityClick = (city) => {
    if (setCityFilter) setCityFilter(city);
    setActiveTab('discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      position: 'relative',
      background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card-hover) 35%, var(--bg-elevated) 100%)',
      borderTop: '1px solid var(--border-subtle)',
      color: 'var(--text-secondary)',
      fontSize: '0.86rem',
      overflow: 'hidden'
    }}>
      {/* Top Gradient Highlight Accent Line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent 0%, rgba(250, 110, 94, 0.45) 25%, rgba(248, 168, 78, 0.45) 50%, rgba(56, 178, 156, 0.45) 75%, transparent 100%)'
      }} />

      {/* 1. TOP TRUST & SAFETY ASSURANCE RIBBON */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '36px 24px 28px 24px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18
        }}>
          {/* Card 1: ID Verification */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            padding: '16px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--color-emerald-bg)',
              color: 'var(--color-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: 3 }}>
                100% ID & Aadhaar Verified
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Every companion completes government photo ID and biometric enclave verification before their first booking.
              </div>
            </div>
          </div>

          {/* Card 2: Handshake Escrow */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            padding: '16px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--color-primary-bg)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Lock size={19} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: 3 }}>
                Dual-Handshake Escrow
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Payment stays protected in secure escrow until you meet in person and mutually verify your 4-digit PIN.
              </div>
            </div>
          </div>

          {/* Card 3: Platonic Code */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            padding: '16px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--color-peach-bg)',
              color: 'var(--color-peach)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Heart size={19} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: 3 }}>
                Strict Platonic Code
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                FindCo is exclusively for social and activity companionship. Zero tolerance for solicitation, with 24/7 support.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 4-COLUMN FOOTER GRID */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '48px 24px 36px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 36
      }}>
        
        {/* Column 1: Brand & Community Overview */}
        <div style={{ gridColumn: 'span 1' }}>
          <div style={{ marginBottom: 14 }}>
            <BrandLogo 
              variant="full" 
              size="md" 
              showTagline={true}
              onClick={() => handleNavClick('landing')} 
            />
          </div>

          <p style={{ fontSize: '0.84rem', lineHeight: 1.65, color: 'var(--text-muted)', marginBottom: 18 }}>
            India’s dedicated social companionship and co-activity hiring network. Connect with vetted, Aadhaar-verified local buddies for dining, movies, fitness, and city exploration.
          </p>
        </div>

        {/* Column 2: Explore Platform */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-primary)'
            }}>
              Explore Platform
            </span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <li>
              <button 
                type="button" 
                onClick={() => handleNavClick('feed')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  padding: 0,
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-main)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span>Activity Requests Feed</span>
                <span style={{
                  fontSize: '0.62rem',
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: 'var(--color-primary-bg)',
                  color: 'var(--color-primary)',
                  fontWeight: 800
                }}>
                  LIVE
                </span>
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => handleNavClick('discover')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 500,
                  padding: 0,
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Discover Companions
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => handleNavClick('chats')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 500,
                  padding: 0,
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Messages & Booking Quotes
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={onOpenPostRequest}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 500,
                  padding: 0,
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Post Activity Request
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={onOpenSubscribe}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 500,
                  padding: 0,
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span>Membership Plans</span>
                <span style={{
                  fontSize: '0.62rem',
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: 'var(--color-emerald-bg)',
                  color: 'var(--color-emerald)',
                  fontWeight: 800
                }}>
                  From ₹50/mo
                </span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: For Companions & Buddies */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-peach)'
            }}>
              For Companions
            </span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <li>
              <button 
                type="button" 
                onClick={() => isLoggedIn ? handleNavClick('profile') : (onOpenAuth ? onOpenAuth('buddy') : handleNavClick('profile'))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  padding: 0,
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-main)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Become a Companion Studio
              </button>
            </li>
            <li>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} color="var(--color-emerald)" />
                <span>Earn ₹300 – ₹2,000 / hr</span>
              </span>
            </li>
            <li>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} color="var(--color-emerald)" />
                <span>0% Commission on Client Payouts</span>
              </span>
            </li>
            <li>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} color="var(--color-emerald)" />
                <span>Direct UPI & Same-Day Settlements</span>
              </span>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => handleNavClick('help')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  padding: 0,
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Companion Safety & Verification Guide
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Trust, Safety & Grievance */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-mint)'
            }}>
              Trust & Safety
            </span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
              <Lock size={14} color="var(--color-primary)" />
              <span style={{ color: 'var(--text-secondary)' }}>AES-256 Identity Enclave</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
              <Heart size={14} color="var(--color-rose)" />
              <span style={{ color: 'var(--text-secondary)' }}>Strict Platonic Code of Conduct</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
              <ShieldCheck size={14} color="var(--color-emerald)" />
              <span style={{ color: 'var(--text-secondary)' }}>Real-Time Safety & Escrow Lock</span>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNavClick('help')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-main)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span>Help Center & Escrow FAQ</span>
                <span style={{
                  fontSize: '0.62rem',
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: 'var(--color-primary-bg)',
                  color: 'var(--color-primary)',
                  fontWeight: 800
                }}>
                  FAQ
                </span>
              </button>
            </li>
            <li style={{ marginTop: 4 }}>
              <a 
                href="mailto:safety@findco.in" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--color-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <Mail size={13} />
                <span>safety@findco.in (24/7 Helpline)</span>
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* 3. ACTIVE INDIAN METRO CORRIDORS DIRECTORY */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '16px 24px 24px 24px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          marginRight: 4
        }}>
          <MapPin size={13} color="var(--color-primary)" />
          <span>Active Metros:</span>
        </div>

        {activeMetros.map(city => (
          <button
            key={city}
            type="button"
            onClick={() => handleCityClick(city)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 11px',
              fontSize: '0.76rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.color = 'var(--color-primary-text)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {city}
          </button>
        ))}
      </div>

      {/* 4. SUB-FOOTER LEGAL, COPYRIGHT & STAFF PORTAL */}
      <div style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '22px 24px 44px 24px' // Generous bottom spacing for mobile & floating beacon
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          // Extra right padding on wide screens so floating beacon never overlaps the staff link
          paddingRight: 'min(180px, 15vw)'
        }}>
          {/* Left: Registered Corporate Details */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
              © {new Date().getFullYear()} FindCo Technologies Private Limited. All rights reserved.
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Registered in Bengaluru, Karnataka · DPDP Act 2023 Compliant Platform
            </div>
          </div>

          {/* Right: Clean Legal Navigation + Staff Access */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            <button
              type="button"
              onClick={() => onOpenLegal ? onOpenLegal('terms') : handleNavClick('landing')}
              style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontSize: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              Terms of Service
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onOpenLegal ? onOpenLegal('privacy') : handleNavClick('landing')}
              style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontSize: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onOpenLegal ? onOpenLegal('dpdp') : handleNavClick('landing')}
              style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontSize: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              Grievance Redressal
            </button>
            
            {/* Staff & Security Portal Button */}
            <button
              type="button"
              onClick={onOpenAdminPortal}
              title="Staff & Cloud Administration Console"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--color-primary-text)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Lock size={12} color="var(--color-primary)" />
              <span>Staff & Security Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
