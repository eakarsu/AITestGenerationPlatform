// Custom Views — additive routes for the four "Test Views" features.
// 1) GET  /api/custom-views/test-coverage-chart      (VIZ)
// 2) GET  /api/custom-views/module-pass-fail-heatmap (VIZ)
// 3) GET  /api/custom-views/test-report-pdf          (NON-VIZ, PDF download)
// 4) GET  /api/custom-views/generation-rules         (NON-VIZ, list + meta)
//    POST /api/custom-views/generation-rules         (NON-VIZ, create)
//    PUT  /api/custom-views/generation-rules/:id     (NON-VIZ, update)
//    DELETE /api/custom-views/generation-rules/:id   (NON-VIZ, delete)
const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');

const router = express.Router();

// Local lightweight rate-limit; default keyGenerator handles IPv6 safely.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
router.use(limiter);

// In-memory store for generation rules. Seeded with sensible defaults so the
// UI is non-empty on first load.
let nextRuleId = 4;
const rules = [
  {
    id: 1,
    framework: 'Jest',
    language: 'JavaScript',
    depth: 'unit',
    enabled: true,
    description: 'Auto-generate Jest unit tests with mocks for external deps.',
    coverage_target: 85,
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    framework: 'Pytest',
    language: 'Python',
    depth: 'integration',
    enabled: true,
    description: 'Pytest integration suites with fixtures + parametrize.',
    coverage_target: 75,
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    framework: 'JUnit 5',
    language: 'Java',
    depth: 'e2e',
    enabled: false,
    description: 'End-to-end JUnit 5 suites with Mockito mocks.',
    coverage_target: 60,
    updated_at: new Date().toISOString(),
  },
];

// ── 1) VIZ — Test coverage chart series ────────────────────────────────
router.get('/test-coverage-chart', auth, async (req, res) => {
  // Synthetic 30-day series — stable for the demo user.
  const days = 30;
  const today = new Date();
  const points = [];
  let line = 62;
  let branch = 48;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    line = Math.max(40, Math.min(98, line + (Math.random() * 4 - 1.4)));
    branch = Math.max(30, Math.min(95, branch + (Math.random() * 4 - 1.6)));
    points.push({
      date: d.toISOString().slice(0, 10),
      line_coverage: Math.round(line * 10) / 10,
      branch_coverage: Math.round(branch * 10) / 10,
      function_coverage: Math.round(Math.min(100, (line + branch) / 2 + 5) * 10) / 10,
    });
  }
  res.json({
    series: points,
    summary: {
      avg_line: Math.round(points.reduce((a, p) => a + p.line_coverage, 0) / points.length * 10) / 10,
      avg_branch: Math.round(points.reduce((a, p) => a + p.branch_coverage, 0) / points.length * 10) / 10,
      latest: points[points.length - 1],
    },
  });
});

// ── 2) VIZ — Module-level pass/fail heatmap ────────────────────────────
router.get('/module-pass-fail-heatmap', auth, async (req, res) => {
  const modules = [
    'auth', 'projects', 'test-cases', 'test-suites', 'code-analysis',
    'bug-detection', 'coverage', 'reports', 'teams', 'api-testing',
    'perf-testing', 'security-testing',
  ];
  const buckets = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const cells = [];
  for (const m of modules) {
    for (const b of buckets) {
      const total = 20 + Math.floor(Math.random() * 60);
      const failed = Math.floor(Math.random() * Math.min(8, total));
      const passed = total - failed;
      cells.push({
        module: m,
        bucket: b,
        passed,
        failed,
        total,
        pass_rate: Math.round((passed / total) * 1000) / 10,
      });
    }
  }
  res.json({ modules, buckets, cells });
});

