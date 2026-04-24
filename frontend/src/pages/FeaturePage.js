import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaProjectDiagram, FaFlask, FaLayerGroup, FaSearchPlus, FaBug, FaChartPie, FaFileCode, FaUsers, FaPlay, FaPlug, FaTachometerAlt, FaShieldAlt, FaPuzzlePiece, FaHistory, FaChartBar, FaRobot } from 'react-icons/fa';
import DetailModal from '../components/DetailModal';
import CreateModal from '../components/CreateModal';
import {
  projectsAPI, testCasesAPI, testSuitesAPI, codeAnalysisAPI, bugDetectionAPI,
  coverageAPI, templatesAPI, teamsAPI, executionsAPI, apiTestingAPI,
  performanceAPI, securityAPI, integrationAPI, regressionAPI, reportsAPI
} from '../services/api';
import '../styles/FeaturePage.css';

const iconMap = {
  FaProjectDiagram, FaFlask, FaLayerGroup, FaSearchPlus, FaBug, FaChartPie,
  FaFileCode, FaUsers, FaPlay, FaPlug, FaTachometerAlt, FaShieldAlt,
  FaPuzzlePiece, FaHistory, FaChartBar
};

const apiMap = {
  'projects': projectsAPI,
  'test-cases': testCasesAPI,
  'test-suites': testSuitesAPI,
  'code-analysis': codeAnalysisAPI,
  'bug-detection': bugDetectionAPI,
  'coverage-analysis': coverageAPI,
  'test-templates': templatesAPI,
  'teams': teamsAPI,
  'test-executions': executionsAPI,
  'api-testing': apiTestingAPI,
  'performance-testing': performanceAPI,
  'security-testing': securityAPI,
  'integration-testing': integrationAPI,
  'regression-testing': regressionAPI,
  'reports': reportsAPI,
};

