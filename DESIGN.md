---
name: FindCo Design System
description: India's dedicated platonic companionship platform — warm, human, Aadhaar-verified, and safe.
colors:
  primary: "#fa6e5e"
  primary-hover: "#e2584a"
  primary-bg: "#fff1ef"
  peach: "#f8a84e"
  mint: "#38b29c"
  emerald: "#10b981"
  neutral-bg: "#faf9f6"
  neutral-card: "#ffffff"
  neutral-elevated: "#f2ece4"
  text-main: "#242c3d"
  text-secondary: "#526078"
  text-muted: "#596b82"
  border-subtle: "#efe7de"
typography:
  display:
    fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif"
    fontSize: "clamp(2rem, 4.5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif"
    fontSize: "clamp(1.55rem, 3.2vw, 2.2rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif"
    fontSize: "clamp(1.2rem, 2.2vw, 1.45rem)"
    fontWeight: 700
    lineHeight: 1.28
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "-0.011em"
  label:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.02em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.neutral-card}"
    textColor: "{colors.text-main}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.lg}"
    padding: "20px"
  chip:
    backgroundColor: "{colors.neutral-card}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.full}"
    padding: "7px 15px"
---

# Design System: FindCo

## Overview

**Creative North Star: "The Welcoming Urban Sanctuary"**

FindCo's visual language balances radical safety transparency with warm, human hospitality. Designed for urban Indians navigating social co-activities (specialty coffee, fitness runs, heritage walks, concerts), the interface feels friendly and approachable rather than cold or clinical, while maintaining bank-grade cryptographic trust cues.

Surfaces rest on warm Pearl Cream canvas rather than stark sterile white, with soft tactile borders, gentle shadows, and rich typographic contrast. The system completely rejects aggressive gamification, spammy popups, and dark patterns in favor of calm clarity and purposeful microinteractions.

**Key Characteristics:**
- **Warm Pearl Canvas**: `#faf9f6` canvas with pure white elevated surface cards.
- **Human Geometry**: Generous rounded corners (`8px`, `12px`, `16px`) and circular pill tags.
- **Trust Accents**: Mint Teal (`#38b29c`) and Emerald (`#10b981`) for government verification and Hallmark security.
- **Dual Display & Body Typography**: Geometric, expressive `Outfit` for display headings paired with high-legibility `Plus Jakarta Sans` for UI copy.

## Colors

The FindCo palette draws from authentic brand mascot assets: Warm Coral representing energy and connection, Honey Peach for playfulness, and Mint Teal for cryptographic verification trust.

### Primary
- **Warm Coral** (`#fa6e5e`): Used for primary action buttons, key brand highlights, and interactive states.
- **Coral Hover** (`#e2584a`): Darker pressed and active state for primary CTAs.
- **Coral Tint Background** (`#fff1ef`): Subtle tint for active tabs, selected states, and badge backgrounds.

### Secondary
- **Honey Peach** (`#f8a84e`): Warm accent used for ratings stars, companion highlights, and membership accents.

### Tertiary
- **Mint Teal** (`#38b29c`): Cryptographic Hallmark trust indicators, badge borders, and Aadhaar verification badges.
- **Presence Emerald** (`#10b981`): Live online presence beacon and confirmed booking indicators.

### Neutral
- **Pearl Cream Canvas** (`#faf9f6`): Default light mode page background.
- **Surface Card** (`#ffffff`): Background for elevated cards, modals, and navigation drawers.
- **Elevated Neutral** (`#f2ece4`): Subtle inset panels, filter bars, and secondary hover states.
- **Warm Navy Ink** (`#242c3d`): High-contrast, friendly primary text color.
- **Slate Secondary** (`#526078`): Secondary body text, metadata, and subtitles.
- **Muted Slate** (`#596b82`): Form labels and auxiliary descriptions (WCAG AA 4.6:1 compliant).
- **Subtle Border** (`#efe7de`): Soft perimeter dividing lines that replace harsh pure black borders.

### Named Rules
**The Rarity of Coral Rule.** The primary coral accent (`#fa6e5e`) is reserved for the single highest-value CTA per view. Secondary actions use neutral or ghost borders to prevent visual noise.

## Typography

**Display Font:** Outfit (with Plus Jakarta Sans, system-ui fallback)  
**Body Font:** Plus Jakarta Sans (with Inter, system-ui fallback)  
**Numeric Variant:** Tabular Numerals (`font-variant-numeric: tabular-nums; font-feature-settings: 'tnum'`)

**Character:** Warm, modern geometric sans pairing. `Outfit` provides friendly circular letterforms and brand punchiness for headlines, while `Plus Jakarta Sans` offers tall x-height and open apertures for small UI labels and mobile legibility.

### Hierarchy
- **Display** (Weight 800, `clamp(2rem, 4.5vw, 3rem)`, Line-height 1.12, Tracking `-0.035em`): Hero headlines on landing and marketing surfaces with `text-wrap: balance`.
- **Headline** (Weight 800, `clamp(1.55rem, 3.2vw, 2.2rem)`, Line-height 1.2, Tracking `-0.03em`): Section headings and modal titles.
- **Title** (Weight 700, `clamp(1.2rem, 2.2vw, 1.45rem)`, Line-height 1.28, Tracking `-0.02em`): Companion card names and feature headers.
- **Body** (Weight 400/500, `15px`, Line-height 1.55, Tracking `-0.011em`): Standard conversational descriptions, bios, and instructions with `text-wrap: pretty`.
- **Label** (Weight 600, `0.78rem`, Line-height 1.25, Tracking `0.02em`): Filter pills, category chips, and verification badges.

