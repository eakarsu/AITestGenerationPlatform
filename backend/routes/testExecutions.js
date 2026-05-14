const express = require('express');
const { TestExecution, TestCase } = require('../models');
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
      const { count, rows } = await TestExecution.findAndCountAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit, offset });
      return res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
    }
    const items = await TestExecution.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await TestExecution.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await TestExecution.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await TestExecution.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await TestExecution.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Mock Test Runner ─────────────────────────────────────────────────────────
router.post('/:id/run', auth, async (req, res) => {
  try {
    const item = await TestExecution.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.update({ status: 'running' });

    // Attempt to read generated test code from a linked test case or from the execution itself
    let testCode = item.logs || '';

    // If execution has a projectId/testCaseId hint, try to find generated tests
    let linkedTests = [];
    if (item.projectId) {
      linkedTests = await TestCase.findAll({
        where: { projectId: item.projectId, userId: req.user.id },
        attributes: ['id', 'title', 'generatedTest', 'type'],
      });
    }

    // Count test blocks in generated code
    const allCode = [...linkedTests.map((t) => t.generatedTest || ''), testCode].join('\n');
    const itCount = (allCode.match(/\bit\s*\(/g) || []).length;
    const testCount = (allCode.match(/\btest\s*\(/g) || []).length;
    const describeCount = (allCode.match(/\bdescribe\s*\(/g) || []).length;
    const totalTests = Math.max(itCount + testCount, item.totalTests || 1);

    // Simulate 90% pass rate with slight randomness
    const passRate = 0.9 + (Math.random() * 0.1 - 0.05);
    const passed = Math.round(totalTests * passRate);
    const failed = totalTests - passed;
    const skipped = 0;
    const duration = parseFloat((Math.random() * 5 + 0.5).toFixed(2));

    const mockLogs = [
      `Test run started at ${new Date().toISOString()}`,
      `Environment: ${item.environment || 'test'}`,
      `Suite: ${item.suiteName || item.name}`,
      `Discovered ${describeCount} describe blocks, ${totalTests} test cases`,
      `...`,
      `Results: ${passed} passed, ${failed} failed, ${skipped} skipped`,
      `Duration: ${duration}s`,
      failed > 0 ? `FAILED TESTS (mock): ${Array.from({ length: failed }, (_, i) => `Test #${i + 1}`).join(', ')}` : 'All tests passed!',
    ].join('\n');

    await item.update({
      status: failed > 0 ? 'failed' : 'completed',
      totalTests,
      passed,
      failed,
      skipped,
      duration,
      logs: mockLogs,
    });

    res.json({
      execution: await item.reload(),
      results: { totalTests, passed, failed, skipped, duration, passRate: (passRate * 100).toFixed(1) + '%' },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
