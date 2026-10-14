import React from 'react';
import BrandLogo from './BrandLogo';
import { 
  ShieldCheck, 
  Compass, 
  Lock, 
  Heart, 
  HelpCircle, 
  FileText, 
  ExternalLink 
} from 'lucide-react';

export default function Footer({ 
  setActiveTab, 
  onOpenAdminPortal, 
  onOpenSubscribe, 
  onOpenPostRequest 
}) {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '50px 24px 30px 24px',
      color: 'var(--text-secondary)',
      fontSize: '0.86rem'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 36,
        marginBottom: 40
      }}>
        
        {/* Brand Column */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <BrandLogo 
              variant="full" 
              size="md" 
              showTagline={true}
              onClick={() => {
                setActiveTab('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
            />
          </div>

          <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: 16 }}>
            India’s dedicated social companionship and co-activity hiring network. Connect with vetted, Aadhaar-verified local buddies for dining, movies, fitness, and city exploration.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--color-emerald-bg)',
            color: 'var(--color-emerald)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            <ShieldCheck size={13} />
            <span>100% Platonic & Government ID Verified</span>
          </div>
        </div>

        {/* Consumer Navigation */}
        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
            Explore Platform
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('feed')}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
              >
                Activity Requests Feed
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('discover')}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
              >
                Discover Companions
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('chats')}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
              >
                Messages & Booking Quotes
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={onOpenPostRequest}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
              >
                Post Activity Request
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={onOpenSubscribe}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
              >
                Micro-Passes from ₹9 / Day
              </button>
            </li>
          </ul>
        </div>

        {/* For Companions */}
        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
            For Companions & Buddies
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('profile')}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
              >
                Companion Profile Studio
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('profile')}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
              >
                Aadhaar Verification Guide
              </button>
            </li>
            <li>
              <span style={{ color: 'var(--text-muted)' }}>
                Zero Commission on Client Payouts
              </span>
            </li>
            <li>
              <span style={{ color: 'var(--text-muted)' }}>
                Direct UPI & Bank Settlements
              </span>
            </li>
          </ul>
        </div>

        {/* Trust, Safety & Ethics */}
        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
            Trust, Safety & Security
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={13} color="var(--color-primary)" />
              <span>Isolated Identity Vault (AES-256)</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={13} color="var(--color-rose)" />
              <span>Strict Platonic Code of Conduct</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={13} color="var(--color-emerald)" />
              <span>AI Chat Solicitation Scanner</span>
            </li>
            <li>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Support & Grievance: safety@findco.in
              </span>
            </li>
          </ul>
        </div>

      </div>

      {/* Sub-Footer with Discreet Admin Portal Link */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        paddingTop: 24,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          © {new Date().getFullYear()} FindCo Technologies Private Limited. All rights reserved.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Grievance Redressal</span>
          
          {/* Protected Admin Portal Discrete Entry */}
          <button
            type="button"
            onClick={onOpenAdminPortal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--color-primary-text)';
              e.currentTarget.style.borderColor = 'var(--border-accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <Lock size={12} color="var(--color-primary)" />
            <span>Staff & Security Portal</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
