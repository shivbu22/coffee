---
name: antinoob-ui-ux
description: Comprehensive master UI/UX design skill synthesizing 24 canonical UI books (Refactoring UI, Practical UI, Designing Interfaces, Better Web Typography, Inclusive Components, Form Design Patterns, and more). Eliminates amateur mistakes with logical guidelines for visual hierarchy, typography, layout, component anatomy, color theory, and accessibility.
---

# Anti-Noob UI/UX Engineering: The 24-Book Synthesis

> "UI design does not require artistic flair or magical intuition. Visual and interaction design decisions are governed by a system of logical rules, spatial grids, and cognitive laws." — Synthesized from *Refactoring UI*, *Practical UI*, and *Designing Interfaces*.

When invoked, this skill enforces the collective wisdom, exact measurements, and battle-tested heuristics from the 24 canonical interface design books. It immediately identifies, fixes, and prevents rookie design anti-patterns.

---

## 1. The Anti-Noob Manifesto: 10 Rookie Traps vs. Master Rules

| # | Rookie Anti-Pattern (What Noobs Do) | Master Solution (Canonical Rule) | Source Book |
| :--- | :--- | :--- | :--- |
| **1** | Using font size alone to convey visual hierarchy (e.g. 36px headline, 24px subhead, 18px body all in black `#000`). | Use **font-weight + color de-emphasis** instead of pure scale. Keep size changes modest, drop secondary text to slate-500, and boost primary title weight to 700/800. | *Refactoring UI* |
| **2** | Separating sections with harsh 1px borders everywhere. | **Remove borders and use whitespace or subtle background fills** (`#f8fafc` vs `#ffffff`) or multi-layered diffuse shadows. Borders add visual noise without adding semantic value. | *Refactoring UI* |
| **3** | Eyeballing margins and paddings with arbitrary values like `13px`, `19px`, `27px`. | **Strict 4pt/8pt Spatial Scale**: Every margin, padding, gap, and height must snap to `4, 8, 12, 16, 24, 32, 48, 64, 96px`. No exceptions. | *Practical UI* & *Grid Systems* |
| **4** | Pure black text (`#000000`) on pure white (`#ffffff`) or pure black background with stark white text. | Use **tinted neutrals**: Dark grey `#0f172a` on light `#ffffff`, and warm zinc/slate `#f8fafc` on dark `#09090b`. Tint dark neutrals with your primary hue for harmony. | *Refactoring UI* & *Color Theory* |
| **5** | Low contrast grey text that fails WCAG accessibility (e.g. `#a1a1aa` on white). | **WCAG 2.2 AA Contrast Mandate**: Body text must have ≥ 4.5:1 contrast; large text (≥18pt or ≥14pt bold) and icons must have ≥ 3.0:1 contrast. | *Practical UI* & *Inclusive Components* |
| **6** | Text measures (line lengths) that span the entire screen (120+ characters per line). | **The 45–75 Character Rule (The Measure)**: Cap body copy at `max-width: 65ch` (~600–680px). Reading comprehension drops severely beyond 75 characters. | *Better Web Typography* |
| **7** | Generic button styling where Secondary, Cancel, and Destructive buttons look identical to Primary. | **Hierarchy of Action**: Only ONE Primary CTA per viewport. Secondary buttons use ghost/outline; tertiary use text-only links. Destructive actions use warning tints. | *How to Design Better Components* |
| **8** | Two-column form layouts with side-by-side inputs (e.g. First Name next to Last Name next to Email). | **Single-Column Linear Flow**: Always stack inputs vertically. Users scan in a vertical Z-path or F-path; multi-column forms cause missed fields and hesitation. | *Form Design Patterns* |
| **9** | Generic labels everywhere (e.g. "Status: Active", "Date: 12 Oct", "Email: john@doe.com"). | **Label De-cluttering**: Let placement, formatting, chips, and iconography communicate what data is. Labels are a fallback, not a default. | *Refactoring UI* |
| **10** | Removing `:focus` outlines (`outline: none`) without an accessible `:focus-visible` replacement. | **Keyboard Navigability**: Every interactive element must provide a high-contrast 2px or 3px `:focus-visible` ring with `outline-offset: 2px`. | *Inclusive Components* |

