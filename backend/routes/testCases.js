const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { TestCase } = require('../models');
const auth = require('../middleware/auth');
const openrouter = require('../services/openrouter');
const { aiRateLimiter, persistAiResult } = require('../middleware/aiMiddleware');
const router = express.Router();

// ─── Multer setup ─────────────────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = ['.js', '.ts', '.py', '.java', '.go', '.rb', '.cs', '.cpp', '.c'];
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) cb(null, true);
    else cb(new Error(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
  },
});

function detectLanguage(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = { '.js': 'JavaScript', '.ts': 'TypeScript', '.py': 'Python', '.java': 'Java', '.go': 'Go', '.rb': 'Ruby', '.cs': 'C#', '.cpp': 'C++', '.c': 'C' };
  return map[ext] || 'Unknown';
}

function defaultFramework(language) {
  const map = { JavaScript: 'Jest', TypeScript: 'Jest', Python: 'pytest', Java: 'JUnit', Go: 'testing', Ruby: 'RSpec', 'C#': 'NUnit' };
  return map[language] || 'Jest';
}

// ─── Pagination helper ────────────────────────────────────────────────────────
function getPagination(req) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// GET all
router.get('/', auth, async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const { count, rows } = await TestCase.findAndCountAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    if (req.query.page) {
      return res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
    }
    const all = await TestCase.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(all);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await TestCase.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE
router.post('/', auth, async (req, res) => {
  try {
    const item = await TestCase.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await TestCase.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await TestCase.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── AI: Generate Tests ───────────────────────────────────────────────────────
router.post('/:id/generate', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await TestCase.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    const response = await openrouter.generateTestCases(item.code || '', item.language || 'JavaScript', item.framework || 'Jest');
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content);

    const updates = {
      aiResponse: JSON.stringify(formatted),
      status: 'active',
    };

    if (parsed) {
      if (parsed.test_cases && Array.isArray(parsed.test_cases)) {
        updates.generatedTest = parsed.test_cases.map((tc) => tc.code || '').join('\n\n// ---\n\n');
      } else {
        updates.generatedTest = formatted.content;
      }
    } else {
      updates.generatedTest = formatted.content;
    }

    await item.update(updates);
    await persistAiResult(req.user.id, 'generate-test-cases', { id: item.id, language: item.language }, parsed || formatted);
    res.json({ item: await item.reload(), aiResult: formatted, structured: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Upload Code File ─────────────────────────────────────────────────────────
router.post('/upload-code', auth, aiRateLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const code = fs.readFileSync(req.file.path, 'utf8');
    const language = detectLanguage(req.file.originalname);
    const framework = defaultFramework(language);

    // Create TestCase
    const testCase = await TestCase.create({
      title: req.file.originalname,
      description: `Uploaded file: ${req.file.originalname}`,
      code,
      language,
      framework,
      type: 'unit',
      priority: 'medium',
      status: 'draft',
      userId: req.user.id,
    });

    // Immediately trigger AI generation
    let structured = null;
    try {
      const response = await openrouter.generateTestCases(code, language, framework);
      const formatted = openrouter.formatResponse(response);
      structured = openrouter.parseAIJson(formatted.content);

      const updates = { status: 'active', aiResponse: JSON.stringify(formatted) };
      if (structured && structured.test_cases) {
        updates.generatedTest = structured.test_cases.map((tc) => tc.code || '').join('\n\n// ---\n\n');
      } else {
        updates.generatedTest = formatted.content;
      }

      await testCase.update(updates);
      await persistAiResult(req.user.id, 'upload-code', { filename: req.file.originalname, language }, structured || formatted);
    } catch (aiErr) {
      console.error('AI generation failed after upload:', aiErr.message);
    }

    // Clean up uploaded file
    fs.unlink(req.file.path, () => {});

    res.status(201).json({ testCase: await testCase.reload(), structured });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: err.message });
  }
});

// ─── Mutation Score ───────────────────────────────────────────────────────────
router.post('/:id/mutation-score', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await TestCase.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    if (!item.code) return res.status(400).json({ error: 'Test case has no source code to analyze' });
    if (!item.generatedTest) return res.status(400).json({ error: 'Test case has no generated test. Run /generate first.' });

    const response = await openrouter.analyzeMutationScore(item.code, item.generatedTest, item.language || 'JavaScript');
    const formatted = openrouter.formatResponse(response);
    const parsed = openrouter.parseAIJson(formatted.content);

    await persistAiResult(req.user.id, 'mutation-score', { id: item.id }, parsed || formatted);
    res.json({ item, mutationAnalysis: parsed || { raw: formatted.content }, model: formatted.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
