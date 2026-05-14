# Audit Note — AITestGenerationPlatform

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_08.md` (section 17).

## Original Recommendations

### Audit Verdict
"0 functional AI endpoints" — but actual code has substantial AI: routes/codeAnalysis.js `/analyze`, routes/testCases.js `/generate` + `/upload-code` + `/mutation-score`, regression/performance/security/integration test generators all live.

### Missing AI Counterparts
- AI-driven test generation (EXISTS via `testCases.js /:id/generate`)
- Mutation testing (EXISTS via `testCases.js /:id/mutation-score`)

### Missing Non-AI Features
- Git/CI integration
- Code coverage visualization
- Test flakiness detection
- Dead code removal

### Custom Feature Suggestions
- AI test generator (DONE)
- Mutation testing (DONE)
- Flaky test detector
- Dead code removal
- Performance regression detection

## Implemented (this round)
1. `POST /api/coverage-analysis/flaky-detect` — flaky test analysis from run history.
2. `POST /api/coverage-analysis/dead-code` — dead code & uncovered paths analysis.

Pattern reused: `openrouter.chat` + `openrouter.formatResponse` + `openrouter.parseAIJson` + `aiRateLimiter` + `persistAiResult`. Syntax-checked.

## Backlog (prioritized)
1. **MECHANICAL** Performance regression detection endpoint (input: timed runs).
2. **NEEDS-CREDS** GitHub/GitLab webhooks for auto test triggering.
3. **NEEDS-CREDS** CI/CD integrations (Jenkins, GitHub Actions).
4. **NEEDS-PRODUCT-DECISION** Coverage visualization frontend.

## Apply pass 3 (frontend)

**Action:** LEFT-AS-IS (FE already wired).

The two pass-2 endpoints (`/api/coverage-analysis/flaky-detect`, `/api/coverage-analysis/dead-code`) have dedicated pages in `frontend/src/pages/FlakyDetect.js` and `frontend/src/pages/DeadCode.js`. Both use the existing `services/api.js` axios instance (token-aware), include sensible default sample inputs, and display the structured AI result. Custom routes registered in `frontend/src/App.js` (`/flaky-detect`, `/dead-code`) and the `Sidebar` features list (entries with `customRoute: true`).

Other AI endpoints in the backend (`codeAnalysis.js /analyze`, `testCases.js /generate`, `/upload-code`, `/mutation-score`, plus regression/performance/security/integration/api/bug-detection generators) are surfaced via the generic `FeaturePage` component.

Backend mount verified: `app.use('/api/coverage-analysis', require('./routes/coverageAnalysis'))` in `backend/server.js`.

Files: none modified.

## Apply pass 4 (mechanical backlog)

Implemented the one mechanical item from the prior backlog list (performance regression detection).

### Backend (`backend/routes/coverageAnalysis.js`, extended)

**POST `/api/coverage-analysis/performance-regression`** — input `{ runs[], baseline?, threshold? }`. Asks the LLM to compare the timed runs across versions and flag latency / throughput / resource regressions versus the baseline (or first run if none supplied), with severity, likely cause, and recommendations.

- Returns **HTTP 503** when `OPENROUTER_API_KEY` is unset.
- Uses existing `auth`, `aiRateLimiter`, `openrouter.chat`, `openrouter.formatResponse`, `openrouter.parseAIJson`, `persistAiResult` — same pattern as the existing `flaky-detect` and `dead-code` endpoints.
- Returns `{ result, raw }` shape matching the other coverage-analysis AI endpoints.

### Frontend (`frontend/src/pages/PerformanceRegression.js`, created)

New page modeled directly on `FlakyDetect.js` (same styles object, same JSON-textarea + parse-error pattern, same `services/api` axios instance, same `react-toastify` toasts). Exposes runs (JSON array), optional baseline (JSON), and a numeric threshold. Surfaces server `503` status with an explicit "AI service unavailable" prefix.

Wired into `frontend/src/App.js`:
- `import PerformanceRegression from './pages/PerformanceRegression';`
- New feature entry `{ key: 'performance-regression', label: 'Performance Regression', icon: 'FaTachometerAlt', ai: true, customRoute: true }`.
- New route `<Route path="/performance-regression" element={<PerformanceRegression />} />`.

No new dependencies.

### Smoke test
Started backend on port 3094. Logged in as `demo@testgen.ai / demo123`, called the new endpoint with a sample two-version runs payload — request reached the endpoint, passed `auth` + `aiRateLimiter`, and OpenRouter returned `404 No endpoints found for anthropic/claude-3-5-sonnet-20241022.` (the configured model in `backend/services/openrouter.js` is no longer available — pre-existing project issue, also affects all other AI routes). Per constraints, did not modify the model name.

Route registration verified by enumerating `router.stack` paths in `coverageAnalysis.js`: includes `flaky-detect`, `dead-code`, `performance-regression`.

### Files modified / created
- `backend/routes/coverageAnalysis.js`
- `frontend/src/pages/PerformanceRegression.js` (new)
- `frontend/src/App.js`

## Apply pass 5 (all backlog)

Implemented 5 endpoints + 2 new FE pages additively (cap was 10) by extending `backend/routes/coverageAnalysis.js` and adding 2 pages under `frontend/src/pages/`. No changes to working code, no new deps.

### Backend (new endpoints, all gate on OPENROUTER_API_KEY at minimum)
1. `POST /api/coverage-analysis/github-webhook` — NEEDS-CREDS: GITHUB_WEBHOOK_SECRET. Validates `X-Hub-Signature-256` HMAC; LLM produces tests-to-run plan.
2. `POST /api/coverage-analysis/gitlab-webhook` — NEEDS-CREDS: GITLAB_WEBHOOK_SECRET. Validates `X-Gitlab-Token`.
3. `POST /api/coverage-analysis/github-actions-trigger` — NEEDS-CREDS: GITHUB_TOKEN. Additive: returns workflow_dispatch plan only.
4. `POST /api/coverage-analysis/jenkins-trigger` — NEEDS-CREDS: JENKINS_URL + JENKINS_TOKEN. Additive: returns buildWithParameters plan only.
5. `GET /api/coverage-analysis/visualization-data` — PRODUCT-DECISION resolved: returns normalised series of `{file, line_coverage, branch_coverage, created_at}` from existing `CoverageAnalysis` records. Registered before generic `/:id` route to avoid integer-cast collision.

Webhook validation uses HMAC-SHA256 with `crypto.timingSafeEqual` — no new deps.

### Frontend
- `frontend/src/pages/CIIntegrations.js` (new): tabbed UI for the 4 webhook/CI endpoints. Uses existing `services/api` axios instance, existing `react-toastify` toasts. 503-aware: surfaces `missing` env var to the user.
- `frontend/src/pages/CoverageVisualization.js` (new): table + inline ASCII-style coverage bars. PRODUCT-DECISION: no new chart library; uses inline div bars colour-coded by threshold.
- `frontend/src/App.js` extended: 2 imports + 2 sidebar entries (`customRoute: true`) + 2 routes.

### Smoke test
Started backend on port 3084. Login as `demo@testgen.ai / demo123` succeeded. `GET /api/coverage-analysis/visualization-data` returned 200 with 200 records. `POST /api/coverage-analysis/jenkins-trigger` (no JENKINS_URL set) returned `HTTP 503 {"error":"Jenkins URL not configured","missing":"JENKINS_URL"}` as designed.

### Files modified / created
- `backend/routes/coverageAnalysis.js` (extended)
- `frontend/src/pages/CIIntegrations.js` (created)
- `frontend/src/pages/CoverageVisualization.js` (created)
- `frontend/src/App.js` (extended)
