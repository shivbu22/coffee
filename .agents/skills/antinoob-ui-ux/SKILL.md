---
name: antinoob-ui-ux
description: Comprehensive master UI/UX design skill synthesizing 24 canonical UI books (Refactoring UI, Practical UI, Designing Interfaces, Better Web Typography, Form Design Patterns, etc.), the 15 Cognitive UX Design Laws, and the complete Zero To Mastery (ZTM) UI/UX Design Cheatsheet. Eliminates amateur mistakes with rigorous mathematical systems for visual hierarchy, 8px grid layouts, typography scales, color harmonies, microinteractions, and accessibility.
---

# Anti-Noob UI/UX Engineering: The Master Architecture

> "UI design does not require artistic flair or magical intuition. Visual and interaction design decisions are governed by a system of logical rules, spatial grids, cognitive laws, and human psychology." — Synthesized from *Refactoring UI*, *Practical UI*, *Designing Interfaces*, *Atomic Design*, and the *ZTM UI/UX Master Curriculum*.

When invoked, this skill enforces the collective wisdom, exact measurements, and battle-tested heuristics from the 24 canonical interface design books, the 15 cognitive UX design laws, and the complete ZTM UI/UX lifecycle. It immediately identifies, fixes, and prevents rookie design anti-patterns.

---

## 1. The Anti-Noob Manifesto: 10 Rookie Traps vs. Master Rules

| # | Rookie Anti-Pattern (What Noobs Do) | Master Solution (Canonical Rule) | Source Authority |
| :--- | :--- | :--- | :--- |
| **1** | Using font size alone to convey visual hierarchy (e.g. 36px headline, 24px subhead, 18px body all in black `#000`). | Use **font-weight + color de-emphasis** instead of pure scale. Keep size changes modest, drop secondary text to slate-500, and boost primary title weight to 700/800. | *Refactoring UI* |
| **2** | Separating sections with harsh 1px borders everywhere. | **Remove borders and use whitespace or subtle background fills** (`#f8fafc` vs `#ffffff`) or multi-layered diffuse shadows. Borders add visual noise without adding semantic value. | *Refactoring UI* & *ZTM Layouts* |
| **3** | Eyeballing margins and paddings with arbitrary values like `13px`, `19px`, `27px`. | **Strict 8px Base Unit & 4pt Scale**: Every margin, padding, gap, and height must snap to `4, 8, 12, 16, 24, 32, 48, 64, 96px`. No exceptions. | *Practical UI* & *Grid Systems* |
| **4** | Pure black text (`#000000`) on pure white (`#ffffff`) or pure black background with stark white text. | Use **tinted neutrals**: Dark grey `#0f172a` on light `#ffffff`, and warm zinc/slate `#f8fafc` on dark `#09090b`. Tint dark neutrals with 3–5% of your brand hue for depth. | *Refactoring UI* & *ZTM Color* |
| **5** | Low contrast grey text that fails WCAG accessibility (e.g. `#a1a1aa` on white). | **WCAG 2.2 AA Contrast Mandate**: Body text must have ≥ 4.5:1 contrast; large text (≥18pt or ≥14pt bold) and icons must have ≥ 3.0:1 contrast. | *Practical UI* & *Inclusive Components* |
| **6** | Text measures (line lengths) that span the entire screen (120+ characters per line). | **The 45–75 Character Rule (The Measure)**: Cap body copy at `max-width: 65ch` (~600–680px). Reading comprehension drops severely beyond 75 characters. | *Better Web Typography* |
| **7** | Generic button styling where Secondary, Cancel, and Destructive buttons look identical to Primary. | **Hierarchy of Action**: Only ONE Primary CTA per viewport. Secondary buttons use ghost/outline; tertiary use text-only links. Destructive actions use warning tints. | *How to Design Better Components* |
| **8** | Two-column form layouts with side-by-side inputs (e.g. First Name next to Last Name next to Email). | **Single-Column Linear Flow**: Always stack inputs vertically. Users scan in a vertical Z-path or F-path; multi-column forms cause missed fields and hesitation. | *Form Design Patterns* |
| **9** | Generic labels everywhere (e.g. "Status: Active", "Date: 12 Oct", "Email: john@doe.com"). | **Label De-cluttering**: Let placement, formatting, chips, and iconography communicate what data is. Labels are a fallback, not a default. | *Refactoring UI* |
| **10** | Removing `:focus` outlines (`outline: none`) without an accessible `:focus-visible` replacement. | **Keyboard Navigability**: Every interactive element must provide a high-contrast 2px or 3px `:focus-visible` ring with `outline-offset: 2px`. | *Inclusive Components* & *ZTM A11y* |

