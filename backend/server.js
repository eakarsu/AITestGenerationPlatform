const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await sequelize.sync({ alter: true });
    console.log('Database synced');

    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