const fieldsConfig = {
  'projects': {
    columns: ['name', 'language', 'framework', 'status'],
    fields: [
      { key: 'name', label: 'Project Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea', wide: true },
      { key: 'language', label: 'Language', type: 'select', options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C#', 'Ruby'] },
      { key: 'framework', label: 'Framework' },
      { key: 'repository', label: 'Repository URL' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'archived', 'paused'] },
    ]
  },
  'test-cases': {
    columns: ['title', 'language', 'type', 'priority', 'status'],
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Description', type: 'textarea', wide: true },
      { key: 'code', label: 'Source Code', type: 'textarea', wide: true },
      { key: 'language', label: 'Language', type: 'select', options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust'] },
      { key: 'framework', label: 'Test Framework', type: 'select', options: ['Jest', 'Mocha', 'pytest', 'JUnit', 'testing', 'cargo test'] },
      { key: 'type', label: 'Type', type: 'select', options: ['unit', 'integration', 'e2e', 'api'] },
      { key: 'priority', label: 'Priority', type: 'select', options: ['critical', 'high', 'medium', 'low'] },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'passed', 'failed', 'skipped'] },
    ],
    aiAction: 'generate', aiLabel: 'Generate Tests'
  },
  'test-suites': {
    columns: ['name', 'totalTests', 'passedTests', 'failedTests', 'status'],
    fields: [
      { key: 'name', label: 'Suite Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea', wide: true },
      { key: 'totalTests', label: 'Total Tests', type: 'number' },
      { key: 'passedTests', label: 'Passed', type: 'number' },
      { key: 'failedTests', label: 'Failed', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'running', 'completed'] },
    ]
  },
  'code-analysis': {
    columns: ['title', 'language', 'testabilityScore', 'qualityScore', 'status'],
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'code', label: 'Code to Analyze', type: 'textarea', wide: true },
      { key: 'language', label: 'Language', type: 'select', options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust'] },
      { key: 'testabilityScore', label: 'Testability Score', type: 'number', readOnly: true },
      { key: 'complexityScore', label: 'Complexity Score', type: 'number', readOnly: true },
      { key: 'qualityScore', label: 'Quality Score', type: 'number', readOnly: true },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'analyzing', 'completed', 'failed'] },
    ],
    aiAction: 'analyze', aiLabel: 'Analyze Code'
  },
  'bug-detection': {
    columns: ['title', 'language', 'bugsFound', 'severity', 'status'],
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'code', label: 'Code to Scan', type: 'textarea', wide: true },
      { key: 'language', label: 'Language', type: 'select', options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust'] },
      { key: 'bugsFound', label: 'Bugs Found', type: 'number', readOnly: true },
      { key: 'severity', label: 'Severity', type: 'select', options: ['critical', 'high', 'medium', 'low'] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'scanning', 'completed', 'failed'] },
    ],
    aiAction: 'detect', aiLabel: 'Detect Bugs'
  },
  'coverage-analysis': {
    columns: ['title', 'projectName', 'coveragePercent', 'branchCoverage', 'status'],
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'projectName', label: 'Project Name' },
      { key: 'totalLines', label: 'Total Lines', type: 'number' },
      { key: 'coveredLines', label: 'Covered Lines', type: 'number' },
      { key: 'coveragePercent', label: 'Coverage %', type: 'number' },
      { key: 'branchCoverage', label: 'Branch Coverage %', type: 'number' },
      { key: 'functionCoverage', label: 'Function Coverage %', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'running', 'completed', 'failed'] },
    ]
  },
  'test-templates': {
    columns: ['name', 'language', 'framework', 'category', 'usageCount'],
    fields: [
      { key: 'name', label: 'Template Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea', wide: true },
      { key: 'language', label: 'Language', type: 'select', options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust'] },
      { key: 'framework', label: 'Framework' },
      { key: 'category', label: 'Category', type: 'select', options: ['Unit Test', 'Integration Test', 'E2E Test', 'Component Test', 'Performance Test', 'Mock'] },
      { key: 'templateCode', label: 'Template Code', type: 'textarea', wide: true },
      { key: 'isPublic', label: 'Public', type: 'select', options: ['true', 'false'] },
    ]
  },
  'teams': {
    columns: ['name', 'role', 'memberCount', 'email', 'status'],
    fields: [
      { key: 'name', label: 'Team Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea', wide: true },
      { key: 'memberCount', label: 'Members', type: 'number' },
      { key: 'role', label: 'Role' },
      { key: 'email', label: 'Team Email' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ]
  },
  'test-executions': {
    columns: ['name', 'suiteName', 'passed', 'failed', 'duration', 'status'],
    fields: [
      { key: 'name', label: 'Execution Name', required: true },
      { key: 'suiteName', label: 'Suite Name' },
      { key: 'totalTests', label: 'Total Tests', type: 'number' },
      { key: 'passed', label: 'Passed', type: 'number' },
      { key: 'failed', label: 'Failed', type: 'number' },
      { key: 'skipped', label: 'Skipped', type: 'number' },
      { key: 'duration', label: 'Duration (s)', type: 'number' },
      { key: 'environment', label: 'Environment' },
      { key: 'status', label: 'Status', type: 'select', options: ['queued', 'running', 'completed', 'failed', 'cancelled'] },
    ]
  },
  'api-testing': {
    columns: ['name', 'endpoint', 'method', 'expectedStatus', 'status'],
    fields: [
      { key: 'name', label: 'Test Name', required: true },
      { key: 'endpoint', label: 'Endpoint' },
      { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea' },
      { key: 'requestBody', label: 'Request Body (JSON)', type: 'textarea' },
      { key: 'expectedStatus', label: 'Expected Status', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'passed', 'failed'] },
    ],
    aiAction: 'generate', aiLabel: 'Generate API Tests'
  },
  'performance-testing': {
    columns: ['name', 'targetUrl', 'testType', 'avgResponseTime', 'throughput', 'status'],
    fields: [
      { key: 'name', label: 'Test Name', required: true },
      { key: 'targetUrl', label: 'Target URL' },
      { key: 'testType', label: 'Test Type', type: 'select', options: ['load', 'stress', 'spike', 'endurance'] },
      { key: 'virtualUsers', label: 'Virtual Users', type: 'number' },
      { key: 'duration', label: 'Duration (s)', type: 'number' },
      { key: 'avgResponseTime', label: 'Avg Response (ms)', type: 'number', readOnly: true },
      { key: 'maxResponseTime', label: 'Max Response (ms)', type: 'number', readOnly: true },
      { key: 'throughput', label: 'Throughput (req/s)', type: 'number', readOnly: true },
      { key: 'errorRate', label: 'Error Rate %', type: 'number', readOnly: true },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'running', 'completed', 'failed'] },
    ],
    aiAction: 'generate', aiLabel: 'Generate Perf Tests'
  },
  'security-testing': {
    columns: ['name', 'targetUrl', 'scanType', 'vulnerabilitiesFound', 'criticalCount', 'status'],
    fields: [
      { key: 'name', label: 'Scan Name', required: true },
      { key: 'targetUrl', label: 'Target URL' },
      { key: 'scanType', label: 'Scan Type', type: 'select', options: ['full', 'quick', 'api', 'auth'] },
      { key: 'vulnerabilitiesFound', label: 'Vulnerabilities', type: 'number', readOnly: true },
      { key: 'criticalCount', label: 'Critical', type: 'number', readOnly: true },
      { key: 'highCount', label: 'High', type: 'number', readOnly: true },
      { key: 'mediumCount', label: 'Medium', type: 'number', readOnly: true },
      { key: 'lowCount', label: 'Low', type: 'number', readOnly: true },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'scanning', 'completed', 'failed'] },
    ],
    aiAction: 'scan', aiLabel: 'Run Security Scan'
  },
  'integration-testing': {
    columns: ['name', 'components', 'status'],
    fields: [
      { key: 'name', label: 'Test Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea', wide: true },
      { key: 'components', label: 'Components', type: 'textarea' },
      { key: 'testCode', label: 'Test Code', type: 'textarea', wide: true },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'passed', 'failed'] },
    ],
    aiAction: 'generate', aiLabel: 'Generate Integration Tests'
  },
  'regression-testing': {
    columns: ['name', 'changeDescription', 'riskLevel', 'status'],
    fields: [
      { key: 'name', label: 'Test Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea', wide: true },
      { key: 'changeDescription', label: 'Change Description', type: 'textarea' },
      { key: 'affectedAreas', label: 'Affected Areas' },
      { key: 'testCode', label: 'Test Code', type: 'textarea', wide: true },
      { key: 'riskLevel', label: 'Risk Level', type: 'select', options: ['critical', 'high', 'medium', 'low'] },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'passed', 'failed'] },
    ],
    aiAction: 'generate', aiLabel: 'Generate Regression Tests'
  },
  'reports': {
    columns: ['name', 'type', 'projectName', 'totalTests', 'passed', 'coverage', 'status'],
    fields: [
      { key: 'name', label: 'Report Name', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['summary', 'coverage', 'performance', 'security', 'regression', 'custom'] },
      { key: 'projectName', label: 'Project Name' },
      { key: 'totalTests', label: 'Total Tests', type: 'number' },
      { key: 'passed', label: 'Passed', type: 'number' },
      { key: 'failed', label: 'Failed', type: 'number' },
      { key: 'coverage', label: 'Coverage %', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['generating', 'completed', 'failed'] },
    ]
  },
};

