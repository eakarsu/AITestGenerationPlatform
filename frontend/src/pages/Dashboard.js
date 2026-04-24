import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaProjectDiagram, FaFlask, FaLayerGroup, FaSearchPlus, FaBug, FaChartPie, FaFileCode, FaUsers, FaPlay, FaPlug, FaTachometerAlt, FaShieldAlt, FaPuzzlePiece, FaHistory, FaChartBar, FaRobot, FaArrowRight } from 'react-icons/fa';
import '../styles/Dashboard.css';

const iconMap = {
  FaProjectDiagram, FaFlask, FaLayerGroup, FaSearchPlus, FaBug, FaChartPie,
  FaFileCode, FaUsers, FaPlay, FaPlug, FaTachometerAlt, FaShieldAlt,
  FaPuzzlePiece, FaHistory, FaChartBar
};

const descriptions = {
  'projects': 'Manage your software projects and repositories',
  'test-cases': 'AI-powered test case generation from your code',
  'test-suites': 'Organize and manage test suite collections',
  'code-analysis': 'AI analysis of code quality and testability',
  'bug-detection': 'AI-powered bug and vulnerability detection',
  'coverage-analysis': 'Track and analyze code coverage metrics',
  'test-templates': 'Reusable test templates for multiple frameworks',
  'teams': 'Manage team members and collaborations',
  'test-executions': 'Track test execution history and results',
  'api-testing': 'AI-generated API test cases and validation',
  'performance-testing': 'Load, stress, and performance test analysis',
  'security-testing': 'AI security vulnerability scanning',
  'integration-testing': 'AI-generated integration test scenarios',
  'regression-testing': 'AI regression test generation for code changes',
  'reports': 'Comprehensive test analytics and reports',
};

const colors = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'
];

function Dashboard({ features }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1>
            <FaRobot className="title-icon" />
            AI Test Generation Platform
          </h1>
          <p>Automate your testing workflow with AI-powered tools. Save 30% development time.</p>
        </div>
        <div className="dashboard-stats-bar">
          <div className="stat-chip">
            <span className="stat-chip-value">15</span>
            <span className="stat-chip-label">Features</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip-value">8</span>
            <span className="stat-chip-label">AI-Powered</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip-value">$30-100</span>
            <span className="stat-chip-label">Per Seat/Mo</span>
          </div>
        </div>
      </div>

      <div className="feature-grid">
        {features.map((f, i) => {
          const Icon = iconMap[f.icon];
          return (
            <div
              key={f.key}
              className="feature-card"
              onClick={() => navigate(`/${f.key}`)}
              style={{ '--card-color': colors[i] }}
            >
              <div className="card-gradient" style={{ background: `linear-gradient(135deg, ${colors[i]}20, ${colors[i]}05)` }}></div>
              <div className="card-header">
                <div className="card-icon" style={{ background: `${colors[i]}20`, color: colors[i] }}>
                  {Icon && <Icon />}
                </div>
                {f.ai && <span className="ai-tag"><FaRobot /> AI</span>}
              </div>
              <h3>{f.label}</h3>
              <p>{descriptions[f.key]}</p>
              <div className="card-footer">
                <span className="card-link">
                  Open <FaArrowRight />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
