import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Search, 
  User, 
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  Key,
  TrendingUp
} from 'lucide-react';

export default function IdentityVaultView({ 
  kycRequests, 
  setKycRequests, 
  role, 
  onShowToast 
}) {
  const [activeSubTab, setActiveSubTab] = useState(role === 'admin' ? 'admin_vault' : 'submit_kyc');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [agreedToConsent, setAgreedToConsent] = useState(false);
  const [vaultSearch, setVaultSearch] = useState('');

  // Submit companion KYC
  const handleSubmitKyc = (e) => {
    e.preventDefault();
    if (!agreedToConsent) {
      onShowToast('Please consent to identity storage in the Identity Vault.', 'error');
      return;
    }

    if (aadhaarNumber.replace(/[^0-9]/g, '').length !== 12) {
      onShowToast('Please enter a valid 12-digit Aadhaar Number.', 'error');
      return;
    }

    const newKyc = {
      id: `kyc_${Date.now()}`,
      userName: fullName || 'You (Current Companion)',
      email: 'user@findco.in',
      phone: phone,
      city: city,
      aadhaarNumber: `XXXX-XXXX-${aadhaarNumber.slice(-4)}`,
      frontImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&h=300&fit=crop',
      backImage: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=500&h=300&fit=crop',
      submittedAt: 'Just now',
      status: 'pending'
    };

    setKycRequests(prev => [newKyc, ...prev]);
    onShowToast('Aadhaar credentials submitted to Identity Vault. Status: Pending Review (2-4 hrs)', 'success');
  };

  const handleApprove = (id) => {
    setKycRequests(prev => prev.map(k => k.id === id ? { ...k, status: 'verified' } : k));
    onShowToast('Applicant approved! Verified Badge and companion privileges granted.', 'success');
  };

  const handleReject = (id) => {
    setKycRequests(prev => prev.map(k => k.id === id ? { ...k, status: 'rejected' } : k));
    onShowToast('Applicant rejected. Notice sent for re-upload.', 'info');
  };

  const filteredVault = kycRequests.filter(k => {
    if (!vaultSearch.trim()) return true;
    const q = vaultSearch.toLowerCase();
    return k.userName.toLowerCase().includes(q) || k.city.toLowerCase().includes(q) || k.aadhaarNumber.includes(q);
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 80px 20px' }}>
      
      {/* Vault Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: 6, fontWeight: 800, letterSpacing: '-0.025em' }}>Identity & Aadhaar Vault</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
            Govt. Identity Verification, encryption at rest, and privacy protection under India's DPDP Act.
          </p>
        </div>

        {/* Tab switch - Only show admin tab if role is explicitly admin */}
        {role === 'admin' && (
          <div style={{
            display: 'flex',
            background: 'var(--bg-card)',
            padding: 4,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={() => setActiveSubTab('submit_kyc')}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                background: activeSubTab === 'submit_kyc' ? 'var(--bg-elevated)' : 'transparent',
                color: activeSubTab === 'submit_kyc' ? 'var(--color-primary)' : 'var(--text-secondary)',
                border: activeSubTab === 'submit_kyc' ? '1px solid var(--border-accent)' : 'none',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Submit KYC (Companion)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('admin_vault')}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                background: activeSubTab === 'admin_vault' ? 'var(--bg-elevated)' : 'transparent',
                color: activeSubTab === 'admin_vault' ? 'var(--color-sky)' : 'var(--text-secondary)',
                border: activeSubTab === 'admin_vault' ? '1px solid var(--color-sky)' : 'none',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Admin Vault Review Queue ({kycRequests.filter(k => k.status === 'pending').length})
            </button>
          </div>
        )}
      </div>

      {activeSubTab === 'submit_kyc' ? (
        /* Companion KYC Submission Form */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
          
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={22} color="var(--color-emerald)" />
              Verify Your Companion Profile
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
              All companions on FindCo are required to pass government identity verification. Once audited by our operations team, you will receive the green <strong>Aadhaar Verified Shield</strong>.
            </p>

            <form onSubmit={handleSubmitKyc}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="kyc-fullname" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                  Legal Full Name (As per Aadhaar)
                </label>
                <input 
                  id="kyc-fullname"
                  type="text"
                  placeholder="e.g. Tanmay Joshi"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label htmlFor="kyc-city" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                    Operating City
                  </label>
                  <input 
                    id="kyc-city"
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="kyc-phone" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                    Phone (OTP-Linked)
                  </label>
                  <input 
                    id="kyc-phone"
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label htmlFor="kyc-aadhaar" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                  12-Digit Aadhaar Card Number
                </label>
                <input 
                  id="kyc-aadhaar"
                  type="text"
                  maxLength={14}
                  placeholder="e.g. 5412 8890 3219"
                  value={aadhaarNumber}
                  onChange={e => setAadhaarNumber(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem',
                    letterSpacing: '0.08em',
                    fontWeight: 700
                  }}
                />
              </div>

              {/* Upload Previews */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div 
                  tabIndex={0}
                  role="button"
                  aria-label="Upload Front Side Photo of Aadhaar"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(); }}
                  style={{
                    border: '1.5px dashed var(--border-hover)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                    background: 'var(--bg-card)',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={20} color="var(--color-primary)" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Front Side Photo</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>JPG, PNG up to 5MB</div>
                </div>

                <div 
                  tabIndex={0}
                  role="button"
                  aria-label="Upload Back Side Photo of Aadhaar"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(); }}
                  style={{
                    border: '1.5px dashed var(--border-hover)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                    background: 'var(--bg-card)',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={20} color="var(--color-primary)" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Back Side Photo</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>JPG, PNG up to 5MB</div>
                </div>
              </div>

              {/* Consent check */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 24 }}>
                <input 
                  type="checkbox"
                  checked={agreedToConsent}
                  onChange={e => setAgreedToConsent(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary)', marginTop: 3 }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  I confirm the uploaded details are authentic and belong to me. I authorize FindCo's Trust & Safety unit to audit these records in the encrypted Identity Vault.
                </span>
              </label>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
              >
                Submit Credentials for Audit
              </button>
            </form>
          </div>

          {/* Privacy & Guarantees side card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Lock size={20} color="var(--color-primary)" />
                <h4 style={{ fontSize: '1.05rem' }}>How FindCo Protects Your Identity</h4>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <ShieldCheck size={16} color="var(--color-emerald)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Zero Public Exposure:</strong> Your Aadhaar number and ID photo will never be shown to clients or public visitors.</span>
                </li>
                <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Key size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>AES-256 Cold Encryption:</strong> Uploaded identity documents are stored in an isolated cold-storage enclave with zero external API egress.</span>
                </li>
                <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <TrendingUp size={16} color="var(--color-mint)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Verified Trust Badge:</strong> Aadhaar-audited buddies receive verified presence status on the activity feed.</span>
                </li>
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: 10, color: 'var(--color-gold)' }}>Audit SLA Timeline</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                Manual audits are processed within 2 to 4 hours. You will receive an SMS confirmation once your badge is active.
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Support Helpline: <strong style={{ color: 'var(--text-main)' }}>safety@findco.in</strong>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Admin Identity Vault Review Queue */
        <div>
          {/* Search bar */}
          <div style={{ marginBottom: 20, position: 'relative', maxWidth: 400 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              id="vault-search-input"
              aria-label="Search vault by applicant, phone, or Aadhaar"
              type="text"
              placeholder="Search vault by applicant, phone, Aadhaar..."
              value={vaultSearch}
              onChange={e => setVaultSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 38px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.86rem'
              }}
            />
          </div>

          {/* List of Applications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {filteredVault.map(app => (
              <div 
                key={app.id}
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 20
                }}
              >
                {/* Applicant Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <User size={24} color="var(--color-primary)" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{app.userName}</span>
                      <span className={`badge-tag ${app.status === 'verified' ? 'badge-tag-emerald' : app.status === 'rejected' ? 'badge-tag-rose' : 'badge-tag-amber'}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} /> {app.city}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={12} /> {app.phone}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Lock size={12} /> Aadhaar: {app.aadhaarNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Document Previews */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <img 
                    src={app.frontImage} 
                    alt="Front"
                    loading="lazy"
                    decoding="async"
                    style={{ width: 90, height: 56, borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                    title="Front Side Photo"
                  />
                  <img 
                    src={app.backImage} 
                    alt="Back"
                    loading="lazy"
                    decoding="async"
                    style={{ width: 90, height: 56, borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                    title="Back Side Photo"
                  />
                </div>

                {/* Admin Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  {app.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(app.id)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem', background: 'var(--color-emerald)', color: '#fff' }}
                      >
                        <CheckCircle2 size={16} />
                        Approve & Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(app.id)}
                        className="btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.82rem', color: 'var(--color-rose)' }}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  {app.status === 'verified' && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={16} /> Verified Active
                    </span>
                  )}
                  {app.status === 'rejected' && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-rose)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <XCircle size={16} /> Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