---

## 2. Visual Hierarchy & Spatial Depth (*Refactoring UI* + *The Non-Designer's Design Book*)

### C.R.A.P. Principles in Digital Interfaces (Robin Williams)
1. **Contrast**: If two elements are different, make them *extremely* different. Weak contrast looks like an accidental mistake.
2. **Repetition**: Repeat layout rhythms, corner radii, badge pill shapes, and typography tokens across every screen.
3. **Alignment**: Every single element must snap to a visual edge or grid column. Never place anything floating freely.
4. **Proximity**: Related items must sit close together; unrelated items must be pushed away with at least 2.5× to 3× whitespace.

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

## 3. The 8px Base Unit & Responsive Grid System (*Practical UI* + *Müller-Brockmann* + *ZTM Cheatsheet*)

### The 8px Mathematical Scale
The base unit recommended across enterprise design systems is **8px** because modern screen resolutions are divisible by 8 and divide evenly into themselves. All spacing, dimensions, and gaps snap to:
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

### The 3 Grid Elements
1. **Columns**: The vertical sections that run left to right. Standard is a 12-column grid because it divides cleanly by 1, 2, 3, 4, 6, and 12.
2. **Gutters**: The whitespace between columns. Always a multiple of the 8px base unit (16px or 24px).
3. **Margins**: The outside edges that separate the grid from the screen edge.

### Responsive Breakpoints & Container Discipline:
Always use `max-width` containers (e.g. `max-width: 1280px; margin: 0 auto;`) so wide monitors don't force users to turn their heads left-to-right to read content.
- **Small (600px - Mobile)**: 4 columns, 16px margins, 12px or 16px gutters.
- **Medium (768px - Tablet)**: 8 columns, 24px margins, 16px gutters.
- **Large (1024px - Laptop/Desktop)**: 12 columns, 32px margins, 20px or 24px gutters.
- **Extra-Large (1280px+ - Widescreen)**: 12 columns, max-width container, fluid centered margins.

### Layout Types:
- **Fixed Layout**: Constant width regardless of viewport.
- **Fluid Layout**: Proportional scaling stretching and shrinking with viewport width.
- **Adaptive Layout**: Shifts between distinct grid configurations at set breakpoints.

---

## 4. Typography Engineering & Golden Ratio Scales (*Better Web Typography* + *ZTM Cheatsheet*)

### Golden Ratio (1.618) Type Scale Curve
Taking a base font size of **16px**, multiply by the golden ratio $\phi = 1.618$:
```
Micro / Caption:  10px (0.618em) | Tracking: +0.04em  | Line-height: 1.4
Base Body:        16px (1.000em) | Tracking: 0        | Line-height: 1.6
Subhead / H3:     26px (1.618em) | Tracking: -0.015em | Line-height: 1.3
Section Title/H2: 42px (2.618em) | Tracking: -0.020em | Line-height: 1.2
Hero Display /H1: 68px (4.236em) | Tracking: -0.025em | Line-height: 1.15
```

### Typeface Classifications:
1. **Serif**: Traditional typefaces with tails/feet.
   - *Old Style* (e.g. Goudy, Garamond): Organic, diagonal stress, low contrast.
   - *Transitional* (e.g. Times New Roman, Baskerville): Vertical stress, sharper serifs.
   - *Modern* (e.g. Didot, Bodoni): Extreme stroke contrast, unbracketed horizontal serifs.
   - *Slab* (e.g. Courier, Rockwell): Heavy, blocky, geometric serifs; great for technical titles.
2. **Sans-Serif**: Clean, no tails, popularized by Swiss design:
   - *Grotesque* (e.g. Source Sans Pro, Franklin Gothic): Early sans, idiosyncratic curves.
   - *Neo-Grotesque* (e.g. Helvetica, Inter, Roboto): Neutral, uniform, high legibility.
   - *Humanist* (e.g. Gill Sans, Open Sans, Frutiger): Based on classical calligraphy proportions.
   - *Geometric* (e.g. Futura, Poppins, Montserrat): Based on pure circles, triangles, and squares.
