import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import FlakyDetect from './pages/FlakyDetect';
import DeadCode from './pages/DeadCode';
import PerformanceRegression from './pages/PerformanceRegression';
import CIIntegrations from './pages/CIIntegrations';
import CoverageVisualization from './pages/CoverageVisualization';
import CustomViewsPage from './pages/CustomViewsPage';
import Sidebar from './components/Sidebar';
import './styles/App.css';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

// Lightweight passthrough used by pre-existing Gap/Cf routes that reference
// <ProtectedRoute> without importing one. Defining it here avoids a
// ReferenceError if a user navigates to those routes; auth is already
// enforced at the App level (login gate above).
const ProtectedRoute = ({ children }) => children;
// === Batch 08 Gaps & Frontend Mounts ===
import CfAiTestGeneratorAnalyzingCodeAndProducing from './pages/CfAiTestGeneratorAnalyzingCodeAndProducing'
import CfMutationTestingWithGeneratedMutantVariantsTo from './pages/CfMutationTestingWithGeneratedMutantVariantsTo'
import CfFlakyTestDetectorIdentifyingNonDeterministicFailures from './pages/CfFlakyTestDetectorIdentifyingNonDeterministicFailures'
import CfDeadCodeDetectorFlaggingUntestedCodePaths from './pages/CfDeadCodeDetectorFlaggingUntestedCodePaths'
import CfPerformanceRegressionDetectionIdentifyingTestExecutionDegradation from './pages/CfPerformanceRegressionDetectionIdentifyingTestExecutionDegradation'
import CfVcsWebhookIntegrationAutoRunningSuitesOn from './pages/CfVcsWebhookIntegrationAutoRunningSuitesOn'
import GapCriticalGapNoAiDrivenTestGeneration from './pages/GapCriticalGapNoAiDrivenTestGeneration'
import GapNoMutationTestingAiAnalysis from './pages/GapNoMutationTestingAiAnalysis'
import GapNoFlakyTestDetectionMlModel from './pages/GapNoFlakyTestDetectionMlModel'
import GapNoCodeCoverageGapRecommender from './pages/GapNoCodeCoverageGapRecommender'
import GapLimitedVcsIntegrationGitAutoTriggerNot from './pages/GapLimitedVcsIntegrationGitAutoTriggerNot'
import GapLimitedCiCdPlatformIntegrationBeyondStub from './pages/GapLimitedCiCdPlatformIntegrationBeyondStub'
import GapNoCodeCoverageVisualizationUiRoute from './pages/GapNoCodeCoverageVisualizationUiRoute'
import GapNoTestFlakinessDetectionFeature from './pages/GapNoTestFlakinessDetectionFeature'
import GapNotificationsLimitedToOneReferenceNotA from './pages/GapNotificationsLimitedToOneReferenceNotA'

