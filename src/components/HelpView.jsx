import React, { useState, useMemo } from 'react';
import { 
  Search, 
  HelpCircle, 
  ShieldCheck, 
  CreditCard, 
  Coffee, 
  Star, 
  Lock, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  Sparkles, 
  ExternalLink, 
  X,
  FileText,
  BadgeAlert,
  ArrowRight
} from 'lucide-react';

const FAQ_DATA = [
  {
    id: 'faq_1',
    category: 'escrow',
    categoryLabel: 'Escrow & Payments',
    question: 'How does the Handshake PIN and Escrow payment release work?',
    answer: 'When a booking is accepted, the client’s payment is placed into a secure escrow vault—not directly into the companion’s personal account. During the meetup, the client reveals a confidential 4-digit Handshake PIN to the companion. Once the companion enters this PIN in the app, the escrow verifies the physical meetup and immediately releases the funds to the companion’s payout balance.'
  },
  {
    id: 'faq_2',
    category: 'safety',
    categoryLabel: 'Safety & Trust',
    question: 'Are companions on FindCo background checked and verified?',
    answer: 'Yes! Every companion must complete mandatory government identity verification via our encrypted Aadhaar Identity Vault. Our operations compliance team manually verifies the government ID against the companion’s profile details before awarding the green Aadhaar Verified Shield. Companions who maintain a perfect safety record also earn the Hallmark Trust Provenance badge.'
  },
  {
    id: 'faq_3',
    category: 'safety',
    categoryLabel: 'Safety & Trust',
    question: 'What are FindCo’s mandatory safety rules for meetups?',
    answer: 'All meetups MUST take place in public, well-lit venues such as reputable cafes, restaurants, shopping malls, fitness centers, or public events. Private residential spaces and secluded locations are strictly prohibited by our Community Guidelines. If a partner suggests an unverified private location, decline and report it immediately via the in-app safety tools.'
  },
  {
    id: 'faq_4',
    category: 'escrow',
    categoryLabel: 'Escrow & Payments',
    question: 'What happens if a companion or client cancels a booked hangout?',
    answer: 'If a companion cancels at any time, 100% of the locked escrow funds are instantly refunded to the client’s original payment method or FindCo balance. If a client cancels more than 4 hours before the scheduled time, a full refund is issued. Cancellations within 2 hours of the start time may incur a nominal 15% cancellation fee to compensate the companion for their reserved time.'
  },
  {
    id: 'faq_5',
    category: 'booking',
    categoryLabel: 'Bookings & Etiquette',
    question: 'How do I post an activity request or find a companion for an event?',
    answer: 'You can either browse the companion feed to find individuals in your city or tap "Post Request" to publish an activity request (e.g. coffee hangout, gym buddy, exhibition companion). Local verified companions will view your request and submit counter-proposals or accept directly. You can review their profiles and ratings before locking the booking.'
  },
  {
    id: 'faq_6',
    category: 'companion',
    categoryLabel: 'Companion Studio',
    question: 'How do companions set their hourly rates and receive payouts?',
    answer: 'Companions have complete autonomy to set their own hourly rates (typically ₹400 to ₹1,500/hr based on expertise and companionship category). Once a client enters the Handshake PIN, funds appear in your Companion Studio earnings. Payouts can be transferred directly to your verified bank account or UPI ID on a weekly or on-demand instant cycle.'
  },
  {
    id: 'faq_7',
    category: 'booking',
    categoryLabel: 'Bookings & Etiquette',
    question: 'Can I extend a hangout session if we are having a great conversation?',
    answer: 'Yes! Both parties can agree to extend the hangout in real-time from the active meetup card. The client selects the additional duration (e.g. +30 mins, +1 hr), authorizes the incremental escrow amount, and the session timer updates automatically for both users.'
  },
  {
    id: 'faq_8',
    category: 'escrow',
    categoryLabel: 'Escrow & Payments',
    question: 'What should I do if there is a dispute or if someone didn’t show up?',
    answer: 'Never share your 4-digit Handshake PIN if the other party fails to appear or leaves early. Without the PIN, the companion cannot claim the escrow funds. Simply tap "Report No-Show" or "Open Dispute" in the chat screen. Our human trust and safety arbitrators review timestamps, chat logs, and GPS check-ins to resolve disputes within 2 hours.'
  },
  {
    id: 'faq_9',
    category: 'safety',
    categoryLabel: 'Safety & Trust',
    question: 'How is my private information and Aadhaar data protected?',
    answer: 'FindCo operates on an isolated UIDAI Enclave model. We never store raw government biometric data, and full Aadhaar numbers are salted and encrypted under AES-256 HSM storage. Only the masked digits (XXXX-XXXX-1234) and verification status are visible to our vetted trust officers.'
  },
  {
    id: 'faq_10',
    category: 'companion',
    categoryLabel: 'Companion Studio',
    question: 'How can companions increase their profile visibility and bookings?',
    answer: 'Maintaining a prompt response time, obtaining positive verified reviews, adding high-quality photos, and maintaining an active VIP Membership pass significantly boosts your discovery ranking. Active companions who complete 10+ hangouts with a 4.9+ rating receive automatic featured placement on the local city discovery grid.'
  }
];

