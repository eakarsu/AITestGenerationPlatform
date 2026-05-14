import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const styles = {
  page: { padding: 24, maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 26, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 },
  subtitle: { color: '#94a3b8', fontSize: 14, marginBottom: 24 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 },
  label: { display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 8, fontWeight: 500 },
  input: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 14 },
  textarea: { width: '100%', padding: 12, borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontFamily: 'monospace', fontSize: 13 },
  button: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 14 },
  pre: { color: '#e2e8f0', fontSize: 12, whiteSpace: 'pre-wrap', overflow: 'auto', background: '#0f172a', padding: 14, borderRadius: 8 },
  err: { background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: 12, borderRadius: 8, marginBottom: 16 },
};

export default function DeadCode() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [coverageReport, setCoverageReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null);
    if (!code.trim()) {
      setError('Code is required');
      return;
    }
    let coverage;
    if (coverageReport.trim()) {
      try { coverage = JSON.parse(coverageReport); } catch { coverage = { notes: coverageReport }; }
    }
    setLoading(true);
    try {
      const res = await api.post('/coverage-analysis/dead-code', {
        code,
        language,
        ...(coverage ? { coverageReport: coverage } : {}),
      });
      setResult(res.data);
      toast.success('Dead code analysis complete');
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
      <h1 style={styles.title}>Dead Code Detector</h1>
      <p style={styles.subtitle}>Identify unreachable / dead code and uncovered paths.</p>

      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={styles.label}>Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={styles.input}>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
              <option value="ruby">Ruby</option>
              <option value="csharp">C#</option>
              <option value="rust">Rust</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={styles.label}>Code</label>
          <textarea rows={12} value={code} onChange={(e) => setCode(e.target.value)} style={styles.textarea} placeholder="Paste source code here..." />
        </div>
        <div>
          <label style={styles.label}>Coverage Report (optional, JSON)</label>
          <textarea rows={4} value={coverageReport} onChange={(e) => setCoverageReport(e.target.value)} style={styles.textarea} placeholder='{"covered_lines": [...], "uncovered_lines": [...]}' />
        </div>
        <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Analyzing...' : 'Detect Dead Code'}
        </button>
      </form>

      {error && <div style={styles.err}>{error}</div>}

      {result && (
        <div style={styles.card}>
          <h3 style={{ color: '#f1f5f9', marginBottom: 12 }}>Findings</h3>
          <pre style={styles.pre}>{JSON.stringify(result.result || result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