3. **Display**: High-personality typefaces used exclusively for short headlines.
4. **Script**: Formal or casual cursive handwriting typefaces.
5. **Monospace**: Fixed-pitch font where each character occupies equal horizontal space. Essential for code, tabular numbers, and technical values.

### Typographic Rules:
1. **Tabular Numerals**: Apply `font-variant-numeric: tabular-nums` to prices, timers, and metrics to prevent layout shifts.
2. **Uppercase Letter-Spacing**: Any uppercase text MUST have positive tracking (`letter-spacing: 0.04em` to `0.08em`).
3. **Never Center Long Text**: Paragraphs over 3 lines must ALWAYS be left-aligned. Center-aligning long body text destroys eye return and impairs reading speed.

---

## 5. Color Systems, Harmonies & Tints (*Refactoring UI* + *ZTM Cheatsheet*)

### The 6 Color Schemes:
1. **Monochromatic**: Single primary hue with varied lightness/saturation tints. Cleanest and least distracting.
2. **Analogous**: 3 adjacent colors on the 360° color wheel. Creates blended, calm, nature-like harmonies.
3. **Complementary**: 2 colors directly opposite on the wheel (180° apart). Produces maximum contrast and vibrant focal points.
4. **Split-Complementary**: Base hue paired with the two colors adjacent to its complement. High contrast with more versatility.
5. **Triadic**: 3 colors evenly spaced at 120° intervals. Bold, vibrant, balanced energy.
6. **Tetradic**: 4 colors evenly arranged in a rectangle. Rich and complex; limit usage to 3 or fewer colors in standard UI.

### The 60-30-10 Distribution Rule:
- **60% Dominant (Canvas Neutral)**: Background surfaces (`#ffffff` / `#f8fafc` light, `#09090b` / `#121214` dark).
- **30% Structural (Surface Hierarchy)**: Card containers, table rows, secondary controls, borders.
- **10% Accent (Interactive Action)**: Primary CTA button, active navigation indicator, focus outline.

### Never Use Untouched Black:
Pure `#000000` is harsh and unnatural. Always tint your blacks and dark greys with 3–5% of the primary brand hue (e.g. slate-900 `#0f172a` with blue undertones or zinc-900 `#18181b`).

---

## 6. The 4-Part Microinteraction Engine (*ZTM Cheatsheet* + *Designing Interfaces*)

Microinteractions turn static screens into responsive software. Every microinteraction consists of 4 structured components:
1. **Trigger**: The initiator (User-initiated: click, tap, hover, scroll, swipe, keystroke; or System-initiated: notification, network receipt).
2. **Rules**: The operational logic that dictates what happens once triggered (e.g. validate format, submit payload, update database record).
3. **Feedback**: The sensory confirmation received by the user (visual button state change, skeleton loader, sound, haptic tap, or celebratory checkmark). Must happen within **< 100ms** to satisfy the Doherty Threshold.
4. **Loops & Modes**: 
   - *Loop*: Governs duration, repetition, and termination (e.g. a spinner that loops until network success).
   - *Mode*: A temporary change of state (e.g. edit mode, active modal overlay, drag-and-drop dragging state).

---

## 7. The End-to-End Design Process & Feedback Protocol (*ZTM Lifecycle*)

```
[1. Sketching] ➔ [2. User Flows] ➔ [3. Sitemaps] ➔ [4. Wireframes] ➔ [5. Prototypes] ➔ [6. Design System]
```

### 1. Rapid Sketching:
- **Timebox**: Set a timer (e.g. 15 minutes) to avoid getting bogged down in decorative details.
- **Frame the Context**: Always draw the target viewport container (mobile screen frame or desktop window).
- **Annotate Gestures**: Label swipes, taps, presses, and transitions with directional arrows.

### 2. User Flows:
- User flows move in **one direction only** from trigger to goal completion. (Bidirectional navigation is prototyping).
- Always include: (1) Flow name, (2) Step number, (3) User persona/role, (4) Explicit start and end states.

### 3. Sitemaps:
- **Flat Sitemap**: Less than 3 levels deep. Ideal for MVPs, portfolios, and SaaS apps.
- **Deep Sitemap**: Greater than 3 levels deep. Used for large enterprise catalogs.
- Always include page reference numbers and color-coded hierarchy legends.

### 4. The 3 Levels of Fidelity:
- **Low-Fidelity**: Rough sketches and user flow diagrams. Validates navigation pathways.
- **Mid-Fidelity**: Wireframes in tools like Figma. Validates layouts, content hierarchy, and information density without color distraction.
- **High-Fidelity**: Clickable, styled prototypes. Validates interactions, micro-animations, typography, and visual polish.

