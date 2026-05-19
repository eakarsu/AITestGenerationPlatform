const express = require('express');
const { IntegrationTest } = require('../models');
const auth = require('../middleware/auth');
const openrouter = require('../services/openrouter');
const { aiRateLimiter, persistAiResult } = require('../middleware/aiMiddleware');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await IntegrationTest.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await IntegrationTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await IntegrationTest.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await IntegrationTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await IntegrationTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Generate Integration Tests
router.post('/:id/generate', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await IntegrationTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    const response = await openrouter.generateIntegrationTests({ components: item.components, description: item.description });
    const formatted = openrouter.formatResponse(response);

    await item.update({ aiGeneratedTests: formatted.content, status: 'active' });
    res.json({ item: await item.reload(), aiResult: formatted });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
