const express = require('express');
const { SecurityTest } = require('../models');
const auth = require('../middleware/auth');
const openrouter = require('../services/openrouter');
const { aiRateLimiter, persistAiResult } = require('../middleware/aiMiddleware');
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
      const { count, rows } = await SecurityTest.findAndCountAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit, offset });
      return res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
    }
    const items = await SecurityTest.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await SecurityTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await SecurityTest.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await SecurityTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await SecurityTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Generate Security Tests — structured JSON with vuln count population
router.post('/:id/scan', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await SecurityTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.update({ status: 'scanning' });
    const target = { targetUrl: item.targetUrl, scanType: item.scanType, name: item.name };
    const response = await openrouter.generateSecurityTests(target);
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content);

    const updates = { aiAnalysis: formatted.content, status: 'completed' };

    if (parsed) {
      if (typeof parsed.vulnerability_count === 'number') updates.vulnerabilitiesFound = parsed.vulnerability_count;
      if (typeof parsed.critical_vulnerabilities === 'number') updates.criticalCount = parsed.critical_vulnerabilities;
      if (parsed.tests && Array.isArray(parsed.tests)) {
        updates.vulnerabilitiesFound = parsed.vulnerability_count || parsed.tests.length;
        const bySeverity = parsed.tests.reduce((acc, t) => {
          if (t.vulnerability_type || t.type) {
            const type = (t.vulnerability_type || t.type || '').toLowerCase();
            if (type.includes('critical')) acc.critical++;
            else if (type.includes('high')) acc.high++;
            else if (type.includes('medium')) acc.medium++;
            else acc.low++;
          }
          return acc;
        }, { critical: 0, high: 0, medium: 0, low: 0 });
        if (!updates.criticalCount) updates.criticalCount = bySeverity.critical;
        updates.highCount = bySeverity.high;
        updates.mediumCount = bySeverity.medium;
        updates.lowCount = bySeverity.low;
      }
    }

    await item.update(updates);
    await persistAiResult(req.user.id, 'security-scan', { id: item.id, scanType: item.scanType }, parsed || formatted);
    res.json({ item: await item.reload(), aiResult: formatted, structured: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
