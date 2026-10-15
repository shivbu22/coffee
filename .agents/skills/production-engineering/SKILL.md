---
name: production-engineering
description: Comprehensive production readiness and backend systems engineering skill. Enforces strict engineering standards across 60 critical production disciplines including API design, auth/RBAC, input validation, concurrency & locking, zero-downtime migrations, caching, rate limiting, queues/DLQs, circuit breakers, observability, and AI safety.
---

# Senior Production Engineering & Systems Architecture Skill

> "A system is not production-ready simply because it compiles and passes tests on localhost. True production readiness means resilience under traffic spikes, defensiveness against malformed data, strict concurrency guarantees, zero data loss, and rapid diagnosability when downstream services fail."

When invoked, this skill conducts architectural audits, guides backend system design, and enforces strict engineering disciplines across all 60 production benchmarks.

---

## The 60 Production Engineering Benchmarks

### 1. API Surface & Error Contracts
- **Clean Endpoints**: Standardized RESTful nouns or typed RPC/GraphQL endpoints (`GET /api/v1/companions`, `POST /api/v1/bookings`).
- **Explicit Versioning**: API version baked into path (`/v1/`) or accept header (`application/vnd.findco.v1+json`).
- **Deterministic Error Envelope**: Every non-2xx response must return a standard schema:
  ```json
  {
    "success": false,
    "error": {
      "code": "SLOT_ALREADY_RESERVED",
      "message": "The selected companion slot is no longer available.",
      "details": { "slot_id": "slot_981", "conflicting_booking_id": "bk_102" },
      "timestamp": "2026-10-16T00:15:00Z"
    }
  }
  ```
- **Pagination by Default**: Never return unbounded collections. Mandate cursor-based pagination (`limit` + `starting_after`) or keyset pagination. Never allow `SELECT *` without a limit.

### 2. Authentication, Authorization & Identity (RBAC)
- **Session & Token Architecture**: Short-lived access tokens (15–60 mins) paired with rotating refresh tokens stored in secure, `HttpOnly`, `SameSite=Lax` cookies.
- **Strict Role-Based Access Control (RBAC)**: Enforce permissions at the data layer (e.g. PostgreSQL Row Level Security `RLS`) and gateway level. Clients cannot perform buddy actions; buddies cannot alter client payments; admins require MFA.
- **Cryptographic Storage**: Never store plaintext credentials. Use Argon2id, bcrypt (work factor $\ge 12$), or salted `SHA-256` with 16-byte random salts.

### 3. Input Validation & Zero Client Trust
- **Never Trust the Client**: Validate all incoming payloads against strict runtime schemas (Zod, Joi, or Pydantic) before hitting business logic.
- **Sanitization & Escaping**: Strip unexpected fields, trim whitespace, normalize phone numbers to E.164, and escape HTML to prevent XSS.
- **Type Bounds & Clamps**: Enforce numeric boundaries (e.g. `hourly_rate BETWEEN 300 AND 3000`), string lengths (e.g. `12-digit Aadhaar`), and valid enum values.

### 4. Data Modeling, Hot Queries & Database Indexes
- **Hot Path Composite Indexes**: Index foreign keys and multi-column filter queries (e.g. `(city, status, hourly_rate)` or `(buddy_id, booking_date)`).
- **Relational Integrity**: Foreign key constraints with explicit `ON DELETE RESTRICT` or `ON DELETE CASCADE`.
- **Read Replicas**: Route analytics, search, and reporting queries to read replicas; reserve the primary database for mutations.
- **Connection Pooling**: Use PgBouncer or serverless connection poolers to prevent exhausting PostgreSQL `max_connections`.

### 5. Data Correctness, Concurrency & Transactions
- **ACID Transactions**: Financial mutations (charging a wallet, creating a booking) must execute inside atomic transactions. If any sub-step fails, roll back completely.
- **Pessimistic & Optimistic Locking**:
  - *Row-Level Locking*: Prevent double-booking using `SELECT ... FOR UPDATE` or explicit unique partial indexes:
    ```sql
    CREATE UNIQUE INDEX idx_no_double_booking 
    ON bookings (companion_id, slot_timestamp) 
    WHERE status != 'cancelled';
    ```
- **Idempotency Keys**: Accept `Idempotency-Key` header on all mutation endpoints (`POST /payments`, `POST /orders`). Cache response in Redis for 24 hours to prevent duplicate charges on network retries.

