import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Star, 
  Coins, 
  CheckCircle2, 
  ExternalLink, 
  Edit3, 
  Camera, 
  Save, 
  ArrowUpRight, 
  Clock, 
  Share2, 
  Coffee, 
  Compass, 
  X, 
  Check, 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  Sparkles, 
  Wallet, 
  ChevronDown, 
  ChevronUp,
  Eye
} from 'lucide-react';
import { INDIAN_STATES, CATEGORIES } from '../data/mockData';

export default function BuddyProfileView({ 
  profile, 
  setProfile, 
  onOpenSubscribe, 
  onNavigateToFeed, 
  onNavigateToVault, 
  onShowToast 
}) {
  const [activeSubTab, setActiveSubTab] = useState('dashboard'); // 'dashboard' | 'edit'
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [showChecklistDetails, setShowChecklistDetails] = useState(false);

  // Form State initialized from profile
  const [formData, setFormData] = useState({
    name: profile.name,
    phone: profile.phone,
    gender: profile.gender,
    city: profile.city,
    state: profile.state,
    pincode: profile.pincode,
    bio: profile.bio,
    hourlyRate: profile.hourlyRate,
    socialLinks: { ...profile.socialLinks },
    services: [...profile.services],
    languages: [...profile.languages],
    isOnline: profile.isOnline
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Preset Avatar choices for quick switcher
  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=500&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&h=500&fit=crop&crop=faces'
  ];

  // Calculate Completion Score
  const completionItems = [
    { label: 'Full Name', done: !!formData.name.trim() },
    { label: 'Phone', done: !!formData.phone.trim() },
    { label: 'Gender', done: !!formData.gender },
    { label: 'Profile Photo', done: !!profile.avatar },
    { label: 'City', done: !!formData.city.trim() },
    { label: 'State', done: !!formData.state },
    { label: 'Pincode', done: /^\d{6}$/.test(formData.pincode) },
    { label: 'Bio', done: formData.bio.trim().length >= 40 },
    { label: 'Services', done: formData.services.length > 0 },
    { label: 'Aadhaar', done: profile.isAadhaarVerified }
  ];

  const completedCount = completionItems.filter(i => i.done).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);

  const getCompletionStatusBadge = () => {
    if (completionPercentage === 100) return { text: 'Profile Complete', color: 'var(--color-emerald)', bg: 'var(--color-emerald-bg)' };
    if (completionPercentage >= 75) return { text: 'Almost Complete', color: 'var(--color-gold)', bg: 'var(--color-gold-bg)' };
    if (completionPercentage >= 40) return { text: 'Good Progress', color: 'var(--color-sky)', bg: 'var(--color-sky-bg)' };
    return { text: 'Setup Required', color: 'var(--color-rose)', bg: 'var(--color-rose-bg)' };
  };

  const statusBadge = getCompletionStatusBadge();

  // Handlers
  const handleToggleOnlineStatus = () => {
    const nextStatus = !formData.isOnline;
    setFormData(prev => ({ ...prev, isOnline: nextStatus }));
    setProfile(prev => ({ ...prev, isOnline: nextStatus }));
    onShowToast(`Status updated: ${nextStatus ? 'Available for new requests' : 'Set to Busy / Away'}`, 'info');
  };

  const handleServiceToggle = (categoryName) => {
    const exists = formData.services.some(s => s.name === categoryName);
    if (exists) {
      if (formData.services.length <= 1) {
        onShowToast('You must offer at least one companion service.', 'error');
        return;
      }
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(s => s.name !== categoryName)
      }));
    } else {
      if (formData.services.length >= 4) {
        onShowToast('You can select up to 4 services at a time.', 'info');
        return;
      }
      // Add default rate
      const newService = {
        name: categoryName,
        rate: formData.hourlyRate || 500,
        desc: `Custom activities for ${categoryName}`
      };
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService]
      }));
    }
  };

  const handleRateChange = (serviceName, newRate) => {
    if (newRate === '') {
      setFormData(prev => ({
        ...prev,
        services: prev.services.map(s => s.name === serviceName ? { ...s, rate: '' } : s)
      }));
      return;
    }
    const num = Number(newRate);
    const numericRate = isNaN(num) ? 100 : Math.max(0, Math.min(5000, num));
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s => s.name === serviceName ? { ...s, rate: numericRate } : s)
    }));
  };

  const handleLanguageToggle = (lang) => {
    if (formData.languages.includes(lang)) {
      if (formData.languages.length <= 1) {
        onShowToast('Select at least one spoken language.', 'error');
        return;
      }
      setFormData(prev => ({
        ...prev,
        languages: prev.languages.filter(l => l !== lang)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, lang]
      }));
    }
  };

  const handleSelectAvatar = (url) => {
    setProfile(prev => ({ ...prev, avatar: url }));
    setIsAvatarModalOpen(false);
    onShowToast('Profile picture updated successfully!', 'success');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    if (!formData.city.trim()) errors.city = 'City cannot be empty.';
    if (!formData.state) errors.state = 'Please select a state.';
    if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = 'Pincode must be a valid 6-digit number.';
    if (formData.bio.trim().length < 30) errors.bio = 'Bio should be at least 30 characters.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      onShowToast('Please fix the highlighted errors before saving.', 'error');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setProfile(prev => ({
        ...prev,
        ...formData
      }));
      onShowToast('Profile updated successfully!', 'success');
    }, 600);
  };

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 20px 80px 20px' }}>
      
      {/* Top Banner / Hero Profile Card */}
      <div 
        style={{
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #f1f5f9',
          boxShadow: '0 8px 30px -6px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          marginBottom: 24
        }}
      >
        {/* Cover Pattern - Luxury Aesthetic Mesh Gradient */}
        <div style={{
          height: 160,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #881337 80%, #be123c 100%)',
          position: 'relative',
          padding: '18px 26px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          overflow: 'hidden'
        }}>
          {/* Subtle Ambient Radial Glow */}
          <div style={{
            position: 'absolute',
            top: -40,
            right: 120,
            width: 220,
            height: 220,
            background: 'radial-gradient(circle, rgba(244, 63, 94, 0.35) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Left Portal Tag */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(12px)',
            color: '#ffffff',
            padding: '5px 14px',
            borderRadius: 9999,
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Sparkles size={13} color="#fcd34d" />
            <span>FINDCO CREATOR ENCLAVE</span>
          </div>

          {/* Right Security Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(12px)',
              color: '#ffffff',
              padding: '5px 14px',
              borderRadius: 9999,
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <ShieldCheck size={14} color="#34d399" />
              <span>Aadhaar 256-Bit Encrypted</span>
            </div>
          </div>
        </div>

        {/* Profile Info Bar */}
        <div style={{
          padding: '0 28px 24px 28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20
        }}>
          {/* Avatar and Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Avatar with Camera Trigger */}
            <div style={{ position: 'relative', marginTop: -50, flexShrink: 0 }}>
              <img 
                src={profile.avatar}
                alt={profile.name}
                style={{
                  width: 108,
                  height: 108,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #ffffff',
                  boxShadow: '0 10px 25px -4px rgba(15, 23, 42, 0.25)',
                  background: '#f8fafc'
                }}
              />
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Change Profile Photo"
                style={{
                  position: 'absolute',
                  bottom: 3,
                  right: 3,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#e11d48',
                  color: '#ffffff',
                  border: '3px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(225, 29, 72, 0.4)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Camera size={15} />
              </button>
            </div>

            {/* Name, Badge, Location */}
            <div style={{ paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
                  {profile.name}
                </h1>
                {profile.isAadhaarVerified && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: '#ecfdf5',
                    color: '#059669',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    border: '1px solid #a7f3d0',
                    letterSpacing: '0.02em'
                  }}>
                    <ShieldCheck size={13} strokeWidth={2.4} />
                    Aadhaar Verified
                  </span>
                )}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#fffbeb',
                  color: '#b45309',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: 9999,
                  border: '1px solid #fde68a'
                }}>
                  <Star size={12} fill="#b45309" color="#b45309" />
                  {profile.metrics.rating} ({profile.metrics.reviewsCount} reviews)
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#fff1f2',
                  color: '#e11d48',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: 9999,
                  border: '1px solid #fecdd3'
                }}>
                  <Award size={12} />
                  Top Rated Companion
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: statusBadge.bg,
                  color: statusBadge.color,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: 9999,
                  border: '1px solid rgba(0,0,0,0.06)'
                }}>
                  <Sparkles size={12} />
                  {completionPercentage}% • {statusBadge.text}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: '0.84rem',
                color: '#64748b',
                flexWrap: 'wrap'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <MapPin size={14} color="#e11d48" />
                  {profile.city}, {profile.state}
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={13} color="#94a3b8" />
                  {profile.phone}
                </span>
                <span>•</span>
                <span style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '2px 10px',
                  borderRadius: 9999,
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '0.78rem'
                }}>
                  Base Rate: ₹{profile.hourlyRate}/hr
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Online Switch + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 14 }}>
            {/* Live Availability Toggle */}
            <button
              type="button"
              onClick={handleToggleOnlineStatus}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                borderRadius: 9999,
                background: formData.isOnline ? '#ecfdf5' : '#f8fafc',
                border: `1.5px solid ${formData.isOnline ? '#a7f3d0' : '#e2e8f0'}`,
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: formData.isOnline ? '#059669' : '#64748b',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = formData.isOnline ? '#34d399' : '#cbd5e1'}
              onMouseLeave={e => e.currentTarget.style.borderColor = formData.isOnline ? '#a7f3d0' : '#e2e8f0'}
            >
              <span style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: formData.isOnline ? '#10b981' : '#94a3b8',
                boxShadow: formData.isOnline ? '0 0 10px rgba(16, 185, 129, 0.7)' : 'none'
              }} />
              <span>{formData.isOnline ? 'Available for Requests' : 'Busy / Invisible'}</span>
            </button>

            {/* Preview Public Profile */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 9999,
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                color: '#334155',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <Eye size={15} color="#64748b" />
              <span>Preview Profile</span>
            </button>

            {/* Share Profile */}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                onShowToast('Profile link copied to clipboard!', 'success');
              }}
              title="Share Profile"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Completion Meter Card */}
      <div 
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #f1f5f9',
          boxShadow: '0 4px 18px -4px rgba(0,0,0,0.03)',
          padding: '16px 22px',
          marginBottom: 24
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}>
              ✓
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                  Profile Verification & Completion
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  color: '#059669',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0'
                }}>
                  {completionPercentage}% Complete
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Your companion profile is fully verified, audited by Aadhaar KYC, and featured on the live companion search.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowChecklistDetails(prev => !prev)}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 9999,
              padding: '6px 14px',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>{showChecklistDetails ? 'Hide Verification Audit' : 'View 10 Verification Points'}</span>
            {showChecklistDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Thin Modern Emerald Progress Bar */}
        <div style={{
          height: 6,
          background: '#f1f5f9',
          borderRadius: 9999,
          overflow: 'hidden',
          marginBottom: showChecklistDetails ? 14 : 0
        }}>
          <div style={{
            height: '100%',
            width: '100%',
            transform: `scaleX(${Math.max(0, Math.min(100, completionPercentage)) / 100})`,
            transformOrigin: 'left',
            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
            borderRadius: 9999,
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
        </div>

        {/* Collapsible Checklist Details */}
        {showChecklistDetails && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            paddingTop: 12,
            borderTop: '1px solid #f8fafc'
          }}>
            {completionItems.map(item => (
              <div
                key={item.label}
                onClick={() => {
                  setActiveSubTab('edit');
                  onShowToast(`Jumped to ${item.label} section in Edit Profile`, 'info');
                }}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 9999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer',
                  background: item.done ? '#ecfdf5' : '#f8fafc',
                  color: item.done ? '#065f46' : '#94a3b8',
                  border: `1px solid ${item.done ? '#a7f3d0' : '#e2e8f0'}`
                }}
              >
                {item.done ? <Check size={12} color="#059669" strokeWidth={3} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1' }} />}
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Mode Tabs Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          padding: 4,
          borderRadius: 14,
          gap: 4
        }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('dashboard')}
            style={{
              padding: '9px 20px',
              fontSize: '0.88rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 10,
              background: activeSubTab === 'dashboard' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'dashboard' ? '#e11d48' : '#64748b',
              boxShadow: activeSubTab === 'dashboard' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <TrendingUp size={16} color={activeSubTab === 'dashboard' ? '#e11d48' : '#94a3b8'} />
            Buddy Dashboard
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('edit')}
            style={{
              padding: '9px 20px',
              fontSize: '0.88rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 10,
              background: activeSubTab === 'edit' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'edit' ? '#e11d48' : '#64748b',
              boxShadow: activeSubTab === 'edit' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <Edit3 size={16} color={activeSubTab === 'edit' ? '#e11d48' : '#94a3b8'} />
            Edit Profile & Rates
          </button>
        </div>

        {/* Membership pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#ffffff',
          padding: '7px 16px',
          borderRadius: 9999,
          border: '1px solid #fecdd3',
          boxShadow: '0 2px 6px rgba(225, 29, 72, 0.04)'
        }}>
          <Star size={14} color="#e11d48" fill="#e11d48" />
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Pass:</span>
          <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>{profile.membership.planName}</strong>
          <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 800 }}>({profile.membership.expiresIn})</span>
          <button 
            type="button"
            onClick={onOpenSubscribe}
            style={{
              background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
              border: 'none',
              borderRadius: 9999,
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.72rem',
              padding: '4px 10px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(225, 29, 72, 0.3)'
            }}
          >
            Upgrade
          </button>
        </div>
      </div>

      {/* TAB 1: BUDDY DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* "How You Earn on BuddySearch" 4-Step Guide Banner */}
          <div 
            style={{
              background: '#ffffff',
              border: '1px solid #f1f5f9',
              borderRadius: 20,
              padding: '24px 28px',
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    How You Earn on FindCo
                  </h2>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    background: '#ecfdf5',
                    color: '#059669',
                    padding: '2px 8px',
                    borderRadius: 9999,
                    border: '1px solid #a7f3d0'
                  }}>
                    0% Commission
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                  A clear 4-step workflow to connect with clients, confirm rates, and earn up to ₹2,000/hr safely.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={onNavigateToFeed}
                  style={{
                    background: '#e11d48',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '9px 18px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span>Browse Client Requests</span>
                  <ArrowUpRight size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('edit')}
                  style={{
                    background: '#ffffff',
                    color: '#334155',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '9px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                >
                  Adjust My Rates
                </button>
              </div>
            </div>

            {/* 4 Steps Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16
            }}>
              {[
                {
                  num: '01',
                  title: 'Connect with Clients',
                  desc: 'Browse client requests on the feed or get discovered directly by clients in your city.',
                  icon: Compass,
                  themeColor: '#e11d48',
                  themeBg: '#fff1f2',
                  themeBorder: '#fecdd3'
                },
                {
                  num: '02',
                  title: 'Chat & Agree on Plan',
                  desc: 'Discuss details, public meeting point, timing, and service requirements in secure duplex chat.',
                  icon: Coffee,
                  themeColor: '#d97706',
                  themeBg: '#fffbeb',
                  themeBorder: '#fde68a'
                },
                {
                  num: '03',
                  title: 'Set Your Rate',
                  desc: 'Decide your hourly rate or send custom quotes. You keep 100% of what you earn.',
                  icon: Coins,
                  themeColor: '#059669',
                  themeBg: '#ecfdf5',
                  themeBorder: '#a7f3d0'
                },
                {
                  num: '04',
                  title: 'Meet & Get Paid',
                  desc: 'Complete the friendly meetup safely and receive payments directly. Simple and verified.',
                  icon: CheckCircle2,
                  themeColor: '#4f46e5',
                  themeBg: '#eef2ff',
                  themeBorder: '#c7d2fe'
                }
              ].map(step => (
                <div 
                  key={step.num}
                  style={{
                    background: '#ffffff',
                    border: `1px solid #f1f5f9`,
                    borderRadius: 16,
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = step.themeBorder;
                    e.currentTarget.style.boxShadow = `0 8px 18px -4px ${step.themeBg}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 900,
                      color: step.themeColor,
                      background: step.themeBg,
                      border: `1px solid ${step.themeBorder}`,
                      padding: '2px 8px',
                      borderRadius: 8
                    }}>
                      {step.num}
                    </span>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: step.themeBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <step.icon size={17} color={step.themeColor} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance & Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 18
          }}>
            {/* Metric 1 */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #f1f5f9',
              borderRadius: 18,
              padding: '22px',
              boxShadow: '0 4px 14px -3px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                  Total Verified Earnings
                </span>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Wallet size={18} color="#059669" />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 6 }}>
                ₹{profile.metrics.totalEarned.toLocaleString()}
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.74rem',
                color: '#059669',
                background: '#ecfdf5',
                padding: '3px 8px',
                borderRadius: 9999,
                fontWeight: 700
              }}>
                ↑ 100% direct payouts with zero cuts
              </div>
            </div>

            {/* Metric 2 */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #f1f5f9',
              borderRadius: 18,
              padding: '22px',
              boxShadow: '0 4px 14px -3px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                  Average Hourly Rate
                </span>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={18} color="#4f46e5" />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 6 }}>
                ₹{profile.metrics.hourlyAvg} <span style={{ fontSize: '0.92rem', color: '#94a3b8', fontWeight: 500 }}>/hr</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                Across {profile.services.length} active service categories
              </div>
            </div>

            {/* Metric 3 */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #f1f5f9',
              borderRadius: 18,
              padding: '22px',
              boxShadow: '0 4px 14px -3px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                  Completed Outings
                </span>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: '#fff1f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Compass size={18} color="#e11d48" />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 6 }}>
                {profile.metrics.completedTrips} Trips
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.74rem',
                color: '#e11d48',
                background: '#fff1f2',
                padding: '3px 8px',
                borderRadius: 9999,
                fontWeight: 700
              }}>
                {profile.metrics.acceptanceRate} acceptance rate
              </div>
            </div>

            {/* Metric 4 */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #f1f5f9',
              borderRadius: 18,
              padding: '22px',
              boxShadow: '0 4px 14px -3px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                  Client Trust Rating
                </span>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: '#fffbeb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Star size={18} color="#d97706" fill="#d97706" />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                ⭐ {profile.metrics.rating} <span style={{ fontSize: '0.92rem', color: '#94a3b8', fontWeight: 500 }}>/ 5.0</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                From {profile.metrics.reviewsCount} verified clients
              </div>
            </div>
          </div>

          {/* Two Columns: Recent Bookings & Client Reviews */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
            
            {/* Recent Bookings */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #f1f5f9',
              borderRadius: 20,
              padding: '24px',
              boxShadow: '0 4px 18px -4px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Recent Bookings & Activity
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    Latest outings and connection requests
                  </span>
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#475569',
                  background: '#f1f5f9',
                  padding: '3px 8px',
                  borderRadius: 9999
                }}>
                  {profile.recentBookings.length} Total
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {profile.recentBookings.map(b => (
                  <div 
                    key={b.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      borderRadius: 14,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#f1f5f9';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem'
                      }}>
                        {b.clientName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                          {b.clientName}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>
                          {b.service} • {b.date}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                        ₹{b.amount}
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        background: b.status === 'Completed' ? '#ecfdf5' : '#eff6ff',
                        color: b.status === 'Completed' ? '#059669' : '#2563eb',
                        border: `1px solid ${b.status === 'Completed' ? '#a7f3d0' : '#bfdbfe'}`,
                        display: 'inline-block',
                        marginTop: 3
                      }}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Reviews */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #f1f5f9',
              borderRadius: 20,
              padding: '24px',
              boxShadow: '0 4px 18px -4px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Verified Client Reviews
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    Authentic feedback from verified meetups
                  </span>
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#059669',
                  background: '#ecfdf5',
                  padding: '3px 9px',
                  borderRadius: 9999,
                  border: '1px solid #a7f3d0'
                }}>
                  ★ 100% Positive
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {profile.reviews.map(r => (
                  <div
                    key={r.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      borderRadius: 14,
                      padding: '14px 16px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#f1f5f9';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: '#fef3c7',
                          color: '#b45309',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {r.author.charAt(0)}
                        </div>
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                          {r.author}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={13} fill="#d97706" color="#d97706" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, margin: '6px 0 6px 0', fontStyle: 'italic' }}>
                      "{r.text}"
                    </p>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
                      Verified meetup • {r.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: EDIT PROFILE & RATES */}
      {activeSubTab === 'edit' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Section 1: Basic Information */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 4, color: 'var(--text-main)' }}>
              1. Basic Personal Information
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Your basic profile info is visible to clients searching for companionship in your area.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                  Full Name <span style={{ color: 'var(--color-rose)' }}>*</span>
                </label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: `1px solid ${formErrors.name ? 'var(--color-rose)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                {formErrors.name && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-rose)', marginTop: 4, display: 'block' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    value={formData.phone}
                    disabled
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-muted)',
                      cursor: 'not-allowed'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.72rem',
                    color: 'var(--color-emerald)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}>
                    <CheckCircle2 size={12} /> Verified
                  </span>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Non-binary / Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                  City <span style={{ color: 'var(--color-rose)' }}>*</span>
                </label>
                <input 
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: `1px solid ${formErrors.city ? 'var(--color-rose)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                {formErrors.city && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-rose)', marginTop: 4, display: 'block' }}>
                    {formErrors.city}
                  </span>
                )}
              </div>

              {/* State */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                  State <span style={{ color: 'var(--color-rose)' }}>*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Pincode */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                  Pincode <span style={{ color: 'var(--color-rose)' }}>*</span>
                </label>
                <input 
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: `1px solid ${formErrors.pincode ? 'var(--color-rose)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                {formErrors.pincode && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-rose)', marginTop: 4, display: 'block' }}>
                    {formErrors.pincode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Social Links */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 4, color: 'var(--text-main)' }}>
              2. Social Media Links
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Optional links shown on your verified public profile to build instant client confidence.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                  <span style={{ color: '#e1306c', fontWeight: 800 }}>IG</span> Instagram
                </label>
                <input 
                  type="text"
                  placeholder="@your_handle"
                  value={formData.socialLinks.instagram}
                  onChange={e => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })}
                  style={{ width: '100%', padding: '10px 14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                  <span style={{ color: '#0077b5', fontWeight: 800 }}>IN</span> LinkedIn
                </label>
                <input 
                  type="text"
                  placeholder="/in/yourname"
                  value={formData.socialLinks.linkedin}
                  onChange={e => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })}
                  style={{ width: '100%', padding: '10px 14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                  <span style={{ color: '#1da1f2', fontWeight: 800 }}>𝕏</span> Twitter / X
                </label>
                <input 
                  type="text"
                  placeholder="@handle"
                  value={formData.socialLinks.twitter}
                  onChange={e => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                  })}
                  style={{ width: '100%', padding: '10px 14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                  <span style={{ color: '#4267b2', fontWeight: 800 }}>FB</span> Facebook
                </label>
                <input 
                  type="text"
                  placeholder="/yourname"
                  value={formData.socialLinks.facebook}
                  onChange={e => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                  })}
                  style={{ width: '100%', padding: '10px 14px' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Buddy Pitch & Bio */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
                3. About You & Companion Pitch
              </h3>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: formData.bio.length < 40 ? 'var(--color-rose)' : 'var(--color-emerald)'
              }}>
                {formData.bio.length} characters (min 40)
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Share your vibe, favorite hangout spots, music taste, and conversational interests.
            </p>

            <textarea 
              rows={4}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="e.g. Specialty coffee lover and amateur street photographer in Bengaluru. Love discovering cozy cafes, indie bookshops, and weekend art exhibitions..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${formErrors.bio ? 'var(--color-rose)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                lineHeight: 1.6
              }}
            />
            {formErrors.bio && (
              <span style={{ fontSize: '0.72rem', color: 'var(--color-rose)', marginTop: 4, display: 'block' }}>
                {formErrors.bio}
              </span>
            )}
          </div>

          {/* Section 4: Services Offered & Custom Hourly Rates */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
                4. Services & Custom Rates
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-primary-text)', fontWeight: 700 }}>
                {formData.services.length}/4 Selected
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 18 }}>
              Select up to 4 services you enjoy offering. Set individual hourly pricing per activity type.
            </p>

            {/* Service Chips Selection */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {CATEGORIES.map(cat => {
                const isSelected = formData.services.some(s => s.name === cat.name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleServiceToggle(cat.name)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'var(--color-primary-bg)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--color-primary-text)' : 'var(--text-main)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {isSelected ? <Check size={14} color="var(--color-primary)" /> : <span>+</span>}
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Custom Rate Inputs for Each Selected Service */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Configured Hourly Rates for Selected Activities:
              </div>

              {formData.services.map(serv => (
                <div 
                  key={serv.name}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {serv.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {serv.desc}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Hourly Rate:</span>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--color-primary)' }}>₹</span>
                      <input 
                        type="number"
                        min={100}
                        max={5000}
                        step={50}
                        value={serv.rate}
                        onChange={e => handleRateChange(serv.name, e.target.value)}
                        style={{
                          width: 110,
                          padding: '8px 10px 8px 24px',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ hr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Spoken Languages */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 4, color: 'var(--text-main)' }}>
              5. Languages Spoken
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Select the languages you can comfortably converse in with your companion clients.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['English', 'Hindi', 'Kannada', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam', 'Spanish', 'French'].map(lang => {
                const isSelected = formData.languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageToggle(lang)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'var(--color-primary-bg)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--color-primary-text)' : 'var(--text-main)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {lang}
                    {isSelected && <Check size={12} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Aadhaar KYC Enclave */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={20} color="var(--color-emerald)" />
                6. Identity Verification (Aadhaar Vault)
              </h3>
              <span className="badge-tag-emerald">
                <CheckCircle2 size={13} /> Status: {profile.aadhaarStatus.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Government ID verification gives you the green "Verified Buddy" shield and boosts client inquiries by 400%.
            </p>

            {/* Document Upload Guidelines box matching BuddySearch */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1.5px solid rgba(59, 130, 246, 0.18)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: 16
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--color-sky)', marginBottom: 8 }}>
                Document Guidelines (FindCo Verified Standard):
              </div>
              <ul style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: 18, lineHeight: 1.6 }}>
                <li>Submit a clear, legible photograph or scan of your official Aadhaar Card.</li>
                <li>Document must not be password-protected (for PDF submissions).</li>
                <li>All four corners of the Aadhaar card must be clearly visible without crop or blur.</li>
                <li>The name on your Aadhaar card must match the name on your FindCo profile.</li>
                <li>Accepted formats: JPEG, PNG, WebP or PDF (up to 5 MB).</li>
              </ul>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Registered Aadhaar: <strong>{profile.aadhaarNumber}</strong>
              </div>
              <button
                type="button"
                onClick={onNavigateToVault}
                className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px 14px' }}
              >
                Open Identity Vault Review <ExternalLink size={14} />
              </button>
            </div>
          </div>

          {/* Section 7: Account Settings & Danger Zone */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(225, 29, 72, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-rose)', marginBottom: 6 }}>
              Account Safety & Actions
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Control your account visibility and permanent data preferences.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  onShowToast('Profile visibility paused. Clients cannot discover you on feed.', 'info');
                }}
                className="btn-secondary"
                style={{ fontSize: '0.82rem' }}
              >
                Temporarily Deactivate Profile
              </button>
              
              <button
                type="button"
                onClick={() => setIsDeactivateModalOpen(true)}
                style={{
                  background: 'transparent',
                  color: 'var(--color-rose)',
                  border: '1px solid var(--color-rose)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Delete Account...
              </button>
            </div>
          </div>

          {/* Sticky Save Bar */}
          <div style={{
            position: 'sticky',
            bottom: 20,
            background: 'var(--bg-card)',
            border: '1.5px solid var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 24px',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 50
          }}>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>
              Changes will update your live companion card on the FindCo feed and discover directory.
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.92rem' }}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>
      )}

      {/* MODAL 1: PREVIEW PUBLIC PROFILE (Matches ProfilePreviewPage.js) */}
      {isPreviewOpen && (
        <div className="modal-overlay">
          <div className="modal-box modal-enter" style={{
            width: '100%',
            maxWidth: 580,
            padding: 0,
            border: '1px solid var(--border-accent)',
            overflow: 'hidden'
          }}>
            {/* Header with Close */}
            <div style={{
              background: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border-subtle)',
              height: 100,
              position: 'relative',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <span style={{
                background: 'rgba(0, 0, 0, 0.4)',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)'
              }}>
                CLIENT PREVIEW MODE
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: 'none',
                  color: '#fff',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Content */}
            <div style={{ padding: '0 24px 28px 24px', marginTop: -45 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
                <img 
                  src={profile.avatar}
                  alt={profile.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid var(--bg-card)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <span className="badge-tag-emerald" style={{ padding: '6px 12px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-emerald)', display: 'inline-block' }} />
                  Available Now
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>
                  {formData.name}
                </h2>
                {profile.isAadhaarVerified && (
                  <ShieldCheck size={18} color="var(--color-emerald)" />
                )}
                <span className="badge-tag-amber" style={{ fontSize: '0.7rem' }}>
                  <Star size={11} fill="var(--color-gold)" color="var(--color-gold)" style={{ marginRight: 3 }} /> {profile.metrics.rating}
                </span>
              </div>

              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                {formData.city}, {formData.state} • {formData.languages.join(', ')}
              </div>

              {/* Rate Strip */}
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20
              }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Base Companion Rate</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-gold)' }}>
                    ₹{formData.hourlyRate} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ hour</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Typical Response</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-emerald)' }}>
                    Within 15 mins
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                  About Me
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {formData.bio}
                </p>
              </div>

              {/* Services Offered with Rates */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                  Activities & Rates
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {formData.services.map(s => (
                    <div 
                      key={s.name}
                      style={{
                        padding: '8px 12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {s.name}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primary-text)' }}>
                        ₹{s.rate}/hr
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPreviewOpen(false);
                  onShowToast('Client simulator: Chat request would be sent directly to your inbox.', 'info');
                }}
                className="btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                Send Message / Book Hangout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE AVATAR PHOTO SELECTOR */}
      {isAvatarModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box modal-enter" style={{
            width: '100%',
            maxWidth: 480,
            padding: 28,
            border: '1px solid var(--border-accent)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
                Select Profile Photo
              </h3>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 18 }}>
              Choose a friendly, high-resolution portrait photograph.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
              {PRESET_AVATARS.map((url, idx) => (
                <button 
                  key={idx}
                  type="button"
                  aria-label={`Select avatar preset ${idx + 1}`}
                  onClick={() => handleSelectAvatar(url)}
                  style={{
                    padding: 0,
                    background: 'transparent',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: profile.avatar === url ? '3px solid var(--color-primary)' : '2px solid transparent',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition-fast)',
                    display: 'block'
                  }}
                >
                  <img 
                    src={url} 
                    alt={`Avatar option ${idx + 1}`} 
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} 
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(false)}
              className="btn-secondary"
              style={{ width: '100%' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE ACCOUNT MODAL */}
      {isDeactivateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box modal-enter" style={{
            width: '100%',
            maxWidth: 460,
            padding: 24,
            border: '1px solid rgba(225, 29, 72, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-rose)', marginBottom: 12 }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.2rem' }}>Delete your FindCo Account?</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 18 }}>
              Your profile will be hidden immediately and you will be signed out. You have a <strong>14-day grace period</strong> to change your mind: simply log back in to restore your data. After 14 days, all personal details and Aadhaar verification records are permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setIsDeactivateModalOpen(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeactivateModalOpen(false);
                  onShowToast('Account deletion request initiated with 14-day grace period.', 'info');
                }}
                style={{
                  flex: 1,
                  background: 'var(--color-rose)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
