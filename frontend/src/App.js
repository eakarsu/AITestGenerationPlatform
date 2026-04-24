import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import Sidebar from './components/Sidebar';
import './styles/App.css';

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
            <Route path="/" element={<Dashboard features={features} />} />
            {features.map(f => (
              <Route key={f.key} path={`/${f.key}`} element={<FeaturePage feature={f} />} />
            ))}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" theme="dark" />
      </div>
    </Router>
  );
}

export default App;
