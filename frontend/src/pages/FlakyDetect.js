import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const SAMPLE_RUNS = `[
  { "name": "should add user", "passed": true, "duration_ms": 240, "run": 1 },
  { "name": "should add user", "passed": false, "duration_ms": 1810, "run": 2 },
  { "name": "should add user", "passed": true, "duration_ms": 230, "run": 3 },
  { "name": "should login", "passed": true, "duration_ms": 120, "run": 1 },
  { "name": "should login", "passed": true, "duration_ms": 122, "run": 2 }
]`;

const styles = {
  page: { padding: 24, maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 26, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 },
  subtitle: { color: '#94a3b8', fontSize: 14, marginBottom: 24 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 },
  label: { display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 8, fontWeight: 500 },
  textarea: { width: '100%', padding: 12, borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontFamily: 'monospace', fontSize: 13 },
  button: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 14 },
  pre: { color: '#e2e8f0', fontSize: 12, whiteSpace: 'pre-wrap', overflow: 'auto', background: '#0f172a', padding: 14, borderRadius: 8 },
  err: { background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: 12, borderRadius: 8, marginBottom: 16 },
};

export default function FlakyDetect() {
  const [runsText, setRunsText] = useState(SAMPLE_RUNS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [parseErr, setParseErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setParseErr('');
    let runs;
    try {
      runs = JSON.parse(runsText);
      if (!Array.isArray(runs) || runs.length === 0) {
        setParseErr('runs must be a non-empty JSON array.');
        return;
      }
    } catch (err) {
      setParseErr('Invalid JSON: ' + err.message);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/coverage-analysis/flaky-detect', { runs });
      setResult(res.data);
      toast.success('Flaky test analysis complete');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Flaky Test Detector</h1>
      <p style={styles.subtitle}>Identify non-deterministic tests from run history with AI.</p>

      <form onSubmit={handleSubmit} style={styles.card}>
        <label style={styles.label}>Test Runs (JSON array)</label>
        <textarea rows={12} value={runsText} onChange={(e) => setRunsText(e.target.value)} style={styles.textarea} />
        {parseErr && <div style={{ color: '#fca5a5', fontSize: 13, marginTop: 8 }}>{parseErr}</div>}
        <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Analyzing...' : 'Detect Flaky Tests'}
        </button>
      </form>

      {error && <div style={styles.err}>{error}</div>}

      {result && (
        <div style={styles.card}>
          <h3 style={{ color: '#f1f5f9', marginBottom: 12 }}>Analysis</h3>
          <pre style={styles.pre}>{JSON.stringify(result.result || result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