### 6. Caching, Traffic Spikes & Rate Limiting
- **Multi-Tier Caching**: Cache hot, read-heavy data (e.g. verified buddy profiles) in Redis with deterministic TTLs and cache-invalidation hooks on write.
- **Throttling & Rate Limits Per Route**:
  - *Public Auth Endpoints* (`/login`, `/signup`): 5 requests/min per IP.
  - *Standard Authenticated APIs*: 100 requests/min per user.
  - *Heavy Search / Analytics*: 10 requests/min per user.
- **Circuit Breakers**: Wrap external downstream HTTP calls (e.g. SMS gateways, third-party KYC) in circuit breakers (fail fast after 5 consecutive failures rather than hanging requests).

### 7. Background Jobs, Queues & Messaging
- **Offload Heavy Work**: Emails, notifications, PDF generation, and webhook dispatches must NEVER run on the main request thread. Push to a persistent message queue (Redis BullMQ, RabbitMQ, SQS).
- **Dead-Letter Queues (DLQ)**: Failed background jobs retry with exponential backoff (e.g. 3 attempts). Poison pills move to a DLQ for manual inspection.
- **Cron Job Safety**: Prevent overlapping cron executions using distributed locks (`Redlock`). Jobs must be idempotent so running twice causes zero harm.

### 8. Zero-Downtime Deployments & Migrations
- **Expand/Contract Pattern**:
  1. *Expand*: Add new nullable column or table. Deploy code that writes to both old and new.
  2. *Backfill*: Migrate existing data in background batches.
  3. *Contract*: Deploy code that reads only from new column. Drop old column.
- **Canary & Staged Rollouts**: Ship code to 2% of traffic first. Monitor error rates for 15 minutes before rolling out to 100%.
- **Rollback Discipline**: Every release must include an automated or one-command rollback plan for both code and database.

### 9. Observability, Logging & Alert Hygiene
- **The Observability Trio**: Metrics (Prometheus/Datadog) + Logs (Structured JSON with request IDs) + Distributed Traces (OpenTelemetry).
- **Contextual Logging**: Every log entry must include: `requestId`, `userId`, `timestamp`, `service`, `durationMs`, and `statusCode`.
- **Alert Hygiene**: If an alert pages the on-call engineer at 3 AM, it MUST require immediate human intervention. Informational alerts belong in Slack or daily digests.

### 10. AI Engineering, Safety & Token Economics
- **Prompt Injection Defense**: Sanitize user inputs before passing to LLM context; enforce strict system prompt delimiters.
- **AI Cost & Spend Caps**: Enforce per-user daily token budgets and rate limits.
- **Semantic Prompt Caching**: Hash identical prompts and cache model responses to eliminate redundant API billing.
- **Pre-Production Gateway**: No feature goes to production without passing: (1) Unit & Integration test suite, (2) Security scan, (3) Migration dry-run, (4) Staging sign-off.

---

## Production Audit Matrix

When reviewing a codebase, format findings into this standardized production ledger:

| Benchmark Area | Critical Production Invariant | Code Location / Implementation | Audit Status |
| :--- | :--- | :--- | :---: |
| **API Shape** | Explicit `/v1/` routes with standard error envelope. | Routes defined with version prefixes. | PASS / FAIL |
| **Auth & RBAC** | Row-level security enabled; token expiration enforced. | Database RLS policies & JWT middleware. | PASS / FAIL |
| **Input Checks** | Zero trust validation; all strings/numbers clamped. | Zod / schema validators on endpoints. | PASS / FAIL |
| **Concurrency** | Idempotency keys & DB locking on financial mutations. | Unique indexes & `FOR UPDATE` queries. | PASS / FAIL |
| **Data Safety** | Automated backups + verified restore procedure. | WAL archiving & scheduled snapshots. | PASS / FAIL |
| **Async Queues** | Offloaded background jobs with DLQ and retries. | BullMQ / Celery worker configuration. | PASS / FAIL |
| **Observability**| Structured JSON logs with correlated `requestId`. | Logger middleware & telemetry traces. | PASS / FAIL |

---

## Production Readiness Sign-Off Checklist
Before shipping any feature to production, verify:
- [ ] Database queries on hot paths have composite indexes.
- [ ] All database migrations are backward-compatible (expand/contract).
- [ ] Sensitive secrets are in environment variables, never committed to git.
- [ ] Financial and booking mutations are protected by idempotency keys and row locks.
- [ ] Rate limiters are active on public and authentication endpoints.
- [ ] Downstream third-party HTTP calls have timeouts (< 5s) and circuit breakers.
- [ ] Logs are structured JSON with correlated request tracing IDs.
- [ ] Rollback strategy has been tested and verified in staging.
