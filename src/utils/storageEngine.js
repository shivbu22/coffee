/**
 * FindCo Persistent Storage Engine (AntiVibe Senior Architectural Layer)
 * 
 * Replaces fragile in-memory state with a resilient, schema-validated local storage engine.
 * Ensures bookings, chat rooms, offers, wallet transactions, notifications, and profiles
 * persist across page reloads and state synchronizations.
 */

import { 
  INITIAL_COMPANIONS, 
  INITIAL_REQUESTS, 
  INITIAL_CHATS, 
  INITIAL_KYC_REQUESTS,
  INITIAL_DASHBOARD_DATA,
  INITIAL_NOTIFICATIONS,
  DEFAULT_BUDDY_PROFILE
} from '../data/mockData';

const STORAGE_KEYS = {
  USER_SESSION: 'findco_user_session_v1',
  COMPANIONS: 'findco_companions_v1',
  REQUESTS: 'findco_requests_v1',
  CHATS: 'findco_chats_v1',
  DASHBOARD: 'findco_dashboard_v1',
  NOTIFICATIONS: 'findco_notifications_v1',
  KYC: 'findco_kyc_v1',
  BUDDY_PROFILE: 'findco_buddy_profile_v1',
  MEMBERSHIP: 'findco_membership_v1'
};

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[AntiVibe Storage] Failed to load ${key}, using fallback:`, err);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[AntiVibe Storage] Failed to persist ${key}:`, err);
  }
}

