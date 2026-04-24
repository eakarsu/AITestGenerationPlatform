const express = require('express');
const { PerformanceTest } = require('../models');
const auth = require('../middleware/auth');
const openrouter = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await PerformanceTest.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await PerformanceTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await PerformanceTest.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await PerformanceTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await PerformanceTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Generate Performance Tests
router.post('/:id/generate', auth, async (req, res) => {
  try {
    const item = await PerformanceTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    const config = { targetUrl: item.targetUrl, testType: item.testType, virtualUsers: item.virtualUsers, duration: item.duration };
    const response = await openrouter.generatePerformanceTests(config);
    const formatted = openrouter.formatResponse(response);

    await item.update({ aiAnalysis: formatted.content, status: 'completed' });
    res.json({ item: await item.reload(), aiResult: formatted });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