### 5. Constructive Feedback Management:
- **Constructive Feedback**: Goal-oriented, identifies friction in user pathways, moves the product forward.
- **Destructive Feedback**: Tangential, subjective personal taste ("I don't like green"), caused by failing to state the design stage.
- **Protocol**: Always declare the design stage upfront, state the specific 2–3 questions needing answers, timebox feedback meetings, and bookmark off-topic ideas for future backlog triage.

---

## 8. The 6 Canonical Design Pattern Classes (*ZTM Cheatsheet*)

Design patterns are reusable solutions to common usability challenges that reduce cognitive strain:
1. **Data & Input**: Drag-and-drop file uploaders, formatted phone/card inputs, inline editing, instant search autocompletion.
2. **Content Structure**: Bento grids, master-detail layouts, accordions, segmented tabs, card carousels.
3. **Navigation**: Bottom mobile navbars, left desktop sidebars, contextual breadcrumbs, floating action buttons.
4. **Incentivization**: Gamified progress bars, celebration confetti upon completion, streak counters, verification badges.
5. **Hierarchy**: Visual focal anchors, primary-versus-secondary button distinction, typography weight stepping.
6. **Social & Identity**: Verified user badges, avatar stacks, activity streams, share sheets.

---

## 9. Atomic Design & The 3-Tier Design System (*Brad Frost* + *ZTM Model*)

A design system is the single source of truth for all reusable components:
```
Tier 1: Foundation  ➔ Tokens (Colors, Typography Scale, 8px Spacing Grid, Shadow Depths, Iconography)
Tier 2: Components  ➔ Atoms & Molecules (Buttons, Inputs, Badges, Tooltips, Avatar Chips, Cards)
Tier 3: Recipes     ➔ Organisms & Templates (Navigation Sidebars, Auth Modals, Hero Grids, Checkouts)
```
> **Golden Rule**: Design systems are living, ever-evolving toolkits. Never build one-off ad-hoc styles when a reusable token or component exists.

---

## 10. The 15 Canonical UX Design Laws for MVP Engineering (2026 Guide)

### Pillar I: Heuristic Usability (Familiarity & Interaction Physics)
1. **Fitts's Law (Target Accessibility)**:
   - *Principle*: Target acquisition time depends on distance and target size ($T = a + b \log_2(2D / W)$).
   - *MVP Rule*: Interactive touch targets must be at least **44×44px** on mobile and placed in reachable thumb zones. Desktop CTAs must have generous click padding.
   - *Anti-Pattern*: 14px text-only delete/submit links with zero padding.

2. **Jakob's Law (Mental Models & Familiarity)**:
   - *Principle*: Users spend most of their time on other products; they expect yours to work like the ones they already know.
   - *MVP Rule*: Never reinvent standard navigation. Search is at the top, profile/settings top-right, company logo navigates home, back buttons exist on multi-step flows.
   - *Anti-Pattern*: Obscure gesture-only hidden menus for primary navigation.

### Pillar II: Gestalt Principles (Visual Perception & Grouping)
3. **Law of Proximity (Visual Clustering)**:
   - *Principle*: Elements close to one another are perceived as belonging to a unified group.
   - *MVP Rule*: Place labels directly next to inputs (4–6px gap). Action buttons go next to the item they operate on. Unrelated sections require 2.5× to 3× more whitespace.
   - *Anti-Pattern*: Uniform vertical spacing where users can't tell which input a label belongs to.

4. **Law of Similarity (Visual Unity & Meaning)**:
   - *Principle*: Elements sharing visual attributes (color, size, shape, weight) are perceived as having the same role.
   - *MVP Rule*: Keep visual tokens uniform across views. All primary CTAs share identical weight and fill. Status badges share identical pill geometry.
   - *Anti-Pattern*: Using 4 different button styles for primary actions across 3 screens.

5. **Law of Common Region (Card & Boundary Hierarchy)**:
   - *Principle*: Elements within a shared boundary with a distinct edge or background are perceived as a group.
   - *MVP Rule*: Group cohesive data into cards, sheets, or distinct surface backgrounds (`var(--bg-surface)` vs `var(--bg-main)`). Eliminate noisy 1px dividing borders.
   - *Anti-Pattern*: Slicing pages into endless wireframe grids with repetitive border-lines.

