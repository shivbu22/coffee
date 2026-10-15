# UI/UX Design Laws for MVP Engineering (2026 Standard)

All UI, UX, frontend, and MVP product development in this repository must strictly adhere to the **15 Canonical UI/UX Design Laws** (organized across 4 cognitive pillars). When building MVPs, features, pages, or components, every interaction, layout, and visual element must be tested against these laws.

---

## The 4 Cognitive Pillars & 15 Laws

### Pillar 1: Heuristic Usability (Familiarity & Interaction Physics)
1. **Fitts's Law (Target Accessibility)**:
   - *Law*: Acquisition time depends on target size and distance.
   - *MVP Rule*: Primary interactive buttons and CTAs must be prominent and easy to hit. On mobile, touch targets must be at least **44×44px** and positioned within comfortable thumb zones (bottom 40% of viewport). On desktop, place key actions along natural cursor trajectories. Never place small, fiddly icons without at least 8–12px padding.

2. **Jakob's Law (Mental Models & Familiarity)**:
   - *Law*: Users spend most of their time on other products. They expect your product to work like the ones they already know.
   - *MVP Rule*: Do not reinvent standard UI conventions. Search bars belong at the top, shopping carts/notifications at the top right, logos navigate home, back buttons exist on multi-step flows, and toggle switches slide. Familiarity breeds immediate adoption; unfamiliarity causes drop-offs.

---

### Pillar 2: Gestalt Principles (Visual Perception & Grouping)
3. **Law of Proximity (Visual Clustering)**:
   - *Law*: Objects near each other are perceived as a related group.
   - *MVP Rule*: Place related elements together (e.g., label immediately above input with 4px gap, action buttons next to the post/item they control). Use 2× to 3× larger whitespace between different groups than between items inside a group.

4. **Law of Similarity (Visual Unity & Meaning)**:
   - *Law*: Elements sharing color, size, shape, or typography are perceived as having the same role or meaning.
   - *MVP Rule*: All primary buttons must look identical across screens. Badges representing status must share a consistent pill anatomy. Never style a non-clickable header like a button, and never style different functional actions with identical priority colors.

5. **Law of Common Region (Card & Boundary Hierarchy)**:
   - *Law*: Elements enclosed within a clearly defined boundary are perceived as belonging together.
   - *MVP Rule*: Group cohesive data into cards, sheets, or distinct surface backgrounds (`var(--bg-surface)` vs `var(--bg-main)`) instead of slicing screens with 1px border lines everywhere. Cards create natural containment without visual noise.

---

### Pillar 3: Cognitive Bias & Memory (Decision Speed & Retention)
6. **Hick's Law (Decision Simplicity)**:
   - *Law*: Decision time increases logarithmically with the number and complexity of choices.
   - *MVP Rule*: Limit choices per screen. Never present an overwhelming list of unranked options. Group categories with pills, provide smart defaults, hide advanced settings behind progressive disclosure, and restrict forms to necessary fields.

7. **Miller's Law (Working Memory Chunking)**:
   - *Law*: Working memory holds only 7 ± 2 items at a time.
   - *MVP Rule*: Chunk information into digestible sets of 5–9 items. Long forms must be divided into 3–4 numbered steps. Phone numbers, credit cards, and order IDs must be grouped with visual spaces. Complex tables must support filtering and pagination.

8. **Serial Position Effect (Primacy & Recency Anchor)**:
   - *Law*: Users remember the first (primacy) and last (recency) items in a sequence best; middle items are easily overlooked.
   - *MVP Rule*: In navigation menus, pricing tiers, and filter sets, place the most critical and highest-converting items at the very beginning and very end. Place the recommended tier or primary conversion funnel in prominent focal anchor positions.

9. **Von Restorff Effect (Isolation Effect)**:
   - *Law*: Distinct items that stand out visually from their surroundings are far more likely to be noticed and remembered.
   - *MVP Rule*: Ensure only ONE true primary CTA commands attention per view (e.g. brand accent with strong contrast). Secondary actions must use muted/ghost styles. If everything is bold, highlighted, or badged, nothing stands out.

10. **Peak-End Rule (Emotional Memory Anchoring)**:
    - *Law*: Users judge an entire journey based on the emotional peak (delight or frustration) and the final conclusion.
    - *MVP Rule*: Celebrate successful actions with delight! When a user submits an application, books a buddy, or completes an order, show an engaging confirmation screen, thank-you messaging, animated checkmark, or subtle celebratory micro-interaction. Smooth out error states with helpful, empathetic copy.

11. **Zeigarnik Effect (Task Momentum & Incompletion Tension)**:
    - *Law*: Incomplete or interrupted tasks create mental tension that drives users to return and finish them.
    - *MVP Rule*: Leverage progress bars for multi-step onboarding (e.g., "Step 2 of 3 — 66% done!"), profile completion meters ("Profile 85% complete — add 1 photo to get verified"), and abandoned action notices to guide users smoothly to task completion.

---

### Pillar 4: Timing, Simplicity & Robustness (System Trust)
12. **Doherty Threshold (Sub-400ms Responsiveness)**:
    - *Law*: Productivity and user engagement peak when user interaction feedback occurs in less than **400ms**.
    - *MVP Rule*: Every click, toggle, or filter change must register instant visual feedback (< 100ms active state). For asynchronous API calls exceeding 300ms, immediately render skeleton loaders or optimistic UI updates. Never let a screen freeze silently without a loading indicator.

13. **Parkinson's Law (Time Perception & Efficiency)**:
    - *Law*: Work expands to fill the time perceived or allotted for its completion.
    - *MVP Rule*: Provide explicit, low time estimates upfront (e.g. "Takes 90 seconds to apply" or "Instant 1-minute booking"). Show clear step indicators so users know the finish line is near, reducing drop-off from perceived endless forms.

14. **Occam's Razor (Ruthless MVP Simplicity)**:
    - *Law*: The simplest solution with the fewest assumptions and elements is the most effective.
    - *MVP Rule*: Cut decorative fluff, superfluous input fields, redundant navigation links, and unnecessary confirmation modals. Every element on the screen must earn its right to exist by directly advancing the user's primary goal.

15. **Postel's Law (Robustness Principle)**:
    - *Law*: "Be liberal in what you accept, and conservative in what you send."
    - *MVP Rule*: Be forgiving with user input. Automatically format phone numbers (e.g. tolerate spaces, parentheses, +91 dashes), sanitize uppercase emails, trim accidental whitespace, accept diverse date formats, and autocorrect minor typos. In return, send back clean, normalized, deterministic data with clear, helpful error states.

---

## MVP Engineering Quality Gate Checklist
Before deploying any MVP interface, audit against this checklist:
- [ ] **Fitts's Law**: Mobile touch targets ≥ 44×44px; primary CTAs within reach.
- [ ] **Jakob's Law**: Standard icons, standard search/nav patterns used without friction.
- [ ] **Proximity & Common Region**: Related items grouped inside clear cards; spacing scale strictly followed.
- [ ] **Similarity**: Consistent button variants and badge tokens used globally.
- [ ] **Hick's & Miller's Laws**: No screen presents > 7 unorganized choices; long forms chunked into steps.
- [ ] **Serial Position & Von Restorff**: Key items at start/end; exactly one dominant primary CTA per viewport.
- [ ] **Peak-End & Zeigarnik**: Clear progress bar on flows; joyful, reassuring completion screen.
- [ ] **Doherty Threshold**: Immediate visual response on all buttons (<100ms); skeleton loaders on async operations.
- [ ] **Occam's Razor & Postel's Law**: Unnecessary inputs removed; flexible, resilient input parsing enabled.