function FeaturePage({ feature }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const api = apiMap[feature.key];
  const config = fieldsConfig[feature.key];
  const Icon = iconMap[feature.icon];

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getAll();
      setItems(res.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchItems();
    setSelectedItem(null);
    setAiResult(null);
    setSearch('');
  }, [feature.key, fetchItems]);

  const handleCreate = async (data) => {
    try {
      await api.create(data);
      toast.success('Created successfully!');
      setShowCreate(false);
      fetchItems();
    } catch (err) {
      toast.error('Failed to create: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSave = async (data) => {
    try {
      await api.update(data.id, data);
      toast.success('Updated successfully!');
      fetchItems();
      const res = await api.getOne(data.id);
      setSelectedItem(res.data);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(id);
      toast.success('Deleted successfully!');
      setSelectedItem(null);
      fetchItems();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleAiAction = async (id) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const actionName = config.aiAction;
      const res = await api[actionName](id);
      setAiResult(res.data.aiResult);
      toast.success('AI analysis completed!');
      // Refresh item
      const updated = await api.getOne(id);
      setSelectedItem(updated.data);
    } catch (err) {
      toast.error('AI action failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  const filtered = items.filter(item => {
    if (!search) return true;
    const s = search.toLowerCase();
    return Object.values(item).some(v => String(v).toLowerCase().includes(s));
  });

  const getStatusClass = (val) => {
    if (!val) return '';
    const s = String(val).toLowerCase();
    if (['active', 'passed', 'completed'].includes(s)) return 'status-success';
    if (['failed', 'critical'].includes(s)) return 'status-danger';
    if (['running', 'scanning', 'analyzing', 'generating'].includes(s)) return 'status-warning';
    if (['draft', 'pending', 'queued'].includes(s)) return 'status-info';
    return '';
  };

  const formatCell = (item, col) => {
    const val = item[col];
    if (col === 'status' || col === 'severity' || col === 'riskLevel' || col === 'scanType' || col === 'testType') {
      return <span className={`table-badge ${getStatusClass(val)}`}>{val}</span>;
    }
    if (col === 'priority') {
      return <span className={`table-badge priority-${val}`}>{val}</span>;
    }
    if (col === 'method') {
      return <span className={`method-badge method-${val}`}>{val}</span>;
    }
    if (col === 'coveragePercent' || col === 'branchCoverage' || col === 'functionCoverage' || col === 'coverage' || col === 'errorRate') {
      return <span>{val}%</span>;
    }
    if (col === 'avgResponseTime' || col === 'maxResponseTime') {
      return <span>{val}ms</span>;
    }
    if (col === 'duration') {
      return <span>{val}s</span>;
    }
    if (col === 'throughput') {
      return <span>{val} req/s</span>;
    }
    if (typeof val === 'string' && val.length > 50) {
      return val.substring(0, 50) + '...';
    }
    return String(val ?? '');
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <div className="page-title">
          {Icon && <Icon className="page-icon" />}
          <div>
            <h1>{feature.label}</h1>
            <span className="item-count">{items.length} items</span>
          </div>
          {feature.ai && <span className="ai-powered-badge"><FaRobot /> AI-Powered</span>}
        </div>
        <div className="page-actions">
          <div className="search-wrapper">
            <FaSearch />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <FaPlus /> New {feature.label.replace(/s$/, '').replace(/ & Analytics/, '')}
          </button>
        </div>
      </div>

      <div className="data-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            {Icon && <Icon />}
            <h3>No items found</h3>
            <p>Create your first item to get started</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <FaPlus /> Create New
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {config.columns.map(col => (
                  <th key={col}>{col.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</th>
                ))}
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} onClick={() => { setSelectedItem(item); setAiResult(null); }} className="clickable-row">
                  <td className="row-num">{idx + 1}</td>
                  {config.columns.map(col => (
                    <td key={col}>{formatCell(item, col)}</td>
                  ))}
                  <td className="date-cell">{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedItem && (
        <DetailModal
          item={selectedItem}
          fields={config.fields}
          onClose={() => { setSelectedItem(null); setAiResult(null); }}
          onSave={handleSave}
          onDelete={handleDelete}
          aiResult={aiResult}
          aiLoading={aiLoading}
          onAiAction={config.aiAction ? handleAiAction : null}
          aiActionLabel={config.aiLabel}
        />
      )}

      {showCreate && (
        <CreateModal
          fields={config.fields}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          title={`Create New ${feature.label.replace(/s$/, '').replace(/ & Analytics/, '')}`}
        />
      )}
    </div>
  );
}

export default FeaturePage;
