const rateLimit = require('express-rate-limit');
const { sequelize } = require('../models');

// ─── AI Rate Limiter ──────────────────────────────────────────────────────────
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) =>
    req.user ? 'user:' + (req.user.id || req.user.userId) : req.ip,
  message: { error: 'Too many AI requests. Limit: 20 per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Persist AI result ────────────────────────────────────────────────────────
async function persistAiResult(userId, endpoint, inputData, result) {
  try {
    await sequelize.query(
      'INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES (:userId, :endpoint, :inputData, :result)',
      {
        replacements: {
          userId: userId || null,
          endpoint,
          inputData: JSON.stringify(inputData),
          result: JSON.stringify(result),
        },
      }
    );
  } catch (e) {
    console.error('Failed to persist AI result:', e.message);
  }
}

module.exports = { aiRateLimiter, persistAiResult };