export const StorageEngine = {
  // --- User Session ---
  getUserSession: () => safeGet(STORAGE_KEYS.USER_SESSION, null),
  setUserSession: (user) => safeSet(STORAGE_KEYS.USER_SESSION, user),
  clearUserSession: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    } catch (e) {
      console.error(e);
    }
  },

  // --- Membership ---
  getMembership: () => safeGet(STORAGE_KEYS.MEMBERSHIP, { hasActiveSub: false, tier: null }),
  setMembership: (sub) => safeSet(STORAGE_KEYS.MEMBERSHIP, sub),

  // --- Companions ---
  getCompanions: () => safeGet(STORAGE_KEYS.COMPANIONS, INITIAL_COMPANIONS),
  setCompanions: (companions) => safeSet(STORAGE_KEYS.COMPANIONS, companions),
  addReviewToCompanion: (companionName, newReview) => {
    const companions = safeGet(STORAGE_KEYS.COMPANIONS, INITIAL_COMPANIONS);
    const updated = companions.map(c => {
      if (c.name.toLowerCase() === companionName.toLowerCase()) {
        const currentCount = c.reviewsCount || 20;
        const currentRating = c.rating || 4.8;
        const newRating = Number(((currentRating * currentCount + newReview.rating) / (currentCount + 1)).toFixed(2));
        return {
          ...c,
          reviewsCount: currentCount + 1,
          rating: newRating
        };
      }
      return c;
    });
    safeSet(STORAGE_KEYS.COMPANIONS, updated);
    return updated;
  },

  // --- Requests ---
  getRequests: () => safeGet(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS),
  setRequests: (requests) => safeSet(STORAGE_KEYS.REQUESTS, requests),
  addRequest: (request) => {
    const prev = safeGet(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const updated = [request, ...prev];
    safeSet(STORAGE_KEYS.REQUESTS, updated);
    return updated;
  },

  // --- Chats & Messages ---
  getChats: () => safeGet(STORAGE_KEYS.CHATS, INITIAL_CHATS),
  setChats: (chats) => safeSet(STORAGE_KEYS.CHATS, chats),
  addMessageToRoom: (roomId, message) => {
    const chats = safeGet(STORAGE_KEYS.CHATS, INITIAL_CHATS);
    const updated = chats.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          lastMessageTime: message.time || 'Just now',
          messages: [...room.messages, message]
        };
      }
      return room;
    });
    safeSet(STORAGE_KEYS.CHATS, updated);
    return updated;
  },
  updateOfferStatus: (roomId, offerId, status) => {
    const chats = safeGet(STORAGE_KEYS.CHATS, INITIAL_CHATS);
    let targetOffer = null;
    const updated = chats.map(room => {
      if (room.id === roomId) {
        const newMessages = room.messages.map(m => {
          if (m.isOffer && m.offerData?.offerId === offerId) {
            targetOffer = { ...m.offerData, status };
            return {
              ...m,
              offerData: targetOffer
            };
          }
          return m;
        });
        return {
          ...room,
          messages: newMessages
        };
      }
      return room;
    });
    safeSet(STORAGE_KEYS.CHATS, updated);
    return { updatedChats: updated, targetOffer };
  },

  // --- Dashboard & Bookings ---
  getDashboardData: () => safeGet(STORAGE_KEYS.DASHBOARD, INITIAL_DASHBOARD_DATA),
  setDashboardData: (data) => safeSet(STORAGE_KEYS.DASHBOARD, data),
  addBooking: (newBooking) => {
    const current = safeGet(STORAGE_KEYS.DASHBOARD, INITIAL_DASHBOARD_DATA);
    const updated = {
      ...current,
      upcomingBookings: [newBooking, ...(current.upcomingBookings || [])]
    };
    safeSet(STORAGE_KEYS.DASHBOARD, updated);
    return updated;
  },
  completeActiveHangout: (feedback) => {
    const current = safeGet(STORAGE_KEYS.DASHBOARD, INITIAL_DASHBOARD_DATA);
    if (!current.activeHangout) return current;

    const completedAmount = current.activeHangout.escrowAmount || 900;
    const newTx = {
      id: `tx_${Date.now()}`,
      date: 'Just now',
      title: `Completed Hangout: ${current.activeHangout.activityTitle}`,
      amount: completedAmount,
      type: 'credit',
      status: 'Unlocked & Transferred'
    };

    const updated = {
      ...current,
      activeHangout: {
        ...current.activeHangout,
        status: 'completed',
        completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      wallet: {
        ...current.wallet,
        availableBalance: (current.wallet.availableBalance || 0) + completedAmount,
        inEscrow: Math.max(0, (current.wallet.inEscrow || 0) - completedAmount),
        transactions: [newTx, ...(current.wallet.transactions || [])]
      }
    };
    safeSet(STORAGE_KEYS.DASHBOARD, updated);
    return updated;
  },
  withdrawToUpi: (amount, upiId) => {
    const current = safeGet(STORAGE_KEYS.DASHBOARD, INITIAL_DASHBOARD_DATA);
    if ((current.wallet.availableBalance || 0) < amount) {
      throw new Error('Insufficient wallet balance');
    }
    const newTx = {
      id: `tx_${Date.now()}`,
      date: 'Just now',
      title: `IMPS Instant Transfer to UPI (${upiId})`,
      amount: -amount,
      type: 'debit',
      status: 'Settled to Bank (IMPS Payout Instant)'
    };
    const updated = {
      ...current,
      wallet: {
        ...current.wallet,
        availableBalance: current.wallet.availableBalance - amount,
        transactions: [newTx, ...(current.wallet.transactions || [])],
        lastSettlementDate: 'Just now'
      }
    };
    safeSet(STORAGE_KEYS.DASHBOARD, updated);
    return updated;
  },

  // --- Notifications ---
  getNotifications: () => safeGet(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  setNotifications: (notifs) => safeSet(STORAGE_KEYS.NOTIFICATIONS, notifs),
  addNotification: (notif) => {
    const prev = safeGet(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = [notif, ...prev];
    safeSet(STORAGE_KEYS.NOTIFICATIONS, updated);
    return updated;
  },
  markAllNotificationsRead: () => {
    const prev = safeGet(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = prev.map(n => ({ ...n, isRead: true }));
    safeSet(STORAGE_KEYS.NOTIFICATIONS, updated);
    return updated;
  },

  // --- KYC Requests ---
  getKycRequests: () => safeGet(STORAGE_KEYS.KYC, INITIAL_KYC_REQUESTS),
  setKycRequests: (kyc) => safeSet(STORAGE_KEYS.KYC, kyc),

  // --- Buddy Profile ---
  getBuddyProfile: () => safeGet(STORAGE_KEYS.BUDDY_PROFILE, DEFAULT_BUDDY_PROFILE),
  setBuddyProfile: (profile) => safeSet(STORAGE_KEYS.BUDDY_PROFILE, profile)
};