const CATEGORIES = [
  {
    id: 'all',
    label: 'All Topics',
    icon: HelpCircle
  },
  {
    id: 'safety',
    label: 'Safety & Trust',
    icon: ShieldCheck
  },
  {
    id: 'escrow',
    label: 'Escrow & Payments',
    icon: CreditCard
  },
  {
    id: 'booking',
    label: 'Bookings & Meetups',
    icon: Coffee
  },
  {
    id: 'companion',
    label: 'Companion Studio',
    icon: Star
  }
];

export default function HelpView({
  onNavigateToTab,
  onOpenAntigravityAgent,
  onShowToast,
  currentUser,
  role = 'client'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState('faq_1'); // first one expanded by default
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Ticket Form States
  const [ticketCategory, setTicketCategory] = useState('escrow');
  const [ticketPriority, setTicketPriority] = useState('normal');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(null);
  const [userTickets, setUserTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('findco_support_tickets_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Filter FAQs based on category & search query
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.categoryLabel.toLowerCase().includes(query)
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleToggleFaq = (id) => {
    setOpenFaqId(prev => prev === id ? null : id);
  };

  const handleQuickTagClick = (tag) => {
    setSearchQuery(tag);
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (isSubmittingTicket) return;
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      if (onShowToast) onShowToast('Please provide both a subject and details for your request.', 'error');
      return;
    }

    setIsSubmittingTicket(true);
    setTimeout(() => {
      const ticketId = `FND-${Math.floor(10000 + Math.random() * 90000)}`;
      const newTicket = {
        id: ticketId,
        subject: ticketSubject.trim(),
        message: ticketMessage.trim(),
        category: ticketCategory,
        priority: ticketPriority,
        status: 'Active Investigation',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      };

      setUserTickets(prev => {
        const updated = [newTicket, ...prev];
        try {
          localStorage.setItem('findco_support_tickets_v1', JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });

      setIsSubmittingTicket(false);
      setTicketSubmitted(newTicket);
      if (onShowToast) {
        onShowToast(`Support Ticket #${ticketId} registered & saved! Operations notified.`, 'success');
      }
      setTicketSubject('');
      setTicketMessage('');
    }, 700);
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '16px 20px 80px 20px' }}>
      
      {/* 1. HERO HEADER WITH SEARCH */}
      <section style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 50%, #fff1ef 100%)',
        borderRadius: 24,
        padding: '36px 32px 32px 32px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow element */}
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250, 110, 94, 0.15) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 640 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--color-primary-bg)',
            color: 'var(--color-primary-text)',
            padding: '4px 12px',
            borderRadius: 9999,
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: 12,
            letterSpacing: '0.02em'
          }}>
            <Sparkles size={13} color="var(--color-primary)" />
            <span>FindCo Help & Concierge Center</span>
          </div>

          <h1 style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            margin: '0 0 10px 0',
            color: 'var(--text-main)',
            letterSpacing: '-0.025em',
            fontFamily: 'var(--font-heading, "Outfit", sans-serif)'
          }}>
            How can we help you today?
          </h1>

          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-secondary)',
            margin: '0 0 24px 0',
            lineHeight: 1.55
          }}>
            Explore verified guides for public meetups, 4-digit Handshake PIN escrow release, companion trust audits, and live support.
          </p>

          {/* Search Box */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
            padding: '4px 8px 4px 14px'
          }}>
            <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginRight: 10 }} />
            <input
              type="text"
              placeholder="Search for Handshake PIN, refunds, Aadhaar verification, rates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 0',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                fontFamily: 'inherit'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 6,
                  color: 'var(--text-muted)'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick Search Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick tags:</span>
            {['Handshake PIN', 'Safety Rules', 'Refunds', 'Aadhaar Verification', 'Companion Rates'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickTagClick(tag)}
                style={{
                  background: searchQuery === tag ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.8)',
                  color: searchQuery === tag ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 9999,
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. 4 PILLARS BENTO CARDS */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          margin: '0 0 16px 0',
          color: 'var(--text-main)',
          letterSpacing: '-0.02em'
        }}>
          Knowledge Topics & Guides
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16
        }}>
          {/* Card 1: Safety & Verification */}
          <div 
            onClick={() => {
              setSelectedCategory('safety');
              setSearchQuery('');
            }}
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: 16,
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = 'var(--color-mint)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--color-mint-bg)',
              color: 'var(--color-mint-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14
            }}>
              <ShieldCheck size={20} color="var(--color-mint)" />
            </div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
              Safety & Verification
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Aadhaar biometric audit rules, public venue policy, and emergency safety features.
            </p>
          </div>

          {/* Card 2: Escrow & Handshake PIN */}
          <div 
            onClick={() => {
              setSelectedCategory('escrow');
              setSearchQuery('');
            }}
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: 16,
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--color-primary-bg)',
              color: 'var(--color-primary-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14
            }}>
              <CreditCard size={20} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
              Escrow & Payments
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              How 4-digit PIN releases vault funds, 100% refund guarantee, and payment dispute handling.
            </p>
          </div>

          {/* Card 3: Bookings & Meetups */}
          <div 
            onClick={() => {
              setSelectedCategory('booking');
              setSearchQuery('');
            }}
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: 16,
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = 'var(--color-peach)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--color-peach-bg)',
              color: 'var(--color-peach-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14
            }}>
              <Coffee size={20} color="var(--color-peach)" />
            </div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
              Bookings & Hangouts
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Posting requests, accepting counter-quotes, chat guidelines, and session extensions.
            </p>
          </div>

          {/* Card 4: Companion Studio */}
          <div 
            onClick={() => {
              setSelectedCategory('companion');
              setSearchQuery('');
            }}
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: 16,
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = 'var(--color-sky)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--color-sky-bg)',
              color: 'var(--color-sky-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14
            }}>
              <Star size={20} color="var(--color-sky)" />
            </div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
              Companion Studio
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Setting hourly rates, fast bank/UPI payouts, discovery rank boosts, and badge perks.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SAFETY MANDATE NOTICE BANNER */}
      <section style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 16,
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 36
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldCheck size={22} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534', marginBottom: 2 }}>
              100% Public Venue Policy & Escrow Guarantee
            </div>
            <div style={{ fontSize: '0.8rem', color: '#15803d', lineHeight: 1.4 }}>
              Never exchange payment outside the app or meet in private venues. Our Trust & Safety hotline is active 24/7.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onOpenAntigravityAgent) {
              onOpenAntigravityAgent();
            } else {
              setSearchQuery('Safety Rules');
            }
          }}
          style={{
            background: '#16a34a',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 9999,
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>Safety Protocols</span>
          <ArrowRight size={13} />
        </button>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      <section style={{ marginBottom: 40 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16
        }}>
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              margin: '0 0 4px 0',
              color: 'var(--text-main)',
              letterSpacing: '-0.02em'
            }}>
              Frequently Answered Questions
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Showing {filteredFaqs.length} help articles {searchQuery ? `matching "${searchQuery}"` : ''}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 12px',
                    borderRadius: 9999,
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? 'var(--text-main)' : 'var(--bg-elevated)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Icon size={12} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredFaqs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#ffffff',
              borderRadius: 16,
              border: '1px dashed var(--border-subtle)'
            }}>
              <HelpCircle size={36} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.6 }} />
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.94rem', marginBottom: 4 }}>
                No matching articles found
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                Try searching with different keywords or ask our 24/7 AI Concierge.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn-secondary"
                style={{ padding: '6px 16px', fontSize: '0.8rem', borderRadius: 9999 }}
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            filteredFaqs.map(faq => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 14,
                    border: isOpen ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                    boxShadow: isOpen ? '0 4px 12px rgba(250, 110, 94, 0.08)' : 'var(--shadow-sm)',
                    overflow: 'hidden',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleFaq(faq.id)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      gap: 16
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em'
                      }}>
                        {faq.categoryLabel}
                      </span>
                      <span style={{
                        fontSize: '0.92rem',
                        fontWeight: isOpen ? 700 : 600,
                        color: 'var(--text-main)',
                        lineHeight: 1.4
                      }}>
                        {faq.question}
                      </span>
                    </div>

                    <div style={{ color: isOpen ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{
                      padding: '0 20px 18px 20px',
                      fontSize: '0.86rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      borderTop: '1px solid #f8fafc'
                    }}>
                      <p style={{ margin: '8px 0 0 0' }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 5. CONTACT SUPPORT & LIVE ASSISTANCE CARDS */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
        {/* Support Card 1: 24/7 AI Concierge */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 20,
          padding: '26px 24px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '3px 10px',
            borderRadius: 9999,
            fontSize: '0.72rem',
            fontWeight: 700,
            marginBottom: 12
          }}>
            <Sparkles size={12} color="#f8a84e" />
            <span>AI Powered Concierge</span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0' }}>
            Instant Help with Antigravity AI
          </h3>

          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 20px 0', lineHeight: 1.5 }}>
            Ask anything about companion availability, escrow calculations, or booking etiquette. Instant answers in natural conversation.
          </p>

          <button
            type="button"
            onClick={onOpenAntigravityAgent}
            style={{
              background: '#fa6e5e',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              padding: '10px 18px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'var(--transition-fast)'
            }}
          >
            <MessageSquare size={16} />
            <span>Launch AI Concierge</span>
          </button>
        </div>

        {/* Support Card 2: Operations Support Desk */}
        <div style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '26px 24px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--color-mint-bg)',
            color: 'var(--color-mint-text)',
            padding: '3px 10px',
            borderRadius: 9999,
            fontSize: '0.72rem',
            fontWeight: 700,
            marginBottom: 12
          }}>
            <Clock size={12} color="var(--color-mint)" />
            <span>Response &lt; 2 Hours</span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
            Operations & Dispute Desk
          </h3>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
            Need human arbitration on an escrow booking, verification audit, or payment discrepancy? Submit an official ticket.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsTicketModalOpen(true)}
              className="btn-primary"
              style={{
                borderRadius: 12,
                padding: '10px 18px',
                fontSize: '0.84rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Send size={15} />
              <span>Submit Support Ticket</span>
            </button>

            <a
              href="mailto:support@findco.in"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                borderRadius: 12,
                background: 'var(--bg-elevated)',
                color: 'var(--text-main)',
                fontSize: '0.84rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <Mail size={15} />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </section>

      {/* 6. SUBMIT TICKET MODAL */}
      {isTicketModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 520,
            width: '100%',
            padding: '28px 28px 24px 28px',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-subtle)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsTicketModalOpen(false);
                setTicketSubmitted(null);
              }}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 4
              }}
            >
              <X size={18} />
            </button>

            {ticketSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                  Support Ticket Submitted!
                </h3>
                <div style={{
                  display: 'inline-block',
                  background: 'var(--bg-elevated)',
                  padding: '4px 12px',
                  borderRadius: 8,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-text)',
                  marginBottom: 16
                }}>
                  Tracking ID: {ticketSubmitted.id}
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                  Our operations officer will review your request under ticket reference <strong>{ticketSubmitted.id}</strong>. A response will be dispatched to your registered email and in-app notifications.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsTicketModalOpen(false);
                    setTicketSubmitted(null);
                  }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', borderRadius: 12, fontWeight: 700 }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--color-primary-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={18} color="var(--color-primary)" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Open Support Request
                  </h3>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
                  Please describe your issue so our trust & escrow team can resolve it swiftly.
                </p>

                <form onSubmit={handleSubmitTicket}>
                  {/* Category Selection */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                      Issue Category
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={e => setTicketCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.86rem',
                        color: 'var(--text-main)',
                        outline: 'none',
                        background: '#ffffff'
                      }}
                    >
                      <option value="escrow">Escrow Payment & Handshake PIN</option>
                      <option value="safety">Trust, Safety & Companion Behavior</option>
                      <option value="kyc">Aadhaar Verification & KYC Status</option>
                      <option value="booking">Booking Cancellation & Rescheduling</option>
                      <option value="technical">Account & Technical Bug</option>
                    </select>
                  </div>

                  {/* Priority Toggle */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                      Priority Level
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['normal', 'high', 'urgent'].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setTicketPriority(lvl)}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: ticketPriority === lvl ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                            background: ticketPriority === lvl ? 'var(--color-primary-bg)' : '#ffffff',
                            color: ticketPriority === lvl ? 'var(--color-primary-text)' : 'var(--text-secondary)',
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            textTransform: 'capitalize',
                            cursor: 'pointer'
                          }}
                        >
                          {lvl === 'urgent' ? '🚨 Urgent' : lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Brief summary (e.g., Handshake PIN rejected at cafe)"
                      value={ticketSubject}
                      onChange={e => setTicketSubject(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.86rem',
                        color: 'var(--text-main)',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Message Details */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                      Details & Timeline
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Please include venue name, partner name, and any relevant details..."
                      value={ticketMessage}
                      onChange={e => setTicketMessage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.86rem',
                        color: 'var(--text-main)',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setIsTicketModalOpen(false)}
                      style={{
                        flex: 1,
                        padding: '11px',
                        borderRadius: 10,
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingTicket}
                      className="btn-primary"
                      style={{
                        flex: 2,
                        padding: '11px',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: isSubmittingTicket ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isSubmittingTicket ? 'Submitting Request...' : 'Send to Support Desk'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
