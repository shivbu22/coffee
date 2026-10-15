# Workspace Engineering Directives & UX Mandates

This workspace is governed by two foundational engineering frameworks:
1. **GRAVITAS Protocol**: Never declare completion without concrete validator evidence (see [.agents/rules/gravitas.md](file:///c:/Users/ahiva/OneDrive/Desktop/COffee/.agents/rules/gravitas.md)).
2. **15 UI/UX Design Laws for MVP Engineering**: All interfaces, flows, components, and pages must strictly follow the 15 cognitive design laws (see [.agents/rules/ui-ux-design-laws.md](file:///c:/Users/ahiva/OneDrive/Desktop/COffee/.agents/rules/ui-ux-design-laws.md) and [.agents/skills/antinoob-ui-ux/SKILL.md](file:///c:/Users/ahiva/OneDrive/Desktop/COffee/.agents/skills/antinoob-ui-ux/SKILL.md)).

---

## The 15 Core UX Laws to Always Remember When Building MVPs

### Pillar 1: Heuristic Usability
- **01. Fitts's Law**: Targets must be large and reachable. Minimum 44×44px touch targets on mobile; primary actions in thumb zones.
- **02. Jakob's Law**: Follow standard web/app conventions. Users expect familiar patterns (top search, standard navigation, conventional icons).

### Pillar 2: Gestalt Visual Hierarchy
- **03. Law of Proximity**: Keep related elements close together (e.g. label 4px from input). Separate distinct sections with 2.5×–3× whitespace.
- **04. Law of Similarity**: Same visual attributes = same role. Keep primary CTAs, pill badges, and interactive states consistent.
- **05. Law of Common Region**: Group items inside clear surface cards (`var(--bg-surface)`) rather than noisy 1px dividing borders.

### Pillar 3: Cognitive Bias & Decision Architecture
- **06. Hick's Law**: Less choices = faster decisions. Categorize long lists into filter pills; hide advanced options under disclosure tabs.
- **07. Miller's Law**: Working memory limit is 7 ± 2. Display 5–9 items max per chunk; split long flows into 3–4 numbered steps.
- **08. Serial Position Effect**: First and last items are remembered best. Place critical actions and high-value options at sequence ends.
- **09. Von Restorff Effect**: Isolate and highlight exactly ONE primary CTA per view with strong contrast; keep secondary options muted.
- **10. Peak-End Rule**: Memorable peak delight + reassuring end confirmation. Always celebrate successful bookings/orders with a positive finish.
- **11. Zeigarnik Effect**: Unfinished tasks linger in memory. Use progress bars ("Step 2 of 3 — 66%") and completion meters to drive momentum.

### Pillar 4: Timing & Robustness
- **12. Doherty Threshold**: Respond in < 400ms. Provide immediate button feedback (< 100ms) and show skeleton loaders on async operations.
- **13. Parkinson's Law**: Work expands to fill perceived time. Show upfront estimates ("Takes 90s") to prevent form drop-offs.
- **14. Occam's Razor**: Ruthlessly simplify. Cut decorative noise, superfluous inputs, and redundant confirmation dialogs.
- **15. Postel's Law**: Be liberal in what you accept, conservative in what you send. Forgive diverse input formats (spaces, hyphens, country codes); return clean, deterministic data.
