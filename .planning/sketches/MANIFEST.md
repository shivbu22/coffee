# GSD Sketch Manifest: Companion In-App Dashboard & Escrow Architecture

## Overview
- **Design Target**: In-app Companion Experience (`/dashboard/buddy`), replicating and elevating the live structure observed on `buddysearch.in`.
- **Created Date**: October 2026
- **Status**: Explored & Validated with 3 Interactive Variants

---

## Interactive Mockup Variants

### Variant A: Direct BuddySearch Companion Replica
- **File**: [`01-authentic-buddysearch-companion.html`](file:///c:/Users/ahiva/OneDrive/Desktop/COffee/.planning/sketches/01-authentic-buddysearch-companion.html)
- **Design Philosophy**: Direct 1:1 fidelity with `https://buddysearch.in/dashboard/buddy`.
- **Key Features**:
  - Full authentic sidebar (`Hire`, `Find`, `Messages`, `Notifications`, `Connections`, `Profile`, `Membership`, `Help`).
  - Underlying blurred feed of actual Bangalore/Mumbai companionship requests.
  - Floating central coral paywall modal ("MEMBERS ONLY - Your next buddy is one tap away").
  - Three bullet points with rounded icons, social proof avatar stack ("1M+ buddies"), and ₹299/mo unlock button.
  - Floating PWA installation card at bottom right.
- **Trade-off**: High authenticity and exact visual replica, but paywall gate obscures immediate utility until dismissed.

---

### Variant B: Trust & Escrow Safety Command
- **File**: [`02-escrow-handshake-companion.html`](file:///c:/Users/ahiva/OneDrive/Desktop/COffee/.planning/sketches/02-escrow-handshake-companion.html)
- **Design Philosophy**: Security-first, solving the real friction of in-person Indian meetups.
- **Key Features**:
  - Active Meetup session card with two-way Handshake PIN (`4892`).
  - Safety check-in countdown timer (41:24 remaining) auto-pinging FindCo Command.
  - Instant UPI Escrow release button and prominent Emergency SOS trigger.
  - Three-tier ledger: Wallet Balance, RBI-held Escrow, and 100% Zero-Incident Trust Rating.
- **Trade-off**: Highly reassuring for companions and female users; focuses deeply on meetup logistics.

---

### Variant C: Companion Growth & Earnings Studio
- **File**: [`03-companion-growth-earnings.html`](file:///c:/Users/ahiva/OneDrive/Desktop/COffee/.planning/sketches/03-companion-growth-earnings.html)
- **Design Philosophy**: Creator-economy orientation for companions earning up to ₹2,000/hr.
- **Key Features**:
  - Dark sleek earnings hero card (₹48,250 net payout this month, +28% growth).
  - One-click instant withdrawal to UPI.
  - Inbound booking inquiry pipeline with one-tap "Accept & Lock Escrow" or "Decline".
  - Companion tier badge ("Top 1% Companion").
- **Trade-off**: Maximizes companion recruitment motivation and commercial transparency.

---

## Recommended Synthesis for Production FindCo
Combine the high-converting coral paywall modal from **Variant A** for un-subscribed users with the live safety escrow command from **Variant B** and the earnings telemetry from **Variant C** inside FindCo's `BuddyAppShell.jsx` and `DashboardView.jsx`.