---

## 2. Visual Hierarchy & Spatial Depth (*Refactoring UI* + *The Non-Designer's Design Book*)

### C.R.A.P. Principles in Digital Interfaces (Robin Williams)
1. **Contrast**: If two elements are different, make them *extremely* different. Weak contrast looks like an accidental mistake.
2. **Repetition**: Repeat layout rhythms, corner radii, badge pill shapes, and typography tokens across every screen.
3. **Alignment**: Every single element must snap to a visual edge or grid column. Never place anything floating freely.
4. **Proximity**: Related items must sit close together; unrelated items must be pushed away with at least 2× to 3× whitespace.

### Creating Depth Without Borders
- **Elevation System (5-Tier Shadows)**:
  - `Level 1 (Subtle Cards)`: `box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)`
  - `Level 2 (Hover/Dropdown)`: `box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)`
  - `Level 3 (Popovers/Drawers)`: `box-shadow: 0 12px 24px -4px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.06)`
  - `Level 4 (Modals)`: `box-shadow: 0 24px 48px -12px rgba(0,0,0,0.22), 0 8px 16px -4px rgba(0,0,0,0.08)`
  - `Level 5 (Toasts/Floating)`: `box-shadow: 0 20px 32px -8px rgba(0,0,0,0.25)`

- **Curved Radii Math Formula**:
  - The corner radius of an inner child must equal the outer parent's radius minus the padding:
  $$\text{Radius}_{\text{child}} = \text{Radius}_{\text{parent}} - \text{Padding}$$
  - *Example*: If a card has `border-radius: 16px` and `padding: 8px`, the inner image must have `border-radius: 8px` (not 16px, which causes ugly mismatched corners).

---

## 3. The 4pt / 8pt Spatial & Layout System (*Practical UI* + *Müller-Brockmann*)

### The Mathematical Scale
Always select spacing, dimensions, and gaps from this exact scale:
```
4px   -> Micro (icon gaps, badge padding, inner pill margins)
8px   -> Tight (button internal vertical padding, tight list item gaps)
12px  -> Compact (input field internal padding, card metadata gaps)
16px  -> Standard (card internal padding, default grid gap, button horizontal padding)
24px  -> Relaxed (section sub-blocks, card grid gaps, header margins)
32px  -> Spacious (card outer margins, container separation)
48px  -> Generous (hero sub-sections, desktop column gutters)
64px  -> Section Break (desktop section vertical padding)
96px+ -> Hero / Landmark Break
```

### The 12-Column Responsive Grid
- **Mobile (< 640px)**: 4 columns, 16px margins, 12px or 16px gutters.
- **Tablet (640px – 1024px)**: 8 columns, 24px margins, 16px gutters.
- **Desktop (1024px – 1440px)**: 12 columns, max-width 1200px or 1280px, 20px or 24px gutters.
- **Widescreen (> 1440px)**: Center-locked container with fluid margins.

---

## 4. Typography Engineering (*Better Web Typography* + *Thinking with Type*)

### Modular Type Scale (Major Third 1.250 or Perfect Fourth 1.333)
Use a mathematically sound scale rather than arbitrary numbers:
```
Display / H1: 40px – 48px | Line-height: 1.15 | Tracking: -0.025em | Weight: 800
H2:           28px – 32px | Line-height: 1.25 | Tracking: -0.020em | Weight: 700
H3:           20px – 24px | Line-height: 1.35 | Tracking: -0.015em | Weight: 700
Body Large:   18px        | Line-height: 1.55 | Tracking: 0       | Weight: 400/500
Body Base:    15px – 16px | Line-height: 1.60 | Tracking: 0       | Weight: 400/500
Small / Meta: 13px – 14px | Line-height: 1.50 | Tracking: +0.010em| Weight: 500/600
Micro / Chip: 11px – 12px | Line-height: 1.40 | Tracking: +0.040em| Weight: 700/800 (Uppercase)
```