### Pillar III: Cognitive Bias & Memory (Decision Speed & Retention)
6. **Hick's Law (Decision Simplicity)**:
   - *Principle*: Decision time increases logarithmically with the number and complexity of choices ($T = b \log_2(n + 1)$).
   - *MVP Rule*: Limit choices per screen. Group long lists into filter pills, provide smart defaults, and hide niche parameters behind progressive disclosure.
   - *Anti-Pattern*: 20 unorganized dropdowns on a single screen causing choice paralysis.

7. **Miller's Law (Working Memory Chunking)**:
   - *Principle*: Working memory holds only $7 \pm 2$ items at once.
   - *MVP Rule*: Chunk information into sets of 5–9 items. Divide long sign-up or checkout sequences into 3–4 numbered steps. Format phone numbers, PAN/Aadhaar cards into 3–4 character chunks.
   - *Anti-Pattern*: Sprawling 18-input forms without step divisions.

8. **Serial Position Effect (Primacy & Recency Anchor)**:
   - *Principle*: Users remember the first (primacy) and last (recency) items in a sequence best.
   - *MVP Rule*: Anchor navigation menus and pricing tables by placing the highest-value and most critical actions at the very beginning and very end.
   - *Anti-Pattern*: Burying the most popular feature in the middle of an unranked list.

9. **Von Restorff Effect (Isolation Effect)**:
   - *Principle*: When multiple similar items are present, the one that visually differs will be remembered.
   - *MVP Rule*: Exactly ONE primary CTA visually dominates each viewport with brand contrast. Secondary actions remain muted. Accent badges ("Best Value") used sparingly.
   - *Anti-Pattern*: Multiple competing neon buttons on the same card.

10. **Peak-End Rule (Emotional Memory Anchoring)**:
    - *Principle*: People evaluate an experience based on its emotional peak and its end.
    - *MVP Rule*: Turn key completions into moments of delight. When a user books or orders, provide a celebratory confirmation screen, friendly toast, or micro-interaction.
    - *Anti-Pattern*: Silent redirect to a blank feed after a payment.

11. **Zeigarnik Effect (Task Momentum & Incompletion Tension)**:
    - *Principle*: Incomplete tasks create cognitive tension that drives users to return and finish them.
    - *MVP Rule*: Use visible progress bars ("Step 2 of 3 — 66% Complete!"), profile completion meters ("Profile 80% complete"), and abandoned draft cues.
    - *Anti-Pattern*: Hiding the total number of steps in a registration flow.

### Pillar IV: Timing, Simplicity & Robustness (System Trust)
12. **Doherty Threshold (Sub-400ms Responsiveness)**:
    - *Principle*: Productivity peaks when system response time is under 400ms.
    - *MVP Rule*: Provide immediate feedback (< 100ms active states on buttons). For asynchronous network operations > 300ms, display content-shaped skeleton loaders.
    - *Anti-Pattern*: Unresponsive buttons causing users to click multiple times.

13. **Parkinson's Law (Time Perception & Efficiency)**:
    - *Principle*: Work expands to fill perceived time available.
    - *MVP Rule*: State explicit, low time estimates upfront ("Takes 90 seconds"). Show step counts to eliminate form drop-offs.
    - *Anti-Pattern*: Open-ended, ambiguous forms with no estimated time.

14. **Occam's Razor (Ruthless MVP Simplicity)**:
    - *Principle*: The simplest solution with the fewest elements is best.
    - *MVP Rule*: Ruthlessly eliminate non-essential fields, decorative fluff, and redundant confirmation dialogs. Every element must earn its place.
    - *Anti-Pattern*: Over-engineering an MVP with 12 nested sub-menus when a search bar and 4 pills suffice.

15. **Postel's Law (Robustness Principle)**:
    - *Principle*: "Be liberal in what you accept, conservative in what you send."
    - *MVP Rule*: Forgive flexible user inputs (phone numbers with spaces, hyphens, country codes; emails with uppercase). Return clean, normalized, deterministic data.
    - *Anti-Pattern*: Rejecting a form with a red error because the user entered a phone number with spaces.

---

## 11. Accessibility & Assistive Technologies (*ZTM Cheatsheet* + *WCAG 2.2 AA*)

"Accessibility is not a checklist. It should be ingrained in the way we design." — Daniel Schifano

