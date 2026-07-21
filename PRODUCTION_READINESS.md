# Production readiness

The governed API at `/api/governance` is the supported test-generation run path. It records tenant-scoped versioned inputs, sandbox queue state, artifacts, evaluations, independent reviews, write approvals, export receipts, connector failures, an idempotent outbox, immutable attempts, bounded retry scheduling, and dead-letter state. It does not execute untrusted code, write repositories, trigger CI, or call a model provider.

## Deployment sequence

1. Review and back up the database, then apply `backend/migrations/001_governed_test_generation.sql` as a separate controlled migration.
2. Copy `.env.example` to `.env`, replace placeholders, and configure a unique 32-plus-character JWT secret and explicit production CORS allowlist.
3. Install locked dependencies explicitly. `start.sh` performs no installation, seeding, port killing, or schema mutation.
4. Provision memberships and separately deploy sandbox and connector workers for repositories, CI/CD, models, telemetry, secrets, artifacts, and ticketing. Use short-lived credentials outside workflow payloads and post opaque receipts.

Production rejects legacy provider routes, mock/demo flags, wildcard CORS, weak secrets, and Sequelize/schema bootstrap. Provider-heavy legacy test routes are quarantined by default.

## Required external validation

Benchmark correctness, reliability, latency, cost, regressions, concurrency, provider failure, retry exhaustion, dead-letter recovery, and reproducible reruns on versioned fixtures. A security team must validate sandbox escape resistance, egress policy, resource limits, secret isolation, artifact retention, and repository write approvals before any untrusted execution. No external provider, repository, or CI execution was performed here.
