import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, Share2, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured, SupabaseService } from '../lib/supabaseClient';

export default function EmergencySosModal({
  isOpen,
  onClose,
  activeBooking = null,
  userProfile = null,
  safetyEnclave = null,
  onShowToast
}) {
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [isLoggedToCloud, setIsLoggedToCloud] = useState(false);

  const guardianName = safetyEnclave?.emergencyContactName || 'Guardian';
  const rawPhone = safetyEnclave?.emergencyContactPhone || '112';
  const cleanGuardianPhone = rawPhone.replace(/\D/g, '') || '112';
  const venue = activeBooking?.venue || 'Active Meetup Location';
  const companionName = activeBooking?.partnerName || 'Assigned Companion';

  // Automatically request GPS position when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.geolocation) {
      setGpsLoading(true);
      setGpsError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLoading(false);
          setGpsLocation({
            lat: pos.coords.latitude.toFixed(5),
            lng: pos.coords.longitude.toFixed(5)
          });
        },
        (err) => {
          setGpsLoading(false);
          setGpsError(err.message || 'Location access unavailable');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    } else {
      setGpsError('Geolocation is not supported by your browser');
    }

    // Lock body scroll while emergency modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const locString = gpsLocation
    ? `https://maps.google.com/?q=${gpsLocation.lat},${gpsLocation.lng}`
    : `Venue: ${venue}`;

  const sosBody = encodeURIComponent(
    `🚨 CRITICAL EMERGENCY SOS - FindCo Safety Alert!\n` +
    `I am on a meetup and need immediate help.\n` +
    `My Venue: ${venue}\n` +
    `Companion: ${companionName}\n` +
    `Live GPS Link: ${locString}\n` +
    `Timestamp: ${new Date().toLocaleTimeString('en-IN')}\n` +
    `Please dispatch help immediately!`
  );

  const handleCloudIncidentLog = async () => {
    if (isSupabaseConfigured && !isLoggedToCloud) {
      try {
        await SupabaseService.createSupportTicket({
          id: `sos_${Date.now()}`,
          category: 'safety',
          priority: 'emergency',
          subject: `CRITICAL SOS DISPATCH: ${companionName} @ ${venue}`,
          message: `User triggered Emergency SOS. GPS: ${gpsLocation ? `${gpsLocation.lat},${gpsLocation.lng}` : 'Pending'}. Guardian: ${guardianName} (${cleanGuardianPhone}). Venue: ${venue}.`
        });
        setIsLoggedToCloud(true);
      } catch (err) {
        console.warn('[SOS Incident Logging Fallback]', err);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          maxWidth: 480,
          width: '100%',
          padding: 24,
          border: '2px solid #dc2626',
          boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.45)',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2
                id="sos-modal-title"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: '#dc2626',
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}
              >
                CRITICAL EMERGENCY SOS
              </h2>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Instant Dispatch to Police & Emergency Contacts
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close emergency modal"
            style={{
              border: 'none',
              background: '#f1f5f9',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* GPS Live Telemetry Pill */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#334155' }}>
              <MapPin size={15} color={gpsLocation ? '#059669' : '#dc2626'} />
              Live Geolocation Beacon
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 6,
                background: gpsLocation ? '#ecfdf5' : '#fef2f2',
                color: gpsLocation ? '#059669' : '#dc2626'
              }}
            >
              {gpsLoading ? 'Acquiring GPS...' : gpsLocation ? `Locked: ${gpsLocation.lat}, ${gpsLocation.lng}` : 'Using Venue'}
            </span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 5 }}>
            Active Venue: <strong style={{ color: '#0f172a' }}>{venue}</strong> · Companion: <strong style={{ color: '#0f172a' }}>{companionName}</strong>
          </div>
        </div>

        {/* Direct Emergency Dispatch Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {/* 1. National Police 112 Direct Dial */}
          <a
            href="tel:112"
            onClick={handleCloudIncidentLog}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: 12,
              background: '#dc2626',
              color: '#ffffff',
              fontWeight: 800,
              textDecoration: 'none',
              fontSize: '0.94rem',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Phone size={18} />
              Call National Emergency Police (112)
            </span>
            <span style={{ background: 'rgba(255,255,255,0.22)', padding: '3px 8px', borderRadius: 6, fontSize: '0.74rem' }}>
              1-Tap Call
            </span>
          </a>

          {/* 2. Women's Safety Helpline 1091 */}
          <a
            href="tel:1091"
            onClick={handleCloudIncidentLog}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 12,
              background: '#be123c',
              color: '#ffffff',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.88rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldAlert size={17} />
              Women Safety Helpline (1091)
            </span>
            <span style={{ background: 'rgba(255,255,255,0.22)', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem' }}>
              1-Tap Call
            </span>
          </a>

          {/* 3. Guardian WhatsApp Dispatch with GPS coordinates */}
          <a
            href={`https://wa.me/${cleanGuardianPhone}?text=${sosBody}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              handleCloudIncidentLog();
              if (onShowToast) onShowToast(`SOS WhatsApp alert generated for ${guardianName}!`, 'success');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 12,
              background: '#16a34a',
              color: '#ffffff',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.88rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Share2 size={17} />
              Send Live GPS WhatsApp to {guardianName}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.22)', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem' }}>
              WhatsApp
            </span>
          </a>

          {/* 4. Native Emergency SMS fallback */}
          <a
            href={`sms:${cleanGuardianPhone}?body=${sosBody}`}
            onClick={() => {
              handleCloudIncidentLog();
              if (onShowToast) onShowToast(`SOS SMS prepared for ${guardianName}!`, 'info');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 16px',
              borderRadius: 12,
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.84rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Phone size={15} />
              Send Emergency SMS to {guardianName}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 6, fontSize: '0.7rem' }}>
              SMS
            </span>
          </a>
        </div>

        {/* Cancel */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            color: '#64748b',
            borderRadius: 10,
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Cancel (Accidental Tap)
        </button>
      </div>
    </div>
  );
}