// ── 3) NON-VIZ — Test report PDF (returns a minimal valid PDF) ─────────
router.get('/test-report-pdf', auth, async (req, res) => {
  const title = 'AI Test Generation Platform — Report';
  const ts = new Date().toISOString();
  const summary = [
    `Generated: ${ts}`,
    `User: ${req.user?.email || 'unknown'}`,
    `Total rules: ${rules.length}`,
    `Enabled rules: ${rules.filter(r => r.enabled).length}`,
    `Frameworks: ${[...new Set(rules.map(r => r.framework))].join(', ')}`,
  ];
  // Build a minimal one-page PDF without any external dependency.
  const lines = [
    title,
    '',
    ...summary,
    '',
    'Top Rules:',
    ...rules.slice(0, 10).map((r, i) =>
      `${i + 1}. [${r.framework}/${r.language}] depth=${r.depth} target=${r.coverage_target}%`
    ),
  ];
  // Escape PDF special chars.
  const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  let textStream = 'BT /F1 12 Tf 50 770 Td 14 TL\n';
  lines.forEach((ln, i) => {
    if (i === 0) textStream += `(${esc(ln)}) Tj\n`;
    else textStream += `T* (${esc(ln)}) Tj\n`;
  });
  textStream += 'ET\n';
  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ' +
    '/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n'
  );
  objects.push(
    `4 0 obj\n<< /Length ${textStream.length} >>\nstream\n${textStream}endstream\nendobj\n`
  );
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += String(off).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="test-report.pdf"');
  res.send(Buffer.from(pdf, 'binary'));
});

// ── 4) NON-VIZ — Test generation rules CRUD ────────────────────────────
const ALLOWED_DEPTHS = ['unit', 'integration', 'e2e', 'smoke'];
const ALLOWED_FRAMEWORKS = [
  'Jest', 'Mocha', 'Vitest', 'Pytest', 'unittest', 'JUnit 5', 'TestNG',
  'RSpec', 'Go test', 'Cypress', 'Playwright', 'Selenium',
];
const ALLOWED_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Ruby', 'Go', 'C#', 'PHP', 'Rust',
];

router.get('/generation-rules', auth, async (req, res) => {
  res.json({
    rules,
    meta: {
      depths: ALLOWED_DEPTHS,
      frameworks: ALLOWED_FRAMEWORKS,
      languages: ALLOWED_LANGUAGES,
    },
  });
});

router.post('/generation-rules', auth, async (req, res) => {
  const { framework, language, depth, description, coverage_target, enabled } = req.body || {};
  if (!framework || !language || !depth) {
    return res.status(400).json({ error: 'framework, language, depth are required' });
  }
  if (!ALLOWED_DEPTHS.includes(depth)) {
    return res.status(400).json({ error: `depth must be one of: ${ALLOWED_DEPTHS.join(', ')}` });
  }
  const rule = {
    id: nextRuleId++,
    framework: String(framework).slice(0, 40),
    language: String(language).slice(0, 40),
    depth,
    enabled: enabled !== false,
    description: String(description || '').slice(0, 500),
    coverage_target: Math.max(0, Math.min(100, Number(coverage_target) || 70)),
    updated_at: new Date().toISOString(),
  };
  rules.push(rule);
  res.status(201).json(rule);
});

router.put('/generation-rules/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  const idx = rules.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  const r = rules[idx];
  const { framework, language, depth, description, coverage_target, enabled } = req.body || {};
  if (depth && !ALLOWED_DEPTHS.includes(depth)) {
    return res.status(400).json({ error: `depth must be one of: ${ALLOWED_DEPTHS.join(', ')}` });
  }
  rules[idx] = {
    ...r,
    framework: framework !== undefined ? String(framework).slice(0, 40) : r.framework,
    language: language !== undefined ? String(language).slice(0, 40) : r.language,
    depth: depth || r.depth,
    description: description !== undefined ? String(description).slice(0, 500) : r.description,
    coverage_target: coverage_target !== undefined
      ? Math.max(0, Math.min(100, Number(coverage_target) || 0))
      : r.coverage_target,
    enabled: enabled !== undefined ? !!enabled : r.enabled,
    updated_at: new Date().toISOString(),
  };
  res.json(rules[idx]);
});

router.delete('/generation-rules/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  const idx = rules.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  const [removed] = rules.splice(idx, 1);
  res.json({ deleted: true, rule: removed });
});

module.exports = router;
