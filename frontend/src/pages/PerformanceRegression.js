import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const SAMPLE_RUNS = `[
  { "test_or_endpoint": "GET /api/users", "version": "v1.4.0", "p50_ms": 42, "p95_ms": 120, "p99_ms": 180, "throughput_rps": 850, "timestamp": "2024-09-01" },
  { "test_or_endpoint": "GET /api/users", "version": "v1.5.0", "p50_ms": 60, "p95_ms": 230, "p99_ms": 410, "throughput_rps": 620, "timestamp": "2024-10-01" },
  { "test_or_endpoint": "POST /api/orders", "version": "v1.4.0", "p50_ms": 110, "p95_ms": 320, "p99_ms": 480, "throughput_rps": 240, "timestamp": "2024-09-01" },
  { "test_or_endpoint": "POST /api/orders", "version": "v1.5.0", "p50_ms": 108, "p95_ms": 318, "p99_ms": 470, "throughput_rps": 245, "timestamp": "2024-10-01" }
]`;

const SAMPLE_BASELINE = `{ "version": "v1.4.0" }`;

const styles = {
  page: { padding: 24, maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 26, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 },
  subtitle: { color: '#94a3b8', fontSize: 14, marginBottom: 24 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 },
  label: { display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 8, fontWeight: 500 },
  textarea: { width: '100%', padding: 12, borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontFamily: 'monospace', fontSize: 13 },
  input: { width: 160, padding: 10, borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 13 },
  button: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 14 },
  pre: { color: '#e2e8f0', fontSize: 12, whiteSpace: 'pre-wrap', overflow: 'auto', background: '#0f172a', padding: 14, borderRadius: 8 },
  err: { background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: 12, borderRadius: 8, marginBottom: 16 },
};

export default function PerformanceRegression() {
  const [runsText, setRunsText] = useState(SAMPLE_RUNS);
  const [baselineText, setBaselineText] = useState(SAMPLE_BASELINE);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [parseErr, setParseErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setParseErr('');
    let runs, baseline;
    try {
      runs = JSON.parse(runsText);
      if (!Array.isArray(runs) || runs.length < 2) {
        setParseErr('runs must be a JSON array with at least 2 entries.');
        return;
      }
    } catch (err) {
      setParseErr('Invalid runs JSON: ' + err.message);
      return;
    }
    try {
      baseline = baselineText && baselineText.trim() ? JSON.parse(baselineText) : undefined;
    } catch (err) {
      setParseErr('Invalid baseline JSON: ' + err.message);
      return;
    }
    setLoading(true);
    try {
      const payload = { runs, threshold: Number(threshold) };
      if (baseline) payload.baseline = baseline;
      const res = await api.post('/coverage-analysis/performance-regression', payload);
      setResult(res.data);
      toast.success('Performance regression analysis complete');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.message || 'Failed';
      const display = status === 503 ? `AI service unavailable (503): ${msg}` : msg;
      setError(display);
      toast.error(display);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Performance Regression Detector</h1>
      <p style={styles.subtitle}>Compare timed runs across versions to surface latency / throughput regressions with AI.</p>

      <form onSubmit={handleSubmit} style={styles.card}>
        <label style={styles.label}>Test Runs (JSON array)</label>
        <textarea rows={12} value={runsText} onChange={(e) => setRunsText(e.target.value)} style={styles.textarea} />

        <label style={{ ...styles.label, marginTop: 16 }}>Baseline (optional JSON)</label>
        <textarea rows={3} value={baselineText} onChange={(e) => setBaselineText(e.target.value)} style={styles.textarea} />

        <label style={{ ...styles.label, marginTop: 16 }}>Regression Threshold (% slowdown to flag)</label>
        <input type="number" min={0} value={threshold} onChange={(e) => setThreshold(e.target.value)} style={styles.input} />

        {parseErr && <div style={{ color: '#fca5a5', fontSize: 13, marginTop: 8 }}>{parseErr}</div>}
        <div>
          <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Analyzing...' : 'Detect Regressions'}
          </button>
        </div>
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