### Typographic Rules:
1. **Vertical Rhythm**: Line height of body text multiplied by font-size should align to an 8px or 4px sub-grid (e.g. 16px font with 24px line-height = 1.5 ratio, exact 8px multiple).
2. **Tabular Numbers for Data**: Always apply `font-variant-numeric: tabular-nums` or `font-feature-settings: 'tnum'` on prices, timestamps, timers, and metrics to prevent jitter during updates.
3. **Uppercase Needs Letter Spacing**: Any text styled with `text-transform: uppercase` MUST have positive letter spacing (`letter-spacing: 0.04em` to `0.08em`) and reduced font size.
4. **Never Center Body Paragraphs**: Only center short titles (1–2 lines) and badges. Long paragraphs (>3 lines) must ALWAYS be left-aligned for readable eye return.

---

## 5. Color Theory, Tints & Contrast Rules (*Practical UI* + *Refactoring UI*)

### The 60-30-10 Distribution Rule:
- **60% Dominant (Neutral Backgrounds)**: Base canvas (`#ffffff` / `#f8fafc` in light, `#09090b` / `#121214` in dark).
- **30% Structural (Secondary & Containers)**: Card surfaces, borders, table rows, muted badges.
- **10% Accent (Interactive Color)**: Primary buttons, active state indicators, focus rings, callout badges.

### Color Tinting Matrix:
- Never use desaturated flat grey for shadows or overlays.
- **Colored Overlays**: Instead of `rgba(0, 0, 0, 0.5)` everywhere, add a 5% tint of your brand hue into dark scrims and borders.
- **Alert Semantic Tints**:
  - *Success*: Emerald (`#059669` text, `#ecfdf5` bg, `#a7f3d0` border)
  - *Danger/Error*: Crimson (`#dc2626` text, `#fef2f2` bg, `#fecaca` border)
  - *Warning*: Amber (`#d97706` text, `#fffbeb` bg, `#fde68a` border)
  - *Info*: Sky Blue (`#0284c7` text, `#f0f9ff` bg, `#bae6fd` border)

---

## 6. Component Anatomy & Design Systems (*How to Design Better Components 3.0* + *Atomic Design*)

### Button Anatomy & Hierarchy:
- **Primary CTA**: High contrast solid fill, minimum height 40px (desktop) / 44px (touch). Padding: `10px 18px`. Weight: 600 or 700.
- **Secondary CTA**: Elevated neutral surface with subtle border (`1px solid var(--border-subtle)`).
- **Tertiary / Ghost**: Transparent background, text color `#475569`, hover background `rgba(0,0,0,0.04)`.
- **Destructive**: Tinted crimson background with crimson text; bold red only for irreversible confirmation modals.
- **Interactive States**:
  - `Hover`: Lightness shift by ±4% or `transform: translateY(-1px)`.
  - `Active (Pressed)`: `transform: scale(0.97)` or `translateY(0)`.
  - `Disabled`: `opacity: 0.45; cursor: not-allowed; pointer-events: none`.
  - `Loading`: Preserve exact width/height of the button and display a centered spinner so layout never jumps.

### Badges vs Tags vs Pills:
- **Status Indicator**: Compact pill with a 6px pulsating dot + semantic text (e.g. `● 240 Buddies Online`).
- **Interactive Filter Pill**: Selectable toggle button with count bubble, hover feedback, active highlight.
- **Metadata Tag**: Non-clickable category label with subdued neutral background.

---

## 7. Form Design & Input Engineering (*Form Design Patterns* + *Inclusive Components*)

1. **Persistent Top-Aligned Labels**: Never use placeholder text as a substitute for an input label. Placeholders disappear when typing, destroying context.
2. **Error Message Grounding**: Error messages must:
   - Appear directly *below* the associated input field.
   - Be paired with an error icon (`AlertCircle size={14}`) and red border (`#ef4444`).
   - Associate programmatically via `aria-describedby="field-error-id"`.
3. **Input Field Sizing**:
   - Height: 42px – 46px for comfortable desktop typing; 48px on mobile viewports.
   - Font-size: Minimum 16px on iOS to prevent mobile Safari from automatically zooming into the page.
4. **Action Placement in Forms**:
   - Primary submit button on the left (matching the left-aligned scanning column), Secondary "Cancel" next to it.

