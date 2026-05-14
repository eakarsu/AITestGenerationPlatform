// Apply pass 5 — additive coverage-visualization page.
// PRODUCT-DECISION: minimal table + ASCII bar chart (no new chart library
// dependency). Shows {file, line_coverage, branch_coverage} from the
// /api/coverage-analysis/visualization-data endpoint.
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const styles = {
  page: { padding: 24, maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 26, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 },
  subtitle: { color: '#94a3b8', fontSize: 14, marginBottom: 24 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, marginBottom: 20 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155', padding: 8, fontWeight: 600 },
  td: { color: '#e2e8f0', borderBottom: '1px solid #1e293b', padding: 8, fontFamily: 'monospace', fontSize: 13 },
  bar: (pct) => ({
    height: 8, background: '#0f172a', borderRadius: 4, overflow: 'hidden', position: 'relative',
  }),
  fill: (pct) => ({
    height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`,
    background: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444',
  }),
  err: { background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: 12, borderRadius: 8, marginBottom: 16 },
};

function pct(x) {
  if (x === null || x === undefined) return null;
  // Accept either fraction (0..1) or percent (0..100)
  return x <= 1 ? Math.round(x * 100) : Math.round(x);
}

export default function CoverageVisualization() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/coverage-analysis/visualization-data')
      .then(res => { if (!cancelled) setSeries(res.data.series || []); })
      .catch(err => {
        if (cancelled) return;
        const msg = err.response?.data?.error || err.message || 'Failed';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Coverage Visualization</h1>
      <p style={styles.subtitle}>Per-file line / branch coverage from your recorded analyses.</p>

      {error && <div style={styles.err}>{error}</div>}

      <div style={styles.card}>
        {loading && <div style={{ color: '#94a3b8' }}>Loading...</div>}
        {!loading && series.length === 0 && <div style={{ color: '#94a3b8' }}>No coverage records yet. Run a coverage analysis first.</div>}
        {!loading && series.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>File</th>
                <th style={styles.th}>Line %</th>
                <th style={styles.th}>Branch %</th>
                <th style={styles.th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {series.map(row => {
                const lp = pct(row.line_coverage);
                const bp = pct(row.branch_coverage);
                return (
                  <tr key={row.id}>
                    <td style={styles.td}>{row.file}</td>
                    <td style={styles.td}>
                      {lp === null ? '—' : `${lp}%`}
                      {lp !== null && (
                        <div style={styles.bar(lp)}><div style={styles.fill(lp)} /></div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {bp === null ? '—' : `${bp}%`}
                      {bp !== null && (
                        <div style={styles.bar(bp)}><div style={styles.fill(bp)} /></div>
                      )}
                    </td>
                    <td style={styles.td}>{row.created_at ? new Date(row.created_at).toLocaleString() : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
