const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/test-cases', require('./routes/testCases'));
app.use('/api/test-suites', require('./routes/testSuites'));
app.use('/api/code-analysis', require('./routes/codeAnalysis'));
app.use('/api/bug-detection', require('./routes/bugDetection'));
app.use('/api/coverage-analysis', require('./routes/coverageAnalysis'));
app.use('/api/test-templates', require('./routes/testTemplates'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/test-executions', require('./routes/testExecutions'));
app.use('/api/api-testing', require('./routes/apiTesting'));
app.use('/api/performance-testing', require('./routes/performanceTesting'));
app.use('/api/security-testing', require('./routes/securityTesting'));
app.use('/api/integration-testing', require('./routes/integrationTesting'));
app.use('/api/regression-testing', require('./routes/regressionTesting'));
app.use('/api/reports', require('./routes/reports'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Serve uploaded files ─────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Start server ─────────────────────────────────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    // Use force: false — never drop tables on boot
    await sequelize.sync({ force: false });
    console.log('Database synced');

    // Ensure ai_results table exists (raw SQL, not Sequelize model)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        endpoint VARCHAR(100),
        input_data JSONB,
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('ai_results table ready');

    app.use('/api/ai-test-generator', require('./routes/aiTestGenerator')); app.use('/api/mutation-testing', require('./routes/mutationTesting')); app.use('/api/flaky-test-detector', require('./routes/flakyTestDetector')); app.use('/api/dead-code-detector', require('./routes/deadCodeDetector')); app.use('/api/perf-regression-detection', require('./routes/perfRegressionDetection')); app.use('/api/vcs-webhook-integration', require('./routes/vcsWebhookIntegration'));

// === Batch 08 Gaps & Frontend Mounts ===
app.use('/api/gap-critical-gap-no-ai-driven-test-generation-despite-domain', require('./routes/gapCriticalGapNoAiDrivenTestGenerationDespiteDomain'));
app.use('/api/gap-no-mutation-testing-ai-analysis', require('./routes/gapNoMutationTestingAiAnalysis'));
app.use('/api/gap-no-flaky-test-detection-ml-model', require('./routes/gapNoFlakyTestDetectionMlModel'));
app.use('/api/gap-no-code-coverage-gap-recommender', require('./routes/gapNoCodeCoverageGapRecommender'));
app.use('/api/gap-limited-vcs-integration-git-auto-trigger-not-visible', require('./routes/gapLimitedVcsIntegrationGitAutoTriggerNotVisible'));
app.use('/api/gap-limited-ci-cd-platform-integration-beyond-stub-modules', require('./routes/gapLimitedCiCdPlatformIntegrationBeyondStubModules'));
app.use('/api/gap-no-code-coverage-visualization-ui-route', require('./routes/gapNoCodeCoverageVisualizationUiRoute'));
app.use('/api/gap-no-test-flakiness-detection-feature', require('./routes/gapNoTestFlakinessDetectionFeature'));
app.use('/api/gap-notifications-limited-to-one-reference-not-a-full', require('./routes/gapNotificationsLimitedToOneReferenceNotAFull'));

app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
