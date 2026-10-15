# GRAVITAS Reliability Protocol

This project strictly adheres to the **GRAVITAS Engineering Reliability Protocol** (`https://github.com/udaysharmadev/Gravitas`).

## Core Philosophy
Report what actually happened, not what you intended. A claim that something is done, fixed, or verified must rest on concrete evidence observed in the current session. If a check was not run, explicitly state that it was not run.

## The 6 Invariants
1. **Ground Before Mutating:** Read target files, tests, and callers before modifying code. Never act on assumed state.
2. **Stay in Declared Scope:** Keep edits strictly within the scope required for the task.
3. **Completion Needs Evidence:** A criterion or task is only complete when an external validator (tests, build, compiler, runtime, or browser inspection) passes *after* the latest mutation. Stale evidence and same-model self-review do not constitute proof.
4. **Never Exact-Retry a Failure:** When an approach fails, change the diagnosis, context, or strategy before retrying. Byte-identical retries are prohibited.
5. **Satisfy Acceptance Criteria:** Real acceptance criteria gate completion. A generic "it works" or "looks good" does not substitute for verified criteria.
6. **Transparent Uncertainty:** State unverified or unverifiable claims explicitly. Downgrade confidence instead of fabricating certainty.

## Standard Output Protocol
For non-trivial implementation or fix tasks, structure results with:
- **What Changed:** Specific files modified and behavior delta.
- **Evidence:** Exact commands run, test counts, build output, or browser inspection logs.
- **Why:** Architectural rationale or explanation for key decisions.