---

## 8. Interaction Patterns & Layout Architecture (*Designing Interfaces* + *About Face*)

- **Navigation Rules**:
  - Navigation tabs must indicate *current page location*, not user entitlements.
  - Active tab indicators should use a high-contrast accent bar or distinct background pill.
  - Provide breadcrumbs for hierarchies 3+ levels deep.
- **Empty States**:
  - Never display an empty grey box or plain text "No results".
  - Always include: (1) Illustrative icon, (2) Friendly human heading, (3) 1-sentence explanation, and (4) Direct action button (e.g. "Clear filters" or "Post a Request").
- **Skeleton Screens vs Spinners**:
  - For page loads taking >250ms, use content-shaped skeleton shimmer animations rather than generic circular spinners. This lowers perceived latency (Doherty Threshold).

---

## 9. Cognitive Psychology in UI (*Designing with the Mind in Mind* + *Design for Cognitive Bias*)

- **Hick's Law (Choice Overload)**: Group long lists into categorized pill filters (e.g. group 16 categories into 5 thematic clusters).
- **Fitts's Law (Click Target Efficiency)**: Critical actions must have large clickable surfaces (minimum 44×44px touch targets). Extend click targets past text boundaries using padding.
- **Miller's Law (Chunking)**: Break large credit card inputs, phone numbers, or multi-step checkout processes into 3–4 bite-sized pieces.
- **Recognition over Recall**: Display visual previews, tags, and icons instead of expecting users to remember text names.
- **Anti-Dark-Patterns**: Never hide unsubscribe links, never use deceptive double-negative opt-ins, and never visually disguise cancel buttons.

---

## 10. Review & Verification Table Format (Required)

When auditing or reviewing UI code, this skill MUST format findings using a Before/After/Why table:

| Before (Amateur / Noob Pattern) | After (Anti-Noob Canonical Pattern) | Why & Canonical Principle |
| :--- | :--- | :--- |
| `border: 1px solid #ccc` across cards and sidebar items. | `background: var(--bg-surface)` with `box-shadow: 0 1px 3px rgba(0,0,0,0.05)` or subtle background contrast. | Borders add visual clutter. Whitespace and subtle elevation achieve separation cleanly (*Refactoring UI*). |
| Font size 36px, 24px, 16px all in pure black `#000000`. | Font sizes 28px, 18px, 15px with weights 800, 600, 400 and color de-emphasis (`#0f172a`, `#64748b`). | True hierarchy uses weight and contrast, not just extreme size steps (*Better Web Typography*). |
| Margin values: `17px`, `23px`, `35px`. | Strictly snap to 4/8pt grid: `16px`, `24px`, `32px`. | Inconsistent margins destroy visual rhythm and make layouts feel broken (*Practical UI*). |
| Placeholder text used as input labels. | Explicit `<label>` above input; placeholder only for syntax hints (e.g. "e.g. +91 98201..."). | Placeholders disappear when typing and cause accessibility failures (*Form Design Patterns*). |
| Single green `ACTIVE` badge on every nav tab. | Remove misleading text; use left accent indicator bar on selected tab + contextual live status indicators (`● LIVE`, `✓ VERIFIED`). | Avoid violating mental models. Navigation badges must denote specific item status, not duplicate generic states (*Designing Interfaces*). |

---

## Verification & Execution Checklist

Before declaring any UI implementation complete, run this checklist:
- [ ] **Contrast**: All body text passes WCAG 2.2 AA (≥ 4.5:1 ratio against background).
- [ ] **Grid**: Every spacing token is a multiple of 4px or 8px.
- [ ] **Touch Targets**: All mobile buttons, links, and icons have a minimum 44×44px hit area.
- [ ] **Typography**: Tabular numerals enabled for prices and counts; uppercase text has tracking; measures capped at 75ch.
- [ ] **Focus Rings**: All interactive elements have `:focus-visible` styles with distinct high-contrast offset.
- [ ] **State Coverage**: Default, hover, pressed, focus, loading, and disabled states are explicitly defined.
- [ ] **Cognitive Load**: Forms are single-column; choices are chunked with category pills.
