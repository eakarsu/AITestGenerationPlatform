const express = require('express');
const { SecurityTest } = require('../models');
const auth = require('../middleware/auth');
const openrouter = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
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

// AI Generate Security Tests
router.post('/:id/scan', auth, async (req, res) => {
  try {
    const item = await SecurityTest.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.update({ status: 'scanning' });
    const target = { targetUrl: item.targetUrl, scanType: item.scanType };
    const response = await openrouter.generateSecurityTests(target);
    const formatted = openrouter.formatResponse(response);

    await item.update({ aiAnalysis: formatted.content, status: 'completed' });
    res.json({ item: await item.reload(), aiResult: formatted });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
