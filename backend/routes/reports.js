const express = require('express');
const { Report, TestExecution, SecurityTest } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

function getPagination(req) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  return { page, limit, offset: (page - 1) * limit };
}

router.get('/', auth, async (req, res) => {
  try {
    if (req.query.page) {
      const { page, limit, offset } = getPagination(req);
      const { count, rows } = await Report.findAndCountAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit, offset });
      return res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
    }
    const items = await Report.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Report.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await Report.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Report.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Report.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Generate JSON report ─────────────────────────────────────────────────────
router.get('/:id/generate', auth, async (req, res) => {
  try {
    const report = await Report.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const executions = await TestExecution.findAll({
      where: { userId: req.user.id, ...(report.projectName ? {} : {}) },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    const securityTests = await SecurityTest.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    const totalTests = executions.reduce((sum, e) => sum + (e.totalTests || 0), 0);
    const totalPassed = executions.reduce((sum, e) => sum + (e.passed || 0), 0);
    const totalFailed = executions.reduce((sum, e) => sum + (e.failed || 0), 0);
    const totalVulns = securityTests.reduce((sum, s) => sum + (s.vulnerabilitiesFound || 0), 0);
    const criticalVulns = securityTests.reduce((sum, s) => sum + (s.criticalCount || 0), 0);

    const generated = {
      report: { id: report.id, name: report.name, type: report.type, projectName: report.projectName, generatedAt: new Date().toISOString() },
      summary: { totalTests, totalPassed, totalFailed, passRate: totalTests ? ((totalPassed / totalTests) * 100).toFixed(1) : '0', coverage: report.coverage },
      security: { totalVulnerabilities: totalVulns, criticalVulnerabilities: criticalVulns },
      executions: executions.map((e) => ({
        id: e.id, name: e.name, status: e.status, totalTests: e.totalTests, passed: e.passed, failed: e.failed, duration: e.duration, environment: e.environment,
      })),
    };

    // Update report stats
    await report.update({ totalTests, passed: totalPassed, failed: totalFailed, data: JSON.stringify(generated), status: 'completed' });

    res.json(generated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Generate HTML report ─────────────────────────────────────────────────────
router.get('/:id/generate-html', auth, async (req, res) => {
  try {
    const report = await Report.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const executions = await TestExecution.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    const securityTests = await SecurityTest.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    const totalTests = executions.reduce((sum, e) => sum + (e.totalTests || 0), 0);
    const totalPassed = executions.reduce((sum, e) => sum + (e.passed || 0), 0);
    const totalFailed = executions.reduce((sum, e) => sum + (e.failed || 0), 0);
    const passRate = totalTests ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';
    const totalVulns = securityTests.reduce((sum, s) => sum + (s.vulnerabilitiesFound || 0), 0);
    const criticalVulns = securityTests.reduce((sum, s) => sum + (s.criticalCount || 0), 0);

    const executionRows = executions.map((e) => `
      <tr>
        <td>${e.id}</td>
        <td>${e.name || '-'}</td>
        <td><span class="badge ${e.status === 'completed' ? 'badge-pass' : e.status === 'failed' ? 'badge-fail' : 'badge-skip'}">${e.status}</span></td>
        <td>${e.totalTests || 0}</td>
        <td class="pass">${e.passed || 0}</td>
        <td class="fail">${e.failed || 0}</td>
        <td>${e.duration ? e.duration + 's' : '-'}</td>
        <td>${e.environment || '-'}</td>
      </tr>
    `).join('');

    const securityRows = securityTests.map((s) => `
      <tr>
        <td>${s.id}</td>
        <td>${s.name || '-'}</td>
        <td>${s.scanType || '-'}</td>
        <td>${s.vulnerabilitiesFound || 0}</td>
        <td class="fail">${s.criticalCount || 0}</td>
        <td>${s.highCount || 0}</td>
        <td>${s.mediumCount || 0}</td>
        <td><span class="badge ${s.status === 'completed' ? 'badge-pass' : 'badge-skip'}">${s.status}</span></td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${report.name} - Test Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 32px; }
  h1 { font-size: 28px; color: #7c3aed; margin-bottom: 4px; }
  h2 { font-size: 18px; color: #a78bfa; margin: 24px 0 12px; }
  .meta { color: #64748b; font-size: 13px; margin-bottom: 32px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .kpi { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; text-align: center; }
  .kpi-value { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
  .kpi-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .pass { color: #4ade80; }
  .fail { color: #f87171; }
  .cover { color: #60a5fa; }
  .vuln { color: #fb923c; }
  .bar-wrap { background: #334155; border-radius: 4px; height: 12px; overflow: hidden; margin: 8px 0; }
  .bar { height: 100%; background: linear-gradient(90deg, #4ade80, #22c55e); border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 8px; overflow: hidden; font-size: 13px; }
  th { background: #0f172a; padding: 10px 12px; text-align: left; color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 11px; }
  td { padding: 10px 12px; border-top: 1px solid #334155; }
  .badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
  .badge-pass { background: #166534; color: #4ade80; }
  .badge-fail { background: #7f1d1d; color: #f87171; }
  .badge-skip { background: #374151; color: #9ca3af; }
  .section { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
  footer { margin-top: 40px; color: #475569; font-size: 12px; text-align: center; }
</style>
</head>
<body>
<h1>${report.name}</h1>
<p class="meta">Generated: ${new Date().toLocaleString()} | Project: ${report.projectName || 'All Projects'} | Type: ${report.type}</p>

<div class="kpi-grid">
  <div class="kpi"><div class="kpi-value">${totalTests}</div><div class="kpi-label">Total Tests</div></div>
  <div class="kpi"><div class="kpi-value pass">${totalPassed}</div><div class="kpi-label">Passed</div></div>
  <div class="kpi"><div class="kpi-value fail">${totalFailed}</div><div class="kpi-label">Failed</div></div>
  <div class="kpi"><div class="kpi-value cover">${passRate}%</div><div class="kpi-label">Pass Rate</div></div>
  <div class="kpi"><div class="kpi-value cover">${report.coverage || 0}%</div><div class="kpi-label">Coverage</div></div>
  <div class="kpi"><div class="kpi-value vuln">${totalVulns}</div><div class="kpi-label">Vulnerabilities</div></div>
  <div class="kpi"><div class="kpi-value fail">${criticalVulns}</div><div class="kpi-label">Critical Vulns</div></div>
</div>

<div class="section">
  <h2>Pass Rate</h2>
  <div class="bar-wrap"><div class="bar" style="width: ${passRate}%"></div></div>
  <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">${passRate}% of ${totalTests} tests passed</p>
</div>

<div class="section">
  <h2>Coverage</h2>
  <div class="bar-wrap" style=""><div class="bar" style="width: ${report.coverage || 0}%; background: linear-gradient(90deg, #60a5fa, #3b82f6);"></div></div>
  <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">${report.coverage || 0}% code coverage</p>
</div>

<h2>Test Executions</h2>
<table>
<thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Total</th><th>Passed</th><th>Failed</th><th>Duration</th><th>Environment</th></tr></thead>
<tbody>${executionRows || '<tr><td colspan="8" style="text-align:center;color:#64748b">No executions found</td></tr>'}</tbody>
</table>

<h2>Security Tests</h2>
<table>
<thead><tr><th>ID</th><th>Name</th><th>Scan Type</th><th>Vulns</th><th>Critical</th><th>High</th><th>Medium</th><th>Status</th></tr></thead>
<tbody>${securityRows || '<tr><td colspan="8" style="text-align:center;color:#64748b">No security tests found</td></tr>'}</tbody>
</table>

<footer>AI Test Generation Platform &mdash; Report ID: ${report.id}</footer>
</body>
</html>`;

    await report.update({ status: 'completed', totalTests, passed: totalPassed, failed: totalFailed });

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="report-${report.id}.html"`);
    res.send(html);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
