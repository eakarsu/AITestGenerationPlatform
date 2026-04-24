const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// User Model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'developer', 'tester', 'viewer'), defaultValue: 'developer' },
  avatar: { type: DataTypes.STRING, defaultValue: '' }
}, { tableName: 'users', timestamps: true });

// Project Model
const Project = sequelize.define('Project', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  language: { type: DataTypes.STRING },
  framework: { type: DataTypes.STRING },
  repository: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('active', 'archived', 'paused'), defaultValue: 'active' },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'projects', timestamps: true });

// Test Case Model
const TestCase = sequelize.define('TestCase', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  code: { type: DataTypes.TEXT },
  generatedTest: { type: DataTypes.TEXT },
  language: { type: DataTypes.STRING },
  framework: { type: DataTypes.STRING },
  type: { type: DataTypes.ENUM('unit', 'integration', 'e2e', 'api'), defaultValue: 'unit' },
  priority: { type: DataTypes.ENUM('critical', 'high', 'medium', 'low'), defaultValue: 'medium' },
  status: { type: DataTypes.ENUM('draft', 'active', 'passed', 'failed', 'skipped'), defaultValue: 'draft' },
  aiResponse: { type: DataTypes.TEXT },
  projectId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'test_cases', timestamps: true });

// Test Suite Model
const TestSuite = sequelize.define('TestSuite', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('active', 'inactive', 'running', 'completed'), defaultValue: 'active' },
  totalTests: { type: DataTypes.INTEGER, defaultValue: 0 },
  passedTests: { type: DataTypes.INTEGER, defaultValue: 0 },
  failedTests: { type: DataTypes.INTEGER, defaultValue: 0 },
  projectId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'test_suites', timestamps: true });

// Code Analysis Model
const CodeAnalysis = sequelize.define('CodeAnalysis', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.TEXT },
  language: { type: DataTypes.STRING },
  testabilityScore: { type: DataTypes.INTEGER },
  complexityScore: { type: DataTypes.INTEGER },
  qualityScore: { type: DataTypes.INTEGER },
  aiAnalysis: { type: DataTypes.TEXT },
  recommendations: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'analyzing', 'completed', 'failed'), defaultValue: 'pending' },
  projectId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'code_analyses', timestamps: true });

// Bug Detection Model
const BugDetection = sequelize.define('BugDetection', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.TEXT },
  language: { type: DataTypes.STRING },
  bugsFound: { type: DataTypes.INTEGER, defaultValue: 0 },
  severity: { type: DataTypes.ENUM('critical', 'high', 'medium', 'low'), defaultValue: 'medium' },
  aiAnalysis: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'scanning', 'completed', 'failed'), defaultValue: 'pending' },
  projectId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'bug_detections', timestamps: true });

// Coverage Analysis Model
const CoverageAnalysis = sequelize.define('CoverageAnalysis', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  projectName: { type: DataTypes.STRING },
  totalLines: { type: DataTypes.INTEGER, defaultValue: 0 },
  coveredLines: { type: DataTypes.INTEGER, defaultValue: 0 },
  coveragePercent: { type: DataTypes.FLOAT, defaultValue: 0 },
  branchCoverage: { type: DataTypes.FLOAT, defaultValue: 0 },
  functionCoverage: { type: DataTypes.FLOAT, defaultValue: 0 },
  uncoveredAreas: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'), defaultValue: 'pending' },
  projectId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'coverage_analyses', timestamps: true });

// Test Template Model
const TestTemplate = sequelize.define('TestTemplate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  language: { type: DataTypes.STRING },
  framework: { type: DataTypes.STRING },
  templateCode: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
  usageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'test_templates', timestamps: true });

// Team Model
const Team = sequelize.define('Team', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  memberCount: { type: DataTypes.INTEGER, defaultValue: 1 },
  role: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'teams', timestamps: true });

// Test Execution Model
const TestExecution = sequelize.define('TestExecution', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  suiteName: { type: DataTypes.STRING },
  totalTests: { type: DataTypes.INTEGER, defaultValue: 0 },
  passed: { type: DataTypes.INTEGER, defaultValue: 0 },
  failed: { type: DataTypes.INTEGER, defaultValue: 0 },
  skipped: { type: DataTypes.INTEGER, defaultValue: 0 },
  duration: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.ENUM('queued', 'running', 'completed', 'failed', 'cancelled'), defaultValue: 'queued' },
  environment: { type: DataTypes.STRING },
  logs: { type: DataTypes.TEXT },
  projectId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'test_executions', timestamps: true });

