# FindCo — Superpowers SDLC Framework
> Adopted from [obra/superpowers](https://github.com/obra/superpowers)

This repository strictly enforces the **Superpowers Software Development Life Cycle (SDLC)** methodology. No code is modified or feature built without passing through these systematic stages.

---

## The 7-Stage Superpowers SDLC

```
[ 1. Brainstorm & Spec ] ➔ [ 2. Plan (TDD & Tasks) ] ➔ [ 3. Subagent Execution ]
           │                                                        │
           ▼                                                        ▼
[ 7. Branch & Ship ]     ◀─ [ 6. End-to-End Verify ]  ◀─ [ 4 & 5. Peer Review & Debug ]
```

### Stage 1: Brainstorming Ideas Into Designs (`superpowers:brainstorming`)
- **Rule**: Never jump directly into implementation. Ask questions one at a time to explore requirements, purpose, and constraints.
- Propose 2–3 architectural approaches with clear trade-offs and recommendations.
- Present the design in digestible sections.
- Output: Save written spec to `docs/superpowers/specs/YYYY-MM-DD--<feature-name>--design.md` and obtain sign-off.

### Stage 2: Writing Implementation Plans (`superpowers:writing-plans`)
- Break the spec into bite-sized, independently testable tasks.
- Structure each task with explicit file paths, exact function signatures, and concrete test expectations.
- Emphasize **Red-Green-Refactor TDD**, **YAGNI**, and **DRY**.
- Output: Save implementation plan to `docs/superpowers/plans/YYYY-MM-DD--<feature-name>.md`.

### Stage 3: Subagent-Driven Development (`superpowers:subagent-driven-development`)
- Execute task-by-task using isolated subagents with explicit, minimal context.
- Maintain checkable task checklists (`- [ ]` / `- [x]`).
- Validate each task slice before proceeding to the next.

### Stage 4: Continuous Peer Code Review (`superpowers:requesting-code-review`)
- Multi-axis review across 5 critical dimensions:
  1. **Correctness**: Adherence to the approved spec.
  2. **Security**: OWASP compliance, injection protection, JWT & RLS verification.
  3. **Performance**: Render efficiency, bundle size, latency.
  4. **Architecture & DRY**: Clean isolation and domain boundaries.
  5. **Maintainability**: Clear typography, comments, and readability.

### Stage 5: Systematic Root-Cause Debugging (`superpowers:systematic-debugging`)
- No shotgun fixes or blind guessing.
- Reproduce the failure, inspect stack traces/logs, isolate the exact root cause, formulate a targeted fix, and verify with tests.

### Stage 6: Evidence-Based Verification (`superpowers:verification-before-completion`)
- Zero unproven assertions. Every deliverable requires tangible verification:
  - Unit/integration test results.
  - Browser automation walkthrough recordings/screenshots.
  - Build confirmation (`npm run build`).

### Stage 7: Branch Finishing & Production Release (`superpowers:finishing-a-development-branch`)
- Conventional atomic commits (`feat:`, `fix:`, `refactor:`, `test:`).
- Verified production deployment on Vercel (`npx vercel --prod --yes`).
- Updated release notes and documentation.
