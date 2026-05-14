const express = require('express');
const { CodeAnalysis } = require('../models');
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
      const { count, rows } = await CodeAnalysis.findAndCountAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit, offset });
      return res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
    }
    const items = await CodeAnalysis.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await CodeAnalysis.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await CodeAnalysis.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await CodeAnalysis.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await CodeAnalysis.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Analyze Code — with structured JSON parsing, populates numeric fields
router.post('/:id/analyze', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await CodeAnalysis.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.update({ status: 'analyzing' });
    const response = await openrouter.analyzeCode(item.code, item.language);
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content);

    const updates = {
      aiAnalysis: formatted.content,
      status: 'completed',
      recommendations: parsed ? JSON.stringify(parsed.recommendations || []) : formatted.content,
    };

    if (parsed) {
      if (typeof parsed.testability_score === 'number') updates.testabilityScore = parsed.testability_score;
      if (typeof parsed.complexity_score === 'number') updates.complexityScore = parsed.complexity_score;
      if (typeof parsed.quality_score === 'number') updates.qualityScore = parsed.quality_score;
    }

    await item.update(updates);
    await persistAiResult(req.user.id, 'code-analysis', { id: item.id, language: item.language }, parsed || formatted);
    res.json({ item: await item.reload(), aiResult: formatted, structured: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