// API Test Model
const ApiTest = sequelize.define('ApiTest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  endpoint: { type: DataTypes.STRING },
  method: { type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH'), defaultValue: 'GET' },
  headers: { type: DataTypes.TEXT },
  requestBody: { type: DataTypes.TEXT },
  expectedStatus: { type: DataTypes.INTEGER },
  expectedResponse: { type: DataTypes.TEXT },
  aiGeneratedTests: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('draft', 'active', 'passed', 'failed'), defaultValue: 'draft' },
  projectId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'api_tests', timestamps: true });

// Performance Test Model
const PerformanceTest = sequelize.define('PerformanceTest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  targetUrl: { type: DataTypes.STRING },
  testType: { type: DataTypes.ENUM('load', 'stress', 'spike', 'endurance'), defaultValue: 'load' },
  virtualUsers: { type: DataTypes.INTEGER, defaultValue: 10 },
  duration: { type: DataTypes.INTEGER, defaultValue: 60 },
  avgResponseTime: { type: DataTypes.FLOAT },
  maxResponseTime: { type: DataTypes.FLOAT },
  throughput: { type: DataTypes.FLOAT },
  errorRate: { type: DataTypes.FLOAT },
  aiAnalysis: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('draft', 'running', 'completed', 'failed'), defaultValue: 'draft' },
  projectId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'performance_tests', timestamps: true });

// Security Test Model
const SecurityTest = sequelize.define('SecurityTest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  targetUrl: { type: DataTypes.STRING },
  scanType: { type: DataTypes.ENUM('full', 'quick', 'api', 'auth'), defaultValue: 'quick' },
  vulnerabilitiesFound: { type: DataTypes.INTEGER, defaultValue: 0 },
  criticalCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  highCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  mediumCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  lowCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  aiAnalysis: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('draft', 'scanning', 'completed', 'failed'), defaultValue: 'draft' },
  projectId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'security_tests', timestamps: true });

// Integration Test Model
const IntegrationTest = sequelize.define('IntegrationTest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  components: { type: DataTypes.TEXT },
  testCode: { type: DataTypes.TEXT },
  aiGeneratedTests: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('draft', 'active', 'passed', 'failed'), defaultValue: 'draft' },
  projectId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'integration_tests', timestamps: true });

// Regression Test Model
const RegressionTest = sequelize.define('RegressionTest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  changeDescription: { type: DataTypes.TEXT },
  affectedAreas: { type: DataTypes.TEXT },
  testCode: { type: DataTypes.TEXT },
  aiGeneratedTests: { type: DataTypes.TEXT },
  riskLevel: { type: DataTypes.ENUM('critical', 'high', 'medium', 'low'), defaultValue: 'medium' },
  status: { type: DataTypes.ENUM('draft', 'active', 'passed', 'failed'), defaultValue: 'draft' },
  projectId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'regression_tests', timestamps: true });

// Report Model
const Report = sequelize.define('Report', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('summary', 'coverage', 'performance', 'security', 'regression', 'custom'), defaultValue: 'summary' },
  projectName: { type: DataTypes.STRING },
  totalTests: { type: DataTypes.INTEGER, defaultValue: 0 },
  passed: { type: DataTypes.INTEGER, defaultValue: 0 },
  failed: { type: DataTypes.INTEGER, defaultValue: 0 },
  coverage: { type: DataTypes.FLOAT, defaultValue: 0 },
  data: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('generating', 'completed', 'failed'), defaultValue: 'generating' },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'reports', timestamps: true });

// Associations
User.hasMany(Project, { foreignKey: 'userId' });
Project.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(TestCase, { foreignKey: 'userId' });
User.hasMany(TestSuite, { foreignKey: 'userId' });
User.hasMany(CodeAnalysis, { foreignKey: 'userId' });
User.hasMany(BugDetection, { foreignKey: 'userId' });
User.hasMany(CoverageAnalysis, { foreignKey: 'userId' });
User.hasMany(TestTemplate, { foreignKey: 'userId' });
User.hasMany(Team, { foreignKey: 'userId' });
User.hasMany(TestExecution, { foreignKey: 'userId' });
User.hasMany(ApiTest, { foreignKey: 'userId' });
User.hasMany(PerformanceTest, { foreignKey: 'userId' });
User.hasMany(SecurityTest, { foreignKey: 'userId' });
User.hasMany(IntegrationTest, { foreignKey: 'userId' });
User.hasMany(RegressionTest, { foreignKey: 'userId' });
User.hasMany(Report, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Project,
  TestCase,
  TestSuite,
  CodeAnalysis,
  BugDetection,
  CoverageAnalysis,
  TestTemplate,
  Team,
  TestExecution,
  ApiTest,
  PerformanceTest,
  SecurityTest,
  IntegrationTest,
  RegressionTest,
  Report
};
