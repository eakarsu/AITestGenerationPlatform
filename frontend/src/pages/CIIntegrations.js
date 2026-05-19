// Apply pass 5 — additive CI integrations page.
// Wraps the four NEEDS-CREDS endpoints in a single tabbed UI:
//   /api/coverage-analysis/github-webhook (server-side, simulated POST here)
//   /api/coverage-analysis/gitlab-webhook (server-side, simulated POST here)
//   /api/coverage-analysis/github-actions-trigger
//   /api/coverage-analysis/jenkins-trigger
// All return 503 + missing if the corresponding env var is unset.
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const TOOLS = [
  {
    key: 'github-webhook',
    label: 'GitHub Webhook (test-impact)',
    endpoint: '/coverage-analysis/github-webhook',
    description: 'Send a sample push payload (HMAC required by server). NEEDS-CREDS: GITHUB_WEBHOOK_SECRET.',
    sample: '{ "commits": [ { "added": ["src/foo.ts"], "modified": ["src/bar.ts"], "removed": [] } ] }',
    requiresAuth: false,
  },
  {
    key: 'gitlab-webhook',
    label: 'GitLab Webhook (test-impact)',
    endpoint: '/coverage-analysis/gitlab-webhook',
    description: 'Send a sample event payload. NEEDS-CREDS: GITLAB_WEBHOOK_SECRET.',
    sample: '{ "object_kind": "push", "ref": "refs/heads/main" }',
    requiresAuth: false,
  },
  {
    key: 'github-actions-trigger',
    label: 'GitHub Actions Trigger',
    endpoint: '/coverage-analysis/github-actions-trigger',
    description: 'Plan a workflow_dispatch. NEEDS-CREDS: GITHUB_TOKEN.',
    sample: '{ "owner": "octo", "repo": "demo", "workflow_id": "tests.yml", "ref": "main", "inputs": {} }',
    requiresAuth: true,
  },
  {
    key: 'jenkins-trigger',
    label: 'Jenkins Trigger',
    endpoint: '/coverage-analysis/jenkins-trigger',
    description: 'Plan a Jenkins buildWithParameters. NEEDS-CREDS: JENKINS_URL + JENKINS_TOKEN.',
    sample: '{ "job": "ci-tests", "params": { "branch": "main" } }',
    requiresAuth: true,
  },
];

const styles = {
  page: { padding: 24, maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 26, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 },
  subtitle: { color: '#94a3b8', fontSize: 14, marginBottom: 24 },
  tabs: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tab: (active) => ({
    padding: '8px 14px', borderRadius: 8, border: '1px solid #334155',
    background: active ? '#6366f1' : '#1e293b',
    color: active ? '#fff' : '#cbd5e1', cursor: 'pointer', fontWeight: 600,
  }),
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 },
  label: { display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 8, fontWeight: 500 },
  textarea: { width: '100%', minHeight: 160, padding: 12, borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontFamily: 'monospace', fontSize: 13 },
  button: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 14 },
  pre: { color: '#e2e8f0', fontSize: 12, whiteSpace: 'pre-wrap', overflow: 'auto', background: '#0f172a', padding: 14, borderRadius: 8 },
  err: { background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: 12, borderRadius: 8, marginBottom: 16 },
};

export default function CIIntegrations() {
  const [activeKey, setActiveKey] = useState(TOOLS[0].key);
  const [payloadText, setPayloadText] = useState(TOOLS[0].sample);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const tool = TOOLS.find(t => t.key === activeKey);

  const switchTool = (key) => {
    setActiveKey(key);
    const t = TOOLS.find(x => x.key === key);
    setPayloadText(t.sample);
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null);
    let payload;
    try { payload = JSON.parse(payloadText); }
    catch (err) { setError('Invalid JSON: ' + err.message); return; }
    setLoading(true);
    try {
      const res = await api.post(tool.endpoint, payload);
      setResult(res.data);
      toast.success(`${tool.label}: OK`);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.message || 'Failed';
      const missing = err.response?.data?.missing;
      const display = status === 503
        ? `AI service unavailable (503): ${msg}${missing ? ` — set env var ${missing}` : ''}`
        : msg;
      setError(display);
      toast.error(display);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>CI / Webhook Integrations</h1>
      <p style={styles.subtitle}>Test the GitHub / GitLab webhook + Jenkins / GitHub Actions trigger plans. All endpoints return 503 with `missing` when their env var is unset.</p>

      <div style={styles.tabs}>
        {TOOLS.map(t => (
          <button key={t.key} type="button" style={styles.tab(t.key === activeKey)} onClick={() => switchTool(t.key)}>{t.label}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={styles.card}>
        <label style={styles.label}>{tool.description}</label>
        <textarea style={styles.textarea} value={payloadText} onChange={e => setPayloadText(e.target.value)} />
        <button type="submit" style={styles.button} disabled={loading}>{loading ? 'Submitting...' : 'Send'}</button>
      </form>

      {error && <div style={styles.err}>{error}</div>}
      {result && (
        <div style={styles.card}>
          <label style={styles.label}>Result</label>
          <pre style={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
