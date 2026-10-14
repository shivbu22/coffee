import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  LogOut, 
  Eye, 
  RefreshCw, 
  Coins, 
  TrendingUp, 
  Clock, 
  FileText, 
  Phone, 
  MapPin, 
  MessageSquare, 
  ArrowLeft,
  ChevronRight,
  Database,
  Activity,
  Sliders,
  AlertTriangle,
  Star,
  Cloud,
  Globe,
  Copy,
  Check,
  Server,
  Terminal
} from 'lucide-react';
import { isSupabaseConfigured, checkSupabaseConnection, SupabaseService } from '../../lib/supabaseClient';

export default function AdminPortalView({
  adminAuth,
  kycRequests,
  setKycRequests,
  companions,
  setCompanions,
  requests,
  setRequests,
  onExitToConsumer,
  onLogout,
  onShowToast
}) {
  const [adminTab, setAdminTab] = useState('vault'); // 'vault' | 'moderation' | 'safety_ai' | 'escrow' | 'audit_log'
  const [vaultSearch, setVaultSearch] = useState('');
  const [selectedKycDoc, setSelectedKycDoc] = useState(null); // Document inspector modal
  const [rejectionReason, setRejectionReason] = useState('Image unreadable or blurred');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [activeRejectTarget, setActiveRejectTarget] = useState(null);

  // Cloud & Supabase / Vercel State
  const [cloudStatus, setCloudStatus] = useState(null);
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestCloudConnection = async () => {
    setIsTestingCloud(true);
    try {
      const res = await checkSupabaseConnection();
      setCloudStatus(res);
      if (res.connected) {
        onShowToast('Supabase connection healthy and active!', 'success');
      } else {
        onShowToast(res.reason || res.error || 'Running in AntiVibe local sync mode', 'info');
      }
    } catch (err) {
      setCloudStatus({ connected: false, error: err.message });
      onShowToast('Supabase check failed: ' + err.message, 'error');
    } finally {
      setIsTestingCloud(false);
    }
  };

  const handleCopySchemaSql = () => {
    const sqlInstruction = `-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql):
-- See root file: supabase_schema.sql in the project`;
    navigator.clipboard.writeText(sqlInstruction);
    setCopiedSql(true);
    onShowToast('Copied schema instruction to clipboard! Open Supabase SQL editor to run supabase_schema.sql', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'log_1',
      time: '10 mins ago',
      operator: adminAuth.operatorName,
      action: 'KYC_APPROVE',
      target: 'Pooja Hegde (Aadhaar: XXXX-XXXX-9932)',
      details: 'Aadhaar Verified Shield granted. OCR Confidence: 98.4%'
    },
    {
      id: 'log_2',
      time: '35 mins ago',
      operator: 'Automated AI Sentinel',
      action: 'FLAG_CONTENT',
      target: 'Chat #RM-8491 (Off-platform contact attempt)',
      details: 'Suspicious phone number exchange detected prior to booking voucher.'
    },
    {
      id: 'log_3',
      time: '1 hour ago',
      operator: adminAuth.operatorName,
      action: 'ESCROW_RELEASE',
      target: 'Batch #BK-9482 (₹2,800)',
      details: 'Hangout completed successfully. Escrow released to Arjun Mehta.'
    }
  ]);

  // Handle KYC Approval
  const handleApproveKyc = (id) => {
    const target = kycRequests.find(k => k.id === id);
    setKycRequests(prev => prev.map(k => k.id === id ? { ...k, status: 'verified' } : k));
    
    // Add to Audit Log
    const newLog = {
      id: `log_${Date.now()}`,
      time: 'Just now',
      operator: adminAuth.operatorName,
      action: 'KYC_APPROVE',
      target: `${target?.userName || 'Applicant'} (${target?.aadhaarNumber || 'Aadhaar'})`,
      details: 'Audit passed. Issued green Aadhaar Verified Shield.'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    onShowToast(`Applicant ${target?.userName} approved and verified.`, 'success');
  };

  // Open Reject Modal
  const handleInitiateReject = (id) => {
    setActiveRejectTarget(id);
    setIsRejectModalOpen(true);
  };

  // Confirm Reject
  const handleConfirmReject = () => {
    if (!activeRejectTarget) return;
    const target = kycRequests.find(k => k.id === activeRejectTarget);

    setKycRequests(prev => prev.map(k => k.id === activeRejectTarget ? { 
      ...k, 
      status: 'rejected',
      rejectReason: rejectionReason 
    } : k));

    const newLog = {
      id: `log_${Date.now()}`,
      time: 'Just now',
      operator: adminAuth.operatorName,
      action: 'KYC_REJECT',
      target: `${target?.userName || 'Applicant'} (${target?.aadhaarNumber || 'Aadhaar'})`,
      details: `Application rejected. Reason: ${rejectionReason}`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    setIsRejectModalOpen(false);
    setActiveRejectTarget(null);
    onShowToast(`Application rejected. Notification sent to companion.`, 'info');
  };

  // Suspend Companion Handler
  const handleToggleSuspendCompanion = (compId) => {
    setCompanions(prev => prev.map(c => {
      if (c.id === compId) {
        const nextState = !c.isSuspended;
        onShowToast(
          nextState ? `Account suspended for ${c.name}. Profile hidden from feed.` : `Account reinstated for ${c.name}.`,
          nextState ? 'error' : 'success'
        );
        return { ...c, isSuspended: nextState };
      }
      return c;
    }));
  };

  // Remove Flagged Activity Request
  const handleRemoveFlaggedRequest = (reqId) => {
    setRequests(prev => prev.filter(r => r.id !== reqId));
    onShowToast('Flagged activity request removed from public feed.', 'info');
  };

  const filteredKyc = kycRequests.filter(k => {
    if (!vaultSearch.trim()) return true;
    const q = vaultSearch.toLowerCase();
    return (
      k.userName?.toLowerCase().includes(q) ||
      k.city?.toLowerCase().includes(q) ||
      k.phone?.toLowerCase().includes(q) ||
      k.aadhaarNumber?.toLowerCase().includes(q)
    );
  });

  const pendingKycCount = kycRequests.filter(k => k.status === 'pending').length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      color: 'var(--text-main)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Administrative Top Bar */}
      <header style={{
        background: '#0f172a',
        color: '#f8fafc',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Brand & Security Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <ShieldCheck size={18} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>FindCo Trust & Safety</span>
                <span style={{
                  fontSize: '0.65rem',
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: 'var(--color-gold)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontWeight: 800
                }}>
                  STAFF CONSOLE
                </span>
              </div>
            </div>
          </div>

          <div style={{
            height: 24,
            width: 1,
            background: 'rgba(255, 255, 255, 0.15)',
            margin: '0 4px'
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.74rem',
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            <span>Encrypted Session: Active</span>
          </div>
        </div>

        {/* Right Actions & Operator Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Operator Profile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)'
          }}>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: '#38bdf8',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.74rem'
            }}>
              TD
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
                {adminAuth.operatorName}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                {adminAuth.role}
              </div>
            </div>
          </div>

          {/* Switch to Consumer Site */}
          <button
            type="button"
            onClick={onExitToConsumer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#e2e8f0',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            <ArrowLeft size={14} />
            Consumer Site
          </button>

          {/* Lock & Log Out */}
          <button
            type="button"
            onClick={onLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(225, 29, 72, 0.15)',
              border: '1px solid rgba(225, 29, 72, 0.35)',
              color: '#fda4af',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            <LogOut size={14} />
            Lock Console
          </button>
        </div>
      </header>

      {/* Admin Body Container */}
      <div style={{
        maxWidth: 1320,
        width: '100%',
        margin: '0 auto',
        padding: '24px 20px 80px 20px',
        flex: 1
      }}>
        
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 24,
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 12,
          overflowX: 'auto'
        }}>
          {[
            { id: 'vault', label: 'Aadhaar Identity Vault', count: pendingKycCount, icon: ShieldCheck },
            { id: 'moderation', label: 'User & Companion Directory', count: companions.length, icon: UserCheck },
            { id: 'safety_ai', label: 'AI Safety & Flagged Chats', count: 3, icon: ShieldAlert },
            { id: 'escrow', label: 'Platform Revenue & Escrow', count: null, icon: Coins },
            { id: 'cloud_infra', label: 'Supabase & Vercel Cloud', count: isSupabaseConfigured ? 'LIVE' : 'LOCAL', icon: Cloud },
            { id: 'audit_log', label: 'Immutable Audit Trail', count: auditLogs.length, icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAdminTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--color-primary-bg)' : 'transparent',
                  color: isActive ? 'var(--color-primary-text)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} color={isActive ? 'var(--color-primary-hover)' : 'currentColor'} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--color-primary)' : 'var(--bg-elevated)',
                    color: isActive ? '#000' : 'var(--text-muted)'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: AADHAAR IDENTITY VAULT */}
        {adminTab === 'vault' && (
          <div>
            {/* Metric KPI Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 24
            }}>
              <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Pending Audits</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-gold)' }}>
                  {pendingKycCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-emerald)', marginTop: 4 }}>
                  Target SLA: ≤ 30 mins
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Verified Buddies</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-emerald)' }}>
                  {kycRequests.filter(k => k.status === 'verified').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Zero public identity leaks
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Rejection / Fraud Rate</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-rose)' }}>
                  4.2%
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Filtered forged submissions
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Vault Encryption</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-sky)', marginTop: 4 }}>
                  AES-256
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  UIDAI compliant redaction
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 20,
              flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text"
                  placeholder="Search by applicant name, city, phone, Aadhaar..."
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

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Showing <strong>{filteredKyc.length}</strong> submitted dossiers
              </div>
            </div>

            {/* Application Records Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredKyc.map(app => (
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
                  {/* Applicant Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ShieldCheck size={26} color={app.status === 'verified' ? 'var(--color-emerald)' : 'var(--color-primary)'} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{app.userName}</span>
                        <span className={`badge-tag ${app.status === 'verified' ? 'badge-tag-emerald' : app.status === 'rejected' ? 'badge-tag-rose' : 'badge-tag-amber'}`}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} /> {app.city}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={13} /> {app.phone}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Lock size={13} /> Masked Aadhaar: <strong>{app.aadhaarNumber}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document Previews */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                      <img 
                        src={app.frontImage} 
                        alt="Front Side" 
                        loading="lazy"
                        decoding="async"
                        onClick={() => setSelectedKycDoc({ url: app.frontImage, title: `${app.userName} - Front Side Photo` })}
                        style={{
                          width: 88,
                          height: 54,
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'cover',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer'
                        }}
                        title="Click to zoom inspect"
                      />
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Front View</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <img 
                        src={app.backImage} 
                        alt="Back Side" 
                        loading="lazy"
                        decoding="async"
                        onClick={() => setSelectedKycDoc({ url: app.backImage, title: `${app.userName} - Back Side Photo` })}
                        style={{
                          width: 88,
                          height: 54,
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'cover',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer'
                        }}
                        title="Click to zoom inspect"
                      />
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Back View</div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    {app.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveKyc(app.id)}
                          className="btn-primary"
                          style={{
                            padding: '8px 18px',
                            fontSize: '0.84rem',
                            background: 'var(--color-emerald)',
                            color: '#fff',
                            gap: 6
                          }}
                        >
                          <CheckCircle2 size={16} />
                          Approve & Issue Shield
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiateReject(app.id)}
                          className="btn-secondary"
                          style={{
                            padding: '8px 14px',
                            fontSize: '0.84rem',
                            color: 'var(--color-rose)',
                            gap: 6
                          }}
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    )}

                    {app.status === 'verified' && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--color-emerald)',
                        fontSize: '0.84rem',
                        fontWeight: 700
                      }}>
                        <CheckCircle2 size={18} />
                        Verified Active
                      </span>
                    )}

                    {app.status === 'rejected' && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--color-rose)',
                        fontSize: '0.84rem',
                        fontWeight: 700
                      }}>
                        <XCircle size={18} />
                        Rejected: {app.rejectReason || 'Non-compliant document'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: USER & COMPANION DIRECTORY */}
        {adminTab === 'moderation' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Platform Directory & Suspension Controls</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Review active companionship profiles, toggle account suspensions, and monitor community health.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {companions.map(comp => (
                <div 
                  key={comp.id}
                  className="glass-panel"
                  style={{
                    padding: '20px 24px',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16,
                    opacity: comp.isSuspended ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <img 
                      src={comp.avatar} 
                      alt={comp.name} 
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--border-subtle)'
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{comp.name}</span>
                        {comp.isAadhaarVerified && (
                          <span title="Aadhaar Verified">
                            <ShieldCheck size={16} color="var(--color-emerald)" />
                          </span>
                        )}
                        {comp.isSuspended ? (
                          <span className="badge-tag-rose">SUSPENDED</span>
                        ) : (
                          <span className="badge-tag-emerald">ACTIVE</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span>{comp.city} • {comp.area}</span>
                        <span>•</span>
                        <span>Rate: <strong className="tabular-nums">₹{comp.hourlyRate}</strong>/hr</span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          Rating: <strong className="tabular-nums">{comp.rating}</strong>
                          <Star size={11} fill="var(--color-gold)" color="var(--color-gold)" />
                          <span className="tabular-nums">({comp.reviewsCount} reviews)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleSuspendCompanion(comp.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: comp.isSuspended ? 'var(--color-emerald-bg)' : 'var(--color-rose-bg)',
                        color: comp.isSuspended ? 'var(--color-emerald)' : 'var(--color-rose)',
                        border: `1px solid ${comp.isSuspended ? 'rgba(5, 150, 105, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`,
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {comp.isSuspended ? 'Reinstate Companion' : 'Suspend Account'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AI SAFETY & FLAGGED CHATS */}
        {adminTab === 'safety_ai' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Platonic AI Guardian Incident Queue</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Real-time safety triggers flagged by NLP filters scanning for off-platform payment solicitations, phone exchanges, or inappropriate requests.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  id: 'inc_1',
                  severity: 'high',
                  flagType: 'Off-Platform Settlement Solicitation',
                  users: 'Kunal R. → Ananya Sen',
                  snippet: '"Hey, can we skip the FindCo app booking fee and pay cash directly during our meetup?"',
                  time: '18 mins ago',
                  recommendation: 'Issue Policy Warning strike to Kunal R.'
                },
                {
                  id: 'inc_2',
                  severity: 'critical',
                  flagType: 'Platonic Violation Alert',
                  users: 'Anonymous Client → Priya Sharma',
                  snippet: '"Do you offer private hotel room visits for dinner companionship?"',
                  time: '42 mins ago',
                  recommendation: 'Immediate Account Ban (Non-platonic violation).'
                },
                {
                  id: 'inc_3',
                  severity: 'medium',
                  flagType: 'Unverified Phone Number Exchange',
                  users: 'Rohan V. → Kabir Kapoor',
                  snippet: '"Call me on +91 99301 22891 to coordinate the roadtrip departure."',
                  time: '2 hours ago',
                  recommendation: 'Warn user to keep logistics inside FindCo chat until voucher confirmed.'
                }
              ].map(inc => (
                <div 
                  key={inc.id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)',
                    borderLeft: `4px solid ${inc.severity === 'critical' ? 'var(--color-rose)' : inc.severity === 'high' ? 'var(--color-gold)' : 'var(--color-sky)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`badge-tag ${inc.severity === 'critical' ? 'badge-tag-rose' : inc.severity === 'high' ? 'badge-tag-amber' : 'badge-tag-sky'}`}>
                        {inc.severity.toUpperCase()} SEVERITY
                      </span>
                      <strong style={{ fontSize: '0.94rem' }}>{inc.flagType}</strong>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{inc.time}</span>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Involved Parties: <strong>{inc.users}</strong>
                  </div>

                  <div style={{
                    background: 'var(--bg-elevated)',
                    border: '1px dashed var(--border-subtle)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.86rem',
                    fontStyle: 'italic',
                    color: 'var(--text-main)',
                    marginBottom: 14
                  }}>
                    {inc.snippet}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-gold)' }}>
                      Recommended Action: {inc.recommendation}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => onShowToast('Disciplinary warning notice sent to client.', 'info')}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        Issue Warning
                      </button>
                      <button
                        type="button"
                        onClick={() => onShowToast('Client banned permanently for policy breach.', 'error')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-rose)',
                          color: '#fff',
                          border: 'none',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Permanent Ban
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PLATFORM ESCROW & REVENUE */}
        {adminTab === 'escrow' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Platform Financials & Escrow Ledger</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Real-time tracking of Razorpay subscription fees, escrow held during ongoing hangouts, and disbursed companion earnings.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
              marginBottom: 24
            }}>
              <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Total Platform Gross (MTD)</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-gold)' }}>
                  ₹2,84,500
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-emerald)', marginTop: 4 }}>
                  ↑ 24% growth over last week
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Active Escrow Held</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-sky)' }}>
                  ₹48,200
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Across 32 confirmed bookings
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Pass Subscriptions Sold</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-emerald)' }}>
                  1,842
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  ₹49 Week Pass is top seller
                </div>
              </div>
            </div>

            {/* Recent Settlements */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 14 }}>Live Escrow Payout Queue</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: 'tx_1', companion: 'Arjun Mehta', amount: 2800, client: 'Vikram S.', status: 'Pending Completion Review', time: 'Today 5:00 PM' },
                  { id: 'tx_2', companion: 'Priya Sharma', amount: 1800, client: 'Riya K.', status: 'Settled & Paid', time: 'Today 3:20 PM' },
                  { id: 'tx_3', companion: 'Ananya Sen', amount: 2500, client: 'Aman D.', status: 'Settled & Paid', time: 'Yesterday' }
                ].map(tx => (
                  <div 
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div>
                      <strong>{tx.companion}</strong> ← {tx.client}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tx.time}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: 'var(--color-gold)' }}>₹{tx.amount}</strong>
                      <div style={{ fontSize: '0.72rem', color: tx.status.includes('Settled') ? 'var(--color-emerald)' : 'var(--color-primary-text)' }}>
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SUPABASE & VERCEL CLOUD INFRASTRUCTURE */}
        {adminTab === 'cloud_infra' && (
          <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Cloud size={22} color="var(--color-primary)" />
                  Supabase Backend & Vercel Deployment Console
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Manage the live cloud database, PostgreSQL real-time websockets, and Vercel edge deployment status for FindCo.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleTestCloudConnection}
                  disabled={isTestingCloud}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <RefreshCw size={14} className={isTestingCloud ? 'animate-spin' : ''} />
                  <span>{isTestingCloud ? 'Pinging Cloud...' : 'Test Supabase Connection'}</span>
                </button>
              </div>
            </div>

            {/* Cloud Status Overview Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
              marginBottom: 24
            }}>
              {/* Card 1: Vercel Edge Status */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Globe size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Vercel Edge Network</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Project: findco (swachta)</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: 20, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
                    ● LIVE & SERVING
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Production URL:
                  <div style={{ marginTop: 4 }}>
                    <a 
                      href="https://findco-sage.vercel.app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                    >
                      <span>https://findco-sage.vercel.app</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Preview: <a href="https://findco-73pllyc7b-swachta.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>findco-73pllyc7b-swachta.vercel.app</a>
                </div>
              </div>

              {/* Card 2: Supabase Database Status */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(5, 150, 105, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                      <Database size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Supabase PostgreSQL</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Realtime + RLS Enclave</span>
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '3px 8px', 
                    borderRadius: 20, 
                    background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                    color: isSupabaseConfigured ? '#10b981' : 'var(--color-gold)', 
                    fontWeight: 700 
                  }}>
                    {isSupabaseConfigured ? '● CLOUD ACTIVE' : '● ANTIVIBE LOCAL SYNC'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Status: <strong>{cloudStatus?.message || (isSupabaseConfigured ? 'Ready to sync' : 'Operating in resilient local offline storage')}</strong>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Client Engine: <code style={{ color: 'var(--color-primary)' }}>src/lib/supabaseClient.js</code>
                </div>
              </div>

              {/* Card 3: Cryptographic Trust Ledger */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                      <Server size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Hallmark Table</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>public.hallmark_credentials</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: 20, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 700 }}>
                    SHA-256 SYNC
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  UIDAI Enclave Records & Police Clearance hashes validated on each companion match.
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Dual-Handshake Escrow PIN: <strong>Active</strong>
                </div>
              </div>
            </div>

            {/* Supabase Schema SQL & Migration Guide */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Terminal size={18} color="var(--color-primary)" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Supabase PostgreSQL Schema (supabase_schema.sql)</h3>
                </div>
                <button
                  type="button"
                  onClick={handleCopySchemaSql}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {copiedSql ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedSql ? 'Copied Instruction!' : 'Copy SQL Path'}</span>
                </button>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                A complete SQL setup is generated in the project root as <code style={{ color: 'var(--color-primary)' }}>supabase_schema.sql</code>. It creates all tables (companions, activity_requests, bookings, chat_messages, hallmark_credentials), Row Level Security (RLS) policies, and Realtime websocket publications.
              </p>

              <div style={{ background: '#0a0e17', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-subtle)', fontFamily: 'monospace', fontSize: '0.76rem', color: '#94a3b8', overflowX: 'auto' }}>
                <div style={{ color: '#38bdf8', marginBottom: 4 }}>-- To run in Supabase SQL Editor:</div>
                <div>1. Log into your Supabase Dashboard: https://supabase.com/dashboard</div>
                <div>2. Select your Project → SQL Editor → New query</div>
                <div>3. Paste contents of <span style={{ color: '#f59e0b' }}>supabase_schema.sql</span> and click "Run"</div>
                <div>4. Copy Project URL and Anon Public Key into <span style={{ color: '#10b981' }}>.env.local</span></div>
              </div>
            </div>

            {/* Environment Variables Sync Card */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>
                Connecting Supabase Credentials with Vercel Production
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                To link your Supabase database with the live Vercel deployment at <a href="https://findco-sage.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>findco-sage.vercel.app</a>, add the following variables:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 16 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>VARIABLE 1</div>
                  <code style={{ fontSize: '0.84rem', color: 'var(--color-primary)', fontWeight: 700 }}>VITE_SUPABASE_URL</code>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>e.g. https://your-project.supabase.co</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>VARIABLE 2</div>
                  <code style={{ fontSize: '0.84rem', color: 'var(--color-primary)', fontWeight: 700 }}>VITE_SUPABASE_ANON_KEY</code>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6...</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                CLI Command to sync:
                <code style={{ display: 'block', background: '#0a0e17', padding: '10px 14px', borderRadius: 8, marginTop: 6, color: '#38bdf8' }}>
                  vercel env add VITE_SUPABASE_URL production,preview,development
                </code>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT TRAIL */}
        {adminTab === 'audit_log' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Immutable Administrative Event Stream</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Every action taken by Trust & Safety personnel is recorded with operator identification and timestamp for compliance under Indian cyber regulations.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {auditLogs.map(log => (
                <div 
                  key={log.id}
                  className="glass-panel"
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14
                  }}
                >
                  <Activity size={18} color="var(--color-sky)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge-tag-sky" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                          {log.action}
                        </span>
                        <strong style={{ fontSize: '0.88rem' }}>{log.target}</strong>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.time}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      {log.details}
                    </p>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Operator: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{log.operator}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Document Inspector Modal */}
      {selectedKycDoc && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4000,
          padding: 20
        }}>
          <div style={{
            maxWidth: 680,
            width: '100%',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedKycDoc.title}</h4>
              <button 
                type="button" 
                onClick={() => setSelectedKycDoc(null)}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
              >
                Close
              </button>
            </div>
            <div style={{ padding: 20, textAlign: 'center', background: '#000' }}>
              <img 
                src={selectedKycDoc.url} 
                alt="Enlarged Document"
                style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {isRejectModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4000,
          padding: 20
        }}>
          <div style={{
            maxWidth: 480,
            width: '100%',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 8, color: 'var(--color-rose)' }}>
              Reject Aadhaar Verification
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Select the compliance reason for rejecting this document submission. The companion will be asked to re-upload.
            </p>

            <div style={{ marginBottom: 20 }}>
              {[
                'Image unreadable, cropped, or blurred',
                'Name on Aadhaar does not match FindCo profile',
                'Submitted document is not a valid government Aadhaar card',
                'Four corners of document are cut off or tampered'
              ].map(reason => (
                <label 
                  key={reason}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: rejectionReason === reason ? 'var(--color-primary-bg)' : 'transparent',
                    cursor: 'pointer',
                    marginBottom: 6,
                    fontSize: '0.82rem'
                  }}
                >
                  <input 
                    type="radio"
                    name="reject-reason"
                    checked={rejectionReason === reason}
                    onChange={() => setRejectionReason(reason)}
                    style={{ accentColor: 'var(--color-rose)' }}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-rose)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer'
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
