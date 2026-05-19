const express = require('express');
const { ApiTest } = require('../models');
const auth = require('../middleware/auth');
const openrouter = require('../services/openrouter');
const { aiRateLimiter, persistAiResult } = require('../middleware/aiMiddleware');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await ApiTest.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await ApiTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await ApiTest.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await ApiTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await ApiTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Generate API Tests
router.post('/:id/generate', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await ApiTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    const response = await openrouter.generateApiTests(item.endpoint, item.method, item.requestBody, item.headers);
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content);

    await item.update({ aiGeneratedTests: parsed ? JSON.stringify(parsed.tests || parsed) : formatted.content, status: 'active' });
    await persistAiResult(req.user.id, 'api-testing', { id: item.id }, parsed || formatted);
    res.json({ item: await item.reload(), aiResult: formatted, structured: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
