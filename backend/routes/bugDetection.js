const express = require('express');
const { BugDetection } = require('../models');
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
      const { count, rows } = await BugDetection.findAndCountAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit, offset });
      return res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
    }
    const items = await BugDetection.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await BugDetection.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await BugDetection.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await BugDetection.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await BugDetection.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Detect Bugs — with structured JSON parsing
router.post('/:id/detect', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await BugDetection.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.update({ status: 'scanning' });
    const response = await openrouter.detectBugs(item.code, item.language);
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content);

    const updates = { aiAnalysis: formatted.content, status: 'completed' };

    if (parsed) {
      if (typeof parsed.total_bugs === 'number') updates.bugsFound = parsed.total_bugs;
      if (parsed.bugs && Array.isArray(parsed.bugs)) {
        // Derive severity from highest-severity bug
        const criticalExists = parsed.bugs.some((b) => b.severity === 'critical');
        const highExists = parsed.bugs.some((b) => b.severity === 'high');
        updates.severity = criticalExists ? 'critical' : highExists ? 'high' : (parsed.bugs[0]?.severity || item.severity);
        updates.bugsFound = parsed.total_bugs || parsed.bugs.length;
      }
    }

    await item.update(updates);
    await persistAiResult(req.user.id, 'detect-bugs', { id: item.id, language: item.language }, parsed || formatted);
    res.json({ item: await item.reload(), aiResult: formatted, structured: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
