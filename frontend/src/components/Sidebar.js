import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaProjectDiagram, FaFlask, FaLayerGroup, FaSearchPlus, FaBug, FaChartPie, FaFileCode, FaUsers, FaPlay, FaPlug, FaTachometerAlt, FaShieldAlt, FaPuzzlePiece, FaHistory, FaChartBar, FaSignOutAlt, FaBars, FaHome, FaRobot } from 'react-icons/fa';

const iconMap = {
  FaProjectDiagram, FaFlask, FaLayerGroup, FaSearchPlus, FaBug, FaChartPie,
  FaFileCode, FaUsers, FaPlay, FaPlug, FaTachometerAlt, FaShieldAlt,
  FaPuzzlePiece, FaHistory, FaChartBar
};

function Sidebar({ features, user, onLogout, isOpen, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={onToggle}>
          <FaBars />
        </button>
        {isOpen && (
          <div className="logo" onClick={() => navigate('/')}>
            <FaRobot className="logo-icon" />
            <span>AI TestGen</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <FaHome />
          {isOpen && <span>Dashboard</span>}
        </div>

        {isOpen && <div className="nav-section-title">Features</div>}

        {features.map(f => {
          const Icon = iconMap[f.icon];
          return (
            <div
              key={f.key}
              className={`nav-item ${location.pathname === `/${f.key}` ? 'active' : ''}`}
              onClick={() => navigate(`/${f.key}`)}
              title={f.label}
            >
              {Icon && <Icon />}
              {isOpen && (
                <span>{f.label}</span>
              )}
              {isOpen && f.ai && <span className="ai-badge">AI</span>}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {isOpen && (
          <div className="user-info">
            <div className="user-avatar">{user.name?.charAt(0)}</div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={onLogout}>
          <FaSignOutAlt />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
