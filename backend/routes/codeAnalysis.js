const express = require('express');
const { CodeAnalysis } = require('../models');
const auth = require('../middleware/auth');
const openrouter = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
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

// AI Analyze Code
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const item = await CodeAnalysis.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.update({ status: 'analyzing' });
    const response = await openrouter.analyzeCode(item.code, item.language);
    const formatted = openrouter.formatResponse(response);

    await item.update({ aiAnalysis: formatted.content, status: 'completed', recommendations: formatted.content });
    res.json({ item: await item.reload(), aiResult: formatted });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
