# BuddySearch Membership Plans Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-architect FindCo's subscription data model, modals, and directory banners to replicate the exact market-proven membership tiers of BuddySearch.in (Basic ₹299/3mo, Standard ₹399/6mo, Premium ₹599/12mo, Star Member ₹799/Lifetime).

**Architecture:** Update central plan configuration in `mockData.js`, upgrade `SubscriptionModal.jsx` to render the 4 BuddySearch tiers with monthly breakdowns and Razorpay checkout, align the standalone Subscriptions tab in `App.jsx`, update banner CTAs in `DiscoverView.jsx` and `BuddyFeedView.jsx`, and persist active subscription terms in `storageEngine.js`.

**Tech Stack:** React 19, Vanilla CSS Design System, Lucide Icons, Canvas Confetti, Web Crypto Storage.

**Spec:** [`docs/superpowers/specs/2026-10-15--buddysearch-membership-plans--design.md`](file:///c:/Users/ahiva/OneDrive/Desktop/COffee/docs/superpowers/specs/2026-10-15--buddysearch-membership-plans--design.md)

---

## Global Constraints
- Naming & Tiers must strictly match BuddySearch: `Basic Plan`, `Standard Plan`, `Premium Plan`, `Star Member`.
- Prices must be exact: ₹299 (3mo), ₹399 (6mo), ₹599 (12mo), ₹799 (Lifetime).
- Monthly breakdown values: ₹100/mo, ₹67/mo, ₹50/mo, One-time Payment.
- No regression on genuine authentication or unblurred discovery.

---

## Tasks

- [x] **Task 1: Update `SUBSCRIPTION_PLANS` Configuration in `mockData.js`**
  - Define the 4 BuddySearch tiers (`basic`, `standard`, `premium`, `star`) with durations, prices, original prices, savings percentages, monthly breakdowns, and features.
  - Verify exported structure.

- [x] **Task 2: Upgrade `SubscriptionModal.jsx` for 4-Tier Display & Monthly Breakdown**
  - Update tier selector cards to render the 4 plans with duration badges, price tags, and monthly breakdown pills.
  - Highlight `premium` as "MOST POPULAR" and `star` as "BEST VALUE • LIFETIME".
  - Ensure coupon discount (`BUDDY50` -> 50% off, `FINDCO100` -> 100% off) computes correctly on the new prices.
  - Preserve simulated Razorpay checkout with UPI QR, Card, and NetBanking.

- [x] **Task 3: Upgrade Subscriptions View in `App.jsx`**
  - Update `activeTab === 'subscriptions'` grid to render the 4 BuddySearch plan cards with matching aesthetic cards, feature checklists, and 1-click checkout triggers.
  - Add Star Member VIP badge indicator upon activation.

- [x] **Task 4: Update Banners in `DiscoverView.jsx` and `BuddyFeedView.jsx`**
  - Change copy from "from ₹9" to "from ₹50/mo or ₹799 Lifetime".
  - Ensure "Unlock Pass" buttons open `SubscriptionModal` with `premium` pre-selected.

- [x] **Task 5: Update `storageEngine.js` for Lifetime and Term Subscriptions**
  - Persist plan expiration dates: 90 days for basic, 180 days for standard, 365 days for premium, and `null` (lifetime) for star member.
  - Expose helper `getActiveSubscription()` returning active plan status.

- [x] **Task 6: Verification & Production Deployment**
  - [x] Run `npm run build` to verify clean compilation.
  - [x] Run browser subagent to interactively verify the modal, select Star Member Lifetime (₹799), apply coupon `BUDDY50`, complete checkout, and verify VIP status.
  - [x] Verified full interactive checkout cycle with automated browser recording.
