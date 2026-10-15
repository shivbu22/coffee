import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  AlertCircle 
} from 'lucide-react';
import { CATEGORIES, CITIES } from '../data/mockData';

const getInitialActivityValues = (initialActivity) => {
  if (!initialActivity) {
    return {
      category: CATEGORIES[0]?.name || 'Cafe Buddy',
      title: '',
      description: '',
      budget: '500'
    };
  }
  let cat = CATEGORIES[0]?.name || 'Cafe Buddy';
  let bud = '500';
  if (initialActivity.badge === 'Fitness' || initialActivity.title?.toLowerCase().includes('strength')) {
    cat = 'Fitness Buddy';
    bud = '700';
  } else if (initialActivity.title?.toLowerCase().includes('coffee') || initialActivity.badge === 'Popular') {
    cat = 'Cafe Buddy';
    bud = '500';
  } else if (initialActivity.title?.toLowerCase().includes('photography') || initialActivity.badge === 'Cultural') {
    cat = 'Photography Buddy';
    bud = '800';
  } else if (initialActivity.title?.toLowerCase().includes('gig') || initialActivity.badge === 'Social') {
    cat = 'Nightout Buddy';
    bud = '1000';
  }
  const desc = initialActivity.desc
    ? (initialActivity.desc.length >= 100
        ? initialActivity.desc
        : `${initialActivity.desc}. Looking for a verified, polite companion to join me for this session. Safe public meet-up in Bengaluru.`)
    : '';

  return {
    category: cat,
    title: initialActivity.title || '',
    description: desc,
    budget: bud
  };
};

export default function PostRequestModal({ 
  isOpen, 
  onClose, 
  onSubmitRequest, 
  role, 
  onShowToast,
  initialActivity = null
}) {
  const initialVals = getInitialActivityValues(initialActivity);
  const [category, setCategory] = useState(initialVals.category);
  const [title, setTitle] = useState(initialVals.title);
  const [description, setDescription] = useState(initialVals.description);
  const [budget, setBudget] = useState(initialVals.budget);
  const [billingType, setBillingType] = useState('hourly');
  const [city, setCity] = useState('Bengaluru');
  const [postedAs, setPostedAs] = useState(role === 'buddy' ? 'buddy' : 'client');
  const [errors, setErrors] = useState({});

  // Accessibility: Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!title.trim() || title.trim().length < 10) {
      errs.title = 'Title must be at least 10 characters long.';
    }
    if (!description.trim() || description.trim().length < 100) {
      errs.description = `Description must be at least 100 characters (${description.trim().length}/100). Please provide clear activity details.`;
    }
    if (title.trim().toLowerCase() === description.trim().toLowerCase()) {
      errs.description = 'Description cannot be identical to the title.';
    }
    if (!budget || isNaN(budget) || Number(budget) <= 0) {
      errs.budget = 'Please enter a valid budget amount.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newReq = {
      id: `req_${Date.now()}`,
      authorName: 'You (Current User)',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
      authorCity: city,
      postedAs: postedAs,
      serviceCategory: category,
      title: title.trim(),
      description: description.trim(),
      budget: Number(budget),
      billingType: billingType,
      timeAgo: 'Just now',
      upvotes: 1,
      isUpvoted: true,
      chatStatus: 'none',
      roomId: null
    };

    onSubmitRequest(newReq);
    onShowToast(postedAs === 'buddy' ? 'Your companion offer is now live on the feed!' : 'Request posted! Local buddies will reach out shortly.', 'success');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-request-modal-title"
        className="modal-box modal-enter" 
        style={{
          width: '100%',
          maxWidth: 580,
          padding: 30,
          border: '1px solid var(--border-accent)',
          background: 'var(--bg-card)',
          color: 'var(--text-main)'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal dialog"
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <h2 id="post-request-modal-title" style={{ fontSize: '1.45rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlusCircle size={22} color="var(--color-primary)" />
          Post a Plan or Activity Request
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          Share what you want to do and connect with trusted local companions.
        </p>

        <form onSubmit={handleSubmit}>
          
          {/* Post As Toggle */}
          <div style={{
            display: 'flex',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-subtle)',
            overflow: 'hidden',
            marginBottom: 18
          }}>
            <button
              type="button"
              onClick={() => setPostedAs('client')}
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: postedAs === 'client' ? 'var(--color-primary)' : 'var(--bg-card)',
                color: postedAs === 'client' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)'
              }}
            >
              I Need a Buddy (Client Request)
            </button>
            <button
              type="button"
              onClick={() => setPostedAs('buddy')}
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: postedAs === 'buddy' ? 'var(--color-rose)' : 'var(--bg-card)',
                color: postedAs === 'buddy' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)'
              }}
            >
              I Want to Be a Buddy (Companion Offer)
            </button>
          </div>

          {/* Activity Category */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="post-category" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
              Select Activity Type
            </label>
            <select
              id="post-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.88rem'
              }}
            >
              {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label htmlFor="post-title" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Request Title
              </label>
              <span style={{ fontSize: '0.72rem', color: title.length < 10 ? 'var(--color-rose)' : 'var(--text-muted)' }}>
                {title.length}/10 min chars
              </span>
            </div>
            <input 
              id="post-title"
              type="text"
              placeholder="e.g. Looking for a roadtrip companion for weekend drive to Nandi Hills"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'var(--bg-card)',
                border: `1px solid ${errors.title ? 'var(--color-rose)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.88rem'
              }}
            />
            {errors.title && (
              <div style={{ color: 'var(--color-rose)', fontSize: '0.74rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={12} /> {errors.title}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label htmlFor="post-description" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Detailed Description & Itinerary
              </label>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: description.length < 100 ? 'var(--color-rose)' : 'var(--color-emerald)'
              }}>
                {description.length}/100 min chars
              </span>
            </div>
            <textarea 
              id="post-description"
              rows={4}
              placeholder="Describe what you plan to do, preferred timing, meeting location, and what kind of companionship style you prefer. Keep it safe, public, and platonic."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-card)',
                border: `1px solid ${errors.description ? 'var(--color-rose)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.86rem',
                lineHeight: 1.5,
                resize: 'none'
              }}
            />
            {errors.description && (
              <div style={{ color: 'var(--color-rose)', fontSize: '0.74rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={12} /> {errors.description}
              </div>
            )}
          </div>

          {/* Budget & City Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
            <div>
              <label htmlFor="post-budget" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                Budget (INR)
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--color-gold)' }}>₹</span>
                  <input 
                    id="post-budget"
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 10px 10px 28px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      fontWeight: 700
                    }}
                  />
                </div>
                <select
                  id="post-billing"
                  aria-label="Billing frequency"
                  value={billingType}
                  onChange={e => setBillingType(e.target.value)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    padding: '0 8px',
                    fontSize: '0.78rem'
                  }}
                >
                  <option value="hourly">/ Hr</option>
                  <option value="trip">/ Trip</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="post-city" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                City
              </label>
              <select
                id="post-city"
                value={city}
                onChange={e => setCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem'
                }}
              >
                {CITIES.filter(c => c !== 'All Cities').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1.5 }}
            >
              Publish to Activity Feed
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
