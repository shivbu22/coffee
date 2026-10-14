# Superpowers SDLC Workspace Rule

Always follow the **Superpowers SDLC** (`https://github.com/obra/superpowers`) methodology across this project:

1. **Brainstorm Before Coding**:
   - For any new feature, improvement, or architectural change, do NOT start by modifying code.
   - Clarify intent, scope, and trade-offs.
   - Present a structured design and save the specification in `docs/superpowers/specs/YYYY-MM-DD--<feature-name>--design.md`.

2. **Write Implementation Plans**:
   - Before executing multi-step tasks, produce a bite-sized, TDD-focused plan in `docs/superpowers/plans/YYYY-MM-DD--<feature-name>.md`.
   - Each task must define exact file paths, expected interfaces, and pass/fail tests.

3. **Subagent & Incremental Execution**:
   - Work in thin, verifiable slices.
   - Maintain checked tasks (`- [x]`).

4. **Rigorous Review & Verification**:
   - Every completed task must be verified with executable tests or automated browser validation before being marked done.
   - All commits must use conventional format (`feat:`, `fix:`, `refactor:`, `test:`).
