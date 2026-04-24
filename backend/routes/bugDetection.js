const express = require('express');
const { BugDetection } = require('../models');
const auth = require('../middleware/auth');
const openrouter = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
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

// AI Detect Bugs
router.post('/:id/detect', auth, async (req, res) => {
  try {
    const item = await BugDetection.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.update({ status: 'scanning' });
    const response = await openrouter.detectBugs(item.code, item.language);
    const formatted = openrouter.formatResponse(response);

    await item.update({ aiAnalysis: formatted.content, status: 'completed' });
    res.json({ item: await item.reload(), aiResult: formatted });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
