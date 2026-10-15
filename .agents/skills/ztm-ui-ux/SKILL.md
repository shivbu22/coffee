---
name: ztm-ui-ux
description: Comprehensive UI/UX Design Cheatsheet skill derived from the Zero To Mastery (ZTM) curriculum by Andrei Neagoie, Daniel Schifano, and Brittney Postma. Covers the complete design process from paper sketching, user flows, flat vs deep sitemaps, 3 fidelity levels, wireframing, prototyping, 8px grid systems, responsive breakpoints, color psychology & harmonies, Golden Ratio 1.618 typography scales, the 4-part microinteraction engine, WCAG accessibility, mobile UX patterns, and atomic design systems.
---

# Zero To Mastery (ZTM) UI/UX Design Skill

> "Accessibility is not a checklist. It should be ingrained in the way we design." — Daniel Schifano

This skill encapsulates the complete, official **Zero To Mastery UI/UX Design Cheatsheet** (v1.01) created by Andrei Neagoie, Daniel Schifano, and Brittney Postma. It provides immediate, step-by-step guidance for designing professional digital products from napkin sketch to production design system.

---

## 1. Getting Started: The Discovery & Ideation Pipeline

### Sketching (The Foundation of Ideation)
Sketching is where you generate as many ideas as possible quickly on paper. Details do not matter at this stage; focus on volume, divergent thinking, and exploring layout options.

**The 6-Step Sketching Workflow**:
1. **Be Prepared**: Gather tools (pens, pencils, markers, rulers, dot-grid notebook or tablet).
2. **Define Goals & Audience**: Clarify user goals and demographic expectations before putting pen to paper.
3. **Timebox Every Sprint**: Set a strict timer (e.g. 10–15 minutes) to prevent getting bogged down in decorative details.
4. **Frame the Context**: Always draw the target boundary first (mobile screen frame `9:19.5` or desktop browser window `16:9`).
5. **Annotate & Document**: Add notes, numbered arrows, labels, and gesture indicators (swipe, tap, long-press, scroll).
6. **Iterate & Share**: Share rough sketches with peers or stakeholders early to uncover friction before high-fidelity design.

### User Flows
A user flow maps the step-by-step path a user takes to achieve a specific goal:
- **Strictly Unidirectional**: User flows go in ONE direction from entry to completion (e.g. Search $\to$ Select $\to$ Checkout $\to$ Success). Bidirectional back-and-forth exploration is prototyping, not user flows.
- **Minimal Visuals**: Focus on decision nodes and screen transitions, not pixel perfection.
- **Metadata Required**: Every flow must specify (1) Flow name, (2) Step number, (3) User persona/role, and (4) Clear entry and exit criteria.

---

## 2. Sitemaps & Information Architecture

Sitemaps organize how pages and screens connect hierarchically, giving developers and designers a shared component roadmap:
- **Flat Sitemaps**: $\le 3$ levels deep. Ideal for MVPs, SaaS apps, and modern web products. Reduces cognitive load and navigation friction.
- **Deep Sitemaps**: $> 3$ levels deep. Necessary for large e-commerce catalogs and complex enterprise dashboards.
- **Organization**: Start with Home at the top. Number every section/page systematically (e.g. `1.0 Home`, `1.1 Feed`, `2.0 Profile`, `2.1 Settings`). Use color-coded legends for page categories.

---

## 3. Levels of Design Fidelity

| Fidelity Level | Purpose | Artifacts Produced | When to Use |
| :--- | :--- | :--- | :--- |
| **Low-Fidelity** | Structure & Flow | Napkin sketches, paper flows, whiteboard diagrams | Discovery, problem definition, rapid validation |
| **Mid-Fidelity** | Layout & Hierarchy | Wireframes (Figma), grayscale boxes, component placement | Pathway testing, client alignment, user testing |
| **High-Fidelity** | Visual Polish & Motion | Clickable prototypes, tokens, typography, microinteractions | Developer handoff, stakeholder sign-off, usability labs |

> **ZTM Principle**: Never jump to high fidelity too early! Validating low-to-mid fidelity ensures you get functionality and navigation pathways right before spending time on colors and aesthetics.

---

## 4. Feedback Management Protocol

Feedback can make or break a design. The designer's job is to steer feedback toward being constructive:
- **Constructive Feedback**: Addresses whether the design achieves user goals, highlights navigation friction, and moves the product forward.
- **Destructive Feedback**: Subjective personal bias ("I don't like purple"), caused by vague context or presenting early wireframes as final designs.
- **Review Agenda**:
  1. State the current design stage upfront (e.g. "This is a mid-fidelity wireframe to test layout, not colors").
  2. Define the exact 2–3 questions you need answered.
  3. Limit meeting attendance to key decision-makers.
  4. Timebox discussions and bookmark off-topic ideas for future backlog reviews.

---

## 5. Design Fundamentals: Grids & Responsive Layouts

### The 8px Base Unit System
- The universal base unit is **8px** because modern display densities divide cleanly by 8.
- All margins, paddings, gaps, and heights must be multiples: `4px` (micro), `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`.