function App() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ToastContainer position="top-right" theme="dark" />
      </>
    );
  }

  const features = [
    { key: 'projects', label: 'Projects', icon: 'FaProjectDiagram' },
    { key: 'test-cases', label: 'Test Cases', icon: 'FaFlask', ai: true },
    { key: 'test-suites', label: 'Test Suites', icon: 'FaLayerGroup' },
    { key: 'code-analysis', label: 'Code Analysis', icon: 'FaSearchPlus', ai: true },
    { key: 'bug-detection', label: 'Bug Detection', icon: 'FaBug', ai: true },
    { key: 'coverage-analysis', label: 'Coverage Analysis', icon: 'FaChartPie' },
    { key: 'test-templates', label: 'Test Templates', icon: 'FaFileCode' },
    { key: 'teams', label: 'Teams', icon: 'FaUsers' },
    { key: 'test-executions', label: 'Test Executions', icon: 'FaPlay' },
    { key: 'api-testing', label: 'API Testing', icon: 'FaPlug', ai: true },
    { key: 'performance-testing', label: 'Performance Testing', icon: 'FaTachometerAlt', ai: true },
    { key: 'security-testing', label: 'Security Testing', icon: 'FaShieldAlt', ai: true },
    { key: 'integration-testing', label: 'Integration Testing', icon: 'FaPuzzlePiece', ai: true },
    { key: 'regression-testing', label: 'Regression Testing', icon: 'FaHistory', ai: true },
    { key: 'reports', label: 'Reports & Analytics', icon: 'FaChartBar' },
    { key: 'flaky-detect', label: 'Flaky Test Detector', icon: 'FaRandom', ai: true, customRoute: true },
    { key: 'dead-code', label: 'Dead Code Detector', icon: 'FaCode', ai: true, customRoute: true },
    { key: 'performance-regression', label: 'Performance Regression', icon: 'FaTachometerAlt', ai: true, customRoute: true },
    { key: 'ci-integrations', label: 'CI / Webhook Integrations', icon: 'FaPlug', ai: true, customRoute: true },
    { key: 'coverage-visualization', label: 'Coverage Visualization', icon: 'FaChartBar', customRoute: true },
    { key: 'custom-views', label: 'Test Views', icon: 'FaChartBar', customRoute: true },
  ];

  return (
    <Router>
      <div className="app-container">
        <Sidebar
          features={features}
          user={user}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
          <Routes>
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

            <Route path="/" element={<Dashboard features={features} />} />
            {features.filter(f => !f.customRoute).map(f => (
              <Route key={f.key} path={`/${f.key}`} element={<FeaturePage feature={f} />} />
            ))}
            <Route path="/flaky-detect" element={<FlakyDetect />} />
            <Route path="/dead-code" element={<DeadCode />} />
            <Route path="/performance-regression" element={<PerformanceRegression />} />
            <Route path="/ci-integrations" element={<CIIntegrations />} />
            <Route path="/coverage-visualization" element={<CoverageVisualization />} />
            <Route path="/custom-views" element={<CustomViewsPage />} />
            {/* // === Batch 08 Gaps & Frontend Mounts === */}
      <Route path="/cf-ai-test-generator-analyzing-code-and-producing-assertions" element={<ProtectedRoute><CfAiTestGeneratorAnalyzingCodeAndProducing /></ProtectedRoute>} />
      <Route path="/cf-mutation-testing-with-generated-mutant-variants-to-assess" element={<ProtectedRoute><CfMutationTestingWithGeneratedMutantVariantsTo /></ProtectedRoute>} />
      <Route path="/cf-flaky-test-detector-identifying-non-deterministic-failures" element={<ProtectedRoute><CfFlakyTestDetectorIdentifyingNonDeterministicFailures /></ProtectedRoute>} />
      <Route path="/cf-dead-code-detector-flagging-untested-code-paths" element={<ProtectedRoute><CfDeadCodeDetectorFlaggingUntestedCodePaths /></ProtectedRoute>} />
      <Route path="/cf-performance-regression-detection-identifying-test-execution-degradation" element={<ProtectedRoute><CfPerformanceRegressionDetectionIdentifyingTestExecutionDegradation /></ProtectedRoute>} />
      <Route path="/cf-vcs-webhook-integration-auto-running-suites-on-pr-open" element={<ProtectedRoute><CfVcsWebhookIntegrationAutoRunningSuitesOn /></ProtectedRoute>} />
      <Route path="/gap-critical-gap-no-ai-driven-test-generation-despite-domain" element={<ProtectedRoute><GapCriticalGapNoAiDrivenTestGeneration /></ProtectedRoute>} />
      <Route path="/gap-no-mutation-testing-ai-analysis" element={<ProtectedRoute><GapNoMutationTestingAiAnalysis /></ProtectedRoute>} />
      <Route path="/gap-no-flaky-test-detection-ml-model" element={<ProtectedRoute><GapNoFlakyTestDetectionMlModel /></ProtectedRoute>} />
      <Route path="/gap-no-code-coverage-gap-recommender" element={<ProtectedRoute><GapNoCodeCoverageGapRecommender /></ProtectedRoute>} />
      <Route path="/gap-limited-vcs-integration-git-auto-trigger-not-visible" element={<ProtectedRoute><GapLimitedVcsIntegrationGitAutoTriggerNot /></ProtectedRoute>} />
      <Route path="/gap-limited-ci-cd-platform-integration-beyond-stub-modules" element={<ProtectedRoute><GapLimitedCiCdPlatformIntegrationBeyondStub /></ProtectedRoute>} />
      <Route path="/gap-no-code-coverage-visualization-ui-route" element={<ProtectedRoute><GapNoCodeCoverageVisualizationUiRoute /></ProtectedRoute>} />
      <Route path="/gap-no-test-flakiness-detection-feature" element={<ProtectedRoute><GapNoTestFlakinessDetectionFeature /></ProtectedRoute>} />
      <Route path="/gap-notifications-limited-to-one-reference-not-a-full" element={<ProtectedRoute><GapNotificationsLimitedToOneReferenceNotA /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" theme="dark" />
      </div>
    </Router>
  );
}

export default App;
