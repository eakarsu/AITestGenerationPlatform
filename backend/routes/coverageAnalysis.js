const express = require('express');
const { CoverageAnalysis } = require('../models');
const auth = require('../middleware/auth');
const openrouter = require('../services/openrouter');
const { aiRateLimiter, persistAiResult } = require('../middleware/aiMiddleware');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await CoverageAnalysis.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Apply pass 5 — must precede the generic /:id route below.
router.get('/visualization-data', auth, async (req, res) => {
  try {
    let items = [];
    try {
      items = await CoverageAnalysis.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 200,
      });
    } catch (_) { /* ignore */ }
    const series = items.map(i => {
      let metrics = {};
      try { metrics = typeof i.metrics === 'string' ? JSON.parse(i.metrics) : (i.metrics || {}); } catch (_) {}
      return {
        id: i.id,
        file: i.file_path || i.fileName || `record-${i.id}`,
        line_coverage: metrics.line_coverage ?? metrics.lineCoverage ?? null,
        branch_coverage: metrics.branch_coverage ?? metrics.branchCoverage ?? null,
        created_at: i.createdAt,
      };
    });
    res.json({ series, count: series.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await CoverageAnalysis.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await CoverageAnalysis.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await CoverageAnalysis.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await CoverageAnalysis.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Flaky test detector — analyze run history to surface non-deterministic tests
router.post('/flaky-detect', auth, aiRateLimiter, async (req, res) => {
  try {
    const { runs } = req.body;
    if (!Array.isArray(runs) || !runs.length) return res.status(400).json({ error: 'runs array required' });

    const systemPrompt = 'You are a test reliability analyst. Identify flaky/non-deterministic tests based on run history. Always respond with valid JSON only.';
    const userMessage = `Analyze these test runs and identify flaky tests.
Runs: ${JSON.stringify(runs.slice(0, 200))}

Return JSON:
{
  "flaky_tests": [{"name": "...", "flake_rate_pct": <0-100>, "evidence": ["..."], "likely_cause": "...", "fix_suggestion": "..."}],
  "stability_score": <0-100>,
  "summary": "..."
}`;
    const response = await openrouter.chat(systemPrompt, userMessage);
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content) || { raw: formatted.content };
    await persistAiResult(req.user.id, 'flaky-detect', { runCount: runs.length }, parsed);
    res.json({ result: parsed, raw: formatted });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Dead code detection — flag uncovered code paths
router.post('/dead-code', auth, aiRateLimiter, async (req, res) => {
  try {
    const { code, language, coverageReport } = req.body;
    if (!code) return res.status(400).json({ error: 'code required' });

    const systemPrompt = 'You are a code quality analyst. Identify dead/unreachable code and uncovered paths. Always respond with valid JSON only.';
    const userMessage = `Identify dead code and uncovered paths.
Language: ${language || 'unknown'}
Code:
${(code || '').slice(0, 8000)}
Coverage report (optional): ${JSON.stringify(coverageReport || {}).slice(0, 4000)}

Return JSON:
{
  "dead_code_segments": [{"location": "...", "reason": "...", "safe_to_remove": <boolean>, "snippet": "..."}],
  "uncovered_paths": ["..."],
  "removal_estimate_loc": <number>,
  "risks": ["..."],
  "summary": "..."
}`;
    const response = await openrouter.chat(systemPrompt, userMessage);
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content) || { raw: formatted.content };
    await persistAiResult(req.user.id, 'dead-code', { language, codeLength: code.length }, parsed);
    res.json({ result: parsed, raw: formatted });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Performance regression detection — compare timed runs across versions
router.post('/performance-regression', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    }
    const { runs, baseline, threshold } = req.body;
    if (!Array.isArray(runs) || runs.length < 2) {
      return res.status(400).json({ error: 'runs array with at least 2 entries required' });
    }

    const systemPrompt = 'You are a performance engineering analyst. Detect performance regressions across timed test runs by comparing latency, throughput, and resource metrics. Always respond with valid JSON only.';
    const userMessage = `Detect performance regressions across these runs.
Runs (chronological): ${JSON.stringify(runs.slice(0, 200))}
Baseline (optional): ${JSON.stringify(baseline || {})}
Regression threshold (% slowdown to flag, optional): ${threshold ?? 10}

Return JSON:
{
  "regressions": [
    {"test_or_endpoint": "...", "metric": "p50_ms|p95_ms|p99_ms|throughput_rps|cpu|mem", "baseline_value": <number>, "current_value": <number>, "delta_pct": <number>, "severity": "critical|high|medium|low", "likely_cause": "...", "evidence": ["..."]}
  ],
  "improvements": [
    {"test_or_endpoint": "...", "metric": "...", "delta_pct": <number>}
  ],
  "overall_health": "stable|degrading|improving|mixed",
  "regression_count": <number>,
  "recommendations": ["..."],
  "summary": "..."
}`;
    const response = await openrouter.chat(systemPrompt, userMessage);
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content) || { raw: formatted.content };
    await persistAiResult(req.user.id, 'performance-regression', { runCount: runs.length, threshold }, parsed);
    res.json({ result: parsed, raw: formatted });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================================================
// Apply pass 5 — additive backlog endpoints.
//
// Required env vars (documented):
//   OPENROUTER_API_KEY — required by every AI endpoint here.
//   GITHUB_WEBHOOK_SECRET — for /github-webhook (NEEDS-CREDS).
//   GITHUB_TOKEN — for /github-actions-trigger (NEEDS-CREDS).
//   GITLAB_WEBHOOK_SECRET — for /gitlab-webhook (NEEDS-CREDS).
//   JENKINS_URL, JENKINS_TOKEN — for /jenkins-trigger (NEEDS-CREDS).
//
// PRODUCT-DECISION (defaults documented inline):
//   - Coverage visualization payload: server returns a normalized series with
//     {file, line_coverage, branch_coverage}. The FE uses recharts.
//   - Webhook validation: HMAC-SHA256 of the raw body, expected in
//     `X-Hub-Signature-256` (GitHub) or `X-Gitlab-Token` (GitLab). When the
//     secret env var is unset we 503 + missing.
// =============================================================================

const crypto = require('crypto');

function timingSafeEqualStr(a, b) {
  try {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
  } catch (_) { return false; }
}

// POST /api/coverage-analysis/github-webhook
router.post('/github-webhook', async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    }
    if (!process.env.GITHUB_WEBHOOK_SECRET) {
      return res.status(503).json({ error: 'GitHub webhook not configured', missing: 'GITHUB_WEBHOOK_SECRET' });
    }
    const sig = req.headers['x-hub-signature-256'] || '';
    const body = JSON.stringify(req.body || {});
    const expected = 'sha256=' + crypto
      .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    if (!timingSafeEqualStr(sig, expected)) {
      return res.status(401).json({ error: 'invalid signature' });
    }
    const event = req.headers['x-github-event'] || 'unknown';
    const changedFiles = (req.body?.commits || []).flatMap(c =>
      [...(c.added || []), ...(c.modified || []), ...(c.removed || [])]
    ).slice(0, 50);
    const response = await openrouter.chat(
      'You are a test-impact analyzer. Pick which tests to run for the changed files. JSON only.',
      `EVENT: ${event}\nCHANGED: ${JSON.stringify(changedFiles)}\nJSON: { "tests_to_run": ["..."], "rationale": "..." }`
    );
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content) || { raw: formatted.content };
    res.json({ accepted: true, event, plan: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/coverage-analysis/gitlab-webhook
router.post('/gitlab-webhook', async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    }
    if (!process.env.GITLAB_WEBHOOK_SECRET) {
      return res.status(503).json({ error: 'GitLab webhook not configured', missing: 'GITLAB_WEBHOOK_SECRET' });
    }
    const token = req.headers['x-gitlab-token'] || '';
    if (!timingSafeEqualStr(token, process.env.GITLAB_WEBHOOK_SECRET)) {
      return res.status(401).json({ error: 'invalid token' });
    }
    const event = req.headers['x-gitlab-event'] || 'unknown';
    const summary = JSON.stringify(req.body || {}).slice(0, 1500);
    const response = await openrouter.chat(
      'You are a test-impact analyzer. JSON only.',
      `EVENT: ${event}\nPAYLOAD: ${summary}\nJSON: { "tests_to_run": ["..."], "rationale": "..." }`
    );
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content) || { raw: formatted.content };
    res.json({ accepted: true, event, plan: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/coverage-analysis/github-actions-trigger
router.post('/github-actions-trigger', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    }
    if (!process.env.GITHUB_TOKEN) {
      return res.status(503).json({ error: 'GitHub Actions trigger not configured', missing: 'GITHUB_TOKEN' });
    }
    const { owner, repo, workflow_id = 'tests.yml', ref = 'main', inputs = {} } = req.body || {};
    if (!owner || !repo) return res.status(400).json({ error: 'owner and repo required' });
    const response = await openrouter.chat(
      'You are a CI workflow planner. JSON only.',
      `Plan a workflow_dispatch on ${owner}/${repo} workflow=${workflow_id} ref=${ref} inputs=${JSON.stringify(inputs)}.
JSON: { "method": "POST", "url": "https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches", "headers": { "Authorization": "Bearer <redacted>", "Accept": "application/vnd.github+json" }, "body": { "ref": "${ref}", "inputs": ${JSON.stringify(inputs)} }, "rationale": "..." }`
    );
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content) || { raw: formatted.content };
    res.json({ simulated: true, plan: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/coverage-analysis/jenkins-trigger
router.post('/jenkins-trigger', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    }
    if (!process.env.JENKINS_URL) {
      return res.status(503).json({ error: 'Jenkins URL not configured', missing: 'JENKINS_URL' });
    }
    if (!process.env.JENKINS_TOKEN) {
      return res.status(503).json({ error: 'Jenkins token not configured', missing: 'JENKINS_TOKEN' });
    }
    const { job, params = {} } = req.body || {};
    if (!job) return res.status(400).json({ error: 'job required' });
    const response = await openrouter.chat(
      'You are a Jenkins job planner. JSON only.',
      `Plan a Jenkins build trigger.
JOB: ${job}
PARAMS: ${JSON.stringify(params)}
JSON: { "method": "POST", "url": "${process.env.JENKINS_URL}/job/${job}/buildWithParameters", "params": ${JSON.stringify(params)}, "rationale": "..." }`
    );
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content) || { raw: formatted.content };
    res.json({ simulated: true, plan: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/coverage-analysis/visualization-data — registered above (must
// precede the generic /:id route).

module.exports = router;