### Named Rules
**The Tabular Pricing Rule.** All prices (`₹450 / hr`, `₹2,000/hr`) must strictly use `.tabular-nums` (`font-variant-numeric: tabular-nums`) to avoid layout jitter during live slider interactions.

## Layout

The spatial model uses an **8px base grid** (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`).
- **Container Max-Widths**: `1140px` for marketing landing views; fluid responsive width for application shell with `250px` fixed desktop sidebar.
- **Card Grids**: CSS Grid with auto-fit minmax (`minmax(320px, 1fr)`) and consistent `20px` gutters.
- **Mobile Behavior**: Single-column layout on screens `< 768px`; bottom navigation bar with thumb-zone ergonomics.

## Elevation & Depth

FindCo uses soft atmospheric layered depth rather than heavy drop shadows. Surfaces feel elevated through subtle ambient occlusions and 1px soft-tinted borders.

### Shadow Vocabulary
- **Subtle Rest** (`var(--shadow-sm)`: `0 1px 3px 0 rgba(44, 54, 71, 0.04)`): Rest state for flat card surfaces.
- **Card Depth** (`var(--shadow-md)`: `0 4px 12px -2px rgba(44, 54, 71, 0.07)`): Elevated cards and hover lifted elements.
- **Overlay Floating** (`var(--shadow-xl)`: `0 20px 36px -10px rgba(44, 54, 71, 0.12)`): Modals, floating PWA banners, and popover menus.
- **Brand Glow** (`0 4px 14px rgba(250, 110, 94, 0.25)`): Active state accent glow on primary CTAs.

### Named Rules
**The Surface-Over-Line Rule.** Group related elements inside clear surface cards (`var(--bg-card)`) with soft elevation instead of noisy 1px dividing lines.

## Shapes

- **Nested Radius Formula**: Inner child elements strictly obey `Radius_child = Radius_parent - Padding`. A `16px` parent card with `0px` margin banner image uses `15px 15px 0 0` top radius.
- **Interactive Pill Shape**: Full radius (`9999px`) for quick-filter chips, city selectors, and presence badges.
- **Touch Target Minimum**: All interactive buttons, chips, and inputs enforce minimum `44×44px` hit areas on touch devices.

## Components

### Buttons
- **Shape**: Rounded (`12px` radius).
- **Primary**: Coral background (`#fa6e5e`), white text (`#ffffff`), `min-height: 44px`, `padding: 10px 18px`, `font-weight: 700`.
- **Hover / Focus**: `translateY(-1px)` spring lift with subtle coral shadow glow; `:active` scales `0.98`.
- **Secondary**: Surface card background, border `1px solid var(--border-subtle)`, text `var(--text-main)`, hover border `var(--border-accent)`.

### Chips
- **Style**: Full rounded pills (`9999px`), `font-size: 0.82rem`, `font-weight: 600`, `padding: 7px 15px`.
- **Selected**: Coral background (`#fa6e5e`), white text (`#ffffff`), glowing border.
- **Unselected**: Surface background (`var(--bg-card)`), border `1px solid var(--border-subtle)`, text `var(--text-secondary)`.

### Cards / Containers
- **Corner Style**: Rounded `16px` (`var(--radius-lg)`).
- **Background**: `var(--bg-card)` (`#ffffff` light, `#181c24` dark).
- **Internal Padding**: `20px` padding with flex column layout.

### Inputs / Fields
- **Style**: `1px solid var(--border-subtle)`, background `var(--bg-card)`, radius `12px`, padding `10px 14px`.
- **Focus**: Border shifts to `var(--color-primary)` with `0 0 0 3px var(--color-primary-glow)` outline.

### Navigation
- **Sidebar**: Desktop `250px` width with sticky positioning, brand logo wordmark, and vertical nav items.
- **Nav Item Active**: Tint background `var(--color-primary-bg)`, coral icon, and bold label.

## Do's and Don'ts

### Do:
- **Do** maintain minimum 44×44px touch targets on all mobile and desktop clickable elements.
- **Do** use `.tabular-nums` for all dynamic numerical data and pricing.
- **Do** enforce `text-wrap: balance` on headings to prevent orphan words.
- **Do** ensure all text maintains $\ge 4.5:1$ contrast against its direct background (WCAG AA).
- **Do** use spring easing (`cubic-bezier(0.16, 1, 0.3, 1)`) with transitions $< 200\text{ms}$ for responsive feedback.

### Don't:
- **Don't** use pure black `#000` text on saturated primary colors; use crisp white `#ffffff` on active coral.
- **Don't** use heavy 4px solid borders on one side of cards as a category accent (the classic AI UI tell).
- **Don't** animate layout properties (`width`, `height`, `padding`, `margin`); animate `transform` and `opacity` instead.
- **Don't** use cartoonish bounce keyframe easing in business UI.
- **Don't** stack competing primary buttons in the same container.
