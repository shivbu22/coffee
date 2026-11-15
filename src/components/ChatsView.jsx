import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Send, 
  MapPin, 
  ShieldCheck, 
  CheckCheck, 
  CheckCircle2, 
  Clock, 
  X,
  Receipt,
  ArrowLeft,
  Search,
  Info,
  Calendar,
  Lock,
  AlertTriangle,
  Copy,
  Check,
  Award,
  Paperclip,
  Star,
  Coffee,
  Image as ImageIcon,
  RefreshCw,
  Eye,
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { isSupabaseConfigured, SupabaseService } from '../lib/supabaseClient';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import SafeAvatar from './SafeAvatar';
import EmergencySosModal from './EmergencySosModal';

/**
 * Client-side Canvas Image Compression
 * Scales to max 1200x1200px and compresses to JPEG 75% quality.
 * Prevents mobile memory crashes and optimizes network socket payloads.
 */
async function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid image file'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        // Prevent black background on transparent PNG/WebP conversions to JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          width,
          height,
          originalName: file.name,
          sizeBytes: Math.round(dataUrl.length * 0.75)
        });
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * 5-stage Enterprise Message Status Indicator
 * Lifecycle: sending (clock) -> sent (single tick) -> delivered (double tick) -> read (double cyan tick) -> failed (retry)
 */
function MessageDeliveryStatus({ status, onRetry }) {
  if (status === 'sending' || status === 'queued') {
    return (
      <span title="Queued / Sending..." style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.85 }}>
        <Clock size={11} />
      </span>
    );
  }
  if (status === 'sent') {
    return (
      <span title="Sent to server" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Check size={12} color="rgba(255, 255, 255, 0.75)" />
      </span>
    );
  }
  if (status === 'delivered') {
    return (
      <span title="Delivered to recipient" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <CheckCheck size={13} color="rgba(255, 255, 255, 0.9)" />
      </span>
    );
  }
  if (status === 'read') {
    return (
      <span title="Read by recipient" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <CheckCheck size={13} color="#38bdf8" />
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onRetry) onRetry();
        }}
        title="Failed to deliver. Click to retry."
        style={{
          background: 'rgba(239, 68, 68, 0.3)',
          border: '1px solid #f87171',
          color: '#fee2e2',
          borderRadius: 4,
          padding: '1px 5px',
          fontSize: '0.62rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3
        }}
      >
        <AlertTriangle size={10} color="#fca5a5" />
        Retry
      </button>
    );
  }
  return <CheckCheck size={13} color="rgba(255, 255, 255, 0.9)" />;
}

