# Spec: BuddySearch-Aligned Membership & Subscription System
> Stage 1 Deliverable — Superpowers SDLC (`docs/superpowers/specs/2026-10-15--buddysearch-membership-plans--design.md`)

## 1. Executive Summary & Goal
Align FindCo's membership and subscription tiers directly with the market-tested pricing architecture of **BuddySearch** (`buddysearch.in` / `buddysearch.com`). Replace arbitrary daily micro-passes with high-conversion commitment tiers: **Basic (3 Months)**, **Standard (6 Months)**, **Premium (12 Months)**, and **Star Member (Lifetime)**, featuring transparent monthly breakdowns (`₹50/mo`, `₹67/mo`, `₹100/mo`), lifetime perks, and seamless checkout.

---

## 2. Competitive Benchmarking vs BuddySearch.in

| Tier | Name | Term / Validity | Price (INR) | Original Price | Effective Monthly Cost | Core Value Proposition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **basic** | **Basic Plan** | 3 Months | **₹299** | ₹499 | ~₹100 / mo | 5 Plan Requests/mo, Browse Directory, Verified Badge |
| **standard** | **Standard Plan** | 6 Months | **₹399** | ₹999 | ~₹67 / mo | 10 Plan Requests/mo, Social Links, Higher Priority Match |
| **premium** | **Premium Plan** *(Most Popular)* | 12 Months | **₹599** | ₹1,599 | ~₹50 / mo | 15 Plan Requests/mo, Profile Pinning, 0% Commission |
| **star** | **Star Member** *(Best Value)* | **Lifetime Access** | **₹799** | ₹2,999 | One-time Payment | Unlimited Requests, Gold Star Badge, Top Discovery Placement |

---

## 3. Architecture & Data Model

### 3.1 `SUBSCRIPTION_PLANS` Schema (`src/data/mockData.js`)
```javascript
export const SUBSCRIPTION_PLANS = [
  {
    tier: 'basic',
    name: 'Basic Plan',
    duration: '3 Months',
    price: 299,
    originalPrice: 499,
    monthlyBreakdown: '₹100/mo',
    discountPercent: 40,
    tag: 'STARTER',
    tagColor: '#64748b',
    popular: false,
    features: [
      'Browse Discovery Feed & Detailed Profiles',
      'Post up to 5 Hangout Requests / month',
      'Direct 1-on-1 private messaging on accepted plans',
      'Standard listing placement in your city'
    ]
  },
  {
    tier: 'standard',
    name: 'Standard Plan',
    duration: '6 Months',
    price: 399,
    originalPrice: 999,
    monthlyBreakdown: '₹67/mo',
    discountPercent: 60,
    tag: 'POPULAR CHOICE',
    tagColor: '#3b82f6',
    popular: false,
    features: [
      'Everything in Basic Plan',
      'Post up to 10 Hangout Requests / month',
      'Higher Priority algorithm placement',
      'Display verified social handles on profile',
      'SMS & WhatsApp instant applicant alerts'
    ]
  },
  {
    tier: 'premium',
    name: 'Premium Plan',
    duration: '12 Months (1 Year)',
    price: 599,
    originalPrice: 1599,
    monthlyBreakdown: '₹50/mo',
    discountPercent: 63,
    tag: 'MOST POPULAR',
    tagColor: '#e11d48',
    popular: true,
    features: [
      'Everything in Standard Plan',
      'Post up to 15 Hangout Requests / month',
      'Top-tier Priority Placement in Companion Directory',
      'Profile Pinning in City Explorer section',
      '0% Platform commission on in-chat custom quotes',
      'Escrow SafeGuard VIP Protection'
    ]
  },
  {
    tier: 'star',
    name: 'Star Member VIP',
    duration: 'Lifetime Access',
    price: 799,
    originalPrice: 2999,
    monthlyBreakdown: 'One-time Payment',
    discountPercent: 73,
    tag: 'BEST VALUE • LIFETIME',
    tagColor: '#d97706',
    popular: false,
    features: [
      'Lifetime Access — Never pay renewal fees again',
      'Unlimited Hangout & Activity Plan Requests',
      'Exclusive Gold Star VIP Badge on your avatar',
      'Perpetual Top #1 placement in Discovery & Feed',
      'Instant direct contact privileges with top companions',
      '24/7 Dedicated Concierge Support line'
    ]
  }
];
```

### 3.2 User Subscription State & Storage (`src/utils/storageEngine.js`)
- Store active plan object:
  ```javascript
  {
    tier: 'premium' | 'star' | 'standard' | 'basic',
    name: 'Premium Plan',
    activatedAt: '2026-10-15T00:20:00Z',
    validUntil: '2027-10-15T00:20:00Z', // or 'Lifetime' for star
    isLifetime: boolean,
    transactionId: string
  }
  ```

---

## 4. UI/UX Specifications

1. **`SubscriptionModal.jsx`**:
   - Modern 4-card responsive layout (or 2x2 grid on desktop, smooth carousel on mobile).
   - "Save 73%" badges and strikethrough original prices.
   - Clear monthly breakdown pill (`Billed as ₹50/mo`).
   - Coupon input supporting `BUDDY50` (50% off) and `FINDCO100` (100% off).
   - Razorpay simulated payment gateway with UPI QR, NetBanking, and Card options.

2. **Subscriptions View in `App.jsx`**:
   - Update `activeTab === 'subscriptions'` to show the 4 BuddySearch tiers.
   - Distinctive border and gradient highlight for **Premium (₹599)** and **Star Member Lifetime (₹799)**.

3. **In-Feed & Discover Notice Banners**:
   - Update text in `DiscoverView.jsx` and `BuddyFeedView.jsx`: "Unlock Membership Pass (from ₹50/mo or ₹799 Lifetime)".

---

## 5. Verification & Acceptance Criteria
1. Selecting any tier displays the correct BuddySearch pricing (`₹299`, `₹399`, `₹599`, `₹799`).
2. Monthly breakdowns calculate accurately (`₹100/mo`, `₹67/mo`, `₹50/mo`, `One-time`).
3. Applying coupon `BUDDY50` reduces prices by 50% across all plans.
4. Completing payment sets the user's active membership status, awards the Star badge for Star Member tier, unlocks full direct chat & hire requests, and persists across sessions.
5. All tests and production build pass with zero warnings or errors.
