import React, { useState } from 'react';
import { FaRobot, FaEnvelope, FaLock, FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import '../styles/Login.css';

function __demoAutofill() {
  (async () => {
    let email = "";
    let password = "";
    try {
      const response = await fetch("/api/auth/demo-credentials", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        email = data.email || data.username || "";
        password = data.password || "";
      }
    } catch (error) {
      /* fall back to build-time credentials below */
    }
    if (!email || !password) {
      const env = (typeof process !== "undefined" && process.env) ? process.env : {};
      email = email || env.REACT_APP_DEMO_EMAIL || env.VITE_DEMO_EMAIL || "";
      password = password || env.REACT_APP_DEMO_PASSWORD || env.VITE_DEMO_PASSWORD || "";
    }
    const form = document.querySelector("form");
    const setValue = (element, value) => {
      if (!element) return;
      const prototype = element.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, "value").set;
      setter.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const scope = form || document;
    setValue(scope.querySelector('input[type="email"], input[name="email"], input[name="username"]') || scope.querySelectorAll("input")[0], email);
    setValue(scope.querySelector('input[type="password"], input[name="password"]') || scope.querySelectorAll("input")[1], password);
    window.setTimeout(() => {
      if (form && typeof form.requestSubmit === "function") {
        form.requestSubmit();
      } else {
        const submit = scope.querySelector('button[type="submit"], input[type="submit"]');
        if (submit) submit.click();
      }
    }, 50);
  })();
}

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    setForm({ email: process.env.REACT_APP_DEMO_EMAIL || '', password: process.env.REACT_APP_DEMO_PASSWORD || '', name: 'Alex Johnson' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await authAPI.register(form);
        toast.success('Account created successfully!');
      } else {
        res = await authAPI.login({ email: form.email, password: form.password });
        toast.success('Welcome back!');
      }
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <FaRobot className="brand-icon" />
            <h1>AI TestGen</h1>
            <p>AI-Powered Test Generation Platform</p>
          </div>
          <div className="login-features">
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Auto-generate test cases with AI</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Save 30% development time</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Bug detection & code analysis</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Security & performance testing</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Comprehensive test reporting</span>
            </div>
          </div>
          <div className="login-stats">
            <div className="stat">
              <div className="stat-number">15+</div>
              <div className="stat-label">Testing Features</div>
            </div>
            <div className="stat">
              <div className="stat-number">8</div>
              <div className="stat-label">AI-Powered</div>
            </div>
            <div className="stat">
              <div className="stat-number">30%</div>
              <div className="stat-label">Time Saved</div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="login-subtitle">
              {isRegister ? 'Start your testing journey' : 'Sign in to your account'}
            </p>

            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <FaUserPlus className="input-icon" />
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required={isRegister}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                <FaSignInAlt />
                {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <button className="demo-btn" onClick={__demoAutofill}>
              Auto Fill Demo Credentials
            </button>

            <div className="login-toggle">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
              <button onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