### Assistive Hardware & Software to Account For:
1. **Screen Readers**: Reads DOM hierarchy out loud. Requires semantic HTML (`<main>`, `<nav>`, `<button>`, `<label>`).
2. **Braille Terminals**: Physical braille displays for visually impaired users.
3. **Screen Magnifiers**: Enlarges hovering screen areas; requires clean reflow at 200% zoom.
4. **Alternate Input Devices**: Voice control, switch buttons, keyboard-only tab navigation.

### Visual Patterns & Hit-Target Rule:
- **Clickable Area > Visual Area**: The clickable bounding box can and should be larger than the visual icon itself (e.g. padding an 18px icon to create a 44×44px hit-box).
- **Focus States are Mandatory**: Form elements and interactive buttons must have high-contrast `:focus-visible` rings, even if browser default styles are reset.
- **Color Contrast Testing**: Use tools like Colorable or Contrast plugins. Body text must meet ≥ 4.5:1; large headings and graphical controls must meet ≥ 3.0:1.

---

## 12. Review & Verification Table Format (Required)

When auditing or reviewing UI code, this skill MUST format findings using a Before/After/Why table:

| Before (Amateur / Noob Pattern) | After (Anti-Noob Canonical Pattern) | Why & Canonical Principle |
| :--- | :--- | :--- |
| `border: 1px solid #ccc` across cards and sidebar items. | `background: var(--bg-surface)` with `box-shadow: 0 1px 3px rgba(0,0,0,0.05)` or subtle background contrast. | Borders add visual clutter. Whitespace and subtle elevation achieve separation cleanly (*Refactoring UI*). |
| Font size 36px, 24px, 16px all in pure black `#000000`. | Font sizes 28px, 18px, 15px with weights 800, 600, 400 and color de-emphasis (`#0f172a`, `#64748b`). | True hierarchy uses weight and contrast, not just extreme size steps (*Better Web Typography*). |
| Margin values: `17px`, `23px`, `35px`. | Strictly snap to 8px base unit & 4pt scale: `16px`, `24px`, `32px`. | Inconsistent margins destroy visual rhythm and make layouts feel broken (*Practical UI*). |
| Placeholder text used as input labels. | Explicit `<label>` above input; placeholder only for syntax hints (e.g. "e.g. +91 98201..."). | Placeholders disappear when typing and cause accessibility failures (*Form Design Patterns*). |
| Single green `ACTIVE` badge on every nav tab. | Remove misleading text; use left accent indicator bar on selected tab + contextual live status indicators (`● LIVE`, `✓ VERIFIED`). | Avoid violating mental models. Navigation badges must denote specific item status, not duplicate generic states (*Designing Interfaces*). |

---

## 13. Unified Master Audit & Execution Checklist

Before declaring any UI, MVP feature, or component implementation complete, audit against this canonical checklist:
- [ ] **Fitts's Law & Touch Targets**: Mobile touch targets are ≥ 44×44px; click hit-areas expanded beyond visual icon dimensions.
- [ ] **Jakob's Law**: Standard navigation, search, and checkout patterns follow familiar web/mobile conventions.
- [ ] **Proximity & Common Region**: Spacing strictly adheres to the 8px base unit system; cards delineate content without border noise.
- [ ] **Similarity**: Global button hierarchy (Primary, Secondary, Ghost, Destructive) is unified across all screens.
- [ ] **Hick's & Miller's Laws**: No view presents > 7 un-chunked choices; complex flows are split into 3–4 numbered steps.
- [ ] **Serial Position & Von Restorff**: Critical items anchored at sequence ends; exactly 1 primary CTA dominates the view.
- [ ] **Peak-End & Zeigarnik**: Multi-step flows show clear progress; task completion triggers delightful confirmation.
- [ ] **Doherty Threshold**: Visual feedback is < 100ms; asynchronous actions show skeletons or spinners within < 400ms.
- [ ] **Parkinson's & Occam's Razor**: Time estimates are clear; non-essential fields and elements are ruthlessly pruned.
- [ ] **Postel's Law**: Inputs accept flexible formatting (phone numbers, emails, postal codes) without rigid validation errors.
- [ ] **Contrast & Accessibility**: All body text passes WCAG 2.2 AA (≥ 4.5:1 ratio); focus-visible rings are present.
- [ ] **Typography**: Tabular numerals enabled for prices and counts; golden ratio scale followed; line measures capped at 75ch.
- [ ] **Atomic Design Alignment**: Reusable tokens (foundation) and components are utilized instead of ad-hoc styles.
