// VIZ — Test coverage chart. Pure-SVG line chart, no external libs.
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function TestCoverageChart() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/custom-views/test-coverage-chart')
      .then(res => { if (!cancelled) setData(res.data); })
      .catch(err => { if (!cancelled) setError(err.response?.data?.error || err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div style={{ color: '#94a3b8', padding: 16 }}>Loading coverage chart...</div>;
  if (error) return <div style={{ color: '#fca5a5', padding: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: 8 }}>{error}</div>;
  if (!data || !data.series?.length) return <div style={{ color: '#94a3b8' }}>No coverage data.</div>;

  const W = 720, H = 240, P = 36;
  const xs = data.series.map((_, i) => P + i * ((W - 2 * P) / (data.series.length - 1)));
  const yFor = (v) => H - P - (v / 100) * (H - 2 * P);
  const path = (key) =>
    data.series.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xs[i].toFixed(1)} ${yFor(d[key]).toFixed(1)}`).join(' ');

  return (
    <div data-testid="coverage-chart" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
      <h3 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: 6 }}>Test Coverage (Last 30 days)</h3>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>
        Avg line: <strong style={{ color: '#10b981' }}>{data.summary.avg_line}%</strong>
        &nbsp;|&nbsp; Avg branch: <strong style={{ color: '#f59e0b' }}>{data.summary.avg_branch}%</strong>
        &nbsp;|&nbsp; Latest line: <strong style={{ color: '#60a5fa' }}>{data.summary.latest.line_coverage}%</strong>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: '#0f172a', borderRadius: 8 }}>
        {[0, 25, 50, 75, 100].map(g => (
          <g key={g}>
            <line x1={P} x2={W - P} y1={yFor(g)} y2={yFor(g)} stroke="#1e293b" strokeWidth="1" />
            <text x={6} y={yFor(g) + 4} fill="#64748b" fontSize="10">{g}%</text>
          </g>
        ))}
        <path d={path('line_coverage')} stroke="#10b981" strokeWidth="2" fill="none" />
        <path d={path('branch_coverage')} stroke="#f59e0b" strokeWidth="2" fill="none" />
        <path d={path('function_coverage')} stroke="#60a5fa" strokeWidth="2" fill="none" strokeDasharray="4 3" />
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, color: '#cbd5e1', fontSize: 12 }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#10b981', marginRight: 6 }} />Line</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#f59e0b', marginRight: 6 }} />Branch</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#60a5fa', marginRight: 6 }} />Function</span>
      </div>
    </div>
  );
}