export default function ChatsView({ 
  chats, 
  setChats, 
  activeRoomId, 
  setActiveRoomId, 
  role, 
  onShowToast,
  onOpenHallmark,
  onAddBooking
}) {
  const isOnline = useNetworkStatus();
  const [selectedRoomId, setSelectedRoomId] = useState(activeRoomId || (chats[0]?.id || 'room_1'));
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false); // Collapsible companion dossier
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'unread' | 'quotes' | 'active'
  const [copiedPin, setCopiedPin] = useState(false);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);

  // Enterprise Chat UI State
  const [offerHours, setOfferHours] = useState('2');
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [customVenueName, setCustomVenueName] = useState('');
  const [customVenueAddress, setCustomVenueAddress] = useState('');
  const fileInputRef = useRef(null);
  const messageTimestampsRef = useRef([]);

  // Quick icebreaker suggestion chips
  const quickChips = [
    { label: 'Indiranagar works great for me!', icon: Coffee },
    { label: 'Share venue Google Maps link', icon: MapPin },
    { label: 'What is our safety handshake PIN?', icon: Lock },
    { label: 'Can we shift the time to 3:30 PM?', icon: Clock }
  ];

  // Offer form state
  const [offerTitle, setOfferTitle] = useState('');
  const [offerAmount, setOfferAmount] = useState('800');
  const [offerBillingType, setOfferBillingType] = useState('trip');
  const [offerVenue, setOfferVenue] = useState('Third Wave Coffee, 12th Main Indiranagar');
  const [offerDateTime, setOfferDateTime] = useState('Saturday • 3:00 PM - 5:00 PM');
  const [offerTerms, setOfferTerms] = useState('Includes visiting 2 roasteries, guide through bean profiles, and high-res cafe portrait photos.');

  const messagesEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === selectedRoomId) || chats[0];

  useEffect(() => {
    if (activeRoomId && activeRoomId !== selectedRoomId) {
      setSelectedRoomId(activeRoomId);
    }
  }, [activeRoomId, selectedRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isTyping]);

  // Realtime subscription for live messages & Read Receipts (Cross-tab resilient)
  useEffect(() => {
    if (!isSupabaseConfigured || !selectedRoomId) return;
    const unsubscribe = SupabaseService.subscribeToRoom(selectedRoomId, (incoming) => {
      setChats(prev => prev.map(c => {
        if (c.id === selectedRoomId) {
          // If this is an UPDATE event (e.g. read receipt update)
          if (incoming._isUpdate) {
            return {
              ...c,
              messages: c.messages.map(m => m.id === incoming.id ? { ...m, status: incoming.status || 'read', isRead: true } : m)
            };
          }

          // Deduplicate by message ID or client_temp_id to support cross-tab sync
          if (c.messages.some(m => m.id === incoming.id || (m.clientTempId && m.clientTempId === incoming.client_temp_id))) {
            return c;
          }
          return {
            ...c,
            messages: [...c.messages, {
              id: incoming.id,
              clientTempId: incoming.client_temp_id,
              sender: incoming.sender_role === role ? 'me' : 'other',
              text: incoming.text,
              mediaType: incoming.media_type,
              mediaUrl: incoming.media_url,
              mediaMetadata: incoming.media_metadata,
              locationData: incoming.location_data,
              time: new Date(incoming.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isRead: true,
              status: incoming.status || 'delivered'
            }],
            lastMessageTime: 'Just now'
          };
        }
        return c;
      }));
    });
    return () => unsubscribe();
  }, [selectedRoomId, role, setChats]);

  // Offline Outbox Queue Drainer: Sequentially flushes when device comes back online
  useEffect(() => {
    if (!isOnline) return;
    let isCancelled = false;

    const drainQueue = async () => {
      try {
        const raw = localStorage.getItem('findco_offline_chat_queue_v1');
        if (!raw) return;
        const queue = JSON.parse(raw);
        if (!Array.isArray(queue) || queue.length === 0) return;

        let remainingQueue = [...queue];
        let syncedCount = 0;

        for (const item of queue) {
          if (isCancelled) break;
          try {
            if (isSupabaseConfigured) {
              await SupabaseService.sendMessage({
                room_id: item.roomId,
                sender_name: role === 'buddy' ? 'Buddy' : 'Client',
                sender_role: role === 'buddy' ? 'buddy' : 'client',
                text: item.text,
                client_temp_id: item.clientTempId || item.id,
                media_type: item.mediaType,
                media_url: item.mediaUrl,
                media_metadata: item.mediaMetadata,
                location_data: item.locationData
              });
            }

            // Remove successfully sent item from storage queue
            remainingQueue = remainingQueue.filter(q => q.id !== item.id && q.clientTempId !== item.clientTempId);
            localStorage.setItem('findco_offline_chat_queue_v1', JSON.stringify(remainingQueue));
            syncedCount++;

            setChats(prev => prev.map(c => {
              if (c.id === item.roomId) {
                return {
                  ...c,
                  messages: c.messages.map(m => (m.id === item.id || m.clientTempId === item.clientTempId) ? { ...m, status: 'delivered' } : m)
                };
              }
              return c;
            }));
          } catch (itemErr) {
            console.warn('[Offline Queue Item Error]', itemErr);
            // On failure, keep in queue and stop sequential send
            break;
          }
        }

        if (remainingQueue.length === 0) {
          localStorage.removeItem('findco_offline_chat_queue_v1');
        }
        if (syncedCount > 0 && onShowToast) {
          onShowToast(`Back online! Synchronized ${syncedCount} offline message(s).`, 'success');
        }
      } catch (err) {
        console.warn('[Offline Queue Drain] error:', err);
      }
    };

    drainQueue();
    return () => { isCancelled = true; };
  }, [isOnline, role, setChats, onShowToast]);

  // Memoized conversation filtering
  const filteredChats = useMemo(() => {
    return chats.filter(c => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.participant.name?.toLowerCase().includes(q);
        const matchCity = c.participant.city?.toLowerCase().includes(q);
        const matchMsg = c.messages.some(m => m.text?.toLowerCase().includes(q));
        if (!matchName && !matchCity && !matchMsg) return false;
      }

      if (filterCategory === 'unread') {
        return (c.unreadCount || 0) > 0;
      }
      if (filterCategory === 'quotes') {
        return c.messages.some(m => m.isOffer);
      }
      if (filterCategory === 'active') {
        return c.messages.some(m => m.isOffer && m.offerData?.status === 'accepted');
      }
      return true;
    });
  }, [chats, searchQuery, filterCategory]);

  const handleSendMessage = (textToSend = null, mediaPayload = null) => {
    const text = textToSend !== null ? textToSend : inputText;
    if ((!text || !text.trim()) && !mediaPayload) return;

    // Rate Limiting: Sliding window (max 5 messages per 3 seconds)
    const now = Date.now();
    messageTimestampsRef.current = messageTimestampsRef.current.filter(t => now - t < 3000);
    if (messageTimestampsRef.current.length >= 5) {
      if (onShowToast) onShowToast("You are sending messages too fast. Please pause for 3 seconds.", "error");
      return;
    }
    messageTimestampsRef.current.push(now);

    const tempId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanText = text ? text.trim().slice(0, 1000) : '';

    const newMsg = {
      id: tempId,
      clientTempId: tempId,
      sender: 'me',
      text: cleanText,
      mediaType: mediaPayload?.mediaType || null,
      mediaUrl: mediaPayload?.mediaUrl || null,
      mediaMetadata: mediaPayload?.mediaMetadata || null,
      locationData: mediaPayload?.locationData || null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      status: isOnline ? 'delivered' : 'queued'
    };

    setChats(prev => prev.map(c => {
      if (c.id === selectedRoomId) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessageTime: 'Just now'
        };
      }
      return c;
    }));

    if (!textToSend && !mediaPayload) setInputText('');

    if (!isOnline) {
      // Store in local outbox queue for reliable delivery once reconnected
      try {
        const queue = JSON.parse(localStorage.getItem('findco_offline_chat_queue_v1') || '[]');
        queue.push({ ...newMsg, roomId: selectedRoomId });
        localStorage.setItem('findco_offline_chat_queue_v1', JSON.stringify(queue));
      } catch (err) {
        console.warn('[Offline Queue] LocalStorage failed:', err);
      }
      if (onShowToast) onShowToast("You are offline. Message queued in local outbox and will deliver automatically when reconnected.", "info");
      return;
    }

    // Sync to Cloudflare D1 backend API if connected
    if (isSupabaseConfigured) {
      SupabaseService.sendMessage({
        room_id: selectedRoomId,
        sender_name: role === 'buddy' ? 'Buddy' : 'Client',
        sender_role: role === 'buddy' ? 'buddy' : 'client',
        text: cleanText,
        client_temp_id: tempId,
        media_type: mediaPayload?.mediaType || null,
        media_url: mediaPayload?.mediaUrl || null,
        media_metadata: mediaPayload?.mediaMetadata || null,
        location_data: mediaPayload?.locationData || null
      }).catch(err => {
        console.warn('[Sync] message delivery fallback:', err);
        setChats(prev => prev.map(c => {
          if (c.id === selectedRoomId) {
            return {
              ...c,
              messages: c.messages.map(m => m.id === tempId ? { ...m, status: 'failed' } : m)
            };
          }
          return c;
        }));
      });
      return;
    }

    // Simulate companion typing and automated reply
    setTimeout(() => {
      setIsTyping(true);
    }, 500);

    setTimeout(() => {
      setIsTyping(false);
      const replyMsg = {
        id: `m_${Date.now() + 1}`,
        sender: 'other',
        text: mediaPayload?.mediaType === 'image'
          ? "That looks incredible! Thanks for sharing the photo."
          : mediaPayload?.mediaType === 'location'
          ? `Perfect meetup spot! I know ${mediaPayload.locationData?.name || 'this venue'} well. See you there!`
          : `Got it! Sounds wonderful. Looking forward to meeting up and making it a memorable session!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: true,
        status: 'delivered'
      };

      setChats(prev => prev.map(c => {
        if (c.id === selectedRoomId) {
          return {
            ...c,
            messages: [...c.messages, replyMsg],
            lastMessageTime: 'Just now'
          };
        }
        return c;
      }));
    }, 1800);
  };

  const handleRetryMessage = (msgToRetry) => {
    if (!isOnline) {
      if (onShowToast) onShowToast('Still offline. Cannot resend message yet.', 'error');
      return;
    }

    setChats(prev => prev.map(c => {
      if (c.id === selectedRoomId) {
        return {
          ...c,
          messages: c.messages.map(m => m.id === msgToRetry.id ? { ...m, status: 'sending' } : m)
        };
      }
      return c;
    }));

    if (isSupabaseConfigured) {
      SupabaseService.sendMessage({
        room_id: selectedRoomId,
        sender_name: role === 'buddy' ? 'Buddy' : 'Client',
        sender_role: role === 'buddy' ? 'buddy' : 'client',
        text: msgToRetry.text,
        client_temp_id: msgToRetry.clientTempId || msgToRetry.id,
        media_type: msgToRetry.mediaType,
        media_url: msgToRetry.mediaUrl,
        media_metadata: msgToRetry.mediaMetadata,
        location_data: msgToRetry.locationData
      }).then(() => {
        setChats(prev => prev.map(c => {
          if (c.id === selectedRoomId) {
            return {
              ...c,
              messages: c.messages.map(m => m.id === msgToRetry.id ? { ...m, status: 'delivered' } : m)
            };
          }
          return c;
        }));
      }).catch(() => {
        setChats(prev => prev.map(c => {
          if (c.id === selectedRoomId) {
            return {
              ...c,
              messages: c.messages.map(m => m.id === msgToRetry.id ? { ...m, status: 'failed' } : m)
            };
          }
          return c;
        }));
      });
    } else {
      setTimeout(() => {
        setChats(prev => prev.map(c => {
          if (c.id === selectedRoomId) {
            return {
              ...c,
              messages: c.messages.map(m => m.id === msgToRetry.id ? { ...m, status: 'delivered' } : m)
            };
          }
          return c;
        }));
      }, 500);
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (onShowToast) onShowToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      if (onShowToast) onShowToast('Image size exceeds 10MB limit.', 'error');
      return;
    }

    try {
      if (onShowToast) onShowToast('Compressing image...', 'info');
      const compressed = await compressImageFile(file, 1200, 1200, 0.75);
      handleSendMessage('', {
        mediaType: 'image',
        mediaUrl: compressed.dataUrl,
        mediaMetadata: {
          width: compressed.width,
          height: compressed.height,
          originalName: compressed.originalName,
          sizeBytes: compressed.sizeBytes
        }
      });
      setShowAttachmentMenu(false);
    } catch (err) {
      console.error('Image compression failed:', err);
      if (onShowToast) onShowToast('Failed to process image. Please try another file.', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleShareVenue = (venue) => {
    handleSendMessage('', {
      mediaType: 'location',
      locationData: {
        name: venue.name,
        address: venue.address,
        mapsUrl: venue.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} ${venue.address}`)}`
      }
    });
    setShowLocationModal(false);
    setShowAttachmentMenu(false);
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    if (!offerAmount || isNaN(offerAmount)) {
      if (onShowToast) onShowToast('Please enter a valid offer amount.', 'error');
      return;
    }

    const offerMessage = {
      id: `m_${Date.now()}`,
      sender: 'me',
      isOffer: true,
      offerData: {
        offerId: `off_${Date.now()}`,
        title: offerTitle || 'Companionship Session',
        amount: Number(offerAmount),
        billingType: offerBillingType,
        hours: Number(offerHours) || 2,
        venue: offerVenue,
        dateTime: offerDateTime,
        terms: offerTerms,
        status: 'pending'
      },
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setChats(prev => prev.map(c => {
      if (c.id === selectedRoomId) {
        return {
          ...c,
          messages: [...c.messages, offerMessage],
          lastMessageTime: 'Just now'
        };
      }
      return c;
    }));

    setShowOfferModal(false);
    if (onShowToast) onShowToast(`Official quote of ₹${offerAmount} sent to ${activeChat.participant.name}!`, 'success');
  };

  const handleAcceptOffer = (offerId) => {
    if (isAcceptingOffer) return;
    setIsAcceptingOffer(true);

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });

    // Retrieve dynamic offer details from the target quote message
    const targetMsg = activeChat?.messages?.find(m => m.isOffer && m.offerData?.offerId === offerId);
    const offerData = targetMsg?.offerData || {};
    const acceptedAmount = Number(offerData.amount) || 800;
    const acceptedVenue = offerData.venue || 'Agreed Public Venue';
    const acceptedHours = Number(offerData.hours) || 2;
    const acceptedDate = offerData.date || 'Saturday';
    const acceptedTime = offerData.time || '03:00 PM';
    const acceptedHourlyRate = Math.round(acceptedAmount / Math.max(1, acceptedHours));

    // Cryptographically isolated 4-digit PIN generated per booking
    const handshakePin = Math.floor(1000 + Math.random() * 9000).toString();

    setChats(prev => prev.map(c => {
      if (c.id === selectedRoomId) {
        const updatedMessages = c.messages.map(m => {
          if (m.isOffer && m.offerData.offerId === offerId) {
            return {
              ...m,
              offerData: {
                ...m.offerData,
                status: 'accepted',
                handshakePin
              }
            };
          }
          return m;
        });

        // Add confirmation message - SECURE: PIN is strictly omitted from plaintext chat
        const confirmMsg = {
          id: `m_${Date.now()}`,
          sender: 'me',
          text: `Proposal accepted! ₹${acceptedAmount} locked in FindCo Escrow Vault. Official safety voucher issued to client booking pass. Looking forward to ${acceptedDate}!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true,
          status: 'delivered'
        };

        return {
          ...c,
          messages: [...updatedMessages, confirmMsg],
          lastMessageTime: 'Just now'
        };
      }
      return c;
    }));

    if (onAddBooking) {
      onAddBooking({
        id: `book_live_${Date.now()}`,
        title: activeChat?.participant?.name ? `Session with ${activeChat.participant.name}` : 'Specialty Meetup',
        category: 'Cafe & Dining Buddy',
        partnerName: activeChat?.participant?.name || 'Priya Sharma',
        partnerAvatar: activeChat?.participant?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
        partnerCity: activeChat?.participant?.city || 'Bengaluru',
        venue: acceptedVenue,
        dateTime: `${acceptedDate} • ${acceptedTime} (${acceptedHours}h)`,
        amount: acceptedAmount,
        status: 'confirmed',
        handshakePin,
        escrowStatus: 'Escrow Locked'
      });
    }

    if (isSupabaseConfigured) {
      SupabaseService.createBooking({
        client_name: 'You (Client)',
        buddy_name: activeChat?.participant?.name || 'Priya Sharma',
        activity: 'Cafe & Dining Buddy',
        date: acceptedDate,
        time: acceptedTime,
        hours: acceptedHours,
        hourly_rate: acceptedHourlyRate,
        total_amount: acceptedAmount,
        escrow_status: 'LOCKED',
        handshake_pin: handshakePin
      }).catch(err => console.warn('[Cloudflare Sync] booking sync error:', err));
    }

    if (onShowToast) onShowToast(`Quote Accepted! ₹${acceptedAmount} locked in FindCo Escrow Vault. Handshake PIN: ${handshakePin}.`, 'success');

    setTimeout(() => {
      setIsAcceptingOffer(false);
    }, 1200);
  };

  const handleDeclineOffer = (offerId) => {
    setChats(prev => prev.map(c => {
      if (c.id === selectedRoomId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.isOffer && m.offerData.offerId === offerId) {
              return {
                ...m,
                offerData: {
                  ...m.offerData,
                  status: 'declined'
                }
              };
            }
            return m;
          })
        };
      }
      return c;
    }));

    if (onShowToast) onShowToast('Quote proposal declined.', 'info');
  };

  const handleCopyPin = (pin) => {
    navigator.clipboard?.writeText(pin);
    setCopiedPin(true);
    if (onShowToast) onShowToast(`Handshake PIN ${pin} copied!`, 'success');
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto', padding: '0 0 20px 0' }}>
      
      {/* Outer Card Frame */}
      <div style={{
        borderRadius: 20,
        height: 'calc(100vh - 105px)',
        minHeight: 580,
        display: 'flex',
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)'
      }}>
        
        {/* ======================================================== */}
        {/* 1. LEFT COLUMN: CONVERSATION LIST & SEARCH               */}
        {/* ======================================================== */}
        <div 
          className={showMobileChat ? 'chat-sidebar-mobile-hidden' : ''}
          style={{
            width: 340,
            maxWidth: '100%',
            flexShrink: 0,
            borderRight: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff'
          }}
        >
          {/* Header */}
          <div style={{ padding: '18px 18px 12px 18px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                  Messages
                </h2>
                <span style={{
                  background: '#fff1f2',
                  color: '#e11d48',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 9999
                }}>
                  {chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0)} New
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowOfferModal(true)}
                title="Create a new quote"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  padding: '6px 10px',
                  borderRadius: 10,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer'
                }}
              >
                <Receipt size={14} color="#e11d48" />
                <span>+ Quote</span>
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search messages or buddies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.82rem',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 2
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'quotes', label: 'Quotes' },
                { id: 'active', label: 'Confirmed' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterCategory(f.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 9999,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    border: 'none',
                    background: filterCategory === f.id ? '#0f172a' : '#f1f5f9',
                    color: filterCategory === f.id ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Thread list */}
          <div style={{ flex: 1, overflowY: 'auto' }} role="tablist" aria-label="Conversation threads">
            {filteredChats.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No conversations found matching "{searchQuery}".
              </div>
            ) : (
              filteredChats.map(chat => {
                const isSelected = chat.id === selectedRoomId;
                const lastMsg = chat.messages[chat.messages.length - 1];
                const hasPendingOffer = chat.messages.some(m => m.isOffer && m.offerData?.status === 'pending');
                const hasAcceptedOffer = chat.messages.some(m => m.isOffer && m.offerData?.status === 'accepted');

                return (
                  <button
                    type="button"
                    key={chat.id}
                    onClick={() => {
                      setSelectedRoomId(chat.id);
                      if (setActiveRoomId) setActiveRoomId(chat.id);
                      setShowMobileChat(true);
                      // Reset unread count locally and sync read receipts
                      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
                      if (isSupabaseConfigured) {
                        SupabaseService.markMessagesAsRead(chat.id, role).catch(console.warn);
                      }
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      padding: '13px 16px',
                      border: 'none',
                      borderBottom: '1px solid #f8fafc',
                      background: isSelected ? '#fff1f2' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'background 0.15s ease',
                      position: 'relative'
                    }}
                    aria-selected={isSelected}
                    role="tab"
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* Active Accent Border on Left Edge */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3.5,
                        background: '#e11d48'
                      }} />
                    )}

                    {/* Avatar with Status indicator */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <SafeAvatar 
                        src={chat.participant.avatar} 
                        alt={chat.participant.name}
                        size={44}
                        style={{
                          boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
                        }}
                      />
                      {chat.participant.isOnline ? (
                        <span style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: '#10b981',
                          border: '2px solid #ffffff'
                        }} />
                      ) : (
                        <span style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#94a3b8',
                          border: '2px solid #ffffff'
                        }} />
                      )}
                    </div>

                    {/* Metadata & Last message snippet */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ 
                            fontWeight: isSelected ? 800 : 700, 
                            fontSize: '0.88rem', 
                            color: isSelected ? '#e11d48' : '#0f172a' 
                          }}>
                            {chat.participant.name}
                          </span>
                          <ShieldCheck size={13} color="#10b981" />
                        </div>
                        <span style={{ fontSize: '0.68rem', color: isSelected ? '#e11d48' : '#94a3b8', fontWeight: 600 }}>
                          {chat.lastMessageTime}
                        </span>
                      </div>

                      <div style={{
                        fontSize: '0.78rem',
                        color: isSelected ? '#475569' : '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {lastMsg?.sender === 'me' && (
                          <CheckCheck size={13} color="#3b82f6" style={{ flexShrink: 0 }} />
                        )}
                        {hasPendingOffer ? (
                          <span style={{ color: '#d97706', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Receipt size={12} />
                            Pending Quote: ₹{lastMsg?.offerData?.amount || 800}
                          </span>
                        ) : hasAcceptedOffer ? (
                          <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <CheckCircle2 size={12} />
                            Confirmed Booking
                          </span>
                        ) : (
                          <span>{lastMsg?.text || 'No messages yet'}</span>
                        )}
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {chat.unreadCount > 0 && !isSelected && (
                      <span style={{
                        background: '#e11d48',
                        color: '#ffffff',
                        borderRadius: 9999,
                        padding: '2px 7px',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        boxShadow: '0 2px 6px rgba(225, 29, 72, 0.3)'
                      }}>
                        {chat.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. CENTER COLUMN: MAIN CHAT PANE                         */}
        {/* ======================================================== */}
        <div 
          className={!showMobileChat ? 'chat-main-mobile-hidden' : ''}
          style={{ 
            flex: 1, 
            minWidth: 0,
            display: 'flex', 
            flexDirection: 'column', 
            background: '#f8fafc', 
            position: 'relative' 
          }}
        >
          {/* Active Chat Header */}
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            gap: 12,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              {/* Back button for mobile viewports */}
              <button
                type="button"
                onClick={() => setShowMobileChat(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  padding: '6px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: '#0f172a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  flexShrink: 0
                }}
                aria-label="Back to conversations"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>

              {/* Avatar with pulse online dot */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <SafeAvatar 
                  src={activeChat.participant.avatar} 
                  alt={activeChat.participant.name}
                  size={42}
                />
                {activeChat.participant.isOnline && (
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 11,
                    height: 11,
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid #ffffff'
                  }} />
                )}
              </div>

              {/* Header Text Details */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {activeChat.participant.name}
                  </h3>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    background: '#e8fbf4',
                    color: '#059669',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 9999
                  }}>
                    <ShieldCheck size={11} />
                    Aadhaar Verified
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ color: activeChat.participant.isOnline ? '#059669' : '#94a3b8', fontWeight: 600 }}>
                    {activeChat.participant.isOnline ? 'Online' : 'Offline'}
                  </span>
                  <span>•</span>
                  <span>{activeChat.participant.area || activeChat.participant.city}</span>
                  <span>•</span>
                  <span>★ {activeChat.participant.rating || '4.9'} ({activeChat.participant.completedHangouts || 54} hangouts)</span>
                </div>
              </div>
            </div>

            {/* Action Tools in Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => onOpenHallmark ? onOpenHallmark(activeChat.participant) : null}
                style={{
                  background: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '7px 12px',
                  borderRadius: 10,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer'
                }}
                title="Audit Companion's Hallmark Cryptographic Dossier"
              >
                <Award size={14} color="#059669" />
                <span>Hallmark</span>
              </button>

              <button
                type="button"
                onClick={() => setShowOfferModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: 10,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)'
                }}
              >
                <Receipt size={14} />
                <span>Official Quote</span>
              </button>

              {/* Toggle Companion Quick Dossier */}
              <button
                type="button"
                onClick={() => setShowRightDrawer(!showRightDrawer)}
                title="View companion details & safety command"
                style={{
                  background: showRightDrawer ? '#fff1f2' : '#f8fafc',
                  border: `1px solid ${showRightDrawer ? '#fecdd3' : '#e2e8f0'}`,
                  color: showRightDrawer ? '#e11d48' : '#475569',
                  padding: '7px 10px',
                  borderRadius: 10,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
              >
                <Info size={15} />
                <span className="hide-on-mobile">Safety & Details</span>
              </button>
            </div>
          </div>

          {/* Escrow Guarantee Safety Alert */}
          <div style={{
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            padding: '7px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#475569'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={13} color="#059669" />
              <span><strong>FindCo Escrow Protection Active:</strong> Payment held safely until in-person 4-digit PIN verification.</span>
            </div>
            <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.7rem' }}>
              RBI COMPLIANT
            </span>
          </div>

          {/* Real-time Connection Quality & Offline Mode Banner */}
          {!isOnline && (
            <div style={{
              background: '#fef2f2',
              borderBottom: '1px solid #fee2e2',
              padding: '7px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.74rem',
              color: '#991b1b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <WifiOff size={13} color="#dc2626" />
                <span><strong>Offline Mode:</strong> Network disconnected. Outgoing messages are queued safely in your local outbox and will deliver automatically when reconnected.</span>
              </div>
            </div>
          )}

          {/* Messages Stream Container */}
          <div style={{
            flex: 1,
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            {/* Date separator */}
            <div style={{ textAlign: 'center', margin: '4px 0 10px 0' }}>
              <span style={{
                background: '#e2e8f0',
                color: '#64748b',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '3px 12px',
                borderRadius: 9999,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                Today · Indiranagar Session
              </span>
            </div>

            {activeChat.messages.map(msg => {
              const isMe = msg.sender === 'me';

              // OFFICIAL QUOTE / BOOKING CARD
              if (msg.isOffer) {
                const off = msg.offerData;
                const isAccepted = off.status === 'accepted';
                const isDeclined = off.status === 'declined';
                const isPending = off.status === 'pending';

                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: 460,
                      width: '100%',
                      animation: 'fadeInScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div style={{
                      borderRadius: 18,
                      overflow: 'hidden',
                      border: isAccepted ? '2px solid #10b981' : isDeclined ? '1px solid #cbd5e1' : '2px solid #fecdd3',
                      background: '#ffffff',
                      boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)'
                    }}>
                      {/* Top Header Ribbon */}
                      <div style={{
                        background: isAccepted ? 'linear-gradient(135deg, #059669, #10b981)' : isDeclined ? '#f1f5f9' : 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
                        padding: '12px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Receipt size={15} color={isAccepted ? '#ffffff' : isDeclined ? '#64748b' : '#e11d48'} />
                          <span style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: isAccepted ? '#ffffff' : isDeclined ? '#64748b' : '#e11d48'
                          }}>
                            {isAccepted ? 'Confirmed Booking Pass' : isDeclined ? 'Declined Quote' : 'Official Companion Quote'}
                          </span>
                        </div>

                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          background: isAccepted ? 'rgba(255,255,255,0.22)' : isDeclined ? '#e2e8f0' : '#e11d48',
                          color: isAccepted ? '#ffffff' : isDeclined ? '#475569' : '#ffffff'
                        }}>
                          {isAccepted ? 'ESCROW LOCKED' : isDeclined ? 'DECLINED' : 'PENDING ACCEPTANCE'}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: '18px 20px' }}>
                        <h4 style={{
                          fontSize: '1.08rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          margin: '0 0 10px 0',
                          lineHeight: 1.35
                        }}>
                          {off.title}
                        </h4>

                        {/* Price & Billing */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 8,
                          marginBottom: 14,
                          padding: '10px 14px',
                          borderRadius: 12,
                          background: '#f8fafc',
                          border: '1px solid #f1f5f9'
                        }}>
                          <span style={{ fontSize: '1.65rem', fontWeight: 900, color: '#e11d48' }}>
                            ₹{off.amount}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                            {off.billingType === 'hourly' ? `for ${off.hours || 2} hours session` : 'All Inclusive Trip Rate'}
                          </span>
                          <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, color: '#059669', background: '#e8fbf4', padding: '2px 6px', borderRadius: 6 }}>
                            0% Client Fee
                          </span>
                        </div>

                        {/* Key Logistics */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, fontSize: '0.8rem', color: '#475569' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Calendar size={14} color="#e11d48" />
                            <span>{off.dateTime || 'Saturday • 3:00 PM - 5:00 PM'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MapPin size={14} color="#e11d48" />
                            <span>{off.venue || 'Third Wave Coffee, 12th Main Indiranagar'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ShieldCheck size={14} color="#059669" />
                            <span>Public Venue & Safety Handshake Guarantee</span>
                          </div>
                        </div>

                        {/* Inclusions & Terms */}
                        <p style={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          lineHeight: 1.5,
                          marginBottom: 16,
                          background: '#ffffff',
                          padding: '8px 0',
                          borderTop: '1px dashed #e2e8f0',
                          borderBottom: '1px dashed #e2e8f0'
                        }}>
                          {off.terms}
                        </p>

                        {/* Pending State Action Buttons */}
                        {isPending && (
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button
                              type="button"
                              disabled={isAcceptingOffer}
                              onClick={() => handleAcceptOffer(off.offerId)}
                              style={{
                                flex: 1,
                                padding: '11px',
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                                color: '#ffffff',
                                fontSize: '0.86rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: isAcceptingOffer ? 'not-allowed' : 'pointer',
                                opacity: isAcceptingOffer ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)'
                              }}
                            >
                              <Lock size={15} />
                              <span>{isAcceptingOffer ? 'Securing Escrow...' : 'Accept & Lock Escrow'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeclineOffer(off.offerId)}
                              style={{
                                padding: '11px 16px',
                                borderRadius: 10,
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                color: '#64748b',
                                fontSize: '0.84rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {/* Accepted State: Verified Pass Voucher */}
                        {isAccepted && (
                          role === 'client' ? (
                            <div style={{
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: 12,
                              padding: '12px 14px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#166534' }}>
                                  LIVE SAFETY HANDSHAKE PIN
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyPin(off.handshakePin || '4892')}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#166534',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  {copiedPin ? <Check size={13} /> : <Copy size={13} />}
                                  <span>{copiedPin ? 'Copied' : 'Copy PIN'}</span>
                                </button>
                              </div>

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                margin: '6px 0 10px 0'
                              }}>
                                {(off.handshakePin || '4892').split('').map((digit, idx) => (
                                  <span 
                                    key={idx}
                                    style={{
                                      width: 38,
                                      height: 42,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: '#ffffff',
                                      borderRadius: 8,
                                      fontSize: '1.25rem',
                                      fontWeight: 900,
                                      color: '#166534',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                                      border: '1px solid #86efac'
                                    }}
                                  >
                                    {digit}
                                  </span>
                                ))}
                              </div>

                              <div style={{ fontSize: '0.72rem', color: '#15803d', textAlign: 'center', lineHeight: 1.4 }}>
                                Share this PIN with {activeChat?.participant?.name || 'companion'} only after you meet in person at the venue.
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: 12,
                              padding: '12px 14px',
                              textAlign: 'center'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#166534', fontWeight: 800, fontSize: '0.78rem', marginBottom: 4 }}>
                                <ShieldCheck size={16} />
                                <span>IN-PERSON VERIFICATION PENDING</span>
                              </div>
                              <p style={{ fontSize: '0.74rem', color: '#15803d', margin: 0, lineHeight: 1.45 }}>
                                Escrow locked. Ask the client for their 4-digit Handshake PIN in person at the meetup to unlock payment.
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                      {msg.time}
                    </div>
                  </div>
                );
              }

              // STANDARD CHAT MESSAGE BUBBLE
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '68%',
                    display: 'flex',
                    flexDirection: isMe ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: 8
                  }}
                >
                  {/* Companion avatar for incoming messages */}
                  {!isMe && (
                    <SafeAvatar 
                      src={activeChat.participant.avatar} 
                      alt={activeChat.participant.name}
                      size={28}
                      style={{ flexShrink: 0, marginBottom: 2 }}
                    />
                  )}

                  {/* Speech Bubble */}
                  <div style={{
                    padding: '11px 16px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' : '#ffffff',
                    color: isMe ? '#ffffff' : '#0f172a',
                    fontWeight: isMe ? 500 : 400,
                    fontSize: '0.9rem',
                    lineHeight: 1.55,
                    border: isMe ? 'none' : '1px solid #e2e8f0',
                    boxShadow: isMe ? '0 3px 10px rgba(225, 29, 72, 0.22)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                    wordBreak: 'break-word',
                    position: 'relative'
                  }}>
                    {/* Media: Compressed High-Res Image Preview */}
                    {msg.mediaType === 'image' && msg.mediaUrl && (
                      <div style={{ marginBottom: msg.text ? 8 : 4 }}>
                        <img 
                          src={msg.mediaUrl}
                          alt="Meetup or cafe attachment"
                          onClick={() => setActiveLightboxImage(msg.mediaUrl)}
                          style={{
                            maxWidth: '100%',
                            maxHeight: 240,
                            borderRadius: 10,
                            objectFit: 'cover',
                            cursor: 'pointer',
                            display: 'block',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                        <div style={{ fontSize: '0.66rem', opacity: 0.85, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Eye size={10} />
                          <span>Click image to expand full view</span>
                        </div>
                      </div>
                    )}

                    {/* Media: Verified Meetup Venue Card */}
                    {(msg.mediaType === 'location' || msg.locationData) && (
                      <div style={{
                        marginTop: 4,
                        marginBottom: msg.text ? 8 : 4,
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: isMe ? 'rgba(0, 0, 0, 0.16)' : '#f8fafc',
                        border: isMe ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.84rem' }}>
                          <MapPin size={15} color={isMe ? '#ffffff' : '#e11d48'} />
                          <span>{msg.locationData?.name || 'Meetup Cafe'}</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', opacity: 0.9 }}>
                          {msg.locationData?.address}
                        </div>
                        <a
                          href={msg.locationData?.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(msg.locationData?.name || 'Cafe')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            marginTop: 4,
                            padding: '5px 10px',
                            borderRadius: 6,
                            background: isMe ? '#ffffff' : '#0f172a',
                            color: isMe ? '#e11d48' : '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            width: 'fit-content'
                          }}
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    )}

                    {msg.text && <div>{msg.text}</div>}

                    {/* Integrated timestamp and 5-stage status indicator */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 4,
                      fontSize: '0.66rem',
                      color: isMe ? 'rgba(255, 255, 255, 0.85)' : '#94a3b8',
                      marginTop: 4
                    }}>
                      <span>{msg.time}</span>
                      {isMe && (
                        <MessageDeliveryStatus 
                          status={msg.status} 
                          onRetry={() => handleRetryMessage(msg)} 
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live Typing Indicator with 3 animated dots */}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 36 }}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  padding: '10px 14px',
                  borderRadius: '16px 16px 16px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, marginRight: 4 }}>
                    {activeChat.participant.name} is typing
                  </span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', animation: 'typingPulse 1.2s cubic-bezier(0.16, 1, 0.3, 1) infinite 0s' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', animation: 'typingPulse 1.2s cubic-bezier(0.16, 1, 0.3, 1) infinite 0.2s' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', animation: 'typingPulse 1.2s cubic-bezier(0.16, 1, 0.3, 1) infinite 0.4s' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Icebreaker Chips */}
          <div style={{
            background: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            padding: '8px 20px',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}>
            {quickChips.map((chip, idx) => {
              const ChipIcon = chip.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.label)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 9999,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#fff1f2';
                    e.currentTarget.style.color = '#e11d48';
                    e.currentTarget.style.borderColor = '#fecdd3';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <ChipIcon size={12} color="#e11d48" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Hidden File Input for Compressed Image Uploads */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleImageFileChange} 
          />

          {/* Message Input Box with Attachment Sheet */}
          <div style={{ position: 'relative' }}>
            {/* Attachment Options Action Sheet */}
            {showAttachmentMenu && (
              <div 
                className="modal-enter"
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: 20,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  boxShadow: '0 12px 28px -5px rgba(0, 0, 0, 0.15)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  zIndex: 100,
                  minWidth: 230
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachmentMenu(false);
                    fileInputRef.current?.click();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: 'none',
                    border: 'none',
                    color: '#0f172a',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <ImageIcon size={16} color="#e11d48" />
                  <span>Upload Cafe / Meetup Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAttachmentMenu(false);
                    setShowLocationModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: 'none',
                    border: 'none',
                    color: '#0f172a',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <MapPin size={16} color="#059669" />
                  <span>Share Meetup Spot / Cafe</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAttachmentMenu(false);
                    setShowOfferModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: 'none',
                    border: 'none',
                    color: '#0f172a',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Receipt size={16} color="#3b82f6" />
                  <span>Issue Official Escrow Quote</span>
                </button>
              </div>
            )}

            <form 
              onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
              style={{
                padding: '12px 20px 14px 20px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#ffffff'
              }}
            >
              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => setShowAttachmentMenu(prev => !prev)}
                title="Attach photo, meetup spot, or quote"
                style={{
                  background: showAttachmentMenu ? '#fff1f2' : '#f8fafc',
                  border: `1px solid ${showAttachmentMenu ? '#fecdd3' : '#e2e8f0'}`,
                  color: showAttachmentMenu ? '#e11d48' : '#64748b',
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <Paperclip size={18} />
              </button>

              {/* Input Capsule */}
              <input 
                type="text"
                placeholder={`Message ${activeChat.participant.name}... (Press Enter to send)`}
                value={inputText}
                maxLength={1000}
                onChange={e => setInputText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={e => e.target.style.borderColor = '#e11d48'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                title="Send message"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: inputText.trim() ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' : '#f1f5f9',
                  color: inputText.trim() ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() ? 'pointer' : 'default',
                  boxShadow: inputText.trim() ? '0 4px 12px rgba(225, 29, 72, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. RIGHT COLUMN: COMPANION QUICK DOSSIER & SAFETY DRAWER */}
        {/* ======================================================== */}
        {showRightDrawer && (
          <div style={{
            width: 320,
            flexShrink: 0,
            borderLeft: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Top Close */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                Companion Profile
              </span>
              <button
                type="button"
                onClick={() => setShowRightDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Hero */}
            <div style={{ padding: '20px 18px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
              <SafeAvatar 
                src={activeChat.participant.avatar} 
                alt={activeChat.participant.name}
                size={80}
                style={{
                  margin: '0 auto 12px auto',
                  border: '3px solid #ffffff',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                }}
              />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                {activeChat.participant.name}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 12 }}>
                {activeChat.participant.city} • {activeChat.participant.area || 'Indiranagar'}
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{
                  background: '#e8fbf4',
                  color: '#059669',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 9999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <ShieldCheck size={12} />
                  Aadhaar Verified
                </span>
                <span style={{
                  background: '#fff7ed',
                  color: '#c2410c',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 9999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Star size={12} fill="#c2410c" />
                  Top Rated (4.9★)
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              padding: '16px 18px',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Rate</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  ₹{activeChat.participant.hourlyRate || 450}/hr
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Completed</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {activeChat.participant.completedHangouts || 54} Meetups
                </div>
              </div>
            </div>

            {/* Safety Guidelines */}
            <div style={{ padding: '18px', flex: 1 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                Safety & Meetup Rules
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem', color: '#475569' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Coffee size={15} color="#e11d48" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Meet strictly in well-lit public cafes, restaurants, or malls.</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Lock size={15} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Never transfer money via personal UPI; escrow covers 100% of payment.</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <ShieldCheck size={15} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Verify the 4-digit Handshake PIN before starting the session timer.</span>
                </div>
              </div>

              {/* Emergency SOS button */}
              <button
                type="button"
                onClick={() => setIsSosModalOpen(true)}
                style={{
                  width: '100%',
                  marginTop: 24,
                  padding: '10px',
                  borderRadius: 10,
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <AlertTriangle size={15} />
                <span>Emergency Safety Alert</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 4. SEND CUSTOM OFFICIAL QUOTE MODAL                      */}
      {/* ======================================================== */}
      {showOfferModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: 16
        }}>
          <div 
            className="modal-enter"
            style={{
              width: '100%',
              maxWidth: 500,
              borderRadius: 22,
              background: '#ffffff',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              padding: '22px 24px',
              color: '#ffffff',
              position: 'relative'
            }}>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: 'none',
                  color: '#ffffff',
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Receipt size={20} color="#ffffff" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Issue Official Binding Quote
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                Protected by FindCo Escrow. Sent directly into chat with {activeChat.participant.name}.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateOffer} style={{ padding: '22px 24px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Activity / Session Title
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Specialty Coffee Trail & Guided Photowalk"
                  value={offerTitle}
                  onChange={e => setOfferTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Price (INR)
                  </label>
                  <input 
                    type="number"
                    value={offerAmount}
                    onChange={e => setOfferAmount(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Duration (Hours)
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="12"
                    value={offerHours}
                    onChange={e => setOfferHours(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Billing Type
                  </label>
                  <select
                    value={offerBillingType}
                    onChange={e => setOfferBillingType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  >
                    <option value="trip">Per Trip</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Date & Timing
                  </label>
                  <input 
                    type="text"
                    value={offerDateTime}
                    onChange={e => setOfferDateTime(e.target.value)}
                    placeholder="e.g. Saturday • 3:00 PM"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      color: '#0f172a'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Public Venue
                  </label>
                  <input 
                    type="text"
                    value={offerVenue}
                    onChange={e => setOfferVenue(e.target.value)}
                    placeholder="e.g. Third Wave Coffee, Indiranagar"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Terms & Inclusions
                </label>
                <textarea 
                  rows={3}
                  value={offerTerms}
                  onChange={e => setOfferTerms(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    color: '#0f172a',
                    resize: 'none',
                    lineHeight: 1.45
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: '#f1f5f9',
                    border: 'none',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1.5,
                    padding: '11px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)'
                  }}
                >
                  Send to Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. VERIFIED CAFE & MEETUP VENUE SELECTOR MODAL            */}
      {/* ======================================================== */}
      {showLocationModal && (
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
          zIndex: 2500,
          padding: 16
        }}>
          <div 
            className="modal-enter"
            style={{
              width: '100%',
              maxWidth: 480,
              borderRadius: 20,
              background: '#ffffff',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              padding: '20px 24px',
              color: '#ffffff',
              position: 'relative'
            }}>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: 'none',
                  color: '#ffffff',
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <MapPin size={20} color="#ffffff" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Share Meetup Cafe Location
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                FindCo safety policy mandates meeting strictly in public, verified cafes.
              </p>
            </div>

            <div style={{ padding: '20px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                Recommended Verified Spots
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {[
                  {
                    name: 'Third Wave Coffee',
                    address: '12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
                    rating: '4.8 ★'
                  },
                  {
                    name: 'Blue Tokai Coffee Roasters',
                    address: '80ft Road, 4th Block, Koramangala, Bengaluru',
                    rating: '4.9 ★'
                  },
                  {
                    name: 'Araku Coffee Flagship',
                    address: '100ft Road, Defence Colony, Indiranagar, Bengaluru',
                    rating: '4.9 ★'
                  },
                  {
                    name: 'Starbucks Reserve',
                    address: 'Church Street, Shanthala Nagar, Bengaluru',
                    rating: '4.7 ★'
                  }
                ].map((venue, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleShareVenue(venue)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#ecfdf5';
                      e.currentTarget.style.borderColor = '#a7f3d0';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        {venue.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 2 }}>
                        {venue.address}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '3px 8px',
                      borderRadius: 6,
                      flexShrink: 0
                    }}>
                      {venue.rating}
                    </span>
                  </div>
                ))}
              </div>

              {/* Custom Venue input */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
                  Or enter another cafe name:
                </div>
                <input 
                  type="text"
                  placeholder="e.g. Dyu Art Cafe, Koramangala"
                  value={customVenueName}
                  onChange={e => setCustomVenueName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    color: '#0f172a',
                    marginBottom: 10
                  }}
                />
                <button
                  type="button"
                  disabled={!customVenueName.trim()}
                  onClick={() => {
                    handleShareVenue({
                      name: customVenueName.trim(),
                      address: 'Bengaluru, Karnataka'
                    });
                    setCustomVenueName('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 10,
                    background: customVenueName.trim() ? '#059669' : '#e2e8f0',
                    color: customVenueName.trim() ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: customVenueName.trim() ? 'pointer' : 'default'
                  }}
                >
                  Share Custom Venue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. FULL-SCREEN HIGH-RES LIGHTBOX MODAL                   */}
      {/* ======================================================== */}
      {activeLightboxImage && (
        <div 
          onClick={() => setActiveLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <button
            onClick={() => setActiveLightboxImage(null)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 42,
              height: 42,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
          >
            <X size={22} />
          </button>
          <img 
            src={activeLightboxImage}
            alt="Full resolution preview"
            style={{
              maxWidth: '92vw',
              maxHeight: '88vh',
              borderRadius: 14,
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              objectFit: 'contain'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Real-time Crisis & SOS Emergency Dispatch Modal */}
      <EmergencySosModal 
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        currentUser={{ name: role === 'buddy' ? 'Companion' : 'Client' }}
        onShowToast={onShowToast}
      />

    </div>
  );
}
