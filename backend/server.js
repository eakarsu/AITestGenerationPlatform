const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const auth = require('./middleware/auth');
const { validateRuntime } = require('./governance/runtime');
const { createProviderGate } = require('./governance/providerGate');

validateRuntime();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const allowedOrigins = String(process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',').map((value) => value.trim()).filter(Boolean);
const providerPrefixes = [
  '/api/test-cases', '/api/code-analysis', '/api/bug-detection',
  '/api/coverage-analysis', '/api/api-testing', '/api/performance-testing',
  '/api/security-testing', '/api/integration-testing', '/api/regression-testing',
  '/api/ai-test-generator', '/api/mutation-testing', '/api/flaky-test-detector',
  '/api/dead-code-detector', '/api/perf-regression-detection',
  '/api/vcs-webhook-integration', '/api/gap-',
];

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin denied'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/governance', require('./governance/router'));
app.use('/api', auth);
app.use(createProviderGate(providerPrefixes));
app.use('/uploads', auth, express.static(path.join(__dirname, 'uploads')));

const protectedRoutes = [
  ['/api/projects', './routes/projects'],
  ['/api/test-suites', './routes/testSuites'],
  ['/api/test-templates', './routes/testTemplates'],
  ['/api/teams', './routes/teams'],
  ['/api/test-executions', './routes/testExecutions'],
  ['/api/reports', './routes/reports'],
  ['/api/custom-views', './routes/customViews'],
];
for (const [routePath, modulePath] of protectedRoutes) app.use(routePath, require(modulePath));

if (process.env.ENABLE_LEGACY_PROVIDER_ROUTES === 'true') {
  const legacyRoutes = [
    ['/api/test-cases', './routes/testCases'],
    ['/api/code-analysis', './routes/codeAnalysis'],
    ['/api/bug-detection', './routes/bugDetection'],
    ['/api/coverage-analysis', './routes/coverageAnalysis'],
    ['/api/api-testing', './routes/apiTesting'],
    ['/api/performance-testing', './routes/performanceTesting'],
    ['/api/security-testing', './routes/securityTesting'],
    ['/api/integration-testing', './routes/integrationTesting'],
    ['/api/regression-testing', './routes/regressionTesting'],
    ['/api/ai-test-generator', './routes/aiTestGenerator'],
    ['/api/mutation-testing', './routes/mutationTesting'],
    ['/api/flaky-test-detector', './routes/flakyTestDetector'],
    ['/api/dead-code-detector', './routes/deadCodeDetector'],
    ['/api/perf-regression-detection', './routes/perfRegressionDetection'],
    ['/api/vcs-webhook-integration', './routes/vcsWebhookIntegration'],
    ['/api/gap-critical-gap-no-ai-driven-test-generation-despite-domain', './routes/gapCriticalGapNoAiDrivenTestGenerationDespiteDomain'],
    ['/api/gap-no-mutation-testing-ai-analysis', './routes/gapNoMutationTestingAiAnalysis'],
    ['/api/gap-no-flaky-test-detection-ml-model', './routes/gapNoFlakyTestDetectionMlModel'],
    ['/api/gap-no-code-coverage-gap-recommender', './routes/gapNoCodeCoverageGapRecommender'],
    ['/api/gap-limited-vcs-integration-git-auto-trigger-not-visible', './routes/gapLimitedVcsIntegrationGitAutoTriggerNotVisible'],
    ['/api/gap-limited-ci-cd-platform-integration-beyond-stub-modules', './routes/gapLimitedCiCdPlatformIntegrationBeyondStubModules'],
    ['/api/gap-no-code-coverage-visualization-ui-route', './routes/gapNoCodeCoverageVisualizationUiRoute'],
    ['/api/gap-no-test-flakiness-detection-feature', './routes/gapNoTestFlakinessDetectionFeature'],
    ['/api/gap-notifications-limited-to-one-reference-not-a-full', './routes/gapNotificationsLimitedToOneReferenceNotAFull'],
  ];
  for (const [routePath, modulePath] of legacyRoutes) app.use(routePath, require(modulePath));
}

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await sequelize.authenticate();
  if (process.env.ENABLE_LEGACY_SCHEMA_BOOTSTRAP === 'true') {
    await sequelize.sync({ force: false });
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
  }
  return app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, start };