### The 12-Column Grid Anatomy
- **Columns**: Vertical tracks. 12-column grids provide maximum flexibility (divisible by 1, 2, 3, 4, 6, 12).
- **Gutters**: Whitespace between columns (multiples of 8px, typically 16px or 24px).
- **Margins**: Outer borders separating grid from display edges.
- **Max-Width Container**: Always cap container width (e.g. `1280px; margin: 0 auto;`) so widescreen users don't have to scan across massive monitors.

### Standardized Breakpoints
- **Small (600px)**: Mobile screens (4 columns, 16px margin).
- **Medium (768px)**: Tablets (8 columns, 24px margin).
- **Large (1024px)**: Laptops & desktops (12 columns, 32px margin).
- **Extra-Large (1280px+)**: High-resolution desktops (12 columns centered).

---

## 6. Color Systems & Harmony

### The 6 Classic Color Schemes:
1. **Monochromatic**: Variations in lightness/saturation of a single hue. Least distracting, most elegant.
2. **Analogous**: 3 adjacent colors on the 360° wheel. Calming, cohesive visual flow.
3. **Complementary**: 2 colors directly opposite (180°). High visual contrast; use for primary CTAs.
4. **Split-Complementary**: Base hue + 2 adjacent colors to its complement. High contrast with softer balance.
5. **Triadic**: 3 colors evenly spaced at 120°. Vibrant, energetic, requires balanced proportion.
6. **Tetradic**: 4 colors evenly spaced in a rectangle. Rich but challenging; restrict UI to 3 or fewer.

### The Untouched Black Rule:
Pure black (`#000000`) is too harsh. Always tint dark neutrals with a subtle hint (3–5%) of the primary brand hue to add depth and warmth (e.g. dark slate `#0f172a` or deep charcoal `#121214`).

---

## 7. Typography & Golden Ratio Scaling

### Golden Ratio (1.618) Curve:
With a base body font size of **16px**, multiply by $\phi = 1.618$ to generate harmonious typographic hierarchy:
- `10px (0.618em)`: Micro labels, tags, uppercase metadata
- `16px (1.000em)`: Standard body text, inputs
- `26px (1.618em)`: Subheads, card titles, H3
- `42px (2.618em)`: Section titles, modal headers, H2
- `68px (4.236em)`: Hero display titles, landing H1

### Typeface Styles & Pairing:
- **Serif**: Old Style (Goudy), Transitional (Times New Roman), Modern (Didot), Slab (Courier/Rockwell).
- **Sans-Serif**: Grotesque, Neo-Grotesque (Helvetica, Inter), Humanist (Gill Sans), Geometric (Futura, Poppins).
- **Monospace**: Fixed-width for numbers, metrics, timestamps, and code blocks.
- **Golden Rule**: Never pair two fonts from the same sub-category (e.g. don't pair two geometric sans-serifs). Pair a geometric sans headline with a neutral neo-grotesque or humanist body.

---

## 8. The 4-Part Microinteraction Framework

Microinteractions provide instant feedback and make software feel alive:
1. **Trigger**: Initiates the interaction (User action: click, swipe, keystroke; or System event).
2. **Rules**: The logic that executes upon triggering (what happens and in what order).
3. **Feedback**: Sensory confirmation to the user (lightness shift, checkmark icon, sound, haptic vibration). Must occur within $< 100\text{ms}$.
4. **Loops & Modes**: Loops define repetition or duration (e.g. loading spinner); Modes define temporary contextual states (e.g. full-screen search overlay or edit mode).

---

## 9. Accessibility (A11y) & Assistive Technology

- **Assistive Technologies**: Account for Screen Readers, Braille Terminals, Screen Magnifiers, and Alternative Switch Inputs.
- **Clickable Area > Visual Area**: Expand interactive hit-targets beyond small icons (minimum 44×44px touch target) using padding or pseudo-elements.
- **Mandatory Focus Rings**: Form inputs and buttons must feature high-contrast `:focus-visible` styling with `outline-offset: 2px`.
- **WCAG 2.2 AA Contrast**: Body copy must meet $\ge 4.5:1$ contrast against its background; large text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold) must meet $\ge 3.0:1$.

---

## 10. The 6 Design Pattern Classes & Atomic Design Systems

### 6 Core Pattern Classes:
1. **Data & Input**: Drag-and-drop zones, masked inputs, inline editing, auto-complete search.
2. **Content Structure**: Cards, accordions, bento grids, segmented tab controls.
3. **Navigation**: Bottom mobile navbars, left sidebars, persistent search bars, breadcrumbs.
4. **Incentivization**: Progress bars, completion badges, positive confetti celebrations.
5. **Hierarchy**: Contrast weighting, primary-versus-ghost action pairing, typographic scale.
6. **Social Media**: Verified badges, avatar stacks, activity feeds, share drawers.

### Atomic Design Hierarchy (Brad Frost & ZTM Model):
```
Foundation (Tokens)  -> Colors, typography, 8px spacing, elevation shadows, icons
Components (Atoms)   -> Buttons, inputs, chips, badge pills, cards
Recipes (Organisms)  -> Composed navigation bars, auth dialogs, booking summaries, feeds
```
> Design systems are living, ever-evolving toolkits. When a reusable token or component exists, never write one-off custom styles.
